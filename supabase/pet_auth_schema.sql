-- Pet Interactions and Authentication Schema
-- Add this to your Supabase SQL Editor

-- Pet Interactions Table
CREATE TABLE IF NOT EXISTS pet_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pet_id UUID REFERENCES user_pets(id) ON DELETE CASCADE NOT NULL,
  interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('pet', 'play', 'feed', 'talk', 'cuddle', 'exercise', 'train', 'celebrate', 'comfort', 'sleep')),
  bond_gain INTEGER NOT NULL DEFAULT 0,
  happiness_gain INTEGER NOT NULL DEFAULT 0,
  energy_change INTEGER NOT NULL DEFAULT 0,
  affection_gain INTEGER NOT NULL DEFAULT 0,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pet Bond Stats Table
CREATE TABLE IF NOT EXISTS pet_bond_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pet_id UUID REFERENCES user_pets(id) ON DELETE CASCADE NOT NULL,
  total_interactions INTEGER DEFAULT 0,
  total_bond_gained INTEGER DEFAULT 0,
  current_bond INTEGER DEFAULT 0 CHECK (current_bond >= 0 AND current_bond <= 100),
  last_interaction_time TIMESTAMP WITH TIME ZONE,
  favorite_interaction VARCHAR(50),
  streak_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, pet_id)
);

-- Pet Milestones Achieved Table
CREATE TABLE IF NOT EXISTS pet_milestones_achieved (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pet_id UUID REFERENCES user_pets(id) ON DELETE CASCADE NOT NULL,
  milestone_level INTEGER NOT NULL,
  milestone_name VARCHAR(100) NOT NULL,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, pet_id, milestone_level)
);

-- Email Verification Tokens (for enhanced auth)
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Sessions (for tracking login activity)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pet_interactions_user ON pet_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_pet_interactions_pet ON pet_interactions(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_interactions_created ON pet_interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pet_interactions_type ON pet_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_pet_bond_stats_user ON pet_bond_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_pet_bond_stats_pet ON pet_bond_stats(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_milestones_user ON pet_milestones_achieved(user_id);
CREATE INDEX IF NOT EXISTS idx_pet_milestones_pet ON pet_milestones_achieved(pet_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_user ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);

-- Row Level Security
ALTER TABLE pet_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_bond_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_milestones_achieved ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Pet Interactions
CREATE POLICY "Users can view own pet interactions" ON pet_interactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pet interactions" ON pet_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Pet Bond Stats
CREATE POLICY "Users can view own bond stats" ON pet_bond_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bond stats" ON pet_bond_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bond stats" ON pet_bond_stats FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for Pet Milestones
CREATE POLICY "Users can view own milestones" ON pet_milestones_achieved FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own milestones" ON pet_milestones_achieved FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Email Verification
CREATE POLICY "Users can view own verification tokens" ON email_verification_tokens FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own verification tokens" ON email_verification_tokens FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for User Sessions
CREATE POLICY "Users can view own sessions" ON user_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON user_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON user_sessions FOR DELETE USING (auth.uid() = user_id);

-- Functions to update timestamps
CREATE OR REPLACE FUNCTION update_pet_bond_stats_updated_at()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger for pet_bond_stats updated_at
CREATE TRIGGER update_pet_bond_stats_updated_at_trigger
  BEFORE UPDATE ON pet_bond_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_pet_bond_stats_updated_at();

-- Function to clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $
BEGIN
  DELETE FROM email_verification_tokens WHERE expires_at < NOW();
  DELETE FROM user_sessions WHERE expires_at < NOW();
END;
$ LANGUAGE plpgsql;

-- Function to record pet interaction and update stats
CREATE OR REPLACE FUNCTION record_pet_interaction(
  p_user_id UUID,
  p_pet_id UUID,
  p_interaction_type VARCHAR,
  p_bond_gain INTEGER,
  p_happiness_gain INTEGER,
  p_energy_change INTEGER,
  p_affection_gain INTEGER,
  p_message TEXT
)
RETURNS void AS $
BEGIN
  -- Insert interaction
  INSERT INTO pet_interactions (user_id, pet_id, interaction_type, bond_gain, happiness_gain, energy_change, affection_gain, message)
  VALUES (p_user_id, p_pet_id, p_interaction_type, p_bond_gain, p_happiness_gain, p_energy_change, p_affection_gain, p_message);

  -- Update or create bond stats
  INSERT INTO pet_bond_stats (user_id, pet_id, total_interactions, total_bond_gained, current_bond, last_interaction_time, favorite_interaction, streak_days)
  VALUES (p_user_id, p_pet_id, 1, p_bond_gain, LEAST(p_bond_gain, 100), NOW(), p_interaction_type, 1)
  ON CONFLICT (user_id, pet_id) DO UPDATE SET
    total_interactions = pet_bond_stats.total_interactions + 1,
    total_bond_gained = pet_bond_stats.total_bond_gained + p_bond_gain,
    current_bond = LEAST(pet_bond_stats.total_bond_gained + p_bond_gain, 100),
    last_interaction_time = NOW();
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and award milestones
CREATE OR REPLACE FUNCTION check_pet_milestones(
  p_user_id UUID,
  p_pet_id UUID,
  p_current_bond INTEGER
)
RETURNS TABLE(milestone_level INTEGER, milestone_name VARCHAR) AS $
BEGIN
  RETURN QUERY
  WITH milestones AS (
    SELECT 0 as level, 'New Friend'::VARCHAR as name
    UNION ALL SELECT 10, 'Acquaintance'
    UNION ALL SELECT 25, 'Friend'
    UNION ALL SELECT 40, 'Best Friend'
    UNION ALL SELECT 60, 'Soulmate'
    UNION ALL SELECT 80, 'Eternal Companion'
    UNION ALL SELECT 100, 'Perfect Bond'
  )
  SELECT m.level, m.name
  FROM milestones m
  WHERE m.level <= p_current_bond
  AND NOT EXISTS (
    SELECT 1 FROM pet_milestones_achieved
    WHERE user_id = p_user_id
    AND pet_id = p_pet_id
    AND milestone_level = m.level
  );
END;
$ LANGUAGE plpgsql;
