import re
import os
from collections import defaultdict

def organize_migrations(input_file, output_dir):
    with open(input_file, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # Create output directory
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Split by the header comments used by pg_dump
    # Example:
    # --
    # -- Name: actors; Type: TABLE; Schema: public; Owner: postgres
    # --
    parts = re.split(r'(--\n-- Name: .*?\n--\n)', content)
    
    # parts[0] is the preamble (settings, etc.)
    preamble = parts[0]
    blocks = parts[1:]
    
    # Mapping Types to Migration Files
    # 01_roles_schemas: ROLE, SCHEMA, EXTENSION, TYPE, DOMAIN
    # 02_tables: TABLE, SEQUENCE, DEFAULT, CONSTRAINT (some)
    # 03_functions: FUNCTION, PROCEDURE, AGGREGATE
    # 04_indexes_triggers: INDEX, TRIGGER
    # 05_policies: POLICY
    # 06_data: DATA, BLOB (handled separately usually but we'll see)
    
    file_mapping = {
        'ROLE': '01_init_roles.sql',
        'SCHEMA': '02_init_schemas.sql',
        'EXTENSION': '02_init_schemas.sql',
        'TYPE': '03_types.sql',
        'DOMAIN': '03_types.sql',
        'TABLE': '04_tables.sql',
        'SEQUENCE': '04_tables.sql',
        'VIEW': '04_tables.sql',
        'DEFAULT': '04_tables.sql',
        'CONSTRAINT': '04_tables.sql',
        'FUNCTION': '05_functions.sql',
        'PROCEDURE': '05_functions.sql',
        'AGGREGATE': '05_functions.sql',
        'INDEX': '06_indexes_triggers.sql',
        'TRIGGER': '06_indexes_triggers.sql',
        'POLICY': '07_policies.sql',
        'ROW SECURITY': '07_policies.sql', # "ALTER TABLE ... ENABLE ROW LEVEL SECURITY"
        'COMMENT': '99_comments.sql',
        'ACL': '98_permissions.sql', # GRANT/REVOKE usually
    }

    # Buffers for each file
    buffers = defaultdict(list)
    
    # Add preamble to the first file or a settings file
    buffers['00_settings.sql'].append(preamble)

    for i in range(0, len(blocks), 2):
        header = blocks[i]
        body = blocks[i+1] if i+1 < len(blocks) else ""
        
        full_block = header + body

        # Extract Type
        type_match = re.search(r'Type: ([\w_ ]+)', header)
        if not type_match:
            # Fallback based on content keywords if header missing/weird
            if 'CREATE POLICY' in full_block:
                obj_type = 'POLICY'
            elif 'COPY ' in full_block and ' FROM stdin;' in full_block:
                obj_type = 'TABLE DATA'
            else:
                obj_type = 'UNKNOWN'
        else:
            obj_type = type_match.group(1).strip()

        # Handle DATA/COPY/BLOBS separately
        if obj_type == 'TABLE DATA':
            buffers['08_data.sql'].append(full_block)
            continue
            
        # Determine target file
        target_file = file_mapping.get(obj_type, '99_others.sql')
        
        # Special case: RLS enablement often comes as "Type: TABLE" or mixed
        if 'ENABLE ROW LEVEL SECURITY' in body:
            # It's usually part of TABLE definition in pg_dump, or a separate ALTER.
            # If it's a separate ALTER TABLE attached to Type: TABLE, we might want to keep it with tables
            # OR move it. pg_dump usually puts it with the table.
            pass 

        buffers[target_file].append(full_block)

    # Write files
    for filename, blocks in sorted(buffers.items()):
        filepath = os.path.join(output_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
             f.write(f"-- Auto-generated migration: {filename}\n")
             f.write("SET statement_timeout = 0;\n")
             f.write("SET lock_timeout = 0;\n")
             f.write("SET client_encoding = 'UTF8';\n")
             f.write("SET standard_conforming_strings = on;\n\n")
             
             for block in blocks:
                 f.write(block)
                 f.write('\n')
        print(f"Created {filepath}")

if __name__ == "__main__":
    organize_migrations('db_cluster-21-08-2025@16-28-49.backup', 'supabase/migrations/organized')
