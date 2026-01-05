-- Seed data for Sahara Mental Wellness App

-- Insert default pets (real animals)
INSERT INTO pets (name, personality, image_url, animation_config, ai_tone_modifier, is_default) VALUES
(
  'Buddy',
  'calm',
  '/pets/dog.svg',
  '{"idle": "breathe", "happy": "bounce", "thinking": "sway", "glow": "pulse"}',
  'Respond with extra gentleness and calm, like a loyal dog companion. Use soothing language and encourage peaceful reflection. Be warm, supportive, and always there for them.',
  true
),
(
  'Whiskers',
  'playful',
  '/pets/cat.svg',
  '{"idle": "bounce", "happy": "spin", "thinking": "tilt", "glow": "sparkle"}',
  'Be curious and playful like a cat! Use gentle humor when appropriate, and help find moments of joy. Keep energy positive but respect their space and pace.',
  false
),
(
  'Cotton',
  'grounding',
  '/pets/bunny.svg',
  '{"idle": "steady", "happy": "nod", "thinking": "deep", "glow": "earth"}',
  'Focus on grounding and presence like a calm bunny. Encourage mindfulness, gentle awareness, and connection to the present moment. Use soft, comforting language.',
  false
),
(
  'Sunny',
  'motivating',
  '/pets/bird.svg',
  '{"idle": "grow", "happy": "flourish", "thinking": "reach", "glow": "radiate"}',
  'Be encouraging and uplifting like a cheerful bird! Celebrate small wins, encourage growth, and help users see their potential. Bring lightness and hope to conversations.',
  false
);

-- Insert affirmations
INSERT INTO affirmations (content, category) VALUES
-- Self-compassion
('You are doing the best you can, and that is enough.', 'self-compassion'),
('It''s okay to take things one moment at a time.', 'self-compassion'),
('You deserve kindness, especially from yourself.', 'self-compassion'),
('Your feelings are valid, whatever they may be.', 'self-compassion'),
('Progress, not perfection, is what matters.', 'self-compassion'),

-- Growth
('Every small step forward is still a step forward.', 'growth'),
('You are growing, even when you can''t see it.', 'growth'),
('Challenges help you discover your strength.', 'growth'),
('Today is a new opportunity to begin again.', 'growth'),
('You have overcome difficult times before.', 'growth'),

-- Peace
('This moment is enough. You are enough.', 'peace'),
('Breathe in calm, breathe out tension.', 'peace'),
('Peace begins with a single breath.', 'peace'),
('You can find stillness within the storm.', 'peace'),
('Let go of what you cannot control.', 'peace'),

-- Strength
('You are stronger than you know.', 'strength'),
('Your resilience is remarkable.', 'strength'),
('You have the power to shape your day.', 'strength'),
('Courage doesn''t mean you''re not afraid.', 'strength'),
('You are capable of handling whatever comes.', 'strength'),

-- Connection
('You are not alone in this journey.', 'connection'),
('Reaching out is a sign of strength.', 'connection'),
('Your presence matters to others.', 'connection'),
('Connection starts with being present.', 'connection'),
('You belong here, just as you are.', 'connection'),

-- Gratitude
('There is always something to be grateful for.', 'gratitude'),
('Small joys add up to a meaningful life.', 'gratitude'),
('Gratitude opens the door to peace.', 'gratitude'),
('Notice the good, however small.', 'gratitude'),
('Your life has moments worth celebrating.', 'gratitude'),

-- Mindfulness
('This moment is all that exists right now.', 'mindfulness'),
('Be gentle with your wandering mind.', 'mindfulness'),
('Awareness is the first step to change.', 'mindfulness'),
('You can observe your thoughts without judgment.', 'mindfulness'),
('Return to your breath whenever you need.', 'mindfulness'),

-- Hope
('Tomorrow holds new possibilities.', 'hope'),
('Difficult times are temporary.', 'hope'),
('Hope is a choice you can make each day.', 'hope'),
('Better days are ahead.', 'hope'),
('You have the power to create change.', 'hope');
