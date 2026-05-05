/**
 * Mascote (Pet) asset mapping — Flat structure (MVP)
 *
 * 3 mascotes × 4 states = 12 images total.
 * MVP uses only 'padrao' state. Other states ready for Sprint 2 gameplay.
 *
 * Naming convention: {petType}_{petState}.png
 */

import type { PetType, PetState } from "../player";

// Re-export for convenience
export type { PetType, PetState };

// ─── Asset map (12 mascotes) ─────────────────────────────────────────────────

type MascoteKey = `${PetType}_${PetState}`;

const MASCOTE_ASSETS: Record<MascoteKey, ReturnType<typeof require>> = {
  'cachorro_padrao': require('../../assets/mascotes/cachorro_padrao.png'),
  'cachorro_atento': require('../../assets/mascotes/cachorro_atento.png'),
  'cachorro_feliz': require('../../assets/mascotes/cachorro_feliz.png'),
  'cachorro_dormindo': require('../../assets/mascotes/cachorro_dormindo.png'),
  'gato_padrao': require('../../assets/mascotes/gato_padrao.png'),
  'gato_atento': require('../../assets/mascotes/gato_atento.png'),
  'gato_feliz': require('../../assets/mascotes/gato_feliz.png'),
  'gato_dormindo': require('../../assets/mascotes/gato_dormindo.png'),
  'coelho_padrao': require('../../assets/mascotes/coelho_padrao.png'),
  'coelho_atento': require('../../assets/mascotes/coelho_atento.png'),
  'coelho_feliz': require('../../assets/mascotes/coelho_feliz.png'),
  'coelho_dormindo': require('../../assets/mascotes/coelho_dormindo.png'),
};

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Get the asset source for a specific mascot in a specific state.
 * Defaults to 'padrao' if no state is specified.
 */
export function getMascoteAsset(type: PetType, state: PetState = 'padrao') {
  const key: MascoteKey = `${type}_${state}`;
  return MASCOTE_ASSETS[key];
}

/** Display names for the pet choice screen */
export const PET_TYPE_LABELS: Record<PetType, string> = {
  cachorro: 'Cachorro',
  gato: 'Gato',
  coelho: 'Coelho',
};
