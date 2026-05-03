/**
 * Mascote Component
 * 
 * Displays the mascot image for a given type and state.
 * Defaults to 'padrao' state for MVP.
 * Structured for easy state swapping in Sprint 2.
 */

import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { MascoteType, MascoteState, getMascoteAsset } from '../lib/assets/mascotes';

interface MascoteProps {
  type: MascoteType;
  state?: MascoteState;
  /** Width of the mascot image. Height adjusts automatically (aspect ~1.83:1). */
  width?: number;
}

export function Mascote({ type, state = 'padrao', width = 200 }: MascoteProps) {
  const source = getMascoteAsset(type, state);
  // Original aspect ratio: 2816x1536 ≈ 1.833:1
  const height = width / 1.833;

  return (
    <Image
      source={source}
      style={[styles.image, { width, height }]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  image: {
    // No additional styling needed — size controlled by props
  },
});
