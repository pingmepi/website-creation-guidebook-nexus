-- Phase 3: Legacy Data Migration
-- This phase migrates existing cart_items and order_items to use the new variant system

-- Step 1: Add new columns to cart_items and order_items tables
ALTER TABLE public.cart_items 
ADD COLUMN variant_id UUID REFERENCES public.product_variants(id),
ADD COLUMN legacy_product_id TEXT;

ALTER TABLE public.order_items 
ADD COLUMN variant_id UUID REFERENCES public.product_variants(id),
ADD COLUMN legacy_product_id TEXT;

-- Step 2: Backup existing product_id values
UPDATE public.cart_items SET legacy_product_id = product_id;
UPDATE public.order_items SET legacy_product_id = product_id;

-- Step 3: Create function to map legacy product IDs to new UUIDs
CREATE OR REPLACE FUNCTION public.map_legacy_product_id_to_uuid(legacy_id TEXT)
RETURNS UUID AS $$
BEGIN
  CASE legacy_id
    WHEN '1' THEN RETURN (SELECT id FROM public.products WHERE name = 'Classic Cotton T-Shirt');
    WHEN '2' THEN RETURN (SELECT id FROM public.products WHERE name = 'Premium Blend Tee');
    WHEN '3' THEN RETURN (SELECT id FROM public.products WHERE name = 'Vintage Style Shirt');
    ELSE RETURN NULL;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create function to get default variant for a product
CREATE OR REPLACE FUNCTION public.get_default_variant_for_product(product_uuid UUID)
RETURNS UUID AS $$
BEGIN
  -- Return the first variant for the product (White, size M if available, otherwise first available)
  RETURN (
    SELECT id FROM public.product_variants 
    WHERE product_id = product_uuid 
    ORDER BY 
      CASE WHEN color_hex = '#FFFFFF' THEN 1 ELSE 2 END,
      CASE WHEN size = 'M' THEN 1 ELSE 2 END,
      created_at
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql;

-- Step 5: Update cart_items with variant_id
UPDATE public.cart_items 
SET variant_id = public.get_default_variant_for_product(
  public.map_legacy_product_id_to_uuid(legacy_product_id)
)
WHERE variant_id IS NULL;

-- Step 6: Update order_items with variant_id  
UPDATE public.order_items 
SET variant_id = public.get_default_variant_for_product(
  public.map_legacy_product_id_to_uuid(legacy_product_id)
)
WHERE variant_id IS NULL;

-- Step 7: Create validation function for Phase 3
CREATE OR REPLACE FUNCTION public.validate_phase3_migration()
RETURNS TABLE(
  check_name TEXT,
  status TEXT,
  expected_value BIGINT,
  actual_value BIGINT,
  success BOOLEAN,
  details TEXT
) AS $$
DECLARE
  cart_items_total BIGINT;
  cart_items_with_variants BIGINT;
  order_items_total BIGINT;
  order_items_with_variants BIGINT;
BEGIN
  -- Get counts
  SELECT COUNT(*) INTO cart_items_total FROM public.cart_items;
  SELECT COUNT(*) INTO cart_items_with_variants FROM public.cart_items WHERE variant_id IS NOT NULL;
  SELECT COUNT(*) INTO order_items_total FROM public.order_items;
  SELECT COUNT(*) INTO order_items_with_variants FROM public.order_items WHERE variant_id IS NOT NULL;
  
  -- Cart items variant mapping validation
  RETURN QUERY SELECT 
    'cart_items_variant_mapping'::TEXT,
    CASE WHEN cart_items_total = cart_items_with_variants THEN 'PASS' ELSE 'FAIL' END::TEXT,
    cart_items_total,
    cart_items_with_variants,
    cart_items_total = cart_items_with_variants,
    'All cart items should have variant_id mapped'::TEXT;
  
  -- Order items variant mapping validation
  RETURN QUERY SELECT 
    'order_items_variant_mapping'::TEXT,
    CASE WHEN order_items_total = order_items_with_variants THEN 'PASS' ELSE 'FAIL' END::TEXT,
    order_items_total,
    order_items_with_variants,
    order_items_total = order_items_with_variants,
    'All order items should have variant_id mapped'::TEXT;
  
  -- Legacy data preservation validation for cart_items
  RETURN QUERY SELECT 
    'cart_items_legacy_data_preserved'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
    0::BIGINT,
    COUNT(*)::BIGINT,
    COUNT(*) = 0,
    'All cart items should have legacy_product_id preserved'::TEXT
  FROM public.cart_items 
  WHERE legacy_product_id IS NULL;
  
  -- Legacy data preservation validation for order_items
  RETURN QUERY SELECT 
    'order_items_legacy_data_preserved'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
    0::BIGINT,
    COUNT(*)::BIGINT,
    COUNT(*) = 0,
    'All order items should have legacy_product_id preserved'::TEXT
  FROM public.order_items 
  WHERE legacy_product_id IS NULL;
  
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create function to get migration status
CREATE OR REPLACE FUNCTION public.get_migration_status()
RETURNS TABLE(
  table_name TEXT,
  total_records BIGINT,
  migrated_records BIGINT,
  migration_percentage NUMERIC,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY SELECT 
    'cart_items'::TEXT,
    COUNT(*)::BIGINT,
    COUNT(CASE WHEN variant_id IS NOT NULL THEN 1 END)::BIGINT,
    ROUND(
      (COUNT(CASE WHEN variant_id IS NOT NULL THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2
    ),
    CASE 
      WHEN COUNT(CASE WHEN variant_id IS NOT NULL THEN 1 END) = COUNT(*) THEN 'COMPLETE'
      ELSE 'INCOMPLETE'
    END::TEXT
  FROM public.cart_items;
  
  RETURN QUERY SELECT 
    'order_items'::TEXT,
    COUNT(*)::BIGINT,
    COUNT(CASE WHEN variant_id IS NOT NULL THEN 1 END)::BIGINT,
    ROUND(
      (COUNT(CASE WHEN variant_id IS NOT NULL THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2
    ),
    CASE 
      WHEN COUNT(CASE WHEN variant_id IS NOT NULL THEN 1 END) = COUNT(*) THEN 'COMPLETE'
      ELSE 'INCOMPLETE'
    END::TEXT
  FROM public.order_items;
END;
$$ LANGUAGE plpgsql;