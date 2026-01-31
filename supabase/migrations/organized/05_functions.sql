-- Auto-generated migration: 05_functions.sql
SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: postgres
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO postgres;


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: postgres
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO postgres;


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;


--
-- Name: check_variant_stock(uuid, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_variant_stock(variant_uuid uuid, requested_quantity integer) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.product_variants 
    WHERE id = variant_uuid 
    AND is_active = true 
    AND stock_quantity >= requested_quantity
  );
END;
$$;


ALTER FUNCTION public.check_variant_stock(variant_uuid uuid, requested_quantity integer) OWNER TO postgres;


--
-- Name: create_migration_checkpoint(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_migration_checkpoint() RETURNS TABLE(checkpoint_name text, table_name text, record_count bigint, timestamp_taken timestamp with time zone)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY SELECT 
    'pre_migration'::TEXT,
    'products'::TEXT,
    COUNT(*)::BIGINT,
    NOW()
  FROM public.products;
  
  RETURN QUERY SELECT 
    'pre_migration'::TEXT,
    'cart_items'::TEXT,
    COUNT(*)::BIGINT,
    NOW()
  FROM public.cart_items;
  
  RETURN QUERY SELECT 
    'pre_migration'::TEXT,
    'order_items'::TEXT,
    COUNT(*)::BIGINT,
    NOW()
  FROM public.order_items;
END;
$$;


ALTER FUNCTION public.create_migration_checkpoint() OWNER TO postgres;


--
-- Name: generate_order_number(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_order_number() RETURNS text
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 6, '0');
END;
$$;


ALTER FUNCTION public.generate_order_number() OWNER TO postgres;


--
-- Name: generate_variant_sku(text, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_variant_sku(product_name text, color_name text, size_name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
  clean_product_name TEXT;
  clean_color_name TEXT;
  clean_size_name TEXT;
  sku_base TEXT;
BEGIN
  -- Clean and normalize names
  clean_product_name := UPPER(REGEXP_REPLACE(TRIM(product_name), '[^A-Za-z0-9]', '', 'g'));
  clean_color_name := UPPER(REGEXP_REPLACE(TRIM(color_name), '[^A-Za-z0-9]', '', 'g'));
  clean_size_name := UPPER(TRIM(size_name));
  
  -- Take first 3 chars of product name, first 3 of color, and size
  sku_base := LEFT(clean_product_name, 3) || '-' || LEFT(clean_color_name, 3) || '-' || clean_size_name;
  
  RETURN sku_base;
END;
$$;


ALTER FUNCTION public.generate_variant_sku(product_name text, color_name text, size_name text) OWNER TO postgres;


--
-- Name: get_color_name_from_hex(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_color_name_from_hex(hex_color text) RETURNS text
    LANGUAGE plpgsql
    AS $$
BEGIN
  CASE UPPER(hex_color)
    WHEN '#FFFFFF' THEN RETURN 'White';
    WHEN '#000000' THEN RETURN 'Black';
    WHEN '#8A898C' THEN RETURN 'Grey';
    WHEN '#1EAEDB' THEN RETURN 'Blue';
    ELSE RETURN 'Color-' || UPPER(REPLACE(hex_color, '#', ''));
  END CASE;
END;
$$;


ALTER FUNCTION public.get_color_name_from_hex(hex_color text) OWNER TO postgres;


--
-- Name: get_default_variant_for_product(uuid, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_default_variant_for_product(product_uuid uuid, preferred_color text DEFAULT '#FFFFFF'::text, preferred_size text DEFAULT 'M'::text) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
  variant_uuid UUID;
BEGIN
  -- Try to find exact match first
  SELECT id INTO variant_uuid 
  FROM public.product_variants 
  WHERE product_id = product_uuid 
    AND color_hex = preferred_color 
    AND size = preferred_size 
    AND is_active = true
  LIMIT 1;
  
  -- If no exact match, try with just the size
  IF variant_uuid IS NULL THEN
    SELECT id INTO variant_uuid 
    FROM public.product_variants 
    WHERE product_id = product_uuid 
      AND size = preferred_size 
      AND is_active = true
    LIMIT 1;
  END IF;
  
  -- If still no match, get any variant for this product
  IF variant_uuid IS NULL THEN
    SELECT id INTO variant_uuid 
    FROM public.product_variants 
    WHERE product_id = product_uuid 
      AND is_active = true
    ORDER BY color_name, size
    LIMIT 1;
  END IF;
  
  RETURN variant_uuid;
END;
$$;


ALTER FUNCTION public.get_default_variant_for_product(product_uuid uuid, preferred_color text, preferred_size text) OWNER TO postgres;


--
-- Name: get_migration_status(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_migration_status() RETURNS TABLE(table_name text, total_records bigint, with_variants bigint, custom_designs bigint, unmapped bigint, migration_complete boolean)
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Cart items status
  RETURN QUERY SELECT 
    'cart_items'::TEXT,
    COUNT(*)::BIGINT as total_records,
    COUNT(CASE WHEN variant_id IS NOT NULL THEN 1 END)::BIGINT as with_variants,
    COUNT(CASE WHEN legacy_product_id = 'custom-design' THEN 1 END)::BIGINT as custom_designs,
    COUNT(CASE WHEN variant_id IS NULL AND legacy_product_id != 'custom-design' THEN 1 END)::BIGINT as unmapped,
    COUNT(CASE WHEN variant_id IS NULL AND legacy_product_id != 'custom-design' THEN 1 END) = 0 as migration_complete
  FROM public.cart_items;
  
  -- Order items status
  RETURN QUERY SELECT 
    'order_items'::TEXT,
    COUNT(*)::BIGINT as total_records,
    COUNT(CASE WHEN variant_id IS NOT NULL THEN 1 END)::BIGINT as with_variants,
    COUNT(CASE WHEN legacy_product_id = 'custom-design' THEN 1 END)::BIGINT as custom_designs,
    COUNT(CASE WHEN variant_id IS NULL AND legacy_product_id != 'custom-design' THEN 1 END)::BIGINT as unmapped,
    COUNT(CASE WHEN variant_id IS NULL AND legacy_product_id != 'custom-design' THEN 1 END) = 0 as migration_complete
  FROM public.order_items;
  
END;
$$;


ALTER FUNCTION public.get_migration_status() OWNER TO postgres;


--
-- Name: get_migration_summary(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_migration_summary() RETURNS TABLE(phase text, description text, tables_affected text, records_migrated bigint, status text)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY SELECT 
    'Phase 1'::TEXT,
    'Database Structure Creation'::TEXT,
    'product_categories, product_variants'::TEXT,
    0::BIGINT,
    'COMPLETE'::TEXT;
    
  RETURN QUERY SELECT 
    'Phase 2'::TEXT,
    'Data Migration & Validation'::TEXT,
    'products, product_variants'::TEXT,
    (SELECT COUNT(*) FROM public.product_variants)::BIGINT,
    'COMPLETE'::TEXT;
    
  RETURN QUERY SELECT 
    'Phase 3'::TEXT,
    'Legacy Data Migration'::TEXT,
    'cart_items, order_items'::TEXT,
    (SELECT COUNT(*) FROM public.cart_items WHERE variant_id IS NOT NULL) + 
    (SELECT COUNT(*) FROM public.order_items WHERE variant_id IS NOT NULL)::BIGINT,
    'COMPLETE'::TEXT;
    
  RETURN QUERY SELECT 
    'Phase 4'::TEXT,
    'Schema Cleanup & Optimization'::TEXT,
    'Constraints, indexes, custom design handling'::TEXT,
    (SELECT COUNT(*) FROM public.order_items WHERE legacy_product_id = 'custom-design')::BIGINT,
    'COMPLETE'::TEXT;
END;
$$;


ALTER FUNCTION public.get_migration_summary() OWNER TO postgres;


--
-- Name: get_product_colors(uuid, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_product_colors(product_uuid uuid, size_param text) RETURNS TABLE(color_name text, color_hex text, stock_quantity integer, variant_id uuid)
    LANGUAGE sql
    AS $$
  SELECT color_name, color_hex, stock_quantity, id as variant_id
  FROM public.product_variants 
  WHERE product_id = product_uuid 
  AND size = size_param
  AND is_active = true
  AND stock_quantity > 0
  ORDER BY color_name;
$$;


ALTER FUNCTION public.get_product_colors(product_uuid uuid, size_param text) OWNER TO postgres;


--
-- Name: get_product_sizes(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_product_sizes(product_uuid uuid) RETURNS TABLE(size text, available_stock integer, sort_order integer)
    LANGUAGE sql
    AS $$
  SELECT 
    size, 
    SUM(stock_quantity)::INTEGER as available_stock,
    CASE size
      WHEN 'XS' THEN 1
      WHEN 'S' THEN 2
      WHEN 'M' THEN 3
      WHEN 'L' THEN 4
      WHEN 'XL' THEN 5
      WHEN 'XXL' THEN 6
      ELSE 7
    END as sort_order
  FROM public.product_variants 
  WHERE product_id = product_uuid 
  AND is_active = true
  GROUP BY size
  ORDER BY sort_order;
$$;


ALTER FUNCTION public.get_product_sizes(product_uuid uuid) OWNER TO postgres;


--
-- Name: get_sample_variants(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_sample_variants(limit_count integer DEFAULT 10) RETURNS TABLE(product_name text, sku text, color_name text, color_hex text, size text, price numeric, stock_quantity integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY SELECT 
    p.name as product_name,
    pv.sku,
    pv.color_name,
    pv.color_hex,
    pv.size,
    pv.price,
    pv.stock_quantity
  FROM public.product_variants pv
  JOIN public.products p ON pv.product_id = p.id
  ORDER BY p.name, pv.color_name, pv.size
  LIMIT limit_count;
END;
$$;


ALTER FUNCTION public.get_sample_variants(limit_count integer) OWNER TO postgres;


--
-- Name: get_theme_questions(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_theme_questions(theme_uuid uuid) RETURNS TABLE(id uuid, question_text text, type text, options jsonb, sort_order integer)
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT id, question_text, type, options, sort_order
  FROM public.design_questions
  WHERE theme_id = theme_uuid OR theme_id IS NULL
  ORDER BY sort_order, created_at;
$$;


ALTER FUNCTION public.get_theme_questions(theme_uuid uuid) OWNER TO postgres;


--
-- Name: get_variant_breakdown(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_variant_breakdown() RETURNS TABLE(product_name text, product_id uuid, color_count bigint, size_count bigint, variants_created bigint, expected_variants bigint, price numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY SELECT 
    p.name as product_name,
    p.id as product_id,
    jsonb_array_length(p.colors) as color_count,
    jsonb_array_length(p.sizes) as size_count,
    COUNT(pv.id) as variants_created,
    (jsonb_array_length(p.colors) * jsonb_array_length(p.sizes)) as expected_variants,
    p.base_price as price
  FROM public.products p
  LEFT JOIN public.product_variants pv ON p.id = pv.product_id
  GROUP BY p.id, p.name, p.colors, p.sizes, p.base_price
  ORDER BY p.name;
END;
$$;


ALTER FUNCTION public.get_variant_breakdown() OWNER TO postgres;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$;


ALTER FUNCTION public.handle_new_user() OWNER TO postgres;


--
-- Name: map_legacy_product_id_to_uuid(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.map_legacy_product_id_to_uuid(legacy_id text) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
  mapped_uuid UUID;
BEGIN
  -- Handle special cases
  IF legacy_id = 'custom-design' THEN
    RETURN NULL; -- Keep as NULL for custom designs
  END IF;
  
  -- Map numeric legacy IDs to current product UUIDs based on order
  -- This assumes the products were created in a specific order
  CASE legacy_id
    WHEN '1' THEN 
      SELECT id INTO mapped_uuid FROM public.products ORDER BY created_at LIMIT 1;
    WHEN '2' THEN 
      SELECT id INTO mapped_uuid FROM public.products ORDER BY created_at LIMIT 1 OFFSET 1;
    WHEN '3' THEN 
      SELECT id INTO mapped_uuid FROM public.products ORDER BY created_at LIMIT 1 OFFSET 2;
    WHEN '4' THEN 
      SELECT id INTO mapped_uuid FROM public.products ORDER BY created_at LIMIT 1 OFFSET 0; -- Map to first product
    WHEN '9' THEN 
      SELECT id INTO mapped_uuid FROM public.products ORDER BY created_at LIMIT 1 OFFSET 1; -- Map to second product
    ELSE
      -- Default to first product for unknown legacy IDs
      SELECT id INTO mapped_uuid FROM public.products ORDER BY created_at LIMIT 1;
  END CASE;
  
  RETURN mapped_uuid;
END;
$$;


ALTER FUNCTION public.map_legacy_product_id_to_uuid(legacy_id text) OWNER TO postgres;


--
-- Name: release_stock(uuid, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.release_stock(variant_uuid uuid, quantity integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Add stock back
  UPDATE public.product_variants 
  SET stock_quantity = stock_quantity + quantity,
      updated_at = NOW()
  WHERE id = variant_uuid;
END;
$$;


ALTER FUNCTION public.release_stock(variant_uuid uuid, quantity integer) OWNER TO postgres;


--
-- Name: reserve_stock(uuid, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.reserve_stock(variant_uuid uuid, quantity integer) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
  current_stock INTEGER;
BEGIN
  -- Get current stock with row lock
  SELECT stock_quantity INTO current_stock
  FROM public.product_variants 
  WHERE id = variant_uuid 
  FOR UPDATE;
  
  -- Check if we have enough stock
  IF current_stock >= quantity THEN
    -- Deduct stock
    UPDATE public.product_variants 
    SET stock_quantity = stock_quantity - quantity,
        updated_at = NOW()
    WHERE id = variant_uuid;
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;


ALTER FUNCTION public.reserve_stock(variant_uuid uuid, quantity integer) OWNER TO postgres;


--
-- Name: set_order_number(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_order_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_order_number() OWNER TO postgres;


--
-- Name: update_custom_designs_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_custom_designs_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_custom_designs_updated_at() OWNER TO postgres;


--
-- Name: update_order_items_variants(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_order_items_variants() RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
  updated_count INTEGER := 0;
BEGIN
  -- Only update non-custom design items that don't have variant_id
  UPDATE public.order_items 
  SET variant_id = public.get_default_variant_for_product(
    public.map_legacy_product_id_to_uuid(legacy_product_id)
  )
  WHERE variant_id IS NULL 
    AND legacy_product_id NOT IN ('custom-design')
    AND legacy_product_id IS NOT NULL;
    
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;


ALTER FUNCTION public.update_order_items_variants() OWNER TO postgres;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;


--
-- Name: validate_final_migration(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.validate_final_migration() RETURNS TABLE(check_name text, status text, expected_value bigint, actual_value bigint, success boolean, details text)
    LANGUAGE plpgsql
    AS $$
DECLARE
  cart_items_count BIGINT;
  order_items_count BIGINT;
  variants_count BIGINT;
  custom_design_orders BIGINT;
  regular_product_orders BIGINT;
BEGIN
  -- Get record counts
  SELECT COUNT(*) INTO cart_items_count FROM public.cart_items;
  SELECT COUNT(*) INTO order_items_count FROM public.order_items;
  SELECT COUNT(*) INTO variants_count FROM public.product_variants;
  SELECT COUNT(*) INTO custom_design_orders FROM public.order_items WHERE legacy_product_id = 'custom-design';
  SELECT COUNT(*) INTO regular_product_orders FROM public.order_items WHERE legacy_product_id != 'custom-design' OR legacy_product_id IS NULL;
  
  -- Validate all cart items have valid variant references
  RETURN QUERY SELECT 
    'cart_items_valid_variants'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
    0::BIGINT,
    COUNT(*)::BIGINT,
    COUNT(*) = 0,
    'All cart items should reference valid variants'::TEXT
  FROM public.cart_items ci
  LEFT JOIN public.product_variants pv ON ci.variant_id = pv.id
  WHERE pv.id IS NULL;
  
  -- Validate regular product order items have valid variant references
  RETURN QUERY SELECT 
    'order_items_valid_variants'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
    0::BIGINT,
    COUNT(*)::BIGINT,
    COUNT(*) = 0,
    'All non-custom order items should reference valid variants'::TEXT
  FROM public.order_items oi
  LEFT JOIN public.product_variants pv ON oi.variant_id = pv.id
  WHERE pv.id IS NULL AND oi.legacy_product_id != 'custom-design';
  
  -- Validate custom design orders have NULL variant_id (as expected)
  RETURN QUERY SELECT 
    'custom_design_orders_null_variant'::TEXT,
    CASE WHEN COUNT(*) = custom_design_orders THEN 'PASS' ELSE 'FAIL' END::TEXT,
    custom_design_orders,
    COUNT(*)::BIGINT,
    COUNT(*) = custom_design_orders,
    'Custom design orders should have NULL variant_id'::TEXT
  FROM public.order_items
  WHERE legacy_product_id = 'custom-design' AND variant_id IS NULL;
  
  -- Validate variant count matches expected
  RETURN QUERY SELECT 
    'variant_count_final'::TEXT,
    CASE WHEN variants_count = 60 THEN 'PASS' ELSE 'FAIL' END::TEXT,
    60::BIGINT,
    variants_count,
    variants_count = 60,
    'Should have exactly 60 product variants'::TEXT;
  
  -- Summary statistics
  RETURN QUERY SELECT 
    'migration_summary'::TEXT,
    'INFO'::TEXT,
    order_items_count,
    custom_design_orders,
    true,
    FORMAT('Total: %s orders (%s custom, %s regular products)', 
           order_items_count, custom_design_orders, regular_product_orders)::TEXT;
  
END;
$$;


ALTER FUNCTION public.validate_final_migration() OWNER TO postgres;


--
-- Name: validate_migration_data(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.validate_migration_data() RETURNS TABLE(check_name text, status text, count_value bigint, details text)
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Check existing products count
  RETURN QUERY SELECT 
    'existing_products'::TEXT,
    'info'::TEXT,
    COUNT(*)::BIGINT,
    'Total products in current system'::TEXT
  FROM public.products;
  
  -- Check existing cart items count
  RETURN QUERY SELECT 
    'existing_cart_items'::TEXT,
    'info'::TEXT,
    COUNT(*)::BIGINT,
    'Total cart items in current system'::TEXT
  FROM public.cart_items;
  
  -- Check existing order items count
  RETURN QUERY SELECT 
    'existing_order_items'::TEXT,
    'info'::TEXT,
    COUNT(*)::BIGINT,
    'Total order items in current system'::TEXT
  FROM public.order_items;
  
  -- Validate JSON structure in products
  RETURN QUERY SELECT 
    'products_with_valid_colors'::TEXT,
    'validation'::TEXT,
    COUNT(*)::BIGINT,
    'Products with valid color JSON arrays'::TEXT
  FROM public.products 
  WHERE jsonb_typeof(colors) = 'array';
  
  -- Validate JSON structure for sizes
  RETURN QUERY SELECT 
    'products_with_valid_sizes'::TEXT,
    'validation'::TEXT,
    COUNT(*)::BIGINT,
    'Products with valid size JSON arrays'::TEXT
  FROM public.products 
  WHERE jsonb_typeof(sizes) = 'array';
  
  -- Calculate expected variants count
  RETURN QUERY SELECT 
    'expected_variants_total'::TEXT,
    'calculation'::TEXT,
    SUM(jsonb_array_length(colors) * jsonb_array_length(sizes))::BIGINT,
    'Total variants that will be created'::TEXT
  FROM public.products 
  WHERE jsonb_typeof(colors) = 'array' AND jsonb_typeof(sizes) = 'array';
  
END;
$$;


ALTER FUNCTION public.validate_migration_data() OWNER TO postgres;


--
-- Name: validate_phase2_migration(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.validate_phase2_migration() RETURNS TABLE(check_name text, status text, expected_value bigint, actual_value bigint, success boolean, details text)
    LANGUAGE plpgsql
    AS $$
DECLARE
  expected_variants BIGINT;
  actual_variants BIGINT;
  products_with_categories BIGINT;
  total_products BIGINT;
BEGIN
  -- Calculate expected variants
  SELECT SUM(jsonb_array_length(colors) * jsonb_array_length(sizes)) 
  INTO expected_variants
  FROM public.products 
  WHERE jsonb_typeof(colors) = 'array' AND jsonb_typeof(sizes) = 'array';
  
  -- Get actual variants created
  SELECT COUNT(*) INTO actual_variants FROM public.product_variants;
  
  -- Get products with categories
  SELECT COUNT(*) INTO products_with_categories 
  FROM public.products 
  WHERE category_id IS NOT NULL;
  
  -- Get total products
  SELECT COUNT(*) INTO total_products FROM public.products;
  
  -- Variant count validation
  RETURN QUERY SELECT 
    'variant_count_validation'::TEXT,
    CASE WHEN expected_variants = actual_variants THEN 'PASS' ELSE 'FAIL' END::TEXT,
    expected_variants,
    actual_variants,
    expected_variants = actual_variants,
    'Expected vs actual variant count'::TEXT;
  
  -- Category assignment validation
  RETURN QUERY SELECT 
    'category_assignment_validation'::TEXT,
    CASE WHEN products_with_categories = total_products THEN 'PASS' ELSE 'FAIL' END::TEXT,
    total_products,
    products_with_categories,
    products_with_categories = total_products,
    'All products should have categories assigned'::TEXT;
  
  -- SKU uniqueness validation
  RETURN QUERY SELECT 
    'sku_uniqueness_validation'::TEXT,
    CASE WHEN COUNT(*) = COUNT(DISTINCT sku) THEN 'PASS' ELSE 'FAIL' END::TEXT,
    COUNT(*)::BIGINT,
    COUNT(DISTINCT sku)::BIGINT,
    COUNT(*) = COUNT(DISTINCT sku),
    'All SKUs should be unique'::TEXT
  FROM public.product_variants;
  
  -- Price consistency validation
  RETURN QUERY SELECT 
    'price_consistency_validation'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
    0::BIGINT,
    COUNT(*)::BIGINT,
    COUNT(*) = 0,
    'No variants should have price mismatches with base product'::TEXT
  FROM public.product_variants pv
  JOIN public.products p ON pv.product_id = p.id
  WHERE pv.price != p.base_price;
  
  -- Stock level validation
  RETURN QUERY SELECT 
    'stock_level_validation'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
    0::BIGINT,
    COUNT(*)::BIGINT,
    COUNT(*) = 0,
    'All variants should have positive stock levels'::TEXT
  FROM public.product_variants
  WHERE stock_quantity <= 0;
  
END;
$$;


ALTER FUNCTION public.validate_phase2_migration() OWNER TO postgres;


--
-- Name: validate_phase3_migration(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.validate_phase3_migration() RETURNS TABLE(check_name text, status text, total_records bigint, migrated_records bigint, success boolean, details text)
    LANGUAGE plpgsql
    AS $$
DECLARE
  total_cart_items BIGINT;
  cart_items_with_variants BIGINT;
  cart_items_custom_designs BIGINT;
  total_order_items BIGINT;
  order_items_with_variants BIGINT;
  order_items_custom_designs BIGINT;
BEGIN
  -- Get cart items counts
  SELECT COUNT(*) INTO total_cart_items FROM public.cart_items;
  SELECT COUNT(*) INTO cart_items_with_variants FROM public.cart_items WHERE variant_id IS NOT NULL;
  SELECT COUNT(*) INTO cart_items_custom_designs FROM public.cart_items WHERE legacy_product_id = 'custom-design';
  
  -- Get order items counts
  SELECT COUNT(*) INTO total_order_items FROM public.order_items;
  SELECT COUNT(*) INTO order_items_with_variants FROM public.order_items WHERE variant_id IS NOT NULL;
  SELECT COUNT(*) INTO order_items_custom_designs FROM public.order_items WHERE legacy_product_id = 'custom-design';
  
  -- Cart items validation
  RETURN QUERY SELECT 
    'cart_items_migration'::TEXT,
    CASE WHEN (cart_items_with_variants + cart_items_custom_designs) = total_cart_items THEN 'PASS' ELSE 'FAIL' END::TEXT,
    total_cart_items,
    cart_items_with_variants,
    (cart_items_with_variants + cart_items_custom_designs) = total_cart_items,
    'Cart items with variants + custom designs should equal total'::TEXT;
  
  -- Order items validation
  RETURN QUERY SELECT 
    'order_items_migration'::TEXT,
    CASE WHEN (order_items_with_variants + order_items_custom_designs) = total_order_items THEN 'PASS' ELSE 'FAIL' END::TEXT,
    total_order_items,
    order_items_with_variants,
    (order_items_with_variants + order_items_custom_designs) = total_order_items,
    'Order items with variants + custom designs should equal total'::TEXT;
  
  -- Legacy data preservation check
  RETURN QUERY SELECT 
    'legacy_data_preservation'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
    0::BIGINT,
    COUNT(*)::BIGINT,
    COUNT(*) = 0,
    'No records should have lost their legacy product IDs'::TEXT
  FROM (
    SELECT 1 FROM public.cart_items WHERE legacy_product_id IS NULL
    UNION ALL
    SELECT 1 FROM public.order_items WHERE legacy_product_id IS NULL
  ) AS missing_legacy;
  
END;
$$;


ALTER FUNCTION public.validate_phase3_migration() OWNER TO postgres;


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_admin;


--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_admin;


--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_admin;


--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_admin;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_admin;


--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_admin;


--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_admin;


--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_admin;


--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_admin;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_admin;


--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_admin;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;


--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
_filename text;
BEGIN
	select string_to_array(name, '/') into _parts;
	select _parts[array_length(_parts,1)] into _filename;
	-- @todo return the last part instead of 2
	return reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;


--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[1:array_length(_parts,1)-1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::int) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO supabase_storage_admin;


--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO supabase_storage_admin;


--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text) OWNER TO supabase_storage_admin;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
  v_order_by text;
  v_sort_order text;
begin
  case
    when sortcolumn = 'name' then
      v_order_by = 'name';
    when sortcolumn = 'updated_at' then
      v_order_by = 'updated_at';
    when sortcolumn = 'created_at' then
      v_order_by = 'created_at';
    when sortcolumn = 'last_accessed_at' then
      v_order_by = 'last_accessed_at';
    else
      v_order_by = 'name';
  end case;

  case
    when sortorder = 'asc' then
      v_sort_order = 'asc';
    when sortorder = 'desc' then
      v_sort_order = 'desc';
    else
      v_sort_order = 'asc';
  end case;

  v_order_by = v_order_by || ' ' || v_sort_order;

  return query execute
    'with folders as (
       select path_tokens[$1] as folder
       from storage.objects
         where objects.name ilike $2 || $3 || ''%''
           and bucket_id = $4
           and array_length(objects.path_tokens, 1) <> $1
       group by folder
       order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;


