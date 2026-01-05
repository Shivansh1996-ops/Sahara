-- Sahara Learning Features Database Schema
-- Add this to your Supabase SQL Editor to enable learning features

-- Learning Groups
CREATE TABLE IF NOT EXISTS learning_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  topic VARCHAR(50) NOT NULL,
  icon VARCHAR(10) NOT NULL,
  level VARCHAR(20) NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  color VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Learning Group Memberships
CREATE TABLE IF NOT EXISTS learning_group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES learning_groups(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, group_id)
);

-- Study Circles
CREATE TABLE IF NOT EXISTS study_circles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES learning_groups(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL CHECK (duration > 0), -- in minutes
  facilitator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  facilitator_name VARCHAR(100) NOT NULL,
  max_participants INTEGER NOT NULL DEFAULT 30 CHECK (max_participants > 0),
  topic VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Circle Participants
CREATE TABLE IF NOT EXISTS study_circle_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID REFERENCES study_circles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  attended BOOLEAN DEFAULT FALSE,
  UNIQUE(circle_id, user_id)
);

-- Study Circle Resources
CREATE TABLE IF NOT EXISTS study_circle_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID REFERENCES study_circles(id) ON DELETE CASCADE NOT NULL,
  resource_id UUID REFERENCES shared_resources(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shared Learning Resources
CREATE TABLE IF NOT EXISTS shared_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES learning_groups(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('article', 'video', 'exercise', 'guide', 'discussion')),
  url TEXT,
  content TEXT,
  shared_by_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  shared_by_name VARCHAR(100) NOT NULL,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resource Tags
CREATE TABLE IF NOT EXISTS resource_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID REFERENCES shared_resources(id) ON DELETE CASCADE NOT NULL,
  tag VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(resource_id, tag)
);

-- Resource Likes
CREATE TABLE IF NOT EXISTS resource_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID REFERENCES shared_resources(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(resource_id, user_id)
);

-- Resource Comments
CREATE TABLE IF NOT EXISTS resource_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID REFERENCES shared_resources(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) <= 500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discussion Threads
CREATE TABLE IF NOT EXISTS discussion_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES learning_groups(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name VARCHAR(100) NOT NULL,
  replies_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discussion Thread Tags
CREATE TABLE IF NOT EXISTS discussion_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES discussion_threads(id) ON DELETE CASCADE NOT NULL,
  tag VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(thread_id, tag)
);

-- Discussion Replies
CREATE TABLE IF NOT EXISTS discussion_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES discussion_threads(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) <= 1000),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning Challenges
CREATE TABLE IF NOT EXISTS learning_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  topic VARCHAR(100) NOT NULL,
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  duration INTEGER NOT NULL CHECK (duration > 0), -- in days
  icon VARCHAR(10) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Challenge Participants
CREATE TABLE IF NOT EXISTS challenge_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES learning_challenges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  UNIQUE(challenge_id, user_id)
);

-- Challenge Rewards
CREATE TABLE IF NOT EXISTS challenge_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES learning_challenges(id) ON DELETE CASCADE NOT NULL,
  reward_text VARCHAR(200) NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning Milestones
