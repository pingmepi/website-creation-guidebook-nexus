-- Step 1: Add XS size variants for all existing products
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
    'XS'
  ) as sku,
  public.get_color_name_from_hex(color_value::text) as color_name,
  color_value::text as color_hex,
  'XS' as size,
  p.base_price as price,
  50 as stock_quantity,
  5 as low_stock_threshold,
  true as is_active
FROM public.products p
CROSS JOIN jsonb_array_elements_text(p.colors) as color_value
WHERE NOT EXISTS (
  SELECT 1 FROM public.product_variants pv 
  WHERE pv.product_id = p.id 
  AND pv.color_hex = color_value::text 
  AND pv.size = 'XS'
);

-- Step 2: Create stock management functions
CREATE OR REPLACE FUNCTION public.check_variant_stock(variant_uuid UUID, requested_quantity INTEGER)
RETURNS BOOLEAN
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

CREATE OR REPLACE FUNCTION public.reserve_stock(variant_uuid UUID, quantity INTEGER)
RETURNS BOOLEAN
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

CREATE OR REPLACE FUNCTION public.release_stock(variant_uuid UUID, quantity INTEGER)
RETURNS VOID
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

-- Step 3: Function to get available sizes for a product
CREATE OR REPLACE FUNCTION public.get_product_sizes(product_uuid UUID)
RETURNS TABLE(size TEXT, available_stock INTEGER)
LANGUAGE sql
AS $$
  SELECT DISTINCT size, SUM(stock_quantity)::INTEGER as available_stock
  FROM public.product_variants 
  WHERE product_id = product_uuid 
  AND is_active = true
  GROUP BY size
  ORDER BY 
    CASE size
      WHEN 'XS' THEN 1
      WHEN 'S' THEN 2
      WHEN 'M' THEN 3
      WHEN 'L' THEN 4
      WHEN 'XL' THEN 5
      WHEN 'XXL' THEN 6
      ELSE 7
    END;
$$;

-- Step 4: Function to get available colors for a product and size
CREATE OR REPLACE FUNCTION public.get_product_colors(product_uuid UUID, size_param TEXT)
RETURNS TABLE(color_name TEXT, color_hex TEXT, stock_quantity INTEGER, variant_id UUID)
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