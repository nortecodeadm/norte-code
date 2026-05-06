/**
 * Avatar Component — Pre-rendered single image (MVP)
 *
 * Renders a single <Image /> from 36 pre-rendered avatar combinations.
 * No runtime composition — each combination is its own PNG.
 */

import React from 'react';
import { Image } from 'react-native';
import { getAvatarAsset } from '../lib/assets/avatar';
import type { SkinTone, HairStyle, HairColor, Outfit } from '../lib/player';

interface AvatarProps {
  skinTone: SkinTone;
  hairStyle: HairStyle;
  hairColor: HairColor;
  outfit: Outfit;
  /** Size of the avatar (width). Height auto-scales via aspect ratio. Defaults to 200. */
  size?: number;
}

export function Avatar({ skinTone, hairStyle, hairColor, outfit, size = 200 }: AvatarProps) {
  const source = getAvatarAsset(skinTone, hairStyle, hairColor, outfit);

  return (
    <Image
      source={source}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}
