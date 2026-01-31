-- Extracted Public Schema
SET standard_conforming_strings = on;
SET search_path TO public, extensions;

--
-- CATEGORY: SEQUENCE
--

--
-- Name: order_number_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_number_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;





--
-- CATEGORY: SEQUENCE SET
--

--
-- Name: order_number_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_number_seq', 16, true);



--
-- CATEGORY: TABLE
--

--
-- Name: addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.addresses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    street_address text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    postal_code text NOT NULL,
    country text DEFAULT 'United States'::text NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);





--
-- Name: ai_generated_designs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_generated_designs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    prompt text NOT NULL,
    design_image text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_favorite boolean DEFAULT false NOT NULL,
    theme_id uuid
);





--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    product_id text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    variant_id uuid NOT NULL,
    legacy_product_id text,
    selected_color text DEFAULT '#FFFFFF'::text,
    selected_size text DEFAULT 'M'::text
);





--
-- Name: custom_designs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_designs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    design_name text NOT NULL,
    design_data jsonb NOT NULL,
    design_image text NOT NULL,
    tshirt_color text DEFAULT '#FFFFFF'::text NOT NULL,
    base_price numeric DEFAULT 29.99 NOT NULL,
    theme_name text,
    answers jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);





--
-- Name: design_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.design_questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question_text text NOT NULL,
    type text NOT NULL,
    options jsonb,
    theme_id uuid,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT design_questions_type_check CHECK ((type = ANY (ARRAY['text'::text, 'color'::text, 'choice'::text])))
);





--
-- Name: design_responses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.design_responses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    design_id uuid NOT NULL,
    question_id uuid NOT NULL,
    response text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);





--
-- Name: designs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.designs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    theme text,
    t_shirt_color text NOT NULL,
    design_data jsonb NOT NULL,
    preview_url text,
    is_public boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);





--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    product_id text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total_price numeric(10,2) NOT NULL,
    design_data jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    custom_design_id uuid,
    variant_id uuid,
    legacy_product_id text
);





--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    order_number text NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    shipping_address_id uuid,
    shipping_address jsonb NOT NULL,
    payment_method text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    payment_transaction_id uuid,
    CONSTRAINT orders_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'shipped'::text, 'delivered'::text, 'cancelled'::text])))
);





--
-- Name: payment_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    payment_gateway text NOT NULL,
    gateway_transaction_id text NOT NULL,
    payment_method text NOT NULL,
    upi_transaction_id text,
    upi_id text,
    amount numeric NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    gateway_response jsonb,
    failure_reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);





--
-- Name: product_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);





--
-- Name: product_variants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_variants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    sku text NOT NULL,
    color_name text NOT NULL,
    color_hex text NOT NULL,
    size text NOT NULL,
    price numeric(10,2) NOT NULL,
    stock_quantity integer DEFAULT 0 NOT NULL,
    low_stock_threshold integer DEFAULT 5,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);





--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    base_price numeric(10,2) NOT NULL,
    category text DEFAULT 'tshirt'::text,
    sizes jsonb DEFAULT '["S", "M", "L", "XL", "XXL"]'::jsonb,
    colors jsonb DEFAULT '["#FFFFFF", "#000000", "#8A898C", "#1EAEDB"]'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    category_id uuid
);





--
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    full_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    marketing_emails boolean DEFAULT true NOT NULL
);





--
-- Name: themes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.themes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    thumbnail_url text,
    is_active boolean DEFAULT true,
    category text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);





--
-- CATEGORY: FUNCTION
--

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





--
-- CATEGORY: INDEX
--

--
-- Name: idx_cart_items_user_variant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cart_items_user_variant ON public.cart_items USING btree (user_id, variant_id);



--
-- Name: idx_cart_items_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cart_items_variant_id ON public.cart_items USING btree (variant_id);



--
-- Name: idx_custom_designs_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_custom_designs_user_id ON public.custom_designs USING btree (user_id);



--
-- Name: idx_order_items_custom_design; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_custom_design ON public.order_items USING btree (order_id) WHERE (variant_id IS NULL);



--
-- Name: idx_order_items_order_variant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_order_variant ON public.order_items USING btree (order_id, variant_id) WHERE (variant_id IS NOT NULL);



--
-- Name: idx_order_items_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_variant_id ON public.order_items USING btree (variant_id) WHERE (variant_id IS NOT NULL);



--
-- Name: idx_payment_transactions_gateway_transaction_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_transactions_gateway_transaction_id ON public.payment_transactions USING btree (gateway_transaction_id);



--
-- Name: idx_payment_transactions_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_transactions_order_id ON public.payment_transactions USING btree (order_id);



--
-- Name: idx_payment_transactions_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_transactions_status ON public.payment_transactions USING btree (status);



--
-- Name: idx_product_variants_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_variants_active ON public.product_variants USING btree (is_active);



--
-- Name: idx_product_variants_product_color_size; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_variants_product_color_size ON public.product_variants USING btree (product_id, color_hex, size);



--
-- Name: idx_product_variants_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_variants_product_id ON public.product_variants USING btree (product_id);



