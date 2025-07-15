-- Update existing product prices from USD to INR (approximate conversion rate 1 USD = 83 INR)
-- Note: Updating the shop page will also need to reflect these changes

-- Update base prices in products table to INR
UPDATE products 
SET base_price = CASE 
  WHEN base_price = 24.99 THEN 2070  -- $24.99 -> ₹2070
  WHEN base_price = 29.99 THEN 2490  -- $29.99 -> ₹2490  
  WHEN base_price = 26.99 THEN 2240  -- $26.99 -> ₹2240
  WHEN base_price = 32.99 THEN 2740  -- $32.99 -> ₹2740
  WHEN base_price = 27.99 THEN 2320  -- $27.99 -> ₹2320
  WHEN base_price = 34.99 THEN 2900  -- $34.99 -> ₹2900
  ELSE base_price * 83  -- Fallback for any other prices
END
WHERE base_price > 0;