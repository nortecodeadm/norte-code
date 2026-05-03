import { supabase } from "./supabase";
import { storage } from "./storage";

// Semantic types matching asset file names exactly
export type PetType = "cachorro" | "gato" | "coelho";
export type SkinTone = "clara" | "media-clara" | "media-escura" | "escura";
export type HairStyle = "curtoliso" | "curtobaguncado" | "longoliso" | "cacheado";
export type HairColor = "castanho-escuro" | "castanho-medio" | "castanho-claro" | "loiro-mel";
export type Outfit = "verde" | "azul" | "amarela";

// Valid values for runtime validation
const VALID_PET_TYPES: string[] = ["cachorro", "gato", "coelho"];
const VALID_SKIN_TONES: string[] = ["clara", "media-clara", "media-escura", "escura"];
const VALID_HAIR_STYLES: string[] = ["curtoliso", "curtobaguncado", "longoliso", "cacheado"];
const VALID_HAIR_COLORS: string[] = ["castanho-escuro", "castanho-medio", "castanho-claro", "loiro-mel"];
const VALID_OUTFITS: string[] = ["verde", "azul", "amarela"];

export interface PlayerData {
  id: string;
  avatar_skin: SkinTone;
  avatar_hair_style: HairStyle;
  avatar_hair_color: HairColor;
  avatar_outfit: Outfit;
  pet_type: PetType;
  pet_name: string;
}

/**
 * Validates that a PlayerData object has valid semantic values.
 * Returns false if any field contains old/generic values (e.g., "dog", "skin_2").
 */
function isValidPlayerData(data: unknown): data is PlayerData {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.id === "string" &&
    VALID_PET_TYPES.includes(d.pet_type as string) &&
    VALID_SKIN_TONES.includes(d.avatar_skin as string) &&
    VALID_HAIR_STYLES.includes(d.avatar_hair_style as string) &&
    VALID_HAIR_COLORS.includes(d.avatar_hair_color as string) &&
    VALID_OUTFITS.includes(d.avatar_outfit as string) &&
    typeof d.pet_name === "string"
  );
}

/**
 * Creates a new player row in Supabase and saves locally.
 * Must be called after onboarding is complete.
 *
 * @param userId - The auth.uid() from anonymous sign-in
 * @param data - Player customization choices from onboarding
 */
export async function createPlayer(
  userId: string,
  data: Omit<PlayerData, "id">
): Promise<PlayerData | null> {
  const player: PlayerData = { id: userId, ...data };

  try {
    // Save to Supabase
    const { error } = await supabase.from("players").insert({
      id: userId,
      avatar_skin: data.avatar_skin,
      avatar_hair_style: data.avatar_hair_style,
      avatar_hair_color: data.avatar_hair_color,
      avatar_outfit: data.avatar_outfit,
      pet_type: data.pet_type,
      pet_name: data.pet_name,
    });

    if (error) {
      console.error("[Player] Error creating player in Supabase:", error.message);
      // Still save locally — offline-first approach
    }

    // Save locally
    await storage.set(storage.keys.PLAYER_DATA, player);
    await storage.set(storage.keys.ONBOARDING_COMPLETE, true);

    return player;
  } catch (error) {
    console.error("[Player] Unexpected error creating player:", error);

    // Fallback: save locally even if remote fails
    await storage.set(storage.keys.PLAYER_DATA, player);
    await storage.set(storage.keys.ONBOARDING_COMPLETE, true);

    return player;
  }
}

/**
 * Updates an existing player's data (e.g., avatar changes).
 */
export async function updatePlayer(
  userId: string,
  data: Partial<Omit<PlayerData, "id">>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("players")
      .update(data)
      .eq("id", userId);

    if (error) {
      console.error("[Player] Error updating player:", error.message);
      return false;
    }

    // Update local cache
    const current = await storage.get<PlayerData>(storage.keys.PLAYER_DATA);
    if (current) {
      await storage.set(storage.keys.PLAYER_DATA, { ...current, ...data });
    }

    return true;
  } catch (error) {
    console.error("[Player] Unexpected error updating player:", error);
    return false;
  }
}

/**
 * Gets the player data from local storage (fast) or Supabase (fallback).
 * Validates that data uses current semantic values.
 * If stale/invalid data is found, clears it and returns null.
 */
export async function getPlayer(userId: string): Promise<PlayerData | null> {
  // Try local first (offline-first)
  const local = await storage.get<PlayerData>(storage.keys.PLAYER_DATA);
  if (local) {
    // Validate semantic values — if stale, clear and force re-onboarding
    if (isValidPlayerData(local)) {
      return local;
    }
    console.warn("[Player] Stale/invalid local player data detected. Clearing cache.");
    await storage.clear();
    return null;
  }

  // Fallback to remote
  try {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) return null;

    const player: PlayerData = {
      id: data.id,
      avatar_skin: data.avatar_skin,
      avatar_hair_style: data.avatar_hair_style,
      avatar_hair_color: data.avatar_hair_color,
      avatar_outfit: data.avatar_outfit,
      pet_type: data.pet_type,
      pet_name: data.pet_name,
    };

    // Validate remote data too
    if (!isValidPlayerData(player)) {
      console.warn("[Player] Stale/invalid remote player data. Clearing.");
      await storage.clear();
      return null;
    }

    // Cache locally
    await storage.set(storage.keys.PLAYER_DATA, player);
    return player;
  } catch {
    return null;
  }
}

/**
 * Checks if onboarding has been completed.
 * Also validates that cached player data is still valid.
 * If data is stale (old generic values), resets onboarding.
 */
export async function isOnboardingComplete(): Promise<boolean> {
  const complete = await storage.get<boolean>(storage.keys.ONBOARDING_COMPLETE);
  if (complete !== true) return false;

  // Double-check: validate that cached player data is still valid
  const local = await storage.get<PlayerData>(storage.keys.PLAYER_DATA);
  if (local && !isValidPlayerData(local)) {
    console.warn("[Player] Onboarding marked complete but data is stale. Resetting.");
    await storage.clear();
    return false;
  }

  return true;
}
