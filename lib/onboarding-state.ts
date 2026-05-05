import { create } from "zustand";
import type { PetType, SkinTone, HairStyle, HairColor, Outfit } from "./player";

/**
 * Temporary state for the onboarding flow.
 * This is NOT persisted — it only lives during the onboarding screens.
 * Once onboarding is complete, this data is written to Supabase + AsyncStorage
 * via the player service.
 */
interface OnboardingState {
  petType: PetType | null;
  petName: string;
  playerName: string;
  avatarSkin: SkinTone;
  avatarHairStyle: HairStyle;
  avatarHairColor: HairColor;
  avatarOutfit: Outfit;

  setPetType: (type: PetType) => void;
  setPetName: (name: string) => void;
  setPlayerName: (name: string) => void;
  setAvatarSkin: (skin: SkinTone) => void;
  setAvatarHairStyle: (style: HairStyle) => void;
  setAvatarHairColor: (color: HairColor) => void;
  setAvatarOutfit: (outfit: Outfit) => void;
  reset: () => void;
}

const initialState = {
  petType: null as PetType | null,
  petName: "",
  playerName: "",
  avatarSkin: "clara" as SkinTone,
  avatarHairStyle: "lisocurto" as HairStyle,
  avatarHairColor: "castanhomedio" as HairColor,
  avatarOutfit: "verde" as Outfit,
};

export const useOnboardingState = create<OnboardingState>((set) => ({
  ...initialState,

  setPetType: (type) => set({ petType: type }),
  setPetName: (name) => set({ petName: name }),
  setPlayerName: (name) => set({ playerName: name }),
  setAvatarSkin: (skin) => set({ avatarSkin: skin }),
  setAvatarHairStyle: (style) => set({ avatarHairStyle: style }),
  setAvatarHairColor: (color) => set({ avatarHairColor: color }),
  setAvatarOutfit: (outfit) => set({ avatarOutfit: outfit }),
  reset: () => set(initialState),
}));
