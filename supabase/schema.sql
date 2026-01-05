-- Sahara Mental Wellness App Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (managed by Supabase Auth, but we reference it)
-- Note: auth.users is created automatically by Supabase

-- User profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name VARCHAR(100),
  sex VARCHAR(20),
  age INTEGER CHECK (age >= 13 AND age <= 120),
  medical_history_encrypted TEXT,
  anonymous_name VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature gates
CREATE TABLE IF NOT EXISTS feature_gates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  completed_chats INTEGER DEFAULT 0,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unlocked features
CREATE TABLE IF NOT EXISTS unlocked_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feature VARCHAR(50) NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, feature)
);

-- Pets
CREATE TABLE IF NOT EXISTS pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  personality VARCHAR(20) NOT NULL CHECK (personality IN ('calm', 'playful', 'grounding', 'motivating')),
  image_url TEXT NOT NULL,
  animation_config JSONB NOT NULL DEFAULT '{}',
  ai_tone_modifier TEXT NOT NULL DEFAULT '',
  is_default BOOLEAN DEFAULT FALSE
);

-- User pets (selected pet)
CREATE TABLE IF NOT EXISTS user_pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pet_id UUID REFERENCES pets(id) NOT NULL,
  bond_level INTEGER DEFAULT 0 CHECK (bond_level >= 0 AND bond_level <= 100),
  selected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Chat sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  message_count INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  emotional_keywords TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mood tracking
CREATE TABLE IF NOT EXISTS mood_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES chat_sessions(id),
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
  dominant_emotion VARCHAR(50),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community posts
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) <= 500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post reactions
CREATE TABLE IF NOT EXISTS post_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  emoji VARCHAR(10) NOT NULL CHECK (emoji IN ('💚', '🌱', '✨', '🤗', '💪')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Peer connections
CREATE TABLE IF NOT EXISTS peer_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  to_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(from_user_id, to_user_id),
  CHECK (from_user_id != to_user_id)
);

-- Affirmations
CREATE TABLE IF NOT EXISTS affirmations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  category VARCHAR(50)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_completed ON chat_sessions(user_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_mood_entries_user ON mood_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_author ON community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_peer_connections_from ON peer_connections(from_user_id);
CREATE INDEX IF NOT EXISTS idx_peer_connections_to ON peer_connections(to_user_id);
CREATE INDEX IF NOT EXISTS idx_user_pets_active ON user_pets(user_id, is_active);

-- Row Level Security Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_gates ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlocked_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_connections ENABLE ROW LEVEL SECURITY;

-- Pets and affirmations are public read
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE affirmations ENABLE ROW LEVEL SECURITY;

-- User profiles: users can read/update their own
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Feature gates: users can read their own
CREATE POLICY "Users can view own feature gate" ON feature_gates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own feature gate" ON feature_gates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own feature gate" ON feature_gates FOR UPDATE USING (auth.uid() = user_id);

-- Unlocked features: users can read their own
CREATE POLICY "Users can view own unlocked features" ON unlocked_features FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own unlocked features" ON unlocked_features FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Pets: everyone can read
CREATE POLICY "Anyone can view pets" ON pets FOR SELECT TO authenticated USING (true);

-- User pets: users can manage their own
CREATE POLICY "Users can view own pets" ON user_pets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pets" ON user_pets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pets" ON user_pets FOR UPDATE USING (auth.uid() = user_id);

-- Chat sessions: users can manage their own
CREATE POLICY "Users can view own sessions" ON chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON chat_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Chat messages: users can manage their own
CREATE POLICY "Users can view own messages" ON chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messages" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Mood entries: users can manage their own
CREATE POLICY "Users can view own mood entries" ON mood_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mood entries" ON mood_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Community posts: authenticated users can read all, manage their own
CREATE POLICY "Authenticated users can view posts" ON community_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own posts" ON community_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can delete own posts" ON community_posts FOR DELETE USING (auth.uid() = author_id);

-- Post reactions: authenticated users can read all, manage their own
CREATE POLICY "Authenticated users can view reactions" ON post_reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own reactions" ON post_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own reactions" ON post_reactions FOR DELETE USING (auth.uid() = user_id);

-- Peer connections: users can manage their own
CREATE POLICY "Users can view own connections" ON peer_connections FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "Users can insert own connections" ON peer_connections FOR INSERT WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "Users can delete own connections" ON peer_connections FOR DELETE USING (auth.uid() = from_user_id);

-- Affirmations: everyone can read
CREATE POLICY "Anyone can view affirmations" ON affirmations FOR SELECT TO authenticated USING (true);

-- Function to increment completed chats
CREATE OR REPLACE FUNCTION increment_completed_chats(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE feature_gates
  SET completed_chats = completed_chats + 1
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_profiles updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