CREATE TABLE IF NOT EXISTS learning_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES learning_groups(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  badge VARCHAR(10) NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Learning Progress
CREATE TABLE IF NOT EXISTS user_learning_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_groups_joined INTEGER DEFAULT 0,
  total_circles_attended INTEGER DEFAULT 0,
  total_resources_shared INTEGER DEFAULT 0,
  total_discussions_started INTEGER DEFAULT 0,
  total_challenges_completed INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  total_badges INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_learning_group_members_user ON learning_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_group_members_group ON learning_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_study_circles_group ON study_circles(group_id);
CREATE INDEX IF NOT EXISTS idx_study_circles_status ON study_circles(status);
CREATE INDEX IF NOT EXISTS idx_study_circles_scheduled ON study_circles(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_study_circle_participants_circle ON study_circle_participants(circle_id);
CREATE INDEX IF NOT EXISTS idx_study_circle_participants_user ON study_circle_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_resources_group ON shared_resources(group_id);
CREATE INDEX IF NOT EXISTS idx_shared_resources_type ON shared_resources(type);
CREATE INDEX IF NOT EXISTS idx_shared_resources_created ON shared_resources(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_resource_likes_resource ON resource_likes(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_likes_user ON resource_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_comments_resource ON resource_comments(resource_id);
CREATE INDEX IF NOT EXISTS idx_discussion_threads_group ON discussion_threads(group_id);
CREATE INDEX IF NOT EXISTS idx_discussion_threads_pinned ON discussion_threads(is_pinned DESC);
CREATE INDEX IF NOT EXISTS idx_discussion_threads_created ON discussion_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_thread ON discussion_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_user ON discussion_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user ON challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_milestones_user ON learning_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_milestones_group ON learning_milestones(group_id);

-- Row Level Security Policies
ALTER TABLE learning_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_circle_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_circle_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_progress ENABLE ROW LEVEL SECURITY;

-- Learning Groups: everyone can read
CREATE POLICY "Anyone can view learning groups" ON learning_groups FOR SELECT TO authenticated USING (true);

-- Learning Group Members: users can manage their own
CREATE POLICY "Users can view group members" ON learning_group_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can join groups" ON learning_group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave groups" ON learning_group_members FOR DELETE USING (auth.uid() = user_id);

-- Study Circles: everyone can read
CREATE POLICY "Anyone can view study circles" ON study_circles FOR SELECT TO authenticated USING (true);

-- Study Circle Participants: users can manage their own
CREATE POLICY "Users can view circle participants" ON study_circle_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can join circles" ON study_circle_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave circles" ON study_circle_participants FOR DELETE USING (auth.uid() = user_id);

-- Study Circle Resources: everyone can read
CREATE POLICY "Anyone can view circle resources" ON study_circle_resources FOR SELECT TO authenticated USING (true);

-- Shared Resources: everyone can read
CREATE POLICY "Anyone can view shared resources" ON shared_resources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can share resources" ON shared_resources FOR INSERT WITH CHECK (auth.uid() = shared_by_id);
CREATE POLICY "Users can update own resources" ON shared_resources FOR UPDATE USING (auth.uid() = shared_by_id);
CREATE POLICY "Users can delete own resources" ON shared_resources FOR DELETE USING (auth.uid() = shared_by_id);

-- Resource Tags: everyone can read
CREATE POLICY "Anyone can view resource tags" ON resource_tags FOR SELECT TO authenticated USING (true);

-- Resource Likes: users can manage their own
CREATE POLICY "Anyone can view resource likes" ON resource_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can like resources" ON resource_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike resources" ON resource_likes FOR DELETE USING (auth.uid() = user_id);

-- Resource Comments: everyone can read
CREATE POLICY "Anyone can view resource comments" ON resource_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can comment on resources" ON resource_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON resource_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON resource_comments FOR DELETE USING (auth.uid() = user_id);

-- Discussion Threads: everyone can read
CREATE POLICY "Anyone can view discussion threads" ON discussion_threads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can start discussions" ON discussion_threads FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own discussions" ON discussion_threads FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own discussions" ON discussion_threads FOR DELETE USING (auth.uid() = author_id);

-- Discussion Tags: everyone can read
CREATE POLICY "Anyone can view discussion tags" ON discussion_tags FOR SELECT TO authenticated USING (true);

-- Discussion Replies: everyone can read
CREATE POLICY "Anyone can view discussion replies" ON discussion_replies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can reply to discussions" ON discussion_replies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own replies" ON discussion_replies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own replies" ON discussion_replies FOR DELETE USING (auth.uid() = user_id);

-- Learning Challenges: everyone can read
CREATE POLICY "Anyone can view learning challenges" ON learning_challenges FOR SELECT TO authenticated USING (true);

-- Challenge Participants: users can manage their own
CREATE POLICY "Users can view challenge participants" ON challenge_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can join challenges" ON challenge_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON challenge_participants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can leave challenges" ON challenge_participants FOR DELETE USING (auth.uid() = user_id);

-- Challenge Rewards: everyone can read
CREATE POLICY "Anyone can view challenge rewards" ON challenge_rewards FOR SELECT TO authenticated USING (true);

-- Learning Milestones: users can view their own
CREATE POLICY "Users can view own milestones" ON learning_milestones FOR SELECT USING (auth.uid() = user_id);

-- User Learning Progress: users can view and update their own
CREATE POLICY "Users can view own progress" ON user_learning_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON user_learning_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_learning_progress FOR UPDATE USING (auth.uid() = user_id);

-- Functions to update timestamps
CREATE OR REPLACE FUNCTION update_learning_groups_updated_at()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_shared_resources_updated_at()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_discussion_threads_updated_at()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  NEW.last_activity_at = NOW();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_learning_challenges_updated_at()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_user_learning_progress_updated_at()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
CREATE TRIGGER update_learning_groups_updated_at_trigger
  BEFORE UPDATE ON learning_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_learning_groups_updated_at();

CREATE TRIGGER update_shared_resources_updated_at_trigger
  BEFORE UPDATE ON shared_resources
  FOR EACH ROW
  EXECUTE FUNCTION update_shared_resources_updated_at();

CREATE TRIGGER update_discussion_threads_updated_at_trigger
  BEFORE UPDATE ON discussion_threads
  FOR EACH ROW
  EXECUTE FUNCTION update_discussion_threads_updated_at();

CREATE TRIGGER update_learning_challenges_updated_at_trigger
  BEFORE UPDATE ON learning_challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_learning_challenges_updated_at();

CREATE TRIGGER update_user_learning_progress_updated_at_trigger
  BEFORE UPDATE ON user_learning_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_user_learning_progress_updated_at();

-- Function to increment resource likes count
CREATE OR REPLACE FUNCTION increment_resource_likes(p_resource_id UUID)
RETURNS void AS $
BEGIN
  UPDATE shared_resources
  SET likes_count = likes_count + 1
  WHERE id = p_resource_id;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement resource likes count
CREATE OR REPLACE FUNCTION decrement_resource_likes(p_resource_id UUID)
RETURNS void AS $
BEGIN
  UPDATE shared_resources
  SET likes_count = GREATEST(0, likes_count - 1)
  WHERE id = p_resource_id;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment resource comments count
CREATE OR REPLACE FUNCTION increment_resource_comments(p_resource_id UUID)
RETURNS void AS $
BEGIN
  UPDATE shared_resources
  SET comments_count = comments_count + 1
  WHERE id = p_resource_id;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement resource comments count
CREATE OR REPLACE FUNCTION decrement_resource_comments(p_resource_id UUID)
RETURNS void AS $
BEGIN
  UPDATE shared_resources
  SET comments_count = GREATEST(0, comments_count - 1)
  WHERE id = p_resource_id;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment discussion replies count
CREATE OR REPLACE FUNCTION increment_discussion_replies(p_thread_id UUID)
RETURNS void AS $
BEGIN
  UPDATE discussion_threads
  SET replies_count = replies_count + 1,
      last_activity_at = NOW()
  WHERE id = p_thread_id;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement discussion replies count
CREATE OR REPLACE FUNCTION decrement_discussion_replies(p_thread_id UUID)
RETURNS void AS $
BEGIN
  UPDATE discussion_threads
  SET replies_count = GREATEST(0, replies_count - 1),
      last_activity_at = NOW()
  WHERE id = p_thread_id;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;
