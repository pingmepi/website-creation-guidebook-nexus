
import re
from collections import defaultdict
import os

def unescape_postgres_copy(text):
    if not text:
        return text
    
    # We need to unescape backslash sequences used by Postgres COPY text format
    # Simple regex substitution
    def replace_match(match):
        char = match.group(1)
        if char == 'n': return '\n'
        if char == 't': return '\t'
        if char == 'r': return '\r'
        if char == 'b': return '\b'
        if char == 'f': return '\f'
        if char == 'v': return '\v'
        # For \\, it becomes \
        # For \", it becomes " (if pg_dump escaped it)
        # For any other char safely escaped, it becomes the char
        return char

    # Pattern matches backslash followed by any character
    return re.sub(r'\\(.)', replace_match, text)

def pg_quote(field):
    if field == '\\N':
        return 'NULL'
    
    # First unescape the COPY format
    decoded = unescape_postgres_copy(field)
    
    # Then escape for SQL INSERT (single quotes)
    escaped = decoded.replace("'", "''")
    return f"'{escaped}'"

def extract_public_schema(input_file, schema_output_file, seed_output_file):
    with open(input_file, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # Split by the header comments
    parts = re.split(r'(--\n-- Name: .*?\n--\n)', content)
    blocks = parts[1:]
    
    categories = defaultdict(list)
    
    migration_order = [
        'TYPE', 'DOMAIN', 'SEQUENCE', 'TABLE', 
        'FUNCTION', 'PROCEDURE', 'AGGREGATE',
        'INDEX', 'CONSTRAINT', 'TRIGGER', 'POLICY', 'VIEW', 'COMMENT'
    ]
    
    for i in range(0, len(blocks), 2):
        header = blocks[i]
        body = blocks[i+1] if i+1 < len(blocks) else ""
        
        # Check schema
        schema_match = re.search(r'Schema: ([\w_]+)', header)
        if not schema_match or schema_match.group(1) != 'public':
            continue
            
        type_match = re.search(r'Type: ([\w_ ]+)', header)
        b_type = type_match.group(1).strip() if type_match else 'UNKNOWN'
        
        # Clean the body
        clean_body = re.sub(r'ALTER .* OWNER TO .*;', '', body)
        clean_body = re.sub(r'SELECT pg_catalog\.set_config\(\'search_path\', \'\', false\);', '', clean_body)
        
        if b_type == 'DATA':
            continue
            
        categories[b_type].append(header + clean_body)

    # Special extraction for COPY data blocks
    copy_pattern = re.compile(r'COPY (public\.\w+) \((.*?)\) FROM stdin;(.*?)\n\\\.', re.DOTALL)
    
    # Pass 1: Collect tables for global truncate
    tables_to_truncate = []
    for match in copy_pattern.finditer(content):
        tables_to_truncate.append(match.group(1))
    
    with open(seed_output_file, 'w', encoding='utf-8') as f_seed:
        f_seed.write("-- Extracted Public Data (Converted to INSERT)\n")
        f_seed.write("SET standard_conforming_strings = on;\n")
        f_seed.write("SET search_path TO public, extensions;\n")
        f_seed.write("SET session_replication_role = replica;\n\n")
        
        if tables_to_truncate:
             # Unique tables only
             unique_tables = sorted(list(set(tables_to_truncate)))
             f_seed.write(f"TRUNCATE TABLE {', '.join(unique_tables)} CASCADE;\n\n")

        for match in copy_pattern.finditer(content):
            table_name = match.group(1)
            columns = match.group(2)
            data_text = match.group(3).strip()
            
            if not data_text:
                continue
            
            f_seed.write(f"-- Data for {table_name}\n")
            lines = data_text.split('\n')
            
            batch_size = 50 
            for i in range(0, len(lines), batch_size):
                batch = lines[i:i+batch_size]
                values_list = []
                for line in batch:
                    fields = line.split('\t')
                    # Use new robust quoting
                    clean_fields = [pg_quote(f) for f in fields]
                    values_list.append("(" + ", ".join(clean_fields) + ")")
                
                f_seed.write(f"INSERT INTO {table_name} ({columns}) VALUES\n")
                f_seed.write(",\n".join(values_list))
                f_seed.write(";\n\n")

    # Write Schema Migration
    with open(schema_output_file, 'w', encoding='utf-8') as f:
        f.write("-- Extracted Public Schema\n")
        f.write("SET standard_conforming_strings = on;\n")
        f.write("SET search_path TO public, extensions;\n\n")
        
        for cat in migration_order:
            if cat in categories:
                f.write(f"--\n-- CATEGORY: {cat}\n--\n\n")
                for block in categories[cat]:
                    f.write(block)
                    f.write("\n")
            
            # Catch variations
            for actual_cat in categories.keys():
                if cat in actual_cat and actual_cat != cat:
                     f.write(f"--\n-- CATEGORY: {actual_cat}\n--\n\n")
                     for block in categories[actual_cat]:
                         f.write(block)
                         f.write("\n")

if __name__ == "__main__":
    extract_public_schema(
        'db_cluster-21-08-2025@16-28-49.backup', 
        'supabase/migrations/00000000000000_schema.sql', 
        'supabase/seed.sql'
    )
