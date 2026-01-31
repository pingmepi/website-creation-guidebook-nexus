-- Seed data for themes
INSERT INTO themes (id, name, description, thumbnail_url, is_active, category, created_at) VALUES
 ('b7f9a58a-bddc-4b0e-9c34-b9927d8985a3', 'Minimalist', 'Clean and simple designs with minimal elements', 'https://example.com/minimalist.jpg', true, 'Style', '2025-05-01 08:39:24.571446+00'),            
 ('6c57ff4e-3a43-4b2c-b84d-0ef2826c2028', 'Bold Typography', 'Designs focused on impactful text and typography', 'https://example.com/typography.jpg', true, 'Typography', '2025-05-01 08:39:24.571446+00'),
 ('ba09daae-a074-4c63-8e4a-c8dd6207b7c8', 'Nature Inspired', 'Designs featuring natural elements and scenery', 'https://example.com/nature.jpg', true, 'Nature', '2025-05-01 08:39:24.571446+00'),          
 ('ae230e90-0fa5-4314-8de2-466771d4d6e8', 'Geometric', 'Abstract designs using geometric shapes and patterns', 'https://example.com/geometric.jpg', true, 'Abstract', '2025-05-01 08:39:24.571446+00'),     
 ('086edb04-8418-4190-a59e-c2e48d6fda1e', 'Vintage', 'Classic retro-style designs with a nostalgic feel', 'https://example.com/vintage.jpg', true, 'Style', '2025-05-01 08:39:24.571446+00');


-- Seed data for product_categories
INSERT INTO product_categories (id, name, description, is_active, sort_order, created_at) VALUES
 ('54145cfd-bf29-4ba3-8b63-8ea019cf3a1b', 'T-Shirts', 'Classic and premium t-shirts', true, 1, '2025-07-15 08:11:33.662121+00'),     
 ('393aff80-5297-454d-b134-409c9cbb16b2', 'Custom Designs', 'User-created custom designs', true, 2, '2025-07-15 08:11:33.662121+00');


-- Seed data for products
INSERT INTO products (id, name, description, base_price, category, sizes, colors, is_active, created_at, category_id) VALUES
 ('bbf231f6-4f6b-487e-bcc0-5db8d91fc10c', 'Classic Cotton Tee', 'Premium 100% cotton t-shirt, perfect for custom designs', 2070.00, 'tshirt', '["S", "M", "L", "XL", "XXL"]'::jsonb, '["#FFFFFF", "#000000", "#8A898C", "#1EAEDB"]'::jsonb, true, '2025-06-02 16:56:40.244029+00', '54145cfd-bf29-4ba3-8b63-8ea019cf3a1b'),
 ('2a026f73-1c40-4f34-8cab-6f1281fafcab', 'Premium Blend Tee', 'Soft cotton-polyester blend for comfort and durability', 2490.00, 'tshirt', '["S", "M", "L", "XL", "XXL"]'::jsonb, '["#FFFFFF", "#000000", "#8A898C", "#1EAEDB"]'::jsonb, true, '2025-06-02 16:56:40.244029+00', '54145cfd-bf29-4ba3-8b63-8ea019cf3a1b'),  
 ('af4da6c0-df94-4758-ae66-014ff6b8b3ef', 'Organic Cotton Tee', 'Eco-friendly organic cotton t-shirt', 2740.00, 'tshirt', '["S", "M", "L", "XL", "XXL"]'::jsonb, '["#FFFFFF", "#000000", "#8A898C", "#1EAEDB"]'::jsonb, true, '2025-06-02 16:56:40.244029+00', '54145cfd-bf29-4ba3-8b63-8ea019cf3a1b');


