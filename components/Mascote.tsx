/**
 * Mascote (Pet) Component
 *
 * Renders a single mascot image in the given state.
 * MVP only uses 'padrao' state. Other states ready for Sprint 2.
 */

import React from 'react';
import { Image } from 'react-native';
import { getMascoteAsset } from '../lib/assets/mascotes';
import type { PetType, PetState } from '../lib/player';

interface MascoteProps {
  type: PetType;
  state?: PetState;
  /** Size of the mascot (square). Defaults to 200. */
  size?: number;
  /** @deprecated Use `size` instead */
  width?: number;
}

export function Mascote({ type, state = 'padrao', size, width }: MascoteProps) {
  const finalSize = size ?? width ?? 200;
  const source = getMascoteAsset(type, state);

  return (
    <Image
      source={source}
      style={{ width: finalSize, height: finalSize }}
      resizeMode="contain"
    />
  );
}
