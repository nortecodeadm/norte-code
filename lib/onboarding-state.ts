import { create } from "zustand";
import type { PetType, SkinOption, HairOption, OutfitOption } from "./player";

/**
 * Temporary state for the onboarding flow.
 * This is NOT persisted — it only lives during the onboarding screens.
 * Once onboarding is complete, this data is written to Supabase + AsyncStorage
 * via the player service.
 */
interface OnboardingState {
  petType: PetType | null;
  petName: string;
  avatarSkin: SkinOption;
  avatarHair: HairOption;
  avatarOutfit: OutfitOption;

  setPetType: (type: PetType) => void;
  setPetName: (name: string) => void;
  setAvatarSkin: (skin: SkinOption) => void;
  setAvatarHair: (hair: HairOption) => void;
  setAvatarOutfit: (outfit: OutfitOption) => void;
  reset: () => void;
}

const initialState = {
  petType: null as PetType | null,
  petName: "",
  avatarSkin: "skin_1" as SkinOption,
  avatarHair: "hair_1" as HairOption,
  avatarOutfit: "outfit_1" as OutfitOption,
};

export const useOnboardingState = create<OnboardingState>((set) => ({
  ...initialState,

  setPetType: (type) => set({ petType: type }),
  setPetName: (name) => set({ petName: name }),
  setAvatarSkin: (skin) => set({ avatarSkin: skin }),
  setAvatarHair: (hair) => set({ avatarHair: hair }),
  setAvatarOutfit: (outfit) => set({ avatarOutfit: outfit }),
  reset: () => set(initialState),
}));
