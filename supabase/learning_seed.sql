-- Sahara Learning Features Seed Data
-- Run this after learning_schema.sql to populate demo data

-- Insert Learning Groups
INSERT INTO learning_groups (name, description, topic, icon, level, color) VALUES
('CBT Fundamentals', 'Learn the basics of Cognitive Behavioral Therapy together', 'Mental Health', '🧠', 'beginner', 'bg-blue-100 text-blue-600'),
('Mindfulness Journey', 'Explore mindfulness practices and meditation techniques', 'Wellness', '🧘', 'beginner', 'bg-purple-100 text-purple-600'),
('Stress Management Mastery', 'Advanced techniques for managing stress and building resilience', 'Wellness', '🌊', 'intermediate', 'bg-teal-100 text-teal-600'),
('Sleep Science & Better Rest', 'Understand sleep cycles and improve your sleep quality', 'Health', '🌙', 'beginner', 'bg-indigo-100 text-indigo-600'),
('Emotional Intelligence', 'Develop emotional awareness and interpersonal skills', 'Personal Growth', '💚', 'intermediate', 'bg-pink-100 text-pink-600'),
('Building Resilience', 'Learn strategies to bounce back from challenges', 'Mental Health', '💪', 'advanced', 'bg-amber-100 text-amber-600')
ON CONFLICT DO NOTHING;

-- Insert Study Circles
INSERT INTO study_circles (group_id, title, description, scheduled_at, duration, facilitator_name, max_participants, topic, status) 
SELECT id, 'Introduction to Cognitive Distortions', 'Learn to identify and challenge negative thought patterns', NOW() + INTERVAL '2 days', 60, 'Dr. Sarah', 30, 'Cognitive Distortions', 'upcoming'
FROM learning_groups WHERE name = 'CBT Fundamentals'
ON CONFLICT DO NOTHING;

INSERT INTO study_circles (group_id, title, description, scheduled_at, duration, facilitator_name, max_participants, topic, status) 
SELECT id, 'Guided Meditation Practice', 'Join us for a 30-minute guided meditation session', NOW() + INTERVAL '1 day', 30, 'Alex', 50, 'Meditation', 'upcoming'
FROM learning_groups WHERE name = 'Mindfulness Journey'
ON CONFLICT DO NOTHING;

INSERT INTO study_circles (group_id, title, description, scheduled_at, duration, facilitator_name, max_participants, topic, status) 
SELECT id, 'Progressive Muscle Relaxation Workshop', 'Learn and practice PMR techniques for stress relief', NOW() - INTERVAL '1 day', 45, 'Jordan', 25, 'Relaxation Techniques', 'completed'
FROM learning_groups WHERE name = 'Stress Management Mastery'
ON CONFLICT DO NOTHING;

-- Insert Shared Resources
INSERT INTO shared_resources (group_id, title, description, type, shared_by_name, likes_count, comments_count) 
SELECT id, 'Understanding Automatic Thoughts', 'A comprehensive guide to identifying your automatic negative thoughts', 'article', 'Emma', 45, 12
FROM learning_groups WHERE name = 'CBT Fundamentals'
ON CONFLICT DO NOTHING;

INSERT INTO shared_resources (group_id, title, description, type, shared_by_name, likes_count, comments_count) 
SELECT id, '5-Minute Breathing Exercise', 'Quick breathing technique for instant calm', 'exercise', 'Marcus', 78, 23
FROM learning_groups WHERE name = 'Mindfulness Journey'
ON CONFLICT DO NOTHING;

INSERT INTO shared_resources (group_id, title, description, type, shared_by_name, likes_count, comments_count) 
SELECT id, 'Stress Management Toolkit', 'Collection of practical tools and techniques', 'guide', 'Dr. Lisa', 92, 34
FROM learning_groups WHERE name = 'Stress Management Mastery'
ON CONFLICT DO NOTHING;

-- Insert Resource Tags
INSERT INTO resource_tags (resource_id, tag)
SELECT id, 'cbt' FROM shared_resources WHERE title = 'Understanding Automatic Thoughts'
UNION ALL
SELECT id, 'thoughts' FROM shared_resources WHERE title = 'Understanding Automatic Thoughts'
UNION ALL
SELECT id, 'beginner' FROM shared_resources WHERE title = 'Understanding Automatic Thoughts'
UNION ALL
SELECT id, 'breathing' FROM shared_resources WHERE title = '5-Minute Breathing Exercise'
UNION ALL
SELECT id, 'quick' FROM shared_resources WHERE title = '5-Minute Breathing Exercise'
UNION ALL
SELECT id, 'beginner' FROM shared_resources WHERE title = '5-Minute Breathing Exercise'
UNION ALL
SELECT id, 'stress' FROM shared_resources WHERE title = 'Stress Management Toolkit'
UNION ALL
SELECT id, 'toolkit' FROM shared_resources WHERE title = 'Stress Management Toolkit'
UNION ALL
SELECT id, 'comprehensive' FROM shared_resources WHERE title = 'Stress Management Toolkit'
ON CONFLICT DO NOTHING;

