-- Phase 1: Create New Database Structure for Product Variants System
-- This creates new tables alongside existing ones (no data loss risk)

-- Create product_categories table for better organization
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_variants table for individual SKUs
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  color_name TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  size TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Foreign key to products table
  CONSTRAINT fk_product_variants_product_id 
    FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE,
    
  -- Ensure unique combination of product, color, and size
  CONSTRAINT unique_product_color_size 
    UNIQUE (product_id, color_hex, size)
);

-- Add category_id to products table (nullable for backward compatibility)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.product_categories(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_active ON public.product_variants(is_active);
CREATE INDEX IF NOT EXISTS idx_product_variants_stock ON public.product_variants(stock_quantity);

-- Enable RLS on new tables
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_categories (public read access)
CREATE POLICY "Categories are publicly readable" 
ON public.product_categories 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for product_variants (public read access for active variants)
CREATE POLICY "Product variants are publicly readable" 
ON public.product_variants 
FOR SELECT 
USING (is_active = true);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_product_categories_updated_at
  BEFORE UPDATE ON public.product_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create validation functions for data integrity
CREATE OR REPLACE FUNCTION public.validate_migration_data()
RETURNS TABLE(
  check_name TEXT,
  status TEXT,
  count_value BIGINT,
  details TEXT
) 
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

-- Create function to generate SKU
CREATE OR REPLACE FUNCTION public.generate_variant_sku(
  product_name TEXT,
  color_name TEXT,
  size_name TEXT
)
RETURNS TEXT
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

-- Create color name mapping function
CREATE OR REPLACE FUNCTION public.get_color_name_from_hex(hex_color TEXT)
RETURNS TEXT
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

-- Insert default product categories
INSERT INTO public.product_categories (name, description, sort_order) VALUES 
  ('T-Shirts', 'Classic and premium t-shirts', 1),
  ('Custom Designs', 'User-created custom designs', 2)
ON CONFLICT (name) DO NOTHING;

-- Create a backup verification query function
CREATE OR REPLACE FUNCTION public.create_migration_checkpoint()
RETURNS TABLE(
  checkpoint_name TEXT,
  table_name TEXT,
  record_count BIGINT,
  timestamp_taken TIMESTAMP WITH TIME ZONE
)
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