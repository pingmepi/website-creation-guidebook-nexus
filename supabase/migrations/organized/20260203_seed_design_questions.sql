-- Migration: Seed theme-specific design questions (5 per theme)
-- Date: 2026-02-03
-- This adds dynamic questions per theme with 5 questions each

-- Get existing theme UUIDs and insert questions
-- Note: This script uses hardcoded theme names to match database

DO $$
DECLARE
  theme_rec RECORD;
BEGIN
  -- Default/common questions for all themes (when theme_id is NULL they apply to all)
  INSERT INTO design_questions (id, question_text, type, options, theme_id, is_active, sort_order, created_at) VALUES
    (gen_random_uuid(), 'What''s the main message you want on your t-shirt?', 'text', NULL, NULL, true, 1, NOW()),
    (gen_random_uuid(), 'What style are you looking for?', 'choice', '["Casual", "Formal", "Sporty", "Vintage", "Minimal"]', NULL, true, 2, NOW()),
    (gen_random_uuid(), 'What''s the occasion for this t-shirt?', 'choice', '["Everyday wear", "Special event", "Gift", "Team/Group", "Casual wear"]', NULL, true, 3, NOW()),
    (gen_random_uuid(), 'What colors do you prefer?', 'color', '["Dark", "Light", "Vibrant", "Pastel", "Monochrome"]', NULL, true, 4, NOW()),
    (gen_random_uuid(), 'Any additional details you''d like to include in your design?', 'text', NULL, NULL, true, 5, NOW())
  ON CONFLICT DO NOTHING;

  -- Theme-specific questions for Sports
  FOR theme_rec IN SELECT id FROM themes WHERE name = 'Sports' LOOP
    INSERT INTO design_questions (id, question_text, type, options, theme_id, is_active, sort_order) VALUES
      (gen_random_uuid(), 'What sport are you celebrating?', 'choice', '["Football", "Basketball", "Cricket", "Running", "Mixed/General"]', theme_rec.id, true, 1),
      (gen_random_uuid(), 'Is this for a team or individual?', 'choice', '["Team spirit", "Personal achievement", "Fan gear", "Coaching", "General fitness"]', theme_rec.id, true, 2),
      (gen_random_uuid(), 'What energy level should the design convey?', 'choice', '["High intensity", "Competitive", "Relaxed fun", "Motivational", "Classic/Retro"]', theme_rec.id, true, 3),
      (gen_random_uuid(), 'What colors match your sport/team?', 'color', '["Team colors", "Bold primary", "Black/White", "Neon accents", "Earth tones"]', theme_rec.id, true, 4),
      (gen_random_uuid(), 'Any specific text, numbers, or symbols?', 'text', NULL, theme_rec.id, true, 5);
  END LOOP;

  -- Theme-specific questions for Motivational
  FOR theme_rec IN SELECT id FROM themes WHERE name = 'Motivational' LOOP
    INSERT INTO design_questions (id, question_text, type, options, theme_id, is_active, sort_order) VALUES
      (gen_random_uuid(), 'What type of motivation resonates with you?', 'choice', '["Success/Hustle", "Mindfulness/Peace", "Fitness/Health", "Creativity", "Overcoming challenges"]', theme_rec.id, true, 1),
      (gen_random_uuid(), 'Do you have a specific quote or message in mind?', 'text', NULL, theme_rec.id, true, 2),
      (gen_random_uuid(), 'What visual style speaks to you?', 'choice', '["Bold typography", "Minimalist", "With illustrations", "Abstract shapes", "Nature-inspired"]', theme_rec.id, true, 3),
      (gen_random_uuid(), 'What mood should the design evoke?', 'choice', '["Energizing", "Calming", "Inspiring", "Powerful", "Uplifting"]', theme_rec.id, true, 4),
      (gen_random_uuid(), 'Any personal touches or symbols to include?', 'text', NULL, theme_rec.id, true, 5);
  END LOOP;

  -- Theme-specific questions for Tech
  FOR theme_rec IN SELECT id FROM themes WHERE name = 'Tech' LOOP
    INSERT INTO design_questions (id, question_text, type, options, theme_id, is_active, sort_order) VALUES
      (gen_random_uuid(), 'What tech area excites you most?', 'choice', '["Programming/Code", "Gaming", "AI/ML", "Hardware/Gadgets", "Cybersecurity"]', theme_rec.id, true, 1),
      (gen_random_uuid(), 'What coding style or language to feature?', 'choice', '["Any code aesthetic", "Python", "JavaScript", "Binary/Matrix", "No specific code"]', theme_rec.id, true, 2),
      (gen_random_uuid(), 'What visual theme?', 'choice', '["Neon/Cyberpunk", "Minimalist circuit", "Retro computing", "Futuristic", "Developer humor"]', theme_rec.id, true, 3),
      (gen_random_uuid(), 'Color preferences?', 'color', '["Matrix green", "Dark mode", "Neon accents", "Monochrome", "Retro colors"]', theme_rec.id, true, 4),
      (gen_random_uuid(), 'Any specific tech references or jokes?', 'text', NULL, theme_rec.id, true, 5);
  END LOOP;

  -- Theme-specific questions for Nature
  FOR theme_rec IN SELECT id FROM themes WHERE name = 'Nature' LOOP
    INSERT INTO design_questions (id, question_text, type, options, theme_id, is_active, sort_order) VALUES
      (gen_random_uuid(), 'What aspect of nature inspires you?', 'choice', '["Mountains/Adventure", "Ocean/Beach", "Forest/Trees", "Wildlife", "Flowers/Gardens"]', theme_rec.id, true, 1),
      (gen_random_uuid(), 'What season or time of day?', 'choice', '["Spring", "Summer", "Autumn", "Winter", "Sunset/Sunrise"]', theme_rec.id, true, 2),
      (gen_random_uuid(), 'Art style preference?', 'choice', '["Realistic", "Illustrated", "Minimalist line art", "Watercolor", "Bold graphic"]', theme_rec.id, true, 3),
      (gen_random_uuid(), 'Natural color palette?', 'color', '["Earth tones", "Fresh greens", "Ocean blues", "Sunset colors", "Monochrome"]', theme_rec.id, true, 4),
      (gen_random_uuid(), 'Any specific location or element?', 'text', NULL, theme_rec.id, true, 5);
  END LOOP;

  -- Theme-specific questions for Animals
  FOR theme_rec IN SELECT id FROM themes WHERE name = 'Animals' LOOP
    INSERT INTO design_questions (id, question_text, type, options, theme_id, is_active, sort_order) VALUES
      (gen_random_uuid(), 'What type of animal?', 'choice', '["Wild/Safari", "Pets/Cute", "Birds", "Marine life", "Mythical creatures"]', theme_rec.id, true, 1),
      (gen_random_uuid(), 'What mood or personality?', 'choice', '["Majestic/Powerful", "Cute/Playful", "Fierce/Protective", "Serene/Peaceful", "Funny/Humorous"]', theme_rec.id, true, 2),
      (gen_random_uuid(), 'Art style?', 'choice', '["Realistic portrait", "Geometric/Low poly", "Cartoon/Illustrated", "Tribal/Artistic", "Minimalist"]', theme_rec.id, true, 3),
      (gen_random_uuid(), 'Color treatment?', 'color', '["Natural colors", "Bold artistic", "Black & White", "Neon/Vibrant", "Earthy tones"]', theme_rec.id, true, 4),
      (gen_random_uuid(), 'Specific animal or message?', 'text', NULL, theme_rec.id, true, 5);
  END LOOP;

  -- Theme-specific questions for Fitness
  FOR theme_rec IN SELECT id FROM themes WHERE name = 'Fitness' LOOP
    INSERT INTO design_questions (id, question_text, type, options, theme_id, is_active, sort_order) VALUES
      (gen_random_uuid(), 'What fitness activity?', 'choice', '["Weight training", "Running/Cardio", "Yoga/Mindfulness", "CrossFit/HIIT", "General motivation"]', theme_rec.id, true, 1),
      (gen_random_uuid(), 'What message style?', 'choice', '["Motivational quote", "Gym humor", "No pain no gain", "Beast mode", "Zen/Balance"]', theme_rec.id, true, 2),
      (gen_random_uuid(), 'Visual elements?', 'choice', '["Muscular silhouette", "Equipment icons", "Typography focus", "Abstract energy", "Anatomical"]', theme_rec.id, true, 3),
      (gen_random_uuid(), 'Color mood?', 'color', '["Bold red/black", "Electric blue", "Military/Army", "Neon accents", "Clean white"]', theme_rec.id, true, 4),
      (gen_random_uuid(), 'Personal message or goal?', 'text', NULL, theme_rec.id, true, 5);
  END LOOP;

END $$;
