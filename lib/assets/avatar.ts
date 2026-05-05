/**
 * Avatar asset mapping — Pre-rendered system (MVP)
 *
 * Each avatar is a single pre-rendered image combining skin + hair + outfit.
 * 36 total combinations: 2 skins × 3 hair styles × 3 hair colors × 2 outfits
 *
 * Naming convention:
 *   avatar_{skin}_{hairStyle}_{hairColor}_{outfit}.png
 */

import type { SkinTone, HairStyle, HairColor, Outfit } from "../player";

// Re-export types for convenience
export type { SkinTone, HairStyle, HairColor, Outfit };

// ─── Asset map (36 pre-rendered avatars) ─────────────────────────────────────

type AvatarKey = `${SkinTone}_${HairStyle}_${HairColor}_${Outfit}`;

const AVATAR_ASSETS: Record<AvatarKey, ReturnType<typeof require>> = {
  // clara + lisocurto
  'clara_lisocurto_castanhomedio_verde': require('../../assets/avatares/avatar_clara_lisocurto_castanhomedio_verde.png'),
  'clara_lisocurto_castanhomedio_amarelo': require('../../assets/avatares/avatar_clara_lisocurto_castanhomedio_amarelo.png'),
  'clara_lisocurto_castanhoescuro_verde': require('../../assets/avatares/avatar_clara_lisocurto_castanhoescuro_verde.png'),
  'clara_lisocurto_castanhoescuro_amarelo': require('../../assets/avatares/avatar_clara_lisocurto_castanhoescuro_amarelo.png'),
  'clara_lisocurto_loiro_verde': require('../../assets/avatares/avatar_clara_lisocurto_loiro_verde.png'),
  'clara_lisocurto_loiro_amarelo': require('../../assets/avatares/avatar_clara_lisocurto_loiro_amarelo.png'),
  // clara + lisomedio
  'clara_lisomedio_castanhomedio_verde': require('../../assets/avatares/avatar_clara_lisomedio_castanhomedio_verde.png'),
  'clara_lisomedio_castanhomedio_amarelo': require('../../assets/avatares/avatar_clara_lisomedio_castanhomedio_amarelo.png'),
  'clara_lisomedio_castanhoescuro_verde': require('../../assets/avatares/avatar_clara_lisomedio_castanhoescuro_verde.png'),
  'clara_lisomedio_castanhoescuro_amarelo': require('../../assets/avatares/avatar_clara_lisomedio_castanhoescuro_amarelo.png'),
  'clara_lisomedio_loiro_verde': require('../../assets/avatares/avatar_clara_lisomedio_loiro_verde.png'),
  'clara_lisomedio_loiro_amarelo': require('../../assets/avatares/avatar_clara_lisomedio_loiro_amarelo.png'),
  // clara + cacheado
  'clara_cacheado_castanhomedio_verde': require('../../assets/avatares/avatar_clara_cacheado_castanhomedio_verde.png'),
  'clara_cacheado_castanhomedio_amarelo': require('../../assets/avatares/avatar_clara_cacheado_castanhomedio_amarelo.png'),
  'clara_cacheado_castanhoescuro_verde': require('../../assets/avatares/avatar_clara_cacheado_castanhoescuro_verde.png'),
  'clara_cacheado_castanhoescuro_amarelo': require('../../assets/avatares/avatar_clara_cacheado_castanhoescuro_amarelo.png'),
  'clara_cacheado_loiro_verde': require('../../assets/avatares/avatar_clara_cacheado_loiro_verde.png'),
  'clara_cacheado_loiro_amarelo': require('../../assets/avatares/avatar_clara_cacheado_loiro_amarelo.png'),
  // media-escura + lisocurto
  'media-escura_lisocurto_castanhomedio_verde': require('../../assets/avatares/avatar_escura_lisocurto_castanhomedio_verde.png'),
  'media-escura_lisocurto_castanhomedio_amarelo': require('../../assets/avatares/avatar_escura_lisocurto_castanhomedio_amarelo.png'),
  'media-escura_lisocurto_castanhoescuro_verde': require('../../assets/avatares/avatar_escura_lisocurto_castanhoescuro_verde.png'),
  'media-escura_lisocurto_castanhoescuro_amarelo': require('../../assets/avatares/avatar_escura_lisocurto_castanhoescuro_amarelo.png'),
  'media-escura_lisocurto_loiro_verde': require('../../assets/avatares/avatar_escura_lisocurto_loiro_verde.png'),
  'media-escura_lisocurto_loiro_amarelo': require('../../assets/avatares/avatar_escura_lisocurto_loiro_amarelo.png'),
  // media-escura + lisomedio
  'media-escura_lisomedio_castanhomedio_verde': require('../../assets/avatares/avatar_escura_lisomedio_castanhomedio_verde.png'),
  'media-escura_lisomedio_castanhomedio_amarelo': require('../../assets/avatares/avatar_escura_lisomedio_castanhomedio_amarelo.png'),
  'media-escura_lisomedio_castanhoescuro_verde': require('../../assets/avatares/avatar_escura_lisomedio_castanhoescuro_verde.png'),
  'media-escura_lisomedio_castanhoescuro_amarelo': require('../../assets/avatares/avatar_escura_lisomedio_castanhoescuro_amarelo.png'),
  'media-escura_lisomedio_loiro_verde': require('../../assets/avatares/avatar_escura_lisomedio_loiro_verde.png'),
  'media-escura_lisomedio_loiro_amarelo': require('../../assets/avatares/avatar_escura_lisomedio_loiro_amarelo.png'),
  // media-escura + cacheado
  'media-escura_cacheado_castanhomedio_verde': require('../../assets/avatares/avatar_escura_cacheado_castanhomedio_verde.png'),
  'media-escura_cacheado_castanhomedio_amarelo': require('../../assets/avatares/avatar_escura_cacheado_castanhomedio_amarelo.png'),
  'media-escura_cacheado_castanhoescuro_verde': require('../../assets/avatares/avatar_escura_cacheado_castanhoescuro_verde.png'),
  'media-escura_cacheado_castanhoescuro_amarelo': require('../../assets/avatares/avatar_escura_cacheado_castanhoescuro_amarelo.png'),
  'media-escura_cacheado_loiro_verde': require('../../assets/avatares/avatar_escura_cacheado_loiro_verde.png'),
  'media-escura_cacheado_loiro_amarelo': require('../../assets/avatares/avatar_escura_cacheado_loiro_amarelo.png'),
};