--
-- Name: idx_product_variants_sku; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_variants_sku ON public.product_variants USING btree (sku);



--
-- Name: idx_product_variants_stock; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_variants_stock ON public.product_variants USING btree (stock_quantity);



--
-- CATEGORY: CONSTRAINT
--

--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);



--
-- Name: ai_generated_designs ai_generated_designs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_generated_designs
    ADD CONSTRAINT ai_generated_designs_pkey PRIMARY KEY (id);



--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);



--
-- Name: custom_designs custom_designs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_designs
    ADD CONSTRAINT custom_designs_pkey PRIMARY KEY (id);



--
-- Name: design_questions design_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.design_questions
    ADD CONSTRAINT design_questions_pkey PRIMARY KEY (id);



--
-- Name: design_responses design_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.design_responses
    ADD CONSTRAINT design_responses_pkey PRIMARY KEY (id);



--
-- Name: designs designs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.designs
    ADD CONSTRAINT designs_pkey PRIMARY KEY (id);



--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);



--
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);



--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);



--
-- Name: payment_transactions payment_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_pkey PRIMARY KEY (id);



--
-- Name: product_categories product_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_name_key UNIQUE (name);



--
-- Name: product_categories product_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_pkey PRIMARY KEY (id);



--
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);



--
-- Name: product_variants product_variants_sku_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_sku_key UNIQUE (sku);



--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);



--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);



--
-- Name: themes themes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.themes
    ADD CONSTRAINT themes_pkey PRIMARY KEY (id);



--
-- Name: product_variants unique_product_color_size; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT unique_product_color_size UNIQUE (product_id, color_hex, size);



--
-- CATEGORY: FK CONSTRAINT
--

--
-- Name: addresses addresses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);



--
-- Name: ai_generated_designs ai_generated_designs_theme_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_generated_designs
    ADD CONSTRAINT ai_generated_designs_theme_id_fkey FOREIGN KEY (theme_id) REFERENCES public.themes(id);



--
-- Name: ai_generated_designs ai_generated_designs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_generated_designs
    ADD CONSTRAINT ai_generated_designs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);



--
-- Name: cart_items cart_items_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);



--
-- Name: cart_items cart_items_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id);



--
-- Name: custom_designs custom_designs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_designs
    ADD CONSTRAINT custom_designs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);



--
-- Name: design_questions design_questions_theme_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.design_questions
    ADD CONSTRAINT design_questions_theme_id_fkey FOREIGN KEY (theme_id) REFERENCES public.themes(id);



--
-- Name: design_responses design_responses_design_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.design_responses
    ADD CONSTRAINT design_responses_design_id_fkey FOREIGN KEY (design_id) REFERENCES public.designs(id) ON DELETE CASCADE;



--
-- Name: design_responses design_responses_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.design_responses
    ADD CONSTRAINT design_responses_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.design_questions(id);



--
-- Name: designs designs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.designs
    ADD CONSTRAINT designs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);



--
-- Name: cart_items fk_cart_items_variant; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT fk_cart_items_variant FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE CASCADE;



--
-- Name: order_items fk_order_items_variant; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fk_order_items_variant FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE RESTRICT;



--
-- Name: product_variants fk_product_variants_product_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT fk_product_variants_product_id FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;



--
-- Name: order_items order_items_custom_design_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_custom_design_id_fkey FOREIGN KEY (custom_design_id) REFERENCES public.custom_designs(id);



--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;



--
-- Name: order_items order_items_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id);



--
-- Name: orders orders_payment_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_payment_transaction_id_fkey FOREIGN KEY (payment_transaction_id) REFERENCES public.payment_transactions(id);



--
-- Name: payment_transactions payment_transactions_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);



--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.product_categories(id);



--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;



--
-- CATEGORY: TRIGGER
--

--
-- Name: orders set_order_number_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_order_number_trigger BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_order_number();



--
-- Name: custom_designs trigger_update_custom_designs_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_custom_designs_updated_at BEFORE UPDATE ON public.custom_designs FOR EACH ROW EXECUTE FUNCTION public.update_custom_designs_updated_at();



--
-- Name: payment_transactions trigger_update_payment_transactions_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_payment_transactions_updated_at BEFORE UPDATE ON public.payment_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();



--
-- Name: orders update_orders_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();



--
-- Name: product_categories update_product_categories_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON public.product_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();



--
-- Name: product_variants update_product_variants_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();



--
-- CATEGORY: POLICY
--

--
-- Name: design_questions Allow everyone to view questions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow everyone to view questions" ON public.design_questions FOR SELECT USING (true);



--
-- Name: themes Allow everyone to view themes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow everyone to view themes" ON public.themes FOR SELECT USING (true);



--
-- Name: designs Allow users to delete their own designs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow users to delete their own designs" ON public.designs FOR DELETE USING ((auth.uid() = user_id));



--
-- Name: designs Allow users to insert their own designs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow users to insert their own designs" ON public.designs FOR INSERT WITH CHECK ((auth.uid() = user_id));



