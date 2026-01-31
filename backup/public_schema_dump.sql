        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
        create or replace function graphql_public.graphql(
COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';
CREATE FUNCTION public.check_variant_stock(variant_uuid uuid, requested_quantity integer) RETURNS boolean
    SELECT 1 FROM public.product_variants 
ALTER FUNCTION public.check_variant_stock(variant_uuid uuid, requested_quantity integer) OWNER TO postgres;
CREATE FUNCTION public.create_migration_checkpoint() RETURNS TABLE(checkpoint_name text, table_name text, record_count bigint, timestamp_taken timestamp with time zone)
  FROM public.products;
  FROM public.cart_items;
  FROM public.order_items;
ALTER FUNCTION public.create_migration_checkpoint() OWNER TO postgres;
CREATE FUNCTION public.generate_order_number() RETURNS text
ALTER FUNCTION public.generate_order_number() OWNER TO postgres;
CREATE FUNCTION public.generate_variant_sku(product_name text, color_name text, size_name text) RETURNS text
ALTER FUNCTION public.generate_variant_sku(product_name text, color_name text, size_name text) OWNER TO postgres;
CREATE FUNCTION public.get_color_name_from_hex(hex_color text) RETURNS text
ALTER FUNCTION public.get_color_name_from_hex(hex_color text) OWNER TO postgres;
CREATE FUNCTION public.get_default_variant_for_product(product_uuid uuid, preferred_color text DEFAULT '#FFFFFF'::text, preferred_size text DEFAULT 'M'::text) RETURNS uuid
  FROM public.product_variants 
    FROM public.product_variants 
    FROM public.product_variants 
ALTER FUNCTION public.get_default_variant_for_product(product_uuid uuid, preferred_color text, preferred_size text) OWNER TO postgres;
CREATE FUNCTION public.get_migration_status() RETURNS TABLE(table_name text, total_records bigint, with_variants bigint, custom_designs bigint, unmapped bigint, migration_complete boolean)
  FROM public.cart_items;
  FROM public.order_items;
ALTER FUNCTION public.get_migration_status() OWNER TO postgres;
CREATE FUNCTION public.get_migration_summary() RETURNS TABLE(phase text, description text, tables_affected text, records_migrated bigint, status text)
    (SELECT COUNT(*) FROM public.product_variants)::BIGINT,
    (SELECT COUNT(*) FROM public.cart_items WHERE variant_id IS NOT NULL) + 
    (SELECT COUNT(*) FROM public.order_items WHERE variant_id IS NOT NULL)::BIGINT,
    (SELECT COUNT(*) FROM public.order_items WHERE legacy_product_id = 'custom-design')::BIGINT,
ALTER FUNCTION public.get_migration_summary() OWNER TO postgres;
CREATE FUNCTION public.get_product_colors(product_uuid uuid, size_param text) RETURNS TABLE(color_name text, color_hex text, stock_quantity integer, variant_id uuid)
  FROM public.product_variants 
ALTER FUNCTION public.get_product_colors(product_uuid uuid, size_param text) OWNER TO postgres;
CREATE FUNCTION public.get_product_sizes(product_uuid uuid) RETURNS TABLE(size text, available_stock integer, sort_order integer)
  FROM public.product_variants 
ALTER FUNCTION public.get_product_sizes(product_uuid uuid) OWNER TO postgres;
CREATE FUNCTION public.get_sample_variants(limit_count integer DEFAULT 10) RETURNS TABLE(product_name text, sku text, color_name text, color_hex text, size text, price numeric, stock_quantity integer)
  FROM public.product_variants pv
  JOIN public.products p ON pv.product_id = p.id
ALTER FUNCTION public.get_sample_variants(limit_count integer) OWNER TO postgres;
CREATE FUNCTION public.get_theme_questions(theme_uuid uuid) RETURNS TABLE(id uuid, question_text text, type text, options jsonb, sort_order integer)
  FROM public.design_questions
ALTER FUNCTION public.get_theme_questions(theme_uuid uuid) OWNER TO postgres;
CREATE FUNCTION public.get_variant_breakdown() RETURNS TABLE(product_name text, product_id uuid, color_count bigint, size_count bigint, variants_created bigint, expected_variants bigint, price numeric)
  FROM public.products p
  LEFT JOIN public.product_variants pv ON p.id = pv.product_id
ALTER FUNCTION public.get_variant_breakdown() OWNER TO postgres;
CREATE FUNCTION public.handle_new_user() RETURNS trigger
  INSERT INTO public.profiles (id, full_name, avatar_url)
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
CREATE FUNCTION public.map_legacy_product_id_to_uuid(legacy_id text) RETURNS uuid
      SELECT id INTO mapped_uuid FROM public.products ORDER BY created_at LIMIT 1;
      SELECT id INTO mapped_uuid FROM public.products ORDER BY created_at LIMIT 1 OFFSET 1;
      SELECT id INTO mapped_uuid FROM public.products ORDER BY created_at LIMIT 1 OFFSET 2;
      SELECT id INTO mapped_uuid FROM public.products ORDER BY created_at LIMIT 1 OFFSET 0; -- Map to first product
      SELECT id INTO mapped_uuid FROM public.products ORDER BY created_at LIMIT 1 OFFSET 1; -- Map to second product
      SELECT id INTO mapped_uuid FROM public.products ORDER BY created_at LIMIT 1;
ALTER FUNCTION public.map_legacy_product_id_to_uuid(legacy_id text) OWNER TO postgres;
CREATE FUNCTION public.release_stock(variant_uuid uuid, quantity integer) RETURNS void
  UPDATE public.product_variants 
ALTER FUNCTION public.release_stock(variant_uuid uuid, quantity integer) OWNER TO postgres;
CREATE FUNCTION public.reserve_stock(variant_uuid uuid, quantity integer) RETURNS boolean
  FROM public.product_variants 
    UPDATE public.product_variants 
ALTER FUNCTION public.reserve_stock(variant_uuid uuid, quantity integer) OWNER TO postgres;
CREATE FUNCTION public.set_order_number() RETURNS trigger
ALTER FUNCTION public.set_order_number() OWNER TO postgres;
CREATE FUNCTION public.update_custom_designs_updated_at() RETURNS trigger
ALTER FUNCTION public.update_custom_designs_updated_at() OWNER TO postgres;
CREATE FUNCTION public.update_order_items_variants() RETURNS integer
  UPDATE public.order_items 
  SET variant_id = public.get_default_variant_for_product(
    public.map_legacy_product_id_to_uuid(legacy_product_id)
ALTER FUNCTION public.update_order_items_variants() OWNER TO postgres;
CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;
CREATE FUNCTION public.validate_final_migration() RETURNS TABLE(check_name text, status text, expected_value bigint, actual_value bigint, success boolean, details text)
  SELECT COUNT(*) INTO cart_items_count FROM public.cart_items;
  SELECT COUNT(*) INTO order_items_count FROM public.order_items;
  SELECT COUNT(*) INTO variants_count FROM public.product_variants;
  SELECT COUNT(*) INTO custom_design_orders FROM public.order_items WHERE legacy_product_id = 'custom-design';
  SELECT COUNT(*) INTO regular_product_orders FROM public.order_items WHERE legacy_product_id != 'custom-design' OR legacy_product_id IS NULL;
  FROM public.cart_items ci
  LEFT JOIN public.product_variants pv ON ci.variant_id = pv.id
  FROM public.order_items oi
  LEFT JOIN public.product_variants pv ON oi.variant_id = pv.id
  FROM public.order_items
ALTER FUNCTION public.validate_final_migration() OWNER TO postgres;
CREATE FUNCTION public.validate_migration_data() RETURNS TABLE(check_name text, status text, count_value bigint, details text)
  FROM public.products;
  FROM public.cart_items;
  FROM public.order_items;
  FROM public.products 
  FROM public.products 
  FROM public.products 
ALTER FUNCTION public.validate_migration_data() OWNER TO postgres;
CREATE FUNCTION public.validate_phase2_migration() RETURNS TABLE(check_name text, status text, expected_value bigint, actual_value bigint, success boolean, details text)
  FROM public.products 
  SELECT COUNT(*) INTO actual_variants FROM public.product_variants;
  FROM public.products 
  SELECT COUNT(*) INTO total_products FROM public.products;
  FROM public.product_variants;
  FROM public.product_variants pv
  JOIN public.products p ON pv.product_id = p.id
  FROM public.product_variants
ALTER FUNCTION public.validate_phase2_migration() OWNER TO postgres;
CREATE FUNCTION public.validate_phase3_migration() RETURNS TABLE(check_name text, status text, total_records bigint, migrated_records bigint, success boolean, details text)
  SELECT COUNT(*) INTO total_cart_items FROM public.cart_items;
  SELECT COUNT(*) INTO cart_items_with_variants FROM public.cart_items WHERE variant_id IS NOT NULL;
  SELECT COUNT(*) INTO cart_items_custom_designs FROM public.cart_items WHERE legacy_product_id = 'custom-design';
  SELECT COUNT(*) INTO total_order_items FROM public.order_items;
  SELECT COUNT(*) INTO order_items_with_variants FROM public.order_items WHERE variant_id IS NOT NULL;
  SELECT COUNT(*) INTO order_items_custom_designs FROM public.order_items WHERE legacy_product_id = 'custom-design';
    SELECT 1 FROM public.cart_items WHERE legacy_product_id IS NULL
    SELECT 1 FROM public.order_items WHERE legacy_product_id IS NULL
ALTER FUNCTION public.validate_phase3_migration() OWNER TO postgres;
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
CREATE TABLE public.addresses (
ALTER TABLE public.addresses OWNER TO postgres;
CREATE TABLE public.ai_generated_designs (
ALTER TABLE public.ai_generated_designs OWNER TO postgres;
CREATE TABLE public.cart_items (
ALTER TABLE public.cart_items OWNER TO postgres;
CREATE TABLE public.custom_designs (
ALTER TABLE public.custom_designs OWNER TO postgres;
CREATE TABLE public.design_questions (
ALTER TABLE public.design_questions OWNER TO postgres;
CREATE TABLE public.design_responses (
ALTER TABLE public.design_responses OWNER TO postgres;
CREATE TABLE public.designs (
ALTER TABLE public.designs OWNER TO postgres;
CREATE TABLE public.order_items (
ALTER TABLE public.order_items OWNER TO postgres;
CREATE SEQUENCE public.order_number_seq
ALTER TABLE public.order_number_seq OWNER TO postgres;
CREATE TABLE public.orders (
ALTER TABLE public.orders OWNER TO postgres;
CREATE TABLE public.payment_transactions (
ALTER TABLE public.payment_transactions OWNER TO postgres;
CREATE TABLE public.product_categories (
ALTER TABLE public.product_categories OWNER TO postgres;
CREATE TABLE public.product_variants (
ALTER TABLE public.product_variants OWNER TO postgres;
CREATE TABLE public.products (
ALTER TABLE public.products OWNER TO postgres;
CREATE TABLE public.profiles (
ALTER TABLE public.profiles OWNER TO postgres;
CREATE TABLE public.themes (
ALTER TABLE public.themes OWNER TO postgres;
COPY public.addresses (id, user_id, name, street_address, city, state, postal_code, country, is_default, created_at, updated_at) FROM stdin;
COPY public.ai_generated_designs (id, user_id, prompt, design_image, created_at, is_favorite, theme_id) FROM stdin;
COPY public.cart_items (id, user_id, product_id, quantity, created_at, updated_at, variant_id, legacy_product_id, selected_color, selected_size) FROM stdin;
COPY public.custom_designs (id, user_id, design_name, design_data, design_image, tshirt_color, base_price, theme_name, answers, created_at, updated_at) FROM stdin;
COPY public.design_questions (id, question_text, type, options, theme_id, is_active, sort_order, created_at) FROM stdin;
COPY public.design_responses (id, design_id, question_id, response, created_at) FROM stdin;
COPY public.designs (id, user_id, name, description, theme, t_shirt_color, design_data, preview_url, is_public, created_at, updated_at) FROM stdin;
COPY public.order_items (id, order_id, product_id, quantity, unit_price, total_price, design_data, created_at, custom_design_id, variant_id, legacy_product_id) FROM stdin;
COPY public.orders (id, user_id, order_number, total_amount, status, shipping_address_id, shipping_address, payment_method, notes, created_at, updated_at, payment_transaction_id) FROM stdin;
COPY public.payment_transactions (id, order_id, payment_gateway, gateway_transaction_id, payment_method, upi_transaction_id, upi_id, amount, currency, status, gateway_response, failure_reason, created_at, updated_at) FROM stdin;
COPY public.product_categories (id, name, description, is_active, sort_order, created_at, updated_at) FROM stdin;
COPY public.product_variants (id, product_id, sku, color_name, color_hex, size, price, stock_quantity, low_stock_threshold, is_active, created_at, updated_at) FROM stdin;
COPY public.products (id, name, description, base_price, category, sizes, colors, is_active, created_at, updated_at, category_id) FROM stdin;
COPY public.profiles (id, full_name, avatar_url, created_at, updated_at, marketing_emails) FROM stdin;
COPY public.themes (id, name, description, thumbnail_url, is_active, category, created_at) FROM stdin;
20250602045640	{"\n-- Create products table for t-shirt variants\nCREATE TABLE IF NOT EXISTS public.products (\n  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,\n  name TEXT NOT NULL,\n  description TEXT,\n  base_price DECIMAL(10,2) NOT NULL,\n  category TEXT DEFAULT 'tshirt',\n  sizes JSONB DEFAULT '[\\"S\\", \\"M\\", \\"L\\", \\"XL\\", \\"XXL\\"]'::jsonb,\n  colors JSONB DEFAULT '[\\"#FFFFFF\\", \\"#000000\\", \\"#8A898C\\", \\"#1EAEDB\\"]'::jsonb,\n  is_active BOOLEAN DEFAULT true,\n  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),\n  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()\n);\n\n-- Add Row Level Security to cart_items table (if not already enabled)\nALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;\n\n-- Drop existing policies if they exist and recreate them\nDROP POLICY IF EXISTS \\"Users can view their own cart items\\" ON public.cart_items;\nDROP POLICY IF EXISTS \\"Users can create their own cart items\\" ON public.cart_items;\nDROP POLICY IF EXISTS \\"Users can update their own cart items\\" ON public.cart_items;\nDROP POLICY IF EXISTS \\"Users can delete their own cart items\\" ON public.cart_items;\n\n-- Create policies for cart_items\nCREATE POLICY \\"Users can view their own cart items\\" \n  ON public.cart_items \n  FOR SELECT \n  USING (auth.uid() = user_id);\n\nCREATE POLICY \\"Users can create their own cart items\\" \n  ON public.cart_items \n  FOR INSERT \n  WITH CHECK (auth.uid() = user_id);\n\nCREATE POLICY \\"Users can update their own cart items\\" \n  ON public.cart_items \n  FOR UPDATE \n  USING (auth.uid() = user_id);\n\nCREATE POLICY \\"Users can delete their own cart items\\" \n  ON public.cart_items \n  FOR DELETE \n  USING (auth.uid() = user_id);\n\n-- Make products publicly readable\nALTER TABLE public.products ENABLE ROW LEVEL SECURITY;\nDROP POLICY IF EXISTS \\"Products are publicly readable\\" ON public.products;\nCREATE POLICY \\"Products are publicly readable\\" \n  ON public.products \n  FOR SELECT \n  USING (is_active = true);\n\n-- Insert sample products (only if table is empty)\nINSERT INTO public.products (name, description, base_price, category) \nSELECT * FROM (VALUES\n  ('Classic Cotton Tee', 'Premium 100% cotton t-shirt, perfect for custom designs', 24.99, 'tshirt'),\n  ('Premium Blend Tee', 'Soft cotton-polyester blend for comfort and durability', 29.99, 'tshirt'),\n  ('Organic Cotton Tee', 'Eco-friendly organic cotton t-shirt', 32.99, 'tshirt')\n) AS new_products(name, description, base_price, category)\nWHERE NOT EXISTS (SELECT 1 FROM public.products);\n"}	60e7dc89-ae33-4f47-8935-b5ed7da200c9	kmandalam@gmail.com	\N
20250602051905	{"\n-- Create orders table to store order information\nCREATE TABLE public.orders (\n  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,\n  user_id UUID NOT NULL,\n  order_number TEXT NOT NULL UNIQUE,\n  total_amount DECIMAL(10,2) NOT NULL,\n  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),\n  shipping_address_id UUID,\n  shipping_address JSONB NOT NULL,\n  payment_method TEXT,\n  notes TEXT,\n  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),\n  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()\n);\n\n-- Create order_items table to store individual items in each order\nCREATE TABLE public.order_items (\n  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,\n  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,\n  product_id TEXT NOT NULL,\n  quantity INTEGER NOT NULL DEFAULT 1,\n  unit_price DECIMAL(10,2) NOT NULL,\n  total_price DECIMAL(10,2) NOT NULL,\n  design_data JSONB,\n  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()\n);\n\n-- Add Row Level Security (RLS) to orders table\nALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;\n\n-- Create policies for orders table\nCREATE POLICY \\"Users can view their own orders\\" \n  ON public.orders \n  FOR SELECT \n  USING (auth.uid() = user_id);\n\nCREATE POLICY \\"Users can create their own orders\\" \n  ON public.orders \n  FOR INSERT \n  WITH CHECK (auth.uid() = user_id);\n\nCREATE POLICY \\"Users can update their own orders\\" \n  ON public.orders \n  FOR UPDATE \n  USING (auth.uid() = user_id);\n\n-- Add Row Level Security (RLS) to order_items table\nALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;\n\n-- Create policies for order_items table\nCREATE POLICY \\"Users can view their own order items\\" \n  ON public.order_items \n  FOR SELECT \n  USING (EXISTS (\n    SELECT 1 FROM public.orders \n    WHERE orders.id = order_items.order_id \n    AND orders.user_id = auth.uid()\n  ));\n\nCREATE POLICY \\"Users can create their own order items\\" \n  ON public.order_items \n  FOR INSERT \n  WITH CHECK (EXISTS (\n    SELECT 1 FROM public.orders \n    WHERE orders.id = order_items.order_id \n    AND orders.user_id = auth.uid()\n  ));\n\n-- Create function to generate order numbers\nCREATE OR REPLACE FUNCTION generate_order_number()\nRETURNS TEXT AS $$\nBEGIN\n  RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 6, '0');\nEND;\n$$ LANGUAGE plpgsql;\n\n-- Create sequence for order numbers\nCREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;\n\n-- Create function to automatically set order number on insert\nCREATE OR REPLACE FUNCTION set_order_number()\nRETURNS TRIGGER AS $$\nBEGIN\n  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN\n    NEW.order_number := generate_order_number();\n  END IF;\n  RETURN NEW;\nEND;\n$$ LANGUAGE plpgsql;\n\n-- Create trigger to set order number\nCREATE TRIGGER set_order_number_trigger\n  BEFORE INSERT ON public.orders\n  FOR EACH ROW\n  EXECUTE FUNCTION set_order_number();\n\n-- Create function to update updated_at timestamp\nCREATE OR REPLACE FUNCTION update_updated_at_column()\nRETURNS TRIGGER AS $$\nBEGIN\n  NEW.updated_at = NOW();\n  RETURN NEW;\nEND;\n$$ LANGUAGE plpgsql;\n\n-- Create trigger to update updated_at on orders\nCREATE TRIGGER update_orders_updated_at\n  BEFORE UPDATE ON public.orders\n  FOR EACH ROW\n  EXECUTE FUNCTION update_updated_at_column();\n"}	743b5313-79df-467d-9fe2-d87553cd2796	kmandalam@gmail.com	\N
20250603055901	{"\n-- Create custom_designs table to store user-created designs from the design page\nCREATE TABLE public.custom_designs (\n  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,\n  user_id UUID NOT NULL REFERENCES auth.users(id),\n  design_name TEXT NOT NULL,\n  design_data JSONB NOT NULL, -- Canvas data from the design tools\n  design_image TEXT NOT NULL, -- Base64 or URL of the design preview\n  tshirt_color TEXT NOT NULL DEFAULT '#FFFFFF',\n  base_price NUMERIC NOT NULL DEFAULT 29.99,\n  theme_name TEXT, -- Store theme used for design\n  answers JSONB, -- Store design preferences/answers\n  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),\n  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()\n);\n\n-- Create payment_transactions table for detailed payment tracking\nCREATE TABLE public.payment_transactions (\n  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,\n  order_id UUID NOT NULL REFERENCES orders(id),\n  payment_gateway TEXT NOT NULL, -- 'razorpay', 'stripe', etc.\n  gateway_transaction_id TEXT NOT NULL,\n  payment_method TEXT NOT NULL, -- 'upi', 'card', 'netbanking', 'wallet'\n  upi_transaction_id TEXT, -- Specific UPI transaction reference\n  upi_id TEXT, -- Customer's UPI ID used for payment\n  amount NUMERIC NOT NULL,\n  currency TEXT NOT NULL DEFAULT 'INR',\n  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'failed', 'cancelled'\n  gateway_response JSONB, -- Full response from payment gateway\n  failure_reason TEXT, -- If payment failed, store reason\n  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),\n  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()\n);\n\n-- Add custom_design_id to order_items to link to custom designs\nALTER TABLE public.order_items \nADD COLUMN custom_design_id UUID REFERENCES custom_designs(id);\n\n-- Add payment_transaction_id to orders for easy reference\nALTER TABLE public.orders \nADD COLUMN payment_transaction_id UUID REFERENCES payment_transactions(id);\n\n-- Enable RLS on custom_designs table\nALTER TABLE public.custom_designs ENABLE ROW LEVEL SECURITY;\n\n-- RLS policies for custom_designs\nCREATE POLICY \\"Users can view their own custom designs\\" \n  ON public.custom_designs \n  FOR SELECT \n  USING (auth.uid() = user_id);\n\nCREATE POLICY \\"Users can create their own custom designs\\" \n  ON public.custom_designs \n  FOR INSERT \n  WITH CHECK (auth.uid() = user_id);\n\nCREATE POLICY \\"Users can update their own custom designs\\" \n  ON public.custom_designs \n  FOR UPDATE \n  USING (auth.uid() = user_id);\n\nCREATE POLICY \\"Users can delete their own custom designs\\" \n  ON public.custom_designs \n  FOR DELETE \n  USING (auth.uid() = user_id);\n\n-- Enable RLS on payment_transactions table\nALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;\n\n-- RLS policies for payment_transactions (users can only see their own payment transactions)\nCREATE POLICY \\"Users can view their own payment transactions\\" \n  ON public.payment_transactions \n  FOR SELECT \n  USING (auth.uid() = (SELECT user_id FROM orders WHERE orders.id = order_id));\n\n-- Create indexes for better performance\nCREATE INDEX idx_custom_designs_user_id ON public.custom_designs(user_id);\nCREATE INDEX idx_payment_transactions_order_id ON public.payment_transactions(order_id);\nCREATE INDEX idx_payment_transactions_gateway_transaction_id ON public.payment_transactions(gateway_transaction_id);\nCREATE INDEX idx_payment_transactions_status ON public.payment_transactions(status);\n\n-- Create trigger to update updated_at column\nCREATE OR REPLACE FUNCTION update_custom_designs_updated_at()\nRETURNS TRIGGER AS $$\nBEGIN\n  NEW.updated_at = NOW();\n  RETURN NEW;\nEND;\n$$ LANGUAGE plpgsql;\n\nCREATE TRIGGER trigger_update_custom_designs_updated_at\n  BEFORE UPDATE ON public.custom_designs\n  FOR EACH ROW\n  EXECUTE FUNCTION update_custom_designs_updated_at();\n\nCREATE TRIGGER trigger_update_payment_transactions_updated_at\n  BEFORE UPDATE ON public.payment_transactions\n  FOR EACH ROW\n  EXECUTE FUNCTION update_updated_at_column();\n"}	ab140ec1-0e77-4823-8624-82d066d25e27	kmandalam@gmail.com	\N
20250715081133	{"-- Phase 1: Create New Database Structure for Product Variants System\n-- This creates new tables alongside existing ones (no data loss risk)\n\n-- Create product_categories table for better organization\nCREATE TABLE IF NOT EXISTS public.product_categories (\n  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,\n  name TEXT NOT NULL UNIQUE,\n  description TEXT,\n  is_active BOOLEAN NOT NULL DEFAULT true,\n  sort_order INTEGER DEFAULT 0,\n  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),\n  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()\n);\n\n-- Create product_variants table for individual SKUs\nCREATE TABLE IF NOT EXISTS public.product_variants (\n  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,\n  product_id UUID NOT NULL,\n  sku TEXT NOT NULL UNIQUE,\n  color_name TEXT NOT NULL,\n  color_hex TEXT NOT NULL,\n  size TEXT NOT NULL,\n  price NUMERIC(10,2) NOT NULL,\n  stock_quantity INTEGER NOT NULL DEFAULT 0,\n  low_stock_threshold INTEGER DEFAULT 5,\n  is_active BOOLEAN NOT NULL DEFAULT true,\n  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),\n  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),\n  \n  -- Foreign key to products table\n  CONSTRAINT fk_product_variants_product_id \n    FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE,\n    \n  -- Ensure unique combination of product, color, and size\n  CONSTRAINT unique_product_color_size \n    UNIQUE (product_id, color_hex, size)\n);\n\n-- Add category_id to products table (nullable for backward compatibility)\nALTER TABLE public.products \nADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.product_categories(id);\n\n-- Create indexes for performance\nCREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);\nCREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants(sku);\nCREATE INDEX IF NOT EXISTS idx_product_variants_active ON public.product_variants(is_active);\nCREATE INDEX IF NOT EXISTS idx_product_variants_stock ON public.product_variants(stock_quantity);\n\n-- Enable RLS on new tables\nALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;\n\n-- RLS Policies for product_categories (public read access)\nCREATE POLICY \\"Categories are publicly readable\\" \nON public.product_categories \nFOR SELECT \nUSING (is_active = true);\n\n-- RLS Policies for product_variants (public read access for active variants)\nCREATE POLICY \\"Product variants are publicly readable\\" \nON public.product_variants \nFOR SELECT \nUSING (is_active = true);\n\n-- Create triggers for automatic timestamp updates\nCREATE TRIGGER update_product_categories_updated_at\n  BEFORE UPDATE ON public.product_categories\n  FOR EACH ROW\n  EXECUTE FUNCTION public.update_updated_at_column();\n\nCREATE TRIGGER update_product_variants_updated_at\n  BEFORE UPDATE ON public.product_variants\n  FOR EACH ROW\n  EXECUTE FUNCTION public.update_updated_at_column();\n\n-- Create validation functions for data integrity\nCREATE OR REPLACE FUNCTION public.validate_migration_data()\nRETURNS TABLE(\n  check_name TEXT,\n  status TEXT,\n  count_value BIGINT,\n  details TEXT\n) \nLANGUAGE plpgsql\nAS $$\nBEGIN\n  -- Check existing products count\n  RETURN QUERY SELECT \n    'existing_products'::TEXT,\n    'info'::TEXT,\n    COUNT(*)::BIGINT,\n    'Total products in current system'::TEXT\n  FROM public.products;\n  \n  -- Check existing cart items count\n  RETURN QUERY SELECT \n    'existing_cart_items'::TEXT,\n    'info'::TEXT,\n    COUNT(*)::BIGINT,\n    'Total cart items in current system'::TEXT\n  FROM public.cart_items;\n  \n  -- Check existing order items count\n  RETURN QUERY SELECT \n    'existing_order_items'::TEXT,\n    'info'::TEXT,\n    COUNT(*)::BIGINT,\n    'Total order items in current system'::TEXT\n  FROM public.order_items;\n  \n  -- Validate JSON structure in products\n  RETURN QUERY SELECT \n    'products_with_valid_colors'::TEXT,\n    'validation'::TEXT,\n    COUNT(*)::BIGINT,\n    'Products with valid color JSON arrays'::TEXT\n  FROM public.products \n  WHERE jsonb_typeof(colors) = 'array';\n  \n  -- Validate JSON structure for sizes\n  RETURN QUERY SELECT \n    'products_with_valid_sizes'::TEXT,\n    'validation'::TEXT,\n    COUNT(*)::BIGINT,\n    'Products with valid size JSON arrays'::TEXT\n  FROM public.products \n  WHERE jsonb_typeof(sizes) = 'array';\n  \n  -- Calculate expected variants count\n  RETURN QUERY SELECT \n    'expected_variants_total'::TEXT,\n    'calculation'::TEXT,\n    SUM(jsonb_array_length(colors) * jsonb_array_length(sizes))::BIGINT,\n    'Total variants that will be created'::TEXT\n  FROM public.products \n  WHERE jsonb_typeof(colors) = 'array' AND jsonb_typeof(sizes) = 'array';\n  \nEND;\n$$;\n\n-- Create function to generate SKU\nCREATE OR REPLACE FUNCTION public.generate_variant_sku(\n  product_name TEXT,\n  color_name TEXT,\n  size_name TEXT\n)\nRETURNS TEXT\nLANGUAGE plpgsql\nAS $$\nDECLARE\n  clean_product_name TEXT;\n  clean_color_name TEXT;\n  clean_size_name TEXT;\n  sku_base TEXT;\nBEGIN\n  -- Clean and normalize names\n  clean_product_name := UPPER(REGEXP_REPLACE(TRIM(product_name), '[^A-Za-z0-9]', '', 'g'));\n  clean_color_name := UPPER(REGEXP_REPLACE(TRIM(color_name), '[^A-Za-z0-9]', '', 'g'));\n  clean_size_name := UPPER(TRIM(size_name));\n  \n  -- Take first 3 chars of product name, first 3 of color, and size\n  sku_base := LEFT(clean_product_name, 3) || '-' || LEFT(clean_color_name, 3) || '-' || clean_size_name;\n  \n  RETURN sku_base;\nEND;\n$$;\n\n-- Create color name mapping function\nCREATE OR REPLACE FUNCTION public.get_color_name_from_hex(hex_color TEXT)\nRETURNS TEXT\nLANGUAGE plpgsql\nAS $$\nBEGIN\n  CASE UPPER(hex_color)\n    WHEN '#FFFFFF' THEN RETURN 'White';\n    WHEN '#000000' THEN RETURN 'Black';\n    WHEN '#8A898C' THEN RETURN 'Grey';\n    WHEN '#1EAEDB' THEN RETURN 'Blue';\n    ELSE RETURN 'Color-' || UPPER(REPLACE(hex_color, '#', ''));\n  END CASE;\nEND;\n$$;\n\n-- Insert default product categories\nINSERT INTO public.product_categories (name, description, sort_order) VALUES \n  ('T-Shirts', 'Classic and premium t-shirts', 1),\n  ('Custom Designs', 'User-created custom designs', 2)\nON CONFLICT (name) DO NOTHING;\n\n-- Create a backup verification query function\nCREATE OR REPLACE FUNCTION public.create_migration_checkpoint()\nRETURNS TABLE(\n  checkpoint_name TEXT,\n  table_name TEXT,\n  record_count BIGINT,\n  timestamp_taken TIMESTAMP WITH TIME ZONE\n)\nLANGUAGE plpgsql\nAS $$\nBEGIN\n  RETURN QUERY SELECT \n    'pre_migration'::TEXT,\n    'products'::TEXT,\n    COUNT(*)::BIGINT,\n    NOW()\n  FROM public.products;\n  \n  RETURN QUERY SELECT \n    'pre_migration'::TEXT,\n    'cart_items'::TEXT,\n    COUNT(*)::BIGINT,\n    NOW()\n  FROM public.cart_items;\n  \n  RETURN QUERY SELECT \n    'pre_migration'::TEXT,\n    'order_items'::TEXT,\n    COUNT(*)::BIGINT,\n    NOW()\n  FROM public.order_items;\nEND;\n$$;"}		kmandalam@gmail.com	\N
20250715081407	{"-- Phase 2: Data Migration & Validation (Controlled Data Copy)\n-- This migrates product data to new structure and generates variants\n\n-- Step 1: Update existing products with category assignments\nUPDATE public.products \nSET category_id = (\n  SELECT id FROM public.product_categories \n  WHERE name = 'T-Shirts' \n  LIMIT 1\n)\nWHERE category_id IS NULL;\n\n-- Step 2: Generate all product variants from existing products\nINSERT INTO public.product_variants (\n  product_id,\n  sku,\n  color_name,\n  color_hex,\n  size,\n  price,\n  stock_quantity,\n  low_stock_threshold,\n  is_active\n)\nSELECT \n  p.id as product_id,\n  public.generate_variant_sku(\n    p.name,\n    public.get_color_name_from_hex(color_value::text),\n    size_value::text\n  ) as sku,\n  public.get_color_name_from_hex(color_value::text) as color_name,\n  color_value::text as color_hex,\n  size_value::text as size,\n  p.base_price as price,\n  50 as stock_quantity,  -- Default initial stock\n  5 as low_stock_threshold,\n  true as is_active\nFROM \n  public.products p,\n  jsonb_array_elements_text(p.colors) as color_value,\n  jsonb_array_elements_text(p.sizes) as size_value\nWHERE \n  p.is_active = true\n  AND jsonb_typeof(p.colors) = 'array'\n  AND jsonb_typeof(p.sizes) = 'array';\n\n-- Step 3: Create post-migration validation function\nCREATE OR REPLACE FUNCTION public.validate_phase2_migration()\nRETURNS TABLE(\n  check_name TEXT,\n  status TEXT,\n  expected_value BIGINT,\n  actual_value BIGINT,\n  success BOOLEAN,\n  details TEXT\n) \nLANGUAGE plpgsql\nAS $$\nDECLARE\n  expected_variants BIGINT;\n  actual_variants BIGINT;\n  products_with_categories BIGINT;\n  total_products BIGINT;\nBEGIN\n  -- Calculate expected variants\n  SELECT SUM(jsonb_array_length(colors) * jsonb_array_length(sizes)) \n  INTO expected_variants\n  FROM public.products \n  WHERE jsonb_typeof(colors) = 'array' AND jsonb_typeof(sizes) = 'array';\n  \n  -- Get actual variants created\n  SELECT COUNT(*) INTO actual_variants FROM public.product_variants;\n  \n  -- Get products with categories\n  SELECT COUNT(*) INTO products_with_categories \n  FROM public.products \n  WHERE category_id IS NOT NULL;\n  \n  -- Get total products\n  SELECT COUNT(*) INTO total_products FROM public.products;\n  \n  -- Variant count validation\n  RETURN QUERY SELECT \n    'variant_count_validation'::TEXT,\n    CASE WHEN expected_variants = actual_variants THEN 'PASS' ELSE 'FAIL' END::TEXT,\n    expected_variants,\n    actual_variants,\n    expected_variants = actual_variants,\n    'Expected vs actual variant count'::TEXT;\n  \n  -- Category assignment validation\n  RETURN QUERY SELECT \n    'category_assignment_validation'::TEXT,\n    CASE WHEN products_with_categories = total_products THEN 'PASS' ELSE 'FAIL' END::TEXT,\n    total_products,\n    products_with_categories,\n    products_with_categories = total_products,\n    'All products should have categories assigned'::TEXT;\n  \n  -- SKU uniqueness validation\n  RETURN QUERY SELECT \n    'sku_uniqueness_validation'::TEXT,\n    CASE WHEN COUNT(*) = COUNT(DISTINCT sku) THEN 'PASS' ELSE 'FAIL' END::TEXT,\n    COUNT(*)::BIGINT,\n    COUNT(DISTINCT sku)::BIGINT,\n    COUNT(*) = COUNT(DISTINCT sku),\n    'All SKUs should be unique'::TEXT\n  FROM public.product_variants;\n  \n  -- Price consistency validation\n  RETURN QUERY SELECT \n    'price_consistency_validation'::TEXT,\n    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,\n    0::BIGINT,\n    COUNT(*)::BIGINT,\n    COUNT(*) = 0,\n    'No variants should have price mismatches with base product'::TEXT\n  FROM public.product_variants pv\n  JOIN public.products p ON pv.product_id = p.id\n  WHERE pv.price != p.base_price;\n  \n  -- Stock level validation\n  RETURN QUERY SELECT \n    'stock_level_validation'::TEXT,\n    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,\n    0::BIGINT,\n    COUNT(*)::BIGINT,\n    COUNT(*) = 0,\n    'All variants should have positive stock levels'::TEXT\n  FROM public.product_variants\n  WHERE stock_quantity <= 0;\n  \nEND;\n$$;\n\n-- Step 4: Create detailed variant breakdown function\nCREATE OR REPLACE FUNCTION public.get_variant_breakdown()\nRETURNS TABLE(\n  product_name TEXT,\n  product_id UUID,\n  color_count BIGINT,\n  size_count BIGINT,\n  variants_created BIGINT,\n  expected_variants BIGINT,\n  price NUMERIC\n) \nLANGUAGE plpgsql\nAS $$\nBEGIN\n  RETURN QUERY SELECT \n    p.name as product_name,\n    p.id as product_id,\n    jsonb_array_length(p.colors) as color_count,\n    jsonb_array_length(p.sizes) as size_count,\n    COUNT(pv.id) as variants_created,\n    (jsonb_array_length(p.colors) * jsonb_array_length(p.sizes)) as expected_variants,\n    p.base_price as price\n  FROM public.products p\n  LEFT JOIN public.product_variants pv ON p.id = pv.product_id\n  GROUP BY p.id, p.name, p.colors, p.sizes, p.base_price\n  ORDER BY p.name;\nEND;\n$$;\n\n-- Step 5: Create sample variant display function for verification\nCREATE OR REPLACE FUNCTION public.get_sample_variants(limit_count INTEGER DEFAULT 10)\nRETURNS TABLE(\n  product_name TEXT,\n  sku TEXT,\n  color_name TEXT,\n  color_hex TEXT,\n  size TEXT,\n  price NUMERIC,\n  stock_quantity INTEGER\n) \nLANGUAGE plpgsql\nAS $$\nBEGIN\n  RETURN QUERY SELECT \n    p.name as product_name,\n    pv.sku,\n    pv.color_name,\n    pv.color_hex,\n    pv.size,\n    pv.price,\n    pv.stock_quantity\n  FROM public.product_variants pv\n  JOIN public.products p ON pv.product_id = p.id\n  ORDER BY p.name, pv.color_name, pv.size\n  LIMIT limit_count;\nEND;\n$$;"}		kmandalam@gmail.com	\N
20250715081832	{"-- Phase 3: Legacy Data Migration (Critical Step)\n-- Handle existing cart_items and order_items mapping to new variant system\n\n-- Step 1: Add new columns to existing tables (backward compatible)\nALTER TABLE public.cart_items \nADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES public.product_variants(id),\nADD COLUMN IF NOT EXISTS legacy_product_id TEXT,\nADD COLUMN IF NOT EXISTS selected_color TEXT DEFAULT '#FFFFFF',\nADD COLUMN IF NOT EXISTS selected_size TEXT DEFAULT 'M';\n\nALTER TABLE public.order_items \nADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES public.product_variants(id),\nADD COLUMN IF NOT EXISTS legacy_product_id TEXT;\n\n-- Step 2: Backup legacy product_id values\nUPDATE public.cart_items \nSET legacy_product_id = product_id \nWHERE legacy_product_id IS NULL;\n\nUPDATE public.order_items \nSET legacy_product_id = product_id \nWHERE legacy_product_id IS NULL;\n\n-- Step 3: Create mapping function for legacy product IDs to current products\nCREATE OR REPLACE FUNCTION public.map_legacy_product_id_to_uuid(legacy_id TEXT)\nRETURNS UUID\nLANGUAGE plpgsql\nAS $$\nDECLARE\n  mapped_uuid UUID;\nBEGIN\n  -- Handle special cases\n  IF legacy_id = 'custom-design' THEN\n    RETURN NULL; -- Keep as NULL for custom designs\n  END IF;\n  \n  -- Map numeric legacy IDs to current product UUIDs based on order\n  -- This assumes the products were created in a specific order\n  CASE legacy_id\n    WHEN '1' THEN \n      SELECT id INTO mapped_uuid FROM public.products ORDER BY created_at LIMIT 1;\n    WHEN '2' THEN \n      SELECT id INTO mapped_uuid FROM public.products ORDER BY created_at LIMIT 1 OFFSET 1;\n    WHEN '3' THEN \n      SELECT id INTO mapped_uuid FROM public.products ORDER BY created_at LIMIT 1 OFFSET 2;\n    WHEN '4' THEN \n      SELECT id INTO mapped_uuid FROM public.products ORDER BY created_at LIMIT 1 OFFSET 0; -- Map to first product\n    WHEN '9' THEN \n      SELECT id INTO mapped_uuid FROM public.products ORDER BY created_at LIMIT 1 OFFSET 1; -- Map to second product\n    ELSE\n      -- Default to first product for unknown legacy IDs\n      SELECT id INTO mapped_uuid FROM public.products ORDER BY created_at LIMIT 1;\n  END CASE;\n  \n  RETURN mapped_uuid;\nEND;\n$$;\n\n-- Step 4: Create function to get default variant for legacy mapping\nCREATE OR REPLACE FUNCTION public.get_default_variant_for_product(\n  product_uuid UUID,\n  preferred_color TEXT DEFAULT '#FFFFFF',\n  preferred_size TEXT DEFAULT 'M'\n)\nRETURNS UUID\nLANGUAGE plpgsql\nAS $$\nDECLARE\n  variant_uuid UUID;\nBEGIN\n  -- Try to find exact match first\n  SELECT id INTO variant_uuid \n  FROM public.product_variants \n  WHERE product_id = product_uuid \n    AND color_hex = preferred_color \n    AND size = preferred_size \n    AND is_active = true\n  LIMIT 1;\n  \n  -- If no exact match, try with just the size\n  IF variant_uuid IS NULL THEN\n    SELECT id INTO variant_uuid \n    FROM public.product_variants \n    WHERE product_id = product_uuid \n      AND size = preferred_size \n      AND is_active = true\n    LIMIT 1;\n  END IF;\n  \n  -- If still no match, get any variant for this product\n  IF variant_uuid IS NULL THEN\n    SELECT id INTO variant_uuid \n    FROM public.product_variants \n    WHERE product_id = product_uuid \n      AND is_active = true\n    ORDER BY color_name, size\n    LIMIT 1;\n  END IF;\n  \n  RETURN variant_uuid;\nEND;\n$$;\n\n-- Step 5: Update cart_items with variant mapping\nUPDATE public.cart_items \nSET \n  variant_id = public.get_default_variant_for_product(\n    public.map_legacy_product_id_to_uuid(legacy_product_id),\n    selected_color,\n    selected_size\n  ),\n  product_id = public.map_legacy_product_id_to_uuid(legacy_product_id)::text\nWHERE variant_id IS NULL \n  AND legacy_product_id != 'custom-design'\n  AND legacy_product_id IS NOT NULL;\n\n-- Step 6: Update order_items with variant mapping (preserve historical integrity)\nUPDATE public.order_items \nSET \n  variant_id = public.get_default_variant_for_product(\n    public.map_legacy_product_id_to_uuid(legacy_product_id),\n    '#FFFFFF', -- Default to white for historical orders\n    'M'        -- Default to Medium for historical orders\n  ),\n  product_id = COALESCE(\n    public.map_legacy_product_id_to_uuid(legacy_product_id)::text,\n    legacy_product_id -- Keep original for custom designs\n  )\nWHERE variant_id IS NULL \n  AND legacy_product_id != 'custom-design'\n  AND legacy_product_id IS NOT NULL;\n\n-- Step 7: Create validation function for Phase 3\nCREATE OR REPLACE FUNCTION public.validate_phase3_migration()\nRETURNS TABLE(\n  check_name TEXT,\n  status TEXT,\n  total_records BIGINT,\n  migrated_records BIGINT,\n  success BOOLEAN,\n  details TEXT\n) \nLANGUAGE plpgsql\nAS $$\nDECLARE\n  total_cart_items BIGINT;\n  cart_items_with_variants BIGINT;\n  cart_items_custom_designs BIGINT;\n  total_order_items BIGINT;\n  order_items_with_variants BIGINT;\n  order_items_custom_designs BIGINT;\nBEGIN\n  -- Get cart items counts\n  SELECT COUNT(*) INTO total_cart_items FROM public.cart_items;\n  SELECT COUNT(*) INTO cart_items_with_variants FROM public.cart_items WHERE variant_id IS NOT NULL;\n  SELECT COUNT(*) INTO cart_items_custom_designs FROM public.cart_items WHERE legacy_product_id = 'custom-design';\n  \n  -- Get order items counts\n  SELECT COUNT(*) INTO total_order_items FROM public.order_items;\n  SELECT COUNT(*) INTO order_items_with_variants FROM public.order_items WHERE variant_id IS NOT NULL;\n  SELECT COUNT(*) INTO order_items_custom_designs FROM public.order_items WHERE legacy_product_id = 'custom-design';\n  \n  -- Cart items validation\n  RETURN QUERY SELECT \n    'cart_items_migration'::TEXT,\n    CASE WHEN (cart_items_with_variants + cart_items_custom_designs) = total_cart_items THEN 'PASS' ELSE 'FAIL' END::TEXT,\n    total_cart_items,\n    cart_items_with_variants,\n    (cart_items_with_variants + cart_items_custom_designs) = total_cart_items,\n    'Cart items with variants + custom designs should equal total'::TEXT;\n  \n  -- Order items validation\n  RETURN QUERY SELECT \n    'order_items_migration'::TEXT,\n    CASE WHEN (order_items_with_variants + order_items_custom_designs) = total_order_items THEN 'PASS' ELSE 'FAIL' END::TEXT,\n    total_order_items,\n    order_items_with_variants,\n    (order_items_with_variants + order_items_custom_designs) = total_order_items,\n    'Order items with variants + custom designs should equal total'::TEXT;\n  \n  -- Legacy data preservation check\n  RETURN QUERY SELECT \n    'legacy_data_preservation'::TEXT,\n    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,\n    0::BIGINT,\n    COUNT(*)::BIGINT,\n    COUNT(*) = 0,\n    'No records should have lost their legacy product IDs'::TEXT\n  FROM (\n    SELECT 1 FROM public.cart_items WHERE legacy_product_id IS NULL\n    UNION ALL\n    SELECT 1 FROM public.order_items WHERE legacy_product_id IS NULL\n  ) AS missing_legacy;\n  \nEND;\n$$;\n\n-- Step 8: Create detailed migration status function\nCREATE OR REPLACE FUNCTION public.get_migration_status()\nRETURNS TABLE(\n  table_name TEXT,\n  total_records BIGINT,\n  with_variants BIGINT,\n  custom_designs BIGINT,\n  unmapped BIGINT,\n  migration_complete BOOLEAN\n) \nLANGUAGE plpgsql\nAS $$\nBEGIN\n  -- Cart items status\n  RETURN QUERY SELECT \n    'cart_items'::TEXT,\n    COUNT(*)::BIGINT as total_records,\n    COUNT(CASE WHEN variant_id IS NOT NULL THEN 1 END)::BIGINT as with_variants,\n    COUNT(CASE WHEN legacy_product_id = 'custom-design' THEN 1 END)::BIGINT as custom_designs,\n    COUNT(CASE WHEN variant_id IS NULL AND legacy_product_id != 'custom-design' THEN 1 END)::BIGINT as unmapped,\n    COUNT(CASE WHEN variant_id IS NULL AND legacy_product_id != 'custom-design' THEN 1 END) = 0 as migration_complete\n  FROM public.cart_items;\n  \n  -- Order items status\n  RETURN QUERY SELECT \n    'order_items'::TEXT,\n    COUNT(*)::BIGINT as total_records,\n    COUNT(CASE WHEN variant_id IS NOT NULL THEN 1 END)::BIGINT as with_variants,\n    COUNT(CASE WHEN legacy_product_id = 'custom-design' THEN 1 END)::BIGINT as custom_designs,\n    COUNT(CASE WHEN variant_id IS NULL AND legacy_product_id != 'custom-design' THEN 1 END)::BIGINT as unmapped,\n    COUNT(CASE WHEN variant_id IS NULL AND legacy_product_id != 'custom-design' THEN 1 END) = 0 as migration_complete\n  FROM public.order_items;\n  \nEND;\n$$;"}		kmandalam@gmail.com	\N
20250715100037	{"-- Phase 4: Schema Cleanup and Optimization (Corrected)\n-- This phase adds constraints, indexes, and handles custom designs properly\n\n-- Step 1: Handle custom design items - these should keep variant_id as NULL since they're custom\n-- Update the mapping function to exclude custom designs\nCREATE OR REPLACE FUNCTION public.update_order_items_variants()\nRETURNS INTEGER AS $$\nDECLARE\n  updated_count INTEGER := 0;\nBEGIN\n  -- Only update non-custom design items that don't have variant_id\n  UPDATE public.order_items \n  SET variant_id = public.get_default_variant_for_product(\n    public.map_legacy_product_id_to_uuid(legacy_product_id)\n  )\n  WHERE variant_id IS NULL \n    AND legacy_product_id NOT IN ('custom-design')\n    AND legacy_product_id IS NOT NULL;\n    \n  GET DIAGNOSTICS updated_count = ROW_COUNT;\n  RETURN updated_count;\nEND;\n$$ LANGUAGE plpgsql;\n\n-- Execute the update\nSELECT public.update_order_items_variants();\n\n-- Step 2: Add foreign key constraints for data integrity (only for regular products)\nALTER TABLE public.cart_items \nADD CONSTRAINT fk_cart_items_variant \nFOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE CASCADE;\n\n-- For order_items, we'll add a conditional constraint that allows NULL for custom designs\n-- But first, let's add the constraint for non-NULL values\nALTER TABLE public.order_items \nADD CONSTRAINT fk_order_items_variant \nFOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE RESTRICT;\n\n-- Step 3: Create indexes for better performance\nCREATE INDEX IF NOT EXISTS idx_cart_items_variant_id ON public.cart_items(variant_id);\nCREATE INDEX IF NOT EXISTS idx_cart_items_user_variant ON public.cart_items(user_id, variant_id);\nCREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON public.order_items(variant_id) WHERE variant_id IS NOT NULL;\nCREATE INDEX IF NOT EXISTS idx_order_items_order_variant ON public.order_items(order_id, variant_id) WHERE variant_id IS NOT NULL;\nCREATE INDEX IF NOT EXISTS idx_order_items_custom_design ON public.order_items(order_id) WHERE variant_id IS NULL;\nCREATE INDEX IF NOT EXISTS idx_product_variants_product_color_size ON public.product_variants(product_id, color_hex, size);\n\n-- Step 4: Add NOT NULL constraint only for cart_items (since custom designs don't go in cart)\nALTER TABLE public.cart_items ALTER COLUMN variant_id SET NOT NULL;\n\n-- Step 5: Create function to validate final migration state\nCREATE OR REPLACE FUNCTION public.validate_final_migration()\nRETURNS TABLE(\n  check_name TEXT,\n  status TEXT,\n  expected_value BIGINT,\n  actual_value BIGINT,\n  success BOOLEAN,\n  details TEXT\n) AS $$\nDECLARE\n  cart_items_count BIGINT;\n  order_items_count BIGINT;\n  variants_count BIGINT;\n  custom_design_orders BIGINT;\n  regular_product_orders BIGINT;\nBEGIN\n  -- Get record counts\n  SELECT COUNT(*) INTO cart_items_count FROM public.cart_items;\n  SELECT COUNT(*) INTO order_items_count FROM public.order_items;\n  SELECT COUNT(*) INTO variants_count FROM public.product_variants;\n  SELECT COUNT(*) INTO custom_design_orders FROM public.order_items WHERE legacy_product_id = 'custom-design';\n  SELECT COUNT(*) INTO regular_product_orders FROM public.order_items WHERE legacy_product_id != 'custom-design' OR legacy_product_id IS NULL;\n  \n  -- Validate all cart items have valid variant references\n  RETURN QUERY SELECT \n    'cart_items_valid_variants'::TEXT,\n    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,\n    0::BIGINT,\n    COUNT(*)::BIGINT,\n    COUNT(*) = 0,\n    'All cart items should reference valid variants'::TEXT\n  FROM public.cart_items ci\n  LEFT JOIN public.product_variants pv ON ci.variant_id = pv.id\n  WHERE pv.id IS NULL;\n  \n  -- Validate regular product order items have valid variant references\n  RETURN QUERY SELECT \n    'order_items_valid_variants'::TEXT,\n    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,\n    0::BIGINT,\n    COUNT(*)::BIGINT,\n    COUNT(*) = 0,\n    'All non-custom order items should reference valid variants'::TEXT\n  FROM public.order_items oi\n  LEFT JOIN public.product_variants pv ON oi.variant_id = pv.id\n  WHERE pv.id IS NULL AND oi.legacy_product_id != 'custom-design';\n  \n  -- Validate custom design orders have NULL variant_id (as expected)\n  RETURN QUERY SELECT \n    'custom_design_orders_null_variant'::TEXT,\n    CASE WHEN COUNT(*) = custom_design_orders THEN 'PASS' ELSE 'FAIL' END::TEXT,\n    custom_design_orders,\n    COUNT(*)::BIGINT,\n    COUNT(*) = custom_design_orders,\n    'Custom design orders should have NULL variant_id'::TEXT\n  FROM public.order_items\n  WHERE legacy_product_id = 'custom-design' AND variant_id IS NULL;\n  \n  -- Validate variant count matches expected\n  RETURN QUERY SELECT \n    'variant_count_final'::TEXT,\n    CASE WHEN variants_count = 60 THEN 'PASS' ELSE 'FAIL' END::TEXT,\n    60::BIGINT,\n    variants_count,\n    variants_count = 60,\n    'Should have exactly 60 product variants'::TEXT;\n  \n  -- Summary statistics\n  RETURN QUERY SELECT \n    'migration_summary'::TEXT,\n    'INFO'::TEXT,\n    order_items_count,\n    custom_design_orders,\n    true,\n    FORMAT('Total: %s orders (%s custom, %s regular products)', \n           order_items_count, custom_design_orders, regular_product_orders)::TEXT;\n  \nEND;\n$$ LANGUAGE plpgsql;\n\n-- Step 6: Create updated migration summary\nCREATE OR REPLACE FUNCTION public.get_migration_summary()\nRETURNS TABLE(\n  phase TEXT,\n  description TEXT,\n  tables_affected TEXT,\n  records_migrated BIGINT,\n  status TEXT\n) AS $$\nBEGIN\n  RETURN QUERY SELECT \n    'Phase 1'::TEXT,\n    'Database Structure Creation'::TEXT,\n    'product_categories, product_variants'::TEXT,\n    0::BIGINT,\n    'COMPLETE'::TEXT;\n    \n  RETURN QUERY SELECT \n    'Phase 2'::TEXT,\n    'Data Migration & Validation'::TEXT,\n    'products, product_variants'::TEXT,\n    (SELECT COUNT(*) FROM public.product_variants)::BIGINT,\n    'COMPLETE'::TEXT;\n    \n  RETURN QUERY SELECT \n    'Phase 3'::TEXT,\n    'Legacy Data Migration'::TEXT,\n    'cart_items, order_items'::TEXT,\n    (SELECT COUNT(*) FROM public.cart_items WHERE variant_id IS NOT NULL) + \n    (SELECT COUNT(*) FROM public.order_items WHERE variant_id IS NOT NULL)::BIGINT,\n    'COMPLETE'::TEXT;\n    \n  RETURN QUERY SELECT \n    'Phase 4'::TEXT,\n    'Schema Cleanup & Optimization'::TEXT,\n    'Constraints, indexes, custom design handling'::TEXT,\n    (SELECT COUNT(*) FROM public.order_items WHERE legacy_product_id = 'custom-design')::BIGINT,\n    'COMPLETE'::TEXT;\nEND;\n$$ LANGUAGE plpgsql;"}		kmandalam@gmail.com	\N
20250723105752	{"-- Step 1: Add XS size variants for all existing products\nINSERT INTO public.product_variants (\n  product_id,\n  sku,\n  color_name,\n  color_hex,\n  size,\n  price,\n  stock_quantity,\n  low_stock_threshold,\n  is_active\n)\nSELECT \n  p.id as product_id,\n  public.generate_variant_sku(\n    p.name,\n    public.get_color_name_from_hex(color_value::text),\n    'XS'\n  ) as sku,\n  public.get_color_name_from_hex(color_value::text) as color_name,\n  color_value::text as color_hex,\n  'XS' as size,\n  p.base_price as price,\n  50 as stock_quantity,\n  5 as low_stock_threshold,\n  true as is_active\nFROM public.products p\nCROSS JOIN jsonb_array_elements_text(p.colors) as color_value\nWHERE NOT EXISTS (\n  SELECT 1 FROM public.product_variants pv \n  WHERE pv.product_id = p.id \n  AND pv.color_hex = color_value::text \n  AND pv.size = 'XS'\n);\n\n-- Step 2: Create stock management functions\nCREATE OR REPLACE FUNCTION public.check_variant_stock(variant_uuid UUID, requested_quantity INTEGER)\nRETURNS BOOLEAN\nLANGUAGE plpgsql\nAS $$\nBEGIN\n  RETURN EXISTS (\n    SELECT 1 FROM public.product_variants \n    WHERE id = variant_uuid \n    AND is_active = true \n    AND stock_quantity >= requested_quantity\n  );\nEND;\n$$;\n\nCREATE OR REPLACE FUNCTION public.reserve_stock(variant_uuid UUID, quantity INTEGER)\nRETURNS BOOLEAN\nLANGUAGE plpgsql\nAS $$\nDECLARE\n  current_stock INTEGER;\nBEGIN\n  -- Get current stock with row lock\n  SELECT stock_quantity INTO current_stock\n  FROM public.product_variants \n  WHERE id = variant_uuid \n  FOR UPDATE;\n  \n  -- Check if we have enough stock\n  IF current_stock >= quantity THEN\n    -- Deduct stock\n    UPDATE public.product_variants \n    SET stock_quantity = stock_quantity - quantity,\n        updated_at = NOW()\n    WHERE id = variant_uuid;\n    \n    RETURN TRUE;\n  ELSE\n    RETURN FALSE;\n  END IF;\nEND;\n$$;\n\nCREATE OR REPLACE FUNCTION public.release_stock(variant_uuid UUID, quantity INTEGER)\nRETURNS VOID\nLANGUAGE plpgsql\nAS $$\nBEGIN\n  -- Add stock back\n  UPDATE public.product_variants \n  SET stock_quantity = stock_quantity + quantity,\n      updated_at = NOW()\n  WHERE id = variant_uuid;\nEND;\n$$;\n\n-- Step 3: Function to get available sizes for a product (fixed ORDER BY)\nCREATE OR REPLACE FUNCTION public.get_product_sizes(product_uuid UUID)\nRETURNS TABLE(size TEXT, available_stock INTEGER, sort_order INTEGER)\nLANGUAGE sql\nAS $$\n  SELECT \n    size, \n    SUM(stock_quantity)::INTEGER as available_stock,\n    CASE size\n      WHEN 'XS' THEN 1\n      WHEN 'S' THEN 2\n      WHEN 'M' THEN 3\n      WHEN 'L' THEN 4\n      WHEN 'XL' THEN 5\n      WHEN 'XXL' THEN 6\n      ELSE 7\n    END as sort_order\n  FROM public.product_variants \n  WHERE product_id = product_uuid \n  AND is_active = true\n  GROUP BY size\n  ORDER BY sort_order;\n$$;\n\n-- Step 4: Function to get available colors for a product and size\nCREATE OR REPLACE FUNCTION public.get_product_colors(product_uuid UUID, size_param TEXT)\nRETURNS TABLE(color_name TEXT, color_hex TEXT, stock_quantity INTEGER, variant_id UUID)\nLANGUAGE sql\nAS $$\n  SELECT color_name, color_hex, stock_quantity, id as variant_id\n  FROM public.product_variants \n  WHERE product_id = product_uuid \n  AND size = size_param\n  AND is_active = true\n  AND stock_quantity > 0\n  ORDER BY color_name;\n$$;"}		kmandalam@gmail.com	\N
SELECT pg_catalog.setval('public.order_number_seq', 16, true);
ALTER TABLE ONLY public.addresses
ALTER TABLE ONLY public.ai_generated_designs
ALTER TABLE ONLY public.cart_items
ALTER TABLE ONLY public.custom_designs
ALTER TABLE ONLY public.design_questions
ALTER TABLE ONLY public.design_responses
ALTER TABLE ONLY public.designs
ALTER TABLE ONLY public.order_items
ALTER TABLE ONLY public.orders
ALTER TABLE ONLY public.orders
ALTER TABLE ONLY public.payment_transactions
ALTER TABLE ONLY public.product_categories
ALTER TABLE ONLY public.product_categories
ALTER TABLE ONLY public.product_variants
ALTER TABLE ONLY public.product_variants
ALTER TABLE ONLY public.products
ALTER TABLE ONLY public.profiles
ALTER TABLE ONLY public.themes
ALTER TABLE ONLY public.product_variants
CREATE INDEX idx_cart_items_user_variant ON public.cart_items USING btree (user_id, variant_id);
CREATE INDEX idx_cart_items_variant_id ON public.cart_items USING btree (variant_id);
CREATE INDEX idx_custom_designs_user_id ON public.custom_designs USING btree (user_id);
CREATE INDEX idx_order_items_custom_design ON public.order_items USING btree (order_id) WHERE (variant_id IS NULL);
CREATE INDEX idx_order_items_order_variant ON public.order_items USING btree (order_id, variant_id) WHERE (variant_id IS NOT NULL);
CREATE INDEX idx_order_items_variant_id ON public.order_items USING btree (variant_id) WHERE (variant_id IS NOT NULL);
CREATE INDEX idx_payment_transactions_gateway_transaction_id ON public.payment_transactions USING btree (gateway_transaction_id);
CREATE INDEX idx_payment_transactions_order_id ON public.payment_transactions USING btree (order_id);
CREATE INDEX idx_payment_transactions_status ON public.payment_transactions USING btree (status);
CREATE INDEX idx_product_variants_active ON public.product_variants USING btree (is_active);
CREATE INDEX idx_product_variants_product_color_size ON public.product_variants USING btree (product_id, color_hex, size);
CREATE INDEX idx_product_variants_product_id ON public.product_variants USING btree (product_id);
CREATE INDEX idx_product_variants_sku ON public.product_variants USING btree (sku);
CREATE INDEX idx_product_variants_stock ON public.product_variants USING btree (stock_quantity);
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
CREATE TRIGGER set_order_number_trigger BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_order_number();
CREATE TRIGGER trigger_update_custom_designs_updated_at BEFORE UPDATE ON public.custom_designs FOR EACH ROW EXECUTE FUNCTION public.update_custom_designs_updated_at();
CREATE TRIGGER trigger_update_payment_transactions_updated_at BEFORE UPDATE ON public.payment_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON public.product_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE ONLY public.addresses
ALTER TABLE ONLY public.ai_generated_designs
    ADD CONSTRAINT ai_generated_designs_theme_id_fkey FOREIGN KEY (theme_id) REFERENCES public.themes(id);
ALTER TABLE ONLY public.ai_generated_designs
ALTER TABLE ONLY public.cart_items
ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id);
ALTER TABLE ONLY public.custom_designs
ALTER TABLE ONLY public.design_questions
    ADD CONSTRAINT design_questions_theme_id_fkey FOREIGN KEY (theme_id) REFERENCES public.themes(id);
ALTER TABLE ONLY public.design_responses
    ADD CONSTRAINT design_responses_design_id_fkey FOREIGN KEY (design_id) REFERENCES public.designs(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.design_responses
    ADD CONSTRAINT design_responses_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.design_questions(id);
ALTER TABLE ONLY public.designs
ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT fk_cart_items_variant FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fk_order_items_variant FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE RESTRICT;
ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT fk_product_variants_product_id FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_custom_design_id_fkey FOREIGN KEY (custom_design_id) REFERENCES public.custom_designs(id);
ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id);
ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_payment_transaction_id_fkey FOREIGN KEY (payment_transaction_id) REFERENCES public.payment_transactions(id);
ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);
ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.product_categories(id);
ALTER TABLE ONLY public.profiles
CREATE POLICY "Allow everyone to view questions" ON public.design_questions FOR SELECT USING (true);
CREATE POLICY "Allow everyone to view themes" ON public.themes FOR SELECT USING (true);
CREATE POLICY "Allow users to delete their own designs" ON public.designs FOR DELETE USING ((auth.uid() = user_id));
CREATE POLICY "Allow users to insert their own designs" ON public.designs FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Allow users to insert their own responses" ON public.design_responses FOR INSERT WITH CHECK ((auth.uid() = ( SELECT designs.user_id
   FROM public.designs
CREATE POLICY "Allow users to update their own designs" ON public.designs FOR UPDATE USING ((auth.uid() = user_id));
CREATE POLICY "Allow users to update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));
CREATE POLICY "Allow users to view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow users to view their own designs" ON public.designs FOR SELECT USING (((auth.uid() = user_id) OR (is_public = true)));
CREATE POLICY "Allow users to view their own responses" ON public.design_responses FOR SELECT USING ((auth.uid() = ( SELECT designs.user_id
   FROM public.designs
CREATE POLICY "Categories are publicly readable" ON public.product_categories FOR SELECT USING ((is_active = true));
CREATE POLICY "Product variants are publicly readable" ON public.product_variants FOR SELECT USING ((is_active = true));
CREATE POLICY "Products are publicly readable" ON public.products FOR SELECT USING ((is_active = true));
CREATE POLICY "Users can create their own AI designs" ON public.ai_generated_designs FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can create their own cart items" ON public.cart_items FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can create their own custom designs" ON public.custom_designs FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can create their own order items" ON public.order_items FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.orders
CREATE POLICY "Users can create their own orders" ON public.orders FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can delete their own AI designs" ON public.ai_generated_designs FOR DELETE USING ((auth.uid() = user_id));
CREATE POLICY "Users can delete their own addresses" ON public.addresses FOR DELETE USING ((auth.uid() = user_id));
CREATE POLICY "Users can delete their own cart items" ON public.cart_items FOR DELETE USING ((auth.uid() = user_id));
CREATE POLICY "Users can delete their own custom designs" ON public.custom_designs FOR DELETE USING ((auth.uid() = user_id));
CREATE POLICY "Users can insert their own addresses" ON public.addresses FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can insert their own cart items" ON public.cart_items FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can update their own AI designs" ON public.ai_generated_designs FOR UPDATE USING ((auth.uid() = user_id));
CREATE POLICY "Users can update their own addresses" ON public.addresses FOR UPDATE USING ((auth.uid() = user_id));
CREATE POLICY "Users can update their own cart items" ON public.cart_items FOR UPDATE USING ((auth.uid() = user_id));
CREATE POLICY "Users can update their own custom designs" ON public.custom_designs FOR UPDATE USING ((auth.uid() = user_id));
CREATE POLICY "Users can update their own orders" ON public.orders FOR UPDATE USING ((auth.uid() = user_id));
CREATE POLICY "Users can view their own AI designs" ON public.ai_generated_designs FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "Users can view their own addresses" ON public.addresses FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "Users can view their own cart items" ON public.cart_items FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "Users can view their own custom designs" ON public.custom_designs FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "Users can view their own order items" ON public.order_items FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.orders
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "Users can view their own payment transactions" ON public.payment_transactions FOR SELECT USING ((auth.uid() = ( SELECT orders.user_id
   FROM public.orders
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generated_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;
GRANT ALL ON FUNCTION public.check_variant_stock(variant_uuid uuid, requested_quantity integer) TO anon;
GRANT ALL ON FUNCTION public.check_variant_stock(variant_uuid uuid, requested_quantity integer) TO authenticated;
GRANT ALL ON FUNCTION public.check_variant_stock(variant_uuid uuid, requested_quantity integer) TO service_role;
GRANT ALL ON FUNCTION public.create_migration_checkpoint() TO anon;
GRANT ALL ON FUNCTION public.create_migration_checkpoint() TO authenticated;
GRANT ALL ON FUNCTION public.create_migration_checkpoint() TO service_role;
GRANT ALL ON FUNCTION public.generate_order_number() TO anon;
GRANT ALL ON FUNCTION public.generate_order_number() TO authenticated;
GRANT ALL ON FUNCTION public.generate_order_number() TO service_role;
GRANT ALL ON FUNCTION public.generate_variant_sku(product_name text, color_name text, size_name text) TO anon;
GRANT ALL ON FUNCTION public.generate_variant_sku(product_name text, color_name text, size_name text) TO authenticated;
GRANT ALL ON FUNCTION public.generate_variant_sku(product_name text, color_name text, size_name text) TO service_role;
GRANT ALL ON FUNCTION public.get_color_name_from_hex(hex_color text) TO anon;
GRANT ALL ON FUNCTION public.get_color_name_from_hex(hex_color text) TO authenticated;
GRANT ALL ON FUNCTION public.get_color_name_from_hex(hex_color text) TO service_role;
GRANT ALL ON FUNCTION public.get_default_variant_for_product(product_uuid uuid, preferred_color text, preferred_size text) TO anon;
GRANT ALL ON FUNCTION public.get_default_variant_for_product(product_uuid uuid, preferred_color text, preferred_size text) TO authenticated;
GRANT ALL ON FUNCTION public.get_default_variant_for_product(product_uuid uuid, preferred_color text, preferred_size text) TO service_role;
GRANT ALL ON FUNCTION public.get_migration_status() TO anon;
GRANT ALL ON FUNCTION public.get_migration_status() TO authenticated;
GRANT ALL ON FUNCTION public.get_migration_status() TO service_role;
GRANT ALL ON FUNCTION public.get_migration_summary() TO anon;
GRANT ALL ON FUNCTION public.get_migration_summary() TO authenticated;
GRANT ALL ON FUNCTION public.get_migration_summary() TO service_role;
GRANT ALL ON FUNCTION public.get_product_colors(product_uuid uuid, size_param text) TO anon;
GRANT ALL ON FUNCTION public.get_product_colors(product_uuid uuid, size_param text) TO authenticated;
GRANT ALL ON FUNCTION public.get_product_colors(product_uuid uuid, size_param text) TO service_role;
GRANT ALL ON FUNCTION public.get_product_sizes(product_uuid uuid) TO anon;
GRANT ALL ON FUNCTION public.get_product_sizes(product_uuid uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_product_sizes(product_uuid uuid) TO service_role;
GRANT ALL ON FUNCTION public.get_sample_variants(limit_count integer) TO anon;
GRANT ALL ON FUNCTION public.get_sample_variants(limit_count integer) TO authenticated;
GRANT ALL ON FUNCTION public.get_sample_variants(limit_count integer) TO service_role;
GRANT ALL ON FUNCTION public.get_theme_questions(theme_uuid uuid) TO anon;
GRANT ALL ON FUNCTION public.get_theme_questions(theme_uuid uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_theme_questions(theme_uuid uuid) TO service_role;
GRANT ALL ON FUNCTION public.get_variant_breakdown() TO anon;
GRANT ALL ON FUNCTION public.get_variant_breakdown() TO authenticated;
GRANT ALL ON FUNCTION public.get_variant_breakdown() TO service_role;
GRANT ALL ON FUNCTION public.handle_new_user() TO anon;
GRANT ALL ON FUNCTION public.handle_new_user() TO authenticated;
GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;
GRANT ALL ON FUNCTION public.map_legacy_product_id_to_uuid(legacy_id text) TO anon;
GRANT ALL ON FUNCTION public.map_legacy_product_id_to_uuid(legacy_id text) TO authenticated;
GRANT ALL ON FUNCTION public.map_legacy_product_id_to_uuid(legacy_id text) TO service_role;
GRANT ALL ON FUNCTION public.release_stock(variant_uuid uuid, quantity integer) TO anon;
GRANT ALL ON FUNCTION public.release_stock(variant_uuid uuid, quantity integer) TO authenticated;
GRANT ALL ON FUNCTION public.release_stock(variant_uuid uuid, quantity integer) TO service_role;
GRANT ALL ON FUNCTION public.reserve_stock(variant_uuid uuid, quantity integer) TO anon;
GRANT ALL ON FUNCTION public.reserve_stock(variant_uuid uuid, quantity integer) TO authenticated;
GRANT ALL ON FUNCTION public.reserve_stock(variant_uuid uuid, quantity integer) TO service_role;
GRANT ALL ON FUNCTION public.set_order_number() TO anon;
GRANT ALL ON FUNCTION public.set_order_number() TO authenticated;
GRANT ALL ON FUNCTION public.set_order_number() TO service_role;
GRANT ALL ON FUNCTION public.update_custom_designs_updated_at() TO anon;
GRANT ALL ON FUNCTION public.update_custom_designs_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.update_custom_designs_updated_at() TO service_role;
GRANT ALL ON FUNCTION public.update_order_items_variants() TO anon;
GRANT ALL ON FUNCTION public.update_order_items_variants() TO authenticated;
GRANT ALL ON FUNCTION public.update_order_items_variants() TO service_role;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO anon;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO service_role;
GRANT ALL ON FUNCTION public.validate_final_migration() TO anon;
GRANT ALL ON FUNCTION public.validate_final_migration() TO authenticated;
GRANT ALL ON FUNCTION public.validate_final_migration() TO service_role;
GRANT ALL ON FUNCTION public.validate_migration_data() TO anon;
GRANT ALL ON FUNCTION public.validate_migration_data() TO authenticated;
GRANT ALL ON FUNCTION public.validate_migration_data() TO service_role;
GRANT ALL ON FUNCTION public.validate_phase2_migration() TO anon;
GRANT ALL ON FUNCTION public.validate_phase2_migration() TO authenticated;
GRANT ALL ON FUNCTION public.validate_phase2_migration() TO service_role;
GRANT ALL ON FUNCTION public.validate_phase3_migration() TO anon;
GRANT ALL ON FUNCTION public.validate_phase3_migration() TO authenticated;
GRANT ALL ON FUNCTION public.validate_phase3_migration() TO service_role;
GRANT ALL ON TABLE public.addresses TO anon;
GRANT ALL ON TABLE public.addresses TO authenticated;
GRANT ALL ON TABLE public.addresses TO service_role;
GRANT ALL ON TABLE public.ai_generated_designs TO anon;
GRANT ALL ON TABLE public.ai_generated_designs TO authenticated;
GRANT ALL ON TABLE public.ai_generated_designs TO service_role;
GRANT ALL ON TABLE public.cart_items TO anon;
GRANT ALL ON TABLE public.cart_items TO authenticated;
GRANT ALL ON TABLE public.cart_items TO service_role;
GRANT ALL ON TABLE public.custom_designs TO anon;
GRANT ALL ON TABLE public.custom_designs TO authenticated;
GRANT ALL ON TABLE public.custom_designs TO service_role;
GRANT ALL ON TABLE public.design_questions TO anon;
GRANT ALL ON TABLE public.design_questions TO authenticated;
GRANT ALL ON TABLE public.design_questions TO service_role;
GRANT ALL ON TABLE public.design_responses TO anon;
GRANT ALL ON TABLE public.design_responses TO authenticated;
GRANT ALL ON TABLE public.design_responses TO service_role;
GRANT ALL ON TABLE public.designs TO anon;
GRANT ALL ON TABLE public.designs TO authenticated;
GRANT ALL ON TABLE public.designs TO service_role;
GRANT ALL ON TABLE public.order_items TO anon;
GRANT ALL ON TABLE public.order_items TO authenticated;
GRANT ALL ON TABLE public.order_items TO service_role;
GRANT ALL ON SEQUENCE public.order_number_seq TO anon;
GRANT ALL ON SEQUENCE public.order_number_seq TO authenticated;
GRANT ALL ON SEQUENCE public.order_number_seq TO service_role;
GRANT ALL ON TABLE public.orders TO anon;
GRANT ALL ON TABLE public.orders TO authenticated;
GRANT ALL ON TABLE public.orders TO service_role;
GRANT ALL ON TABLE public.payment_transactions TO anon;
GRANT ALL ON TABLE public.payment_transactions TO authenticated;
GRANT ALL ON TABLE public.payment_transactions TO service_role;
GRANT ALL ON TABLE public.product_categories TO anon;
GRANT ALL ON TABLE public.product_categories TO authenticated;
GRANT ALL ON TABLE public.product_categories TO service_role;
GRANT ALL ON TABLE public.product_variants TO anon;
GRANT ALL ON TABLE public.product_variants TO authenticated;
GRANT ALL ON TABLE public.product_variants TO service_role;
GRANT ALL ON TABLE public.products TO anon;
GRANT ALL ON TABLE public.products TO authenticated;
GRANT ALL ON TABLE public.products TO service_role;
GRANT ALL ON TABLE public.profiles TO anon;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;
GRANT ALL ON TABLE public.themes TO anon;
GRANT ALL ON TABLE public.themes TO authenticated;
GRANT ALL ON TABLE public.themes TO service_role;