-- Insert Discussion Threads
INSERT INTO discussion_threads (group_id, title, description, author_name, replies_count, views_count, is_pinned, last_activity_at) 
SELECT id, 'How do you identify your cognitive distortions?', 'Share your experience with recognizing negative thought patterns', 'Sarah', 18, 156, true, NOW() - INTERVAL '2 hours'
FROM learning_groups WHERE name = 'CBT Fundamentals'
ON CONFLICT DO NOTHING;

INSERT INTO discussion_threads (group_id, title, description, author_name, replies_count, views_count, is_pinned, last_activity_at) 
SELECT id, 'Best time of day for meditation?', 'When do you find meditation most effective?', 'James', 34, 289, false, NOW() - INTERVAL '1 hour'
FROM learning_groups WHERE name = 'Mindfulness Journey'
ON CONFLICT DO NOTHING;

INSERT INTO discussion_threads (group_id, title, description, author_name, replies_count, views_count, is_pinned, last_activity_at) 
SELECT id, 'Combining multiple stress management techniques', 'What''s your favorite combination of techniques?', 'Dr. Lisa', 42, 412, true, NOW() - INTERVAL '30 minutes'
FROM learning_groups WHERE name = 'Stress Management Mastery'
ON CONFLICT DO NOTHING;

-- Insert Discussion Tags
INSERT INTO discussion_tags (thread_id, tag)
SELECT id, 'distortions' FROM discussion_threads WHERE title = 'How do you identify your cognitive distortions?'
UNION ALL
SELECT id, 'techniques' FROM discussion_threads WHERE title = 'How do you identify your cognitive distortions?'
UNION ALL
SELECT id, 'discussion' FROM discussion_threads WHERE title = 'How do you identify your cognitive distortions?'
UNION ALL
SELECT id, 'meditation' FROM discussion_threads WHERE title = 'Best time of day for meditation?'
UNION ALL
SELECT id, 'timing' FROM discussion_threads WHERE title = 'Best time of day for meditation?'
UNION ALL
SELECT id, 'tips' FROM discussion_threads WHERE title = 'Best time of day for meditation?'
UNION ALL
SELECT id, 'techniques' FROM discussion_threads WHERE title = 'Combining multiple stress management techniques'
UNION ALL
SELECT id, 'combination' FROM discussion_threads WHERE title = 'Combining multiple stress management techniques'
UNION ALL
SELECT id, 'advanced' FROM discussion_threads WHERE title = 'Combining multiple stress management techniques'
ON CONFLICT DO NOTHING;

-- Insert Learning Challenges
INSERT INTO learning_challenges (title, description, topic, difficulty, duration, icon, start_date, end_date) VALUES
('7-Day Mindfulness Challenge', 'Practice mindfulness for 7 consecutive days', 'Mindfulness', 'easy', 7, '🧘', NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days'),
('CBT Thought Record Challenge', 'Complete 10 thought records using CBT techniques', 'CBT', 'medium', 14, '🧠', NOW() - INTERVAL '5 days', NOW() + INTERVAL '9 days'),
('Stress Resilience Sprint', 'Build resilience through daily stress management practices', 'Stress Management', 'hard', 21, '💪', NOW() - INTERVAL '8 days', NOW() + INTERVAL '13 days')
ON CONFLICT DO NOTHING;

-- Insert Challenge Rewards
INSERT INTO challenge_rewards (challenge_id, reward_text, points)
SELECT id, '🏅 Mindfulness Badge', 50 FROM learning_challenges WHERE title = '7-Day Mindfulness Challenge'
UNION ALL
SELECT id, '🎯 CBT Master Badge', 75 FROM learning_challenges WHERE title = 'CBT Thought Record Challenge'
UNION ALL
SELECT id, '🏆 Resilience Champion Badge', 100 FROM learning_challenges WHERE title = 'Stress Resilience Sprint'
ON CONFLICT DO NOTHING;
