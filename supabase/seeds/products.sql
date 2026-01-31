-- Seed data for products
INSERT INTO products (id, name, description, base_price, category, sizes, colors, is_active, created_at, category_id) VALUES
 ('bbf231f6-4f6b-487e-bcc0-5db8d91fc10c', 'Classic Cotton Tee', 'Premium 100% cotton t-shirt, perfect for custom designs', 2070.00, 'tshirt', '["S", "M", "L", "XL", "XXL"]'::jsonb, '["#FFFFFF", "#000000", "#8A898C", "#1EAEDB"]'::jsonb, true, '2025-06-02 16:56:40.244029+00', '54145cfd-bf29-4ba3-8b63-8ea019cf3a1b'),+
 ('2a026f73-1c40-4f34-8cab-6f1281fafcab', 'Premium Blend Tee', 'Soft cotton-polyester blend for comfort and durability', 2490.00, 'tshirt', '["S", "M", "L", "XL", "XXL"]'::jsonb, '["#FFFFFF", "#000000", "#8A898C", "#1EAEDB"]'::jsonb, true, '2025-06-02 16:56:40.244029+00', '54145cfd-bf29-4ba3-8b63-8ea019cf3a1b'),  +
 ('af4da6c0-df94-4758-ae66-014ff6b8b3ef', 'Organic Cotton Tee', 'Eco-friendly organic cotton t-shirt', 2740.00, 'tshirt', '["S", "M", "L", "XL", "XXL"]'::jsonb, '["#FFFFFF", "#000000", "#8A898C", "#1EAEDB"]'::jsonb, true, '2025-06-02 16:56:40.244029+00', '54145cfd-bf29-4ba3-8b63-8ea019cf3a1b');

