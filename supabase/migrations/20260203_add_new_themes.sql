-- Migration: Add 10 new themes for PRD compliance
-- Date: 2026-02-03
-- This brings total themes to 18 (8 existing + 10 new)

INSERT INTO themes (id, name, description, thumbnail_url, is_active, category, created_at) VALUES
  (gen_random_uuid(), 'Sports', 'Athletic and sports-themed designs', '/uploads/theme_sports.png', true, 'Lifestyle', NOW()),
  (gen_random_uuid(), 'Motivational', 'Inspiring quotes and positive vibes', '/uploads/theme_motivational.png', true, 'Typography', NOW()),
  (gen_random_uuid(), 'Pop Culture', 'Trending memes and cultural references', '/uploads/theme_popculture.png', true, 'Abstract', NOW()),
  (gen_random_uuid(), 'Food & Drink', 'Culinary and beverage inspired art', '/uploads/theme_food.png', true, 'Artistic', NOW()),
  (gen_random_uuid(), 'Animals', 'Wildlife and pet-themed designs', '/uploads/theme_animals.png', true, 'Nature', NOW()),
  (gen_random_uuid(), 'Tech', 'Developer and technology aesthetics', '/uploads/theme_tech.png', true, 'Abstract', NOW()),
  (gen_random_uuid(), 'Fashion', 'High-fashion and streetwear style', '/uploads/theme_fashion.png', true, 'Style', NOW()),
  (gen_random_uuid(), 'Humor', 'Witty and comedic designs', '/uploads/theme_humor.png', true, 'Typography', NOW()),
  (gen_random_uuid(), 'Spiritual', 'Zen, meditation, and mindfulness', '/uploads/theme_spiritual.png', true, 'Minimal', NOW()),
  (gen_random_uuid(), 'Fitness', 'Gym and workout motivation', '/uploads/theme_fitness.png', true, 'Lifestyle', NOW());