// ─── Slug mapping (banco → arquivo) ─────────────────────────────────────────

/**
 * The DB slug for skin is 'media-escura' but the file uses 'escura'.
 * Other attributes use the same slug in DB and file.
 */
const SKIN_SLUG_TO_FILE: Record<SkinTone, string> = {
  'clara': 'clara',
  'media-escura': 'escura',
};

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Get the pre-rendered avatar asset for the given combination.
 */
export function getAvatarAsset(
  skin: SkinTone,
  hairStyle: HairStyle,
  hairColor: HairColor,
  outfit: Outfit
) {
  const key: AvatarKey = `${skin}_${hairStyle}_${hairColor}_${outfit}`;
  return AVATAR_ASSETS[key];
}

// ─── Options for the customization screen ────────────────────────────────────

export const SKIN_TONE_OPTIONS: { value: SkinTone; label: string; hex: string }[] = [
  { value: 'clara', label: 'Clara', hex: '#F1DEC6' },
  { value: 'media-escura', label: 'Escura', hex: '#BB7B4D' },
];

export const HAIR_STYLE_OPTIONS: { value: HairStyle; label: string }[] = [
  { value: 'lisocurto', label: 'Liso Curto' },
  { value: 'lisomedio', label: 'Liso Médio' },
  { value: 'cacheado', label: 'Cacheado' },
];

export const HAIR_COLOR_OPTIONS: { value: HairColor; label: string; hex: string }[] = [
  { value: 'castanhomedio', label: 'Castanho Médio', hex: '#774522' },
  { value: 'castanhoescuro', label: 'Castanho Escuro', hex: '#301E17' },
  { value: 'loiro', label: 'Loiro', hex: '#DEBF89' },
];

export const OUTFIT_OPTIONS: { value: Outfit; label: string; hex: string }[] = [
  { value: 'verde', label: 'Verde', hex: '#48BD86' },
  { value: 'amarelo', label: 'Amarelo', hex: '#F7C22B' },
];
