/**
 * Avatar asset mapping — 2-layer system (dressed body + hair)
 *
 * The avatar is composed of 2 layers rendered at runtime:
 * 1. Dressed Body (skinTone + outfit) — base layer with colored t-shirt
 * 2. Hair (hairStyle + hairColor) — top layer, pre-positioned on canvas
 *
 * All assets are 512x512 with same canvas anchoring.
 * Hair layers are already positioned to align with the body's head.
 *
 * Total combinations: 4 skins × 3 outfits × 4 styles × 4 colors = 192
 * Total images: 12 dressed bodies + 16 hair layers = 28
 */

export type SkinTone = 'clara' | 'media-clara' | 'media-escura' | 'escura';
export type HairStyle = 'curtoliso' | 'curtobaguncado' | 'longoliso' | 'cacheado';
export type HairColor = 'castanho-escuro' | 'castanho-medio' | 'castanho-claro' | 'loiro-mel';
export type Outfit = 'verde' | 'azul' | 'amarela';

// --- Dressed Body assets (4 skins × 3 outfits = 12) ---
type BodyKey = `${string}_${string}`;
const BODY_ASSETS: Record<BodyKey, ReturnType<typeof require>> = {
  'clara_verde': require('../../assets/avatar/corpos/corpo_clara_verde.png'),
  'clara_azul': require('../../assets/avatar/corpos/corpo_clara_azul.png'),
  'clara_amarela': require('../../assets/avatar/corpos/corpo_clara_amarela.png'),
  'media-clara_verde': require('../../assets/avatar/corpos/corpo_media-clara_verde.png'),
  'media-clara_azul': require('../../assets/avatar/corpos/corpo_media-clara_azul.png'),
  'media-clara_amarela': require('../../assets/avatar/corpos/corpo_media-clara_amarela.png'),
  'media-escura_verde': require('../../assets/avatar/corpos/corpo_media-escura_verde.png'),
  'media-escura_azul': require('../../assets/avatar/corpos/corpo_media-escura_azul.png'),
  'media-escura_amarela': require('../../assets/avatar/corpos/corpo_media-escura_amarela.png'),
  'escura_verde': require('../../assets/avatar/corpos/corpo_escura_verde.png'),
  'escura_azul': require('../../assets/avatar/corpos/corpo_escura_azul.png'),
  'escura_amarela': require('../../assets/avatar/corpos/corpo_escura_amarela.png'),
};

// --- Hair assets (4 styles × 4 colors = 16) ---
type HairKey = `${string}_${string}`;
const HAIR_ASSETS: Record<HairKey, ReturnType<typeof require>> = {
  'curtoliso_castanho-escuro': require('../../assets/avatar/cabelos/cabelo_curtoliso_castanho-escuro.png'),
  'curtoliso_castanho-medio': require('../../assets/avatar/cabelos/cabelo_curtoliso_castanho-medio.png'),
  'curtoliso_castanho-claro': require('../../assets/avatar/cabelos/cabelo_curtoliso_castanho-claro.png'),
  'curtoliso_loiro-mel': require('../../assets/avatar/cabelos/cabelo_curtoliso_loiro-mel.png'),
  'curtobaguncado_castanho-escuro': require('../../assets/avatar/cabelos/cabelo_curtobaguncado_castanho-escuro.png'),
  'curtobaguncado_castanho-medio': require('../../assets/avatar/cabelos/cabelo_curtobaguncado_castanho-medio.png'),
  'curtobaguncado_castanho-claro': require('../../assets/avatar/cabelos/cabelo_curtobaguncado_castanho-claro.png'),
  'curtobaguncado_loiro-mel': require('../../assets/avatar/cabelos/cabelo_curtobaguncado_loiro-mel.png'),
  'longoliso_castanho-escuro': require('../../assets/avatar/cabelos/cabelo_longoliso_castanho-escuro.png'),
  'longoliso_castanho-medio': require('../../assets/avatar/cabelos/cabelo_longoliso_castanho-medio.png'),
  'longoliso_castanho-claro': require('../../assets/avatar/cabelos/cabelo_longoliso_castanho-claro.png'),
  'longoliso_loiro-mel': require('../../assets/avatar/cabelos/cabelo_longoliso_loiro-mel.png'),
  'cacheado_castanho-escuro': require('../../assets/avatar/cabelos/cabelo_cacheado_castanho-escuro.png'),
  'cacheado_castanho-medio': require('../../assets/avatar/cabelos/cabelo_cacheado_castanho-medio.png'),
  'cacheado_castanho-claro': require('../../assets/avatar/cabelos/cabelo_cacheado_castanho-claro.png'),
  'cacheado_loiro-mel': require('../../assets/avatar/cabelos/cabelo_cacheado_loiro-mel.png'),
};

// --- Public API ---

export function getBodyAsset(skinTone: SkinTone, outfit: Outfit) {
  const key: BodyKey = `${skinTone}_${outfit}`;
  return BODY_ASSETS[key];
}

export function getHairAsset(style: HairStyle, color: HairColor) {
  const key: HairKey = `${style}_${color}`;
  return HAIR_ASSETS[key];
}

// --- Options for the customization screen ---

export const SKIN_TONE_OPTIONS: { value: SkinTone; label: string; hex: string }[] = [
  { value: 'clara', label: 'Clara', hex: '#FDDCBD' },
  { value: 'media-clara', label: 'Média clara', hex: '#E8B88A' },
  { value: 'media-escura', label: 'Média escura', hex: '#C68642' },
  { value: 'escura', label: 'Escura', hex: '#8D5524' },
];

export const HAIR_STYLE_OPTIONS: { value: HairStyle; label: string }[] = [
  { value: 'curtoliso', label: 'Curto liso' },
  { value: 'curtobaguncado', label: 'Curto bagunçado' },
  { value: 'longoliso', label: 'Longo liso' },
  { value: 'cacheado', label: 'Cacheado' },
];

export const HAIR_COLOR_OPTIONS: { value: HairColor; label: string; hex: string }[] = [
  { value: 'castanho-escuro', label: 'Castanho escuro', hex: '#3B2314' },
  { value: 'castanho-medio', label: 'Castanho médio', hex: '#6B3A2A' },
  { value: 'castanho-claro', label: 'Castanho claro', hex: '#A0522D' },
  { value: 'loiro-mel', label: 'Loiro mel', hex: '#DAA520' },
];

export const OUTFIT_OPTIONS: { value: Outfit; label: string; hex: string }[] = [
  { value: 'verde', label: 'Verde', hex: '#2E7D4F' },
  { value: 'azul', label: 'Azul', hex: '#4A90D9' },
  { value: 'amarela', label: 'Amarela', hex: '#F5C542' },
];
