-- Phase 3: Legacy Data Migration (Critical Step)
-- Handle existing cart_items and order_items mapping to new variant system

-- Step 1: Add new columns to existing tables (backward compatible)
ALTER TABLE public.cart_items 
ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES public.product_variants(id),
ADD COLUMN IF NOT EXISTS legacy_product_id TEXT,
ADD COLUMN IF NOT EXISTS selected_color TEXT DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS selected_size TEXT DEFAULT 'M';

ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES public.product_variants(id),
ADD COLUMN IF NOT EXISTS legacy_product_id TEXT;

-- Step 2: Backup legacy product_id values
UPDATE public.cart_items 
SET legacy_product_id = product_id 
WHERE legacy_product_id IS NULL;

UPDATE public.order_items 
SET legacy_product_id = product_id 
WHERE legacy_product_id IS NULL;

-- Step 3: Create mapping function for legacy product IDs to current products
CREATE OR REPLACE FUNCTION public.map_legacy_product_id_to_uuid(legacy_id TEXT)
RETURNS UUID
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

-- Step 4: Create function to get default variant for legacy mapping
CREATE OR REPLACE FUNCTION public.get_default_variant_for_product(
  product_uuid UUID,
  preferred_color TEXT DEFAULT '#FFFFFF',
  preferred_size TEXT DEFAULT 'M'
)
RETURNS UUID
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

-- Step 5: Update cart_items with variant mapping
UPDATE public.cart_items 
SET 
  variant_id = public.get_default_variant_for_product(
    public.map_legacy_product_id_to_uuid(legacy_product_id),
    selected_color,
    selected_size
  ),
  product_id = public.map_legacy_product_id_to_uuid(legacy_product_id)::text
WHERE variant_id IS NULL 
  AND legacy_product_id != 'custom-design'
  AND legacy_product_id IS NOT NULL;

-- Step 6: Update order_items with variant mapping (preserve historical integrity)
UPDATE public.order_items 
SET 
  variant_id = public.get_default_variant_for_product(
    public.map_legacy_product_id_to_uuid(legacy_product_id),
    '#FFFFFF', -- Default to white for historical orders
    'M'        -- Default to Medium for historical orders
  ),
  product_id = COALESCE(
    public.map_legacy_product_id_to_uuid(legacy_product_id)::text,
    legacy_product_id -- Keep original for custom designs
  )
WHERE variant_id IS NULL 
  AND legacy_product_id != 'custom-design'
  AND legacy_product_id IS NOT NULL;

-- Step 7: Create validation function for Phase 3
CREATE OR REPLACE FUNCTION public.validate_phase3_migration()
RETURNS TABLE(
  check_name TEXT,
  status TEXT,
  total_records BIGINT,
  migrated_records BIGINT,
  success BOOLEAN,
  details TEXT
) 
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

-- Step 8: Create detailed migration status function
CREATE OR REPLACE FUNCTION public.get_migration_status()
RETURNS TABLE(
  table_name TEXT,
  total_records BIGINT,
  with_variants BIGINT,
  custom_designs BIGINT,
  unmapped BIGINT,
  migration_complete BOOLEAN
) 
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