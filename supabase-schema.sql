-- Rashi Quiz — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- Players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar_emoji TEXT DEFAULT '📖',
  total_xp INT DEFAULT 0,
  level INT DEFAULT 1,
  quizzes_completed INT DEFAULT 0,
  best_streak INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz attempts table
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  part_id INT NOT NULL,
  score INT NOT NULL,
  total_questions INT NOT NULL,
  xp_earned INT NOT NULL,
  hearts_remaining INT DEFAULT 0,
  max_streak INT DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_attempts_player ON quiz_attempts(player_id);
CREATE INDEX idx_attempts_part ON quiz_attempts(part_id);

-- RPC function to atomically add XP
CREATE OR REPLACE FUNCTION add_player_xp(p_id UUID, xp_amount INT, new_level INT)
RETURNS VOID AS $$
BEGIN
  UPDATE players
  SET total_xp = total_xp + xp_amount,
      level = new_level,
      quizzes_completed = quizzes_completed + 1,
      updated_at = NOW()
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (open access for this family/classroom app)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on players" ON players
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on quiz_attempts" ON quiz_attempts
  FOR ALL USING (true) WITH CHECK (true);
