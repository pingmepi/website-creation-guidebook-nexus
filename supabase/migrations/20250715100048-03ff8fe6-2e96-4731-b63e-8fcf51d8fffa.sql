-- Phase 4: Schema Cleanup and Optimization (Corrected)
-- This phase adds constraints, indexes, and handles custom designs properly

-- Step 1: Handle custom design items - these should keep variant_id as NULL since they're custom
-- Update the mapping function to exclude custom designs
CREATE OR REPLACE FUNCTION public.update_order_items_variants()
RETURNS INTEGER AS $$
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
$$ LANGUAGE plpgsql;

-- Execute the update
SELECT public.update_order_items_variants();

-- Step 2: Add foreign key constraints for data integrity (only for regular products)
ALTER TABLE public.cart_items 
ADD CONSTRAINT fk_cart_items_variant 
FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE CASCADE;

-- For order_items, we'll add a conditional constraint that allows NULL for custom designs
-- But first, let's add the constraint for non-NULL values
ALTER TABLE public.order_items 
ADD CONSTRAINT fk_order_items_variant 
FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE RESTRICT;

-- Step 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cart_items_variant_id ON public.cart_items(variant_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_variant ON public.cart_items(user_id, variant_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON public.order_items(variant_id) WHERE variant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_order_items_order_variant ON public.order_items(order_id, variant_id) WHERE variant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_order_items_custom_design ON public.order_items(order_id) WHERE variant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_product_variants_product_color_size ON public.product_variants(product_id, color_hex, size);

-- Step 4: Add NOT NULL constraint only for cart_items (since custom designs don't go in cart)
ALTER TABLE public.cart_items ALTER COLUMN variant_id SET NOT NULL;

-- Step 5: Create function to validate final migration state
CREATE OR REPLACE FUNCTION public.validate_final_migration()
RETURNS TABLE(
  check_name TEXT,
  status TEXT,
  expected_value BIGINT,
  actual_value BIGINT,
  success BOOLEAN,
  details TEXT
) AS $$
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
$$ LANGUAGE plpgsql;

-- Step 6: Create updated migration summary
CREATE OR REPLACE FUNCTION public.get_migration_summary()
RETURNS TABLE(
  phase TEXT,
  description TEXT,
  tables_affected TEXT,
  records_migrated BIGINT,
  status TEXT
) AS $$
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
$$ LANGUAGE plpgsql;