-- Migration 0004: Add player_name column
-- Date: 2026-05-05
-- Context: Doc2 Semana 3 — criança agora nomeia o avatar no onboarding

ALTER TABLE players ADD COLUMN player_name text NOT NULL DEFAULT '';

-- Registros com player_name vazio devem ser tratados como onboarding incompleto
-- (forçar criança a passar pela tela de nome)