-- Seed data for product_variants
INSERT INTO product_variants (id, product_id, sku, color_name, color_hex, size, price, stock_quantity, low_stock_threshold, is_active, created_at) VALUES
 ('a463adfb-c5e2-4acb-9742-65d4be3c4009', 'bbf231f6-4f6b-487e-bcc0-5db8d91fc10c', 'CLA-WHI-S', 'White', '#FFFFFF', 'S', 2070.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),    
 ('87567bd1-af82-43b8-b186-b624494a8a65', 'bbf231f6-4f6b-487e-bcc0-5db8d91fc10c', 'CLA-WHI-M', 'White', '#FFFFFF', 'M', 2070.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),    
 ('fc0dbecf-2154-40f5-b326-466e3e7e01ec', 'bbf231f6-4f6b-487e-bcc0-5db8d91fc10c', 'CLA-WHI-L', 'White', '#FFFFFF', 'L', 2070.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),    
 ('1859ea49-ee01-48fd-9e57-11379c7b6d2c', 'bbf231f6-4f6b-487e-bcc0-5db8d91fc10c', 'CLA-WHI-XL', 'White', '#FFFFFF', 'XL', 2070.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),  
 ('3c34a49c-1130-401f-b7b5-4f01bd37b155', 'bbf231f6-4f6b-487e-bcc0-5db8d91fc10c', 'CLA-WHI-XXL', 'White', '#FFFFFF', 'XXL', 2070.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),
 ('54a296a5-d560-46af-8323-d825104290a6', 'bbf231f6-4f6b-487e-bcc0-5db8d91fc10c', 'CLA-BLA-S', 'Black', '#000000', 'S', 2070.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),    
 ('e7030205-e6ed-427a-8a14-90d8785e85dd', 'bbf231f6-4f6b-487e-bcc0-5db8d91fc10c', 'CLA-BLA-M', 'Black', '#000000', 'M', 2070.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),    
 ('65d03c20-f918-41e7-97ba-5e2c4808d310', 'bbf231f6-4f6b-487e-bcc0-5db8d91fc10c', 'CLA-BLA-L', 'Black', '#000000', 'L', 2070.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),    
 ('75d6e48a-b321-472c-82c4-ec3f6ae0e925', 'bbf231f6-4f6b-487e-bcc0-5db8d91fc10c', 'CLA-BLA-XL', 'Black', '#000000', 'XL', 2070.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),  
 ('92a50a3b-7da5-4d3b-be16-7885f5f661a6', 'bbf231f6-4f6b-487e-bcc0-5db8d91fc10c', 'CLA-BLA-XXL', 'Black', '#000000', 'XXL', 2070.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),
 ('ee3aa246-1137-413b-acd6-dd7c6b94134f', 'bbf231f6-4f6b-487e-bcc0-5db8d91fc10c', 'CLA-GRE-S', 'Grey', '#8A898C', 'S', 2070.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),     
 ('68629471-43b8-432c-9258-2373df24f6a0', 'bbf231f6-4f6b-487e-bcc0-5db8d91fc10c', 'CLA-GRE-M', 'Grey', '#8A898C', 'M', 2070.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),     
 ('a2468591-d99b-4e60-9b0f-b31fcbe6b2c2', 'bbf231f6-4f6b-487e-bcc0-5db8d91fc10c', 'CLA-GRE-L', 'Grey', '#8A898C', 'L', 2070.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),     
 ('962b1b18-7faa-496d-84af-139eb3f6bbe5', 'bbf231f6-4f6b-487e-bcc0-5db8d91fc10c', 'CLA-GRE-XL', 'Grey', '#8A898C', 'XL', 2070.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),   
 ('bacda326-9dc7-42d6-a476-32f3c7daf374', 'bbf231f6-4f6b-487e-bcc0-5db8d91fc10c', 'CLA-GRE-XXL', 'Grey', '#8A898C', 'XXL', 2070.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'), 
 ('b2e4604a-fae9-466d-b812-0863fdcd0dcc', 'bbf231f6-4f6b-487e-bcc0-5db8d91fc10c', 'CLA-BLU-S', 'Blue', '#1EAEDB', 'S', 2070.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),     
 ('9c31eeb5-0a77-4f40-996a-9bf0dc7d6a7f', 'bbf231f6-4f6b-487e-bcc0-5db8d91fc10c', 'CLA-BLU-M', 'Blue', '#1EAEDB', 'M', 2070.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),     
 ('2e4b1a84-c366-411e-951a-9ae80c8fcce9', 'bbf231f6-4f6b-487e-bcc0-5db8d91fc10c', 'CLA-BLU-L', 'Blue', '#1EAEDB', 'L', 2070.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),     
 ('e1772a35-7ef3-4d27-9f34-d42817a39b80', 'bbf231f6-4f6b-487e-bcc0-5db8d91fc10c', 'CLA-BLU-XL', 'Blue', '#1EAEDB', 'XL', 2070.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),   
 ('35647e7c-a298-4e7d-a50a-94cff44266b5', 'bbf231f6-4f6b-487e-bcc0-5db8d91fc10c', 'CLA-BLU-XXL', 'Blue', '#1EAEDB', 'XXL', 2070.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'), 
 ('6fa64c2b-9032-4fb1-b393-a5d08e09bbcc', '2a026f73-1c40-4f34-8cab-6f1281fafcab', 'PRE-WHI-S', 'White', '#FFFFFF', 'S', 2490.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),    
 ('b4d5cb52-0fd5-41ac-be3d-c06f81658639', '2a026f73-1c40-4f34-8cab-6f1281fafcab', 'PRE-WHI-M', 'White', '#FFFFFF', 'M', 2490.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),    
 ('c867773c-b052-403c-8bd7-792d9ed59dd3', '2a026f73-1c40-4f34-8cab-6f1281fafcab', 'PRE-WHI-L', 'White', '#FFFFFF', 'L', 2490.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),    
 ('44e9b6c3-e1e2-4071-88a8-14a9fc4e8fce', '2a026f73-1c40-4f34-8cab-6f1281fafcab', 'PRE-WHI-XL', 'White', '#FFFFFF', 'XL', 2490.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),  
 ('8a6145ff-89c2-4e3b-936d-7a3d64aa6549', '2a026f73-1c40-4f34-8cab-6f1281fafcab', 'PRE-WHI-XXL', 'White', '#FFFFFF', 'XXL', 2490.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),
 ('e68f4ca5-36cf-41fd-beae-57ee1423b45b', '2a026f73-1c40-4f34-8cab-6f1281fafcab', 'PRE-BLA-S', 'Black', '#000000', 'S', 2490.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),    
 ('ef37e4a2-51ac-4153-9067-e0eac8202c9b', '2a026f73-1c40-4f34-8cab-6f1281fafcab', 'PRE-BLA-M', 'Black', '#000000', 'M', 2490.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),    
 ('b89fd86a-6fe0-4f07-b369-3c8c528e7b75', '2a026f73-1c40-4f34-8cab-6f1281fafcab', 'PRE-BLA-L', 'Black', '#000000', 'L', 2490.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),    
 ('a9cf5a46-bdc2-42ce-bfe4-b9b0975daccf', '2a026f73-1c40-4f34-8cab-6f1281fafcab', 'PRE-BLA-XL', 'Black', '#000000', 'XL', 2490.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),  
 ('7c714a4e-81d2-460b-9a84-acc616fb2674', '2a026f73-1c40-4f34-8cab-6f1281fafcab', 'PRE-BLA-XXL', 'Black', '#000000', 'XXL', 2490.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),
 ('8850f89e-5cee-4c16-bcb4-45011f4a9c14', '2a026f73-1c40-4f34-8cab-6f1281fafcab', 'PRE-GRE-S', 'Grey', '#8A898C', 'S', 2490.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),     
 ('682c6314-71f2-4566-a772-2120fcc3092a', '2a026f73-1c40-4f34-8cab-6f1281fafcab', 'PRE-GRE-M', 'Grey', '#8A898C', 'M', 2490.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),     
 ('1efb168c-427c-45c4-8ae3-911fa39120d7', '2a026f73-1c40-4f34-8cab-6f1281fafcab', 'PRE-GRE-L', 'Grey', '#8A898C', 'L', 2490.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),     
 ('68c7c76d-fc7a-4674-9add-58fae8ffcea9', '2a026f73-1c40-4f34-8cab-6f1281fafcab', 'PRE-GRE-XL', 'Grey', '#8A898C', 'XL', 2490.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),   
 ('b1d8f5fe-e769-4315-af89-18749d06992b', '2a026f73-1c40-4f34-8cab-6f1281fafcab', 'PRE-GRE-XXL', 'Grey', '#8A898C', 'XXL', 2490.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'), 
 ('31b1e7ba-0878-415d-bbd2-e06589c0ba14', '2a026f73-1c40-4f34-8cab-6f1281fafcab', 'PRE-BLU-S', 'Blue', '#1EAEDB', 'S', 2490.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),     
 ('4675f4f1-3c95-4971-becb-0a74fdfffd54', '2a026f73-1c40-4f34-8cab-6f1281fafcab', 'PRE-BLU-M', 'Blue', '#1EAEDB', 'M', 2490.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),     
 ('30d53fe1-1d6f-48a9-b044-51c0c46380d1', '2a026f73-1c40-4f34-8cab-6f1281fafcab', 'PRE-BLU-L', 'Blue', '#1EAEDB', 'L', 2490.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),     
 ('417aa8f9-0030-481f-880a-b85b243dfc21', '2a026f73-1c40-4f34-8cab-6f1281fafcab', 'PRE-BLU-XL', 'Blue', '#1EAEDB', 'XL', 2490.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),   
 ('91a6c65b-8556-480f-af67-61de1e59d892', '2a026f73-1c40-4f34-8cab-6f1281fafcab', 'PRE-BLU-XXL', 'Blue', '#1EAEDB', 'XXL', 2490.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'), 
 ('d32167e2-1f6b-4200-8330-f4d2b92af282', 'af4da6c0-df94-4758-ae66-014ff6b8b3ef', 'ORG-WHI-S', 'White', '#FFFFFF', 'S', 2740.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),    
 ('77a51a51-e5b1-49a7-98bc-63a0adcfa9d1', 'af4da6c0-df94-4758-ae66-014ff6b8b3ef', 'ORG-WHI-M', 'White', '#FFFFFF', 'M', 2740.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),    
 ('4c2d513a-636e-460f-8f04-e4de8717d62e', 'af4da6c0-df94-4758-ae66-014ff6b8b3ef', 'ORG-WHI-L', 'White', '#FFFFFF', 'L', 2740.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),    
 ('be2d11bc-b964-4a00-b8f2-190c8f0faa72', 'af4da6c0-df94-4758-ae66-014ff6b8b3ef', 'ORG-WHI-XL', 'White', '#FFFFFF', 'XL', 2740.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),  
 ('365c1521-bd70-4024-8f75-df22ce9bd804', 'af4da6c0-df94-4758-ae66-014ff6b8b3ef', 'ORG-WHI-XXL', 'White', '#FFFFFF', 'XXL', 2740.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),
 ('e013d933-655f-4a1e-a950-099e6ebd3762', 'af4da6c0-df94-4758-ae66-014ff6b8b3ef', 'ORG-BLA-S', 'Black', '#000000', 'S', 2740.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),    
 ('a42deb88-ed8c-4703-973c-c5cba0ab8e14', 'af4da6c0-df94-4758-ae66-014ff6b8b3ef', 'ORG-BLA-M', 'Black', '#000000', 'M', 2740.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),    
 ('5b55eb9d-cf6e-49a9-a182-0450d3811ed1', 'af4da6c0-df94-4758-ae66-014ff6b8b3ef', 'ORG-BLA-L', 'Black', '#000000', 'L', 2740.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),    
 ('30d22f07-0b74-4aef-98a0-bffdde986d0d', 'af4da6c0-df94-4758-ae66-014ff6b8b3ef', 'ORG-BLA-XL', 'Black', '#000000', 'XL', 2740.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),  
 ('d50c83ce-c1f6-4a1b-9fdb-e57f3ef7b6ee', 'af4da6c0-df94-4758-ae66-014ff6b8b3ef', 'ORG-BLA-XXL', 'Black', '#000000', 'XXL', 2740.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),
 ('60af441e-7b58-442f-b452-460952be02df', 'af4da6c0-df94-4758-ae66-014ff6b8b3ef', 'ORG-GRE-S', 'Grey', '#8A898C', 'S', 2740.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),     
 ('07f255fd-40fc-48df-9d00-468abe690ba1', 'af4da6c0-df94-4758-ae66-014ff6b8b3ef', 'ORG-GRE-M', 'Grey', '#8A898C', 'M', 2740.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),     
 ('b66138cb-67df-4274-87c8-7ec14688a5a2', 'af4da6c0-df94-4758-ae66-014ff6b8b3ef', 'ORG-GRE-L', 'Grey', '#8A898C', 'L', 2740.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),     
 ('80a1b4d6-159a-4f74-8164-70f60d6c1674', 'af4da6c0-df94-4758-ae66-014ff6b8b3ef', 'ORG-GRE-XL', 'Grey', '#8A898C', 'XL', 2740.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),   
 ('73498a90-a29d-4f5b-b11f-fb062c8c5d37', 'af4da6c0-df94-4758-ae66-014ff6b8b3ef', 'ORG-GRE-XXL', 'Grey', '#8A898C', 'XXL', 2740.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'), 
 ('6650c110-3cee-4cad-826b-00fe34062cde', 'af4da6c0-df94-4758-ae66-014ff6b8b3ef', 'ORG-BLU-S', 'Blue', '#1EAEDB', 'S', 2740.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),     
 ('17203820-51b2-44fb-85b2-f79402599f65', 'af4da6c0-df94-4758-ae66-014ff6b8b3ef', 'ORG-BLU-M', 'Blue', '#1EAEDB', 'M', 2740.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),     
 ('13da922c-5ac9-4bf8-9ffc-5f18b1fdff7f', 'af4da6c0-df94-4758-ae66-014ff6b8b3ef', 'ORG-BLU-L', 'Blue', '#1EAEDB', 'L', 2740.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),     
 ('3b916a72-7cae-49f0-ace9-b9edca408a93', 'af4da6c0-df94-4758-ae66-014ff6b8b3ef', 'ORG-BLU-XL', 'Blue', '#1EAEDB', 'XL', 2740.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'),   
 ('67106d05-7ab1-4fd8-a786-f65082d547cd', 'af4da6c0-df94-4758-ae66-014ff6b8b3ef', 'ORG-BLU-XXL', 'Blue', '#1EAEDB', 'XXL', 2740.00, 50, 5, true, '2025-07-15 08:14:07.299647+00'), 
 ('8e6cd6de-22ca-4001-86d1-4c7cdf788fb4', '2a026f73-1c40-4f34-8cab-6f1281fafcab', 'PRE-WHI-XS', 'White', '#FFFFFF', 'XS', 2490.00, 50, 5, true, '2025-07-23 10:57:52.833487+00'),  
 ('8f353672-2995-4c54-a440-78853547a96a', '2a026f73-1c40-4f34-8cab-6f1281fafcab', 'PRE-BLA-XS', 'Black', '#000000', 'XS', 2490.00, 50, 5, true, '2025-07-23 10:57:52.833487+00'),  
 ('831590b9-cca7-4ffd-8f4a-ae9a19646fdc', '2a026f73-1c40-4f34-8cab-6f1281fafcab', 'PRE-GRE-XS', 'Grey', '#8A898C', 'XS', 2490.00, 50, 5, true, '2025-07-23 10:57:52.833487+00'),   
 ('9e29d4f0-9097-4947-bf5a-952b82f13a4f', '2a026f73-1c40-4f34-8cab-6f1281fafcab', 'PRE-BLU-XS', 'Blue', '#1EAEDB', 'XS', 2490.00, 50, 5, true, '2025-07-23 10:57:52.833487+00'),   
 ('9082f691-e286-490b-b597-926b02b59ae5', 'af4da6c0-df94-4758-ae66-014ff6b8b3ef', 'ORG-WHI-XS', 'White', '#FFFFFF', 'XS', 2740.00, 50, 5, true, '2025-07-23 10:57:52.833487+00'),  
 ('fef4bc00-db2b-419d-9443-762395626336', 'af4da6c0-df94-4758-ae66-014ff6b8b3ef', 'ORG-BLA-XS', 'Black', '#000000', 'XS', 2740.00, 50, 5, true, '2025-07-23 10:57:52.833487+00'),  
 ('37bc667f-65e8-41d1-ba9d-cb604061faf5', 'af4da6c0-df94-4758-ae66-014ff6b8b3ef', 'ORG-GRE-XS', 'Grey', '#8A898C', 'XS', 2740.00, 50, 5, true, '2025-07-23 10:57:52.833487+00'),   
 ('aee53f84-1b1c-4db2-b5be-76dfb6d60f8d', 'af4da6c0-df94-4758-ae66-014ff6b8b3ef', 'ORG-BLU-XS', 'Blue', '#1EAEDB', 'XS', 2740.00, 50, 5, true, '2025-07-23 10:57:52.833487+00'),   
 ('6b6baf4f-cf0f-49e6-8920-ef5c273b3581', 'bbf231f6-4f6b-487e-bcc0-5db8d91fc10c', 'CLA-WHI-XS', 'White', '#FFFFFF', 'XS', 2070.00, 50, 5, true, '2025-07-23 10:57:52.833487+00'),  
 ('3ba54187-8458-4586-9b44-405a9600ed18', 'bbf231f6-4f6b-487e-bcc0-5db8d91fc10c', 'CLA-BLA-XS', 'Black', '#000000', 'XS', 2070.00, 50, 5, true, '2025-07-23 10:57:52.833487+00'),  
 ('58d06d67-41c1-4196-be3f-112026517f70', 'bbf231f6-4f6b-487e-bcc0-5db8d91fc10c', 'CLA-GRE-XS', 'Grey', '#8A898C', 'XS', 2070.00, 50, 5, true, '2025-07-23 10:57:52.833487+00'),   
 ('709673c6-1bfc-4ff4-a6e0-8b76cd440859', 'bbf231f6-4f6b-487e-bcc0-5db8d91fc10c', 'CLA-BLU-XS', 'Blue', '#1EAEDB', 'XS', 2070.00, 50, 5, true, '2025-07-23 10:57:52.833487+00');

