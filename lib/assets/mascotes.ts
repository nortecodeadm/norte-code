/**
 * Mascote asset mapping
 * 
 * Each mascot has 5 states: padrao, atento, feliz, pensativo, dormindo
 * For MVP, we use only "padrao" state.
 * Structure supports easy swap between states for Sprint 2.
 */

export type MascoteType = 'cachorro' | 'gato' | 'coelho';
export type MascoteState = 'padrao' | 'atento' | 'feliz' | 'pensativo' | 'dormindo';

type MascoteAssets = {
  [key in MascoteState]: ReturnType<typeof require>;
};

type MascoteMap = {
  [key in MascoteType]: MascoteAssets;
};

export const MASCOTE_ASSETS: MascoteMap = {
  cachorro: {
    padrao: require('../../assets/mascotes/cachorro/cachorro_padrao.png'),
    atento: require('../../assets/mascotes/cachorro/cachorro_atento.png'),
    feliz: require('../../assets/mascotes/cachorro/cachorro_feliz.png'),
    pensativo: require('../../assets/mascotes/cachorro/cachorro_pensativo.png'),
    dormindo: require('../../assets/mascotes/cachorro/cachorro_dormindo.png'),
  },
  gato: {
    padrao: require('../../assets/mascotes/gato/gato_padrao.png'),
    atento: require('../../assets/mascotes/gato/gato_atento.png'),
    feliz: require('../../assets/mascotes/gato/gato_feliz.png'),
    pensativo: require('../../assets/mascotes/gato/gato_pensativo.png'),
    dormindo: require('../../assets/mascotes/gato/gato_dormindo.png'),
  },
  coelho: {
    padrao: require('../../assets/mascotes/coelho/coelho_padrao.png'),
    atento: require('../../assets/mascotes/coelho/coelho_atento.png'),
    feliz: require('../../assets/mascotes/coelho/coelho_feliz.png'),
    pensativo: require('../../assets/mascotes/coelho/coelho_pensativo.png'),
    dormindo: require('../../assets/mascotes/coelho/coelho_dormindo.png'),
  },
};

/**
 * Get the asset source for a specific mascot in a specific state.
 * Defaults to 'padrao' if no state is specified.
 */
export function getMascoteAsset(type: MascoteType, state: MascoteState = 'padrao') {
  return MASCOTE_ASSETS[type][state];
}

/** Display names for the pet choice screen */
export const MASCOTE_NAMES: Record<MascoteType, string> = {
  cachorro: 'Cachorro',
  gato: 'Gato',
  coelho: 'Coelho',
};
