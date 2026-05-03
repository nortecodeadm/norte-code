-- Migration 0002: Avatar Semantic Values
-- Migra de valores genéricos (skin_1, hair_1, outfit_1, dog/cat/rabbit)
-- para valores semânticos que batem com os nomes dos assets.
-- Também separa avatar_hair em avatar_hair_style + avatar_hair_color.

-- 1. Limpar registro de teste antigo
DELETE FROM players WHERE id = '4ff56ffe-c85f-4b72-8a0f-f8fc943ef92f';

-- 2. Adicionar novas colunas para hair separado
ALTER TABLE players ADD COLUMN IF NOT EXISTS avatar_hair_style text;
ALTER TABLE players ADD COLUMN IF NOT EXISTS avatar_hair_color text;

-- 3. Remover coluna antiga avatar_hair
ALTER TABLE players DROP COLUMN IF EXISTS avatar_hair;

-- Valores aceitos (documentação, sem constraint por enquanto):
-- pet_type: 'cachorro' | 'gato' | 'coelho'
-- avatar_skin: 'clara' | 'media-clara' | 'media-escura' | 'escura'
-- avatar_hair_style: 'curtoliso' | 'curtobaguncado' | 'longoliso' | 'cacheado'
-- avatar_hair_color: 'castanho-escuro' | 'castanho-medio' | 'castanho-claro' | 'loiro-mel'
-- avatar_outfit: 'verde' | 'azul' | 'amarela'
