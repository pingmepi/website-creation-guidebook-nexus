-- Phase 2: Data Migration & Validation (Controlled Data Copy)
-- This migrates product data to new structure and generates variants

-- Step 1: Update existing products with category assignments
UPDATE public.products 
SET category_id = (
  SELECT id FROM public.product_categories 
  WHERE name = 'T-Shirts' 
  LIMIT 1
)
WHERE category_id IS NULL;

-- Step 2: Generate all product variants from existing products
INSERT INTO public.product_variants (
  product_id,
  sku,
  color_name,
  color_hex,
  size,
  price,
  stock_quantity,
  low_stock_threshold,
  is_active
)
SELECT 
  p.id as product_id,
  public.generate_variant_sku(
    p.name,
    public.get_color_name_from_hex(color_value::text),
    size_value::text
  ) as sku,
  public.get_color_name_from_hex(color_value::text) as color_name,
  color_value::text as color_hex,
  size_value::text as size,
  p.base_price as price,
  50 as stock_quantity,  -- Default initial stock
  5 as low_stock_threshold,
  true as is_active
FROM 
  public.products p,
  jsonb_array_elements_text(p.colors) as color_value,
  jsonb_array_elements_text(p.sizes) as size_value
WHERE 
  p.is_active = true
  AND jsonb_typeof(p.colors) = 'array'
  AND jsonb_typeof(p.sizes) = 'array';

-- Step 3: Create post-migration validation function
CREATE OR REPLACE FUNCTION public.validate_phase2_migration()
RETURNS TABLE(
  check_name TEXT,
  status TEXT,
  expected_value BIGINT,
  actual_value BIGINT,
  success BOOLEAN,
  details TEXT
) 
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

-- Step 4: Create detailed variant breakdown function
CREATE OR REPLACE FUNCTION public.get_variant_breakdown()
RETURNS TABLE(
  product_name TEXT,
  product_id UUID,
  color_count BIGINT,
  size_count BIGINT,
  variants_created BIGINT,
  expected_variants BIGINT,
  price NUMERIC
) 
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

-- Step 5: Create sample variant display function for verification
CREATE OR REPLACE FUNCTION public.get_sample_variants(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
  product_name TEXT,
  sku TEXT,
  color_name TEXT,
  color_hex TEXT,
  size TEXT,
  price NUMERIC,
  stock_quantity INTEGER
) 
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