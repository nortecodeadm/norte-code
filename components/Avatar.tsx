/**
 * Avatar Component — 3-layer composition at runtime
 *
 * Renders 3 stacked <Image /> layers:
 * 1. Body (skinTone) — relative position, anchors the container
 * 2. Outfit (outfit color) — absolute position, clothing overlay
 * 3. Hair (style + color) — absolute position, pre-positioned on same canvas
 *
 * All source images are 1024x1024 with same canvas anchoring,
 * so they align perfectly when stacked with same dimensions.
 */

import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import {
  SkinTone,
  HairStyle,
  HairColor,
  Outfit,
  getBodyAsset,
  getOutfitAsset,
  getHairAsset,
} from '../lib/assets/avatar';

interface AvatarProps {
  skinTone: SkinTone;
  hairStyle: HairStyle;
  hairColor: HairColor;
  outfit: Outfit;
  /** Size of the avatar container (square). Defaults to 200. */
  size?: number;
}

export function Avatar({ skinTone, hairStyle, hairColor, outfit, size = 200 }: AvatarProps) {
  const bodySource = getBodyAsset(skinTone);
  const outfitSource = getOutfitAsset(outfit);
  const hairSource = getHairAsset(hairStyle, hairColor);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Layer 1: Body (base — skin tone) */}
      <Image
        source={bodySource}
        style={[styles.baseLayer, { width: size, height: size }]}
        resizeMode="contain"
      />
      {/* Layer 2: Outfit (clothing overlay) */}
      <Image
        source={outfitSource}
        style={[styles.overlayLayer, { width: size, height: size }]}
        resizeMode="contain"
      />
      {/* Layer 3: Hair (pre-positioned on same canvas) */}
      <Image
        source={hairSource}
        style={[styles.overlayLayer, { width: size, height: size }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  baseLayer: {
    position: 'relative',
  },
  overlayLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
