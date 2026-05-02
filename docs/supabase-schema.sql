-- ============================================================
-- NORTE CODE - Database Schema
-- Execute this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 2. Tables
-- ============================================================

-- Players table (linked directly to Supabase anonymous auth user ID)
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY,                          -- matches auth.uid() from anonymous sign-in
  avatar_skin TEXT NOT NULL DEFAULT 'skin_1',
  avatar_hair TEXT NOT NULL DEFAULT 'hair_1',
  avatar_outfit TEXT NOT NULL DEFAULT 'outfit_1',
  pet_type TEXT NOT NULL DEFAULT 'dog',         -- 'dog', 'cat', 'rabbit'
  pet_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Level progress (tracks completion and attempts per level)
CREATE TABLE IF NOT EXISTS level_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  level_number INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  first_completed_at TIMESTAMPTZ,
  last_attempted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(player_id, level_number)
);

-- World elements (visual elements unlocked in the permanent world)
CREATE TABLE IF NOT EXISTS world_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  element_key TEXT NOT NULL,                    -- 'seed_lvl1', 'sprout_lvl2', etc.
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(player_id, element_key)
);

-- Narrative chapters viewed
CREATE TABLE IF NOT EXISTS narrative_chapters_viewed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  chapter_id TEXT NOT NULL,                     -- 'chapter_1' in MVP
  viewed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(player_id, chapter_id)
);

-- ============================================================
-- 3. Row Level Security (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE narrative_chapters_viewed ENABLE ROW LEVEL SECURITY;

-- Players: user can only read/write their own row
-- The anonymous auth user's ID matches the player's id
CREATE POLICY "Players can view own data"
  ON players FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Players can insert own data"
  ON players FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Players can update own data"
  ON players FOR UPDATE
  USING (id = auth.uid());

-- Level progress: user can only access their own progress
CREATE POLICY "Players can view own level progress"
  ON level_progress FOR SELECT
  USING (player_id = auth.uid());

CREATE POLICY "Players can insert own level progress"
  ON level_progress FOR INSERT
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "Players can update own level progress"
  ON level_progress FOR UPDATE
  USING (player_id = auth.uid());

-- World elements: user can only access their own elements
CREATE POLICY "Players can view own world elements"
  ON world_elements FOR SELECT
  USING (player_id = auth.uid());

CREATE POLICY "Players can insert own world elements"
  ON world_elements FOR INSERT
  WITH CHECK (player_id = auth.uid());

-- Narrative chapters: user can only access their own viewed chapters
CREATE POLICY "Players can view own chapters"
  ON narrative_chapters_viewed FOR SELECT
  USING (player_id = auth.uid());

CREATE POLICY "Players can insert own chapters"
  ON narrative_chapters_viewed FOR INSERT
  WITH CHECK (player_id = auth.uid());

-- ============================================================
-- 4. Indexes for performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_level_progress_player
  ON level_progress(player_id);

CREATE INDEX IF NOT EXISTS idx_world_elements_player
  ON world_elements(player_id);

CREATE INDEX IF NOT EXISTS idx_narrative_chapters_player
  ON narrative_chapters_viewed(player_id);

-- ============================================================
-- 5. Updated_at trigger for players table
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