--
-- Name: design_responses Allow users to insert their own responses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow users to insert their own responses" ON public.design_responses FOR INSERT WITH CHECK ((auth.uid() = ( SELECT designs.user_id
   FROM public.designs
  WHERE (designs.id = design_responses.design_id))));



--
-- Name: designs Allow users to update their own designs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow users to update their own designs" ON public.designs FOR UPDATE USING ((auth.uid() = user_id));



--
-- Name: profiles Allow users to update their own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow users to update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));



--
-- Name: profiles Allow users to view all profiles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow users to view all profiles" ON public.profiles FOR SELECT USING (true);



--
-- Name: designs Allow users to view their own designs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow users to view their own designs" ON public.designs FOR SELECT USING (((auth.uid() = user_id) OR (is_public = true)));



--
-- Name: design_responses Allow users to view their own responses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow users to view their own responses" ON public.design_responses FOR SELECT USING ((auth.uid() = ( SELECT designs.user_id
   FROM public.designs
  WHERE (designs.id = design_responses.design_id))));



--
-- Name: product_categories Categories are publicly readable; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Categories are publicly readable" ON public.product_categories FOR SELECT USING ((is_active = true));



--
-- Name: product_variants Product variants are publicly readable; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Product variants are publicly readable" ON public.product_variants FOR SELECT USING ((is_active = true));



--
-- Name: products Products are publicly readable; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Products are publicly readable" ON public.products FOR SELECT USING ((is_active = true));



--
-- Name: ai_generated_designs Users can create their own AI designs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create their own AI designs" ON public.ai_generated_designs FOR INSERT WITH CHECK ((auth.uid() = user_id));



--
-- Name: cart_items Users can create their own cart items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create their own cart items" ON public.cart_items FOR INSERT WITH CHECK ((auth.uid() = user_id));



--
-- Name: custom_designs Users can create their own custom designs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create their own custom designs" ON public.custom_designs FOR INSERT WITH CHECK ((auth.uid() = user_id));



--
-- Name: order_items Users can create their own order items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create their own order items" ON public.order_items FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.orders
  WHERE ((orders.id = order_items.order_id) AND (orders.user_id = auth.uid())))));



--
-- Name: orders Users can create their own orders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create their own orders" ON public.orders FOR INSERT WITH CHECK ((auth.uid() = user_id));



--
-- Name: ai_generated_designs Users can delete their own AI designs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete their own AI designs" ON public.ai_generated_designs FOR DELETE USING ((auth.uid() = user_id));



--
-- Name: addresses Users can delete their own addresses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete their own addresses" ON public.addresses FOR DELETE USING ((auth.uid() = user_id));



--
-- Name: cart_items Users can delete their own cart items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete their own cart items" ON public.cart_items FOR DELETE USING ((auth.uid() = user_id));



--
-- Name: custom_designs Users can delete their own custom designs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete their own custom designs" ON public.custom_designs FOR DELETE USING ((auth.uid() = user_id));



--
-- Name: addresses Users can insert their own addresses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert their own addresses" ON public.addresses FOR INSERT WITH CHECK ((auth.uid() = user_id));



--
-- Name: cart_items Users can insert their own cart items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert their own cart items" ON public.cart_items FOR INSERT WITH CHECK ((auth.uid() = user_id));



--
-- Name: ai_generated_designs Users can update their own AI designs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own AI designs" ON public.ai_generated_designs FOR UPDATE USING ((auth.uid() = user_id));



--
-- Name: addresses Users can update their own addresses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own addresses" ON public.addresses FOR UPDATE USING ((auth.uid() = user_id));



--
-- Name: cart_items Users can update their own cart items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own cart items" ON public.cart_items FOR UPDATE USING ((auth.uid() = user_id));



--
-- Name: custom_designs Users can update their own custom designs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own custom designs" ON public.custom_designs FOR UPDATE USING ((auth.uid() = user_id));



--
-- Name: orders Users can update their own orders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own orders" ON public.orders FOR UPDATE USING ((auth.uid() = user_id));



--
-- Name: ai_generated_designs Users can view their own AI designs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own AI designs" ON public.ai_generated_designs FOR SELECT USING ((auth.uid() = user_id));



--
-- Name: addresses Users can view their own addresses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own addresses" ON public.addresses FOR SELECT USING ((auth.uid() = user_id));



--
-- Name: cart_items Users can view their own cart items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own cart items" ON public.cart_items FOR SELECT USING ((auth.uid() = user_id));



--
-- Name: custom_designs Users can view their own custom designs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own custom designs" ON public.custom_designs FOR SELECT USING ((auth.uid() = user_id));



--
-- Name: order_items Users can view their own order items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own order items" ON public.order_items FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.orders
  WHERE ((orders.id = order_items.order_id) AND (orders.user_id = auth.uid())))));



--
-- Name: orders Users can view their own orders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING ((auth.uid() = user_id));



--
-- Name: payment_transactions Users can view their own payment transactions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own payment transactions" ON public.payment_transactions FOR SELECT USING ((auth.uid() = ( SELECT orders.user_id
   FROM public.orders
  WHERE (orders.id = payment_transactions.order_id))));



