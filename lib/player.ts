import { supabase } from "./supabase";
import { storage } from "./storage";

// ─── Types (MVP) ────────────────────────────────────────────────────────────

export type PetType = "cachorro" | "gato" | "coelho";
export type PetState = "padrao" | "atento" | "feliz" | "dormindo";
export type SkinTone = "clara" | "media-escura";
export type HairStyle = "lisocurto" | "lisomedio" | "cacheado";
export type HairColor = "castanhomedio" | "castanhoescuro" | "loiro";
export type Outfit = "verde" | "amarelo";

// Valid values for runtime validation
const VALID_PET_TYPES: string[] = ["cachorro", "gato", "coelho"];
const VALID_SKIN_TONES: string[] = ["clara", "media-escura"];
const VALID_HAIR_STYLES: string[] = ["lisocurto", "lisomedio", "cacheado"];
const VALID_HAIR_COLORS: string[] = ["castanhomedio", "castanhoescuro", "loiro"];
const VALID_OUTFITS: string[] = ["verde", "amarelo"];

export interface PlayerData {
  id: string;
  player_name: string;
  avatar_skin: SkinTone;
  avatar_hair_style: HairStyle;
  avatar_hair_color: HairColor;
  avatar_outfit: Outfit;
  pet_type: PetType;
  pet_name: string;
}

/**
 * Validates that a PlayerData object has valid semantic values.
 * Returns false if any field contains old/generic values.
 */
function isValidPlayerData(data: unknown): data is PlayerData {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.id === "string" &&
    typeof d.player_name === "string" &&
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
 */
export async function createPlayer(
  userId: string,
  data: Omit<PlayerData, "id">
): Promise<PlayerData | null> {
  const player: PlayerData = { id: userId, ...data };

  try {
    const { error } = await supabase.from("players").insert({
      id: userId,
      player_name: data.player_name,
      avatar_skin: data.avatar_skin,
      avatar_hair_style: data.avatar_hair_style,
      avatar_hair_color: data.avatar_hair_color,
      avatar_outfit: data.avatar_outfit,
      pet_type: data.pet_type,
      pet_name: data.pet_name,
    });

    if (error) {
      console.error("[Player] Error creating player in Supabase:", error.message);
    }

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
 */
export async function getPlayer(userId: string): Promise<PlayerData | null> {
  const local = await storage.get<PlayerData>(storage.keys.PLAYER_DATA);
  if (local) {
    if (isValidPlayerData(local)) {
      return local;
    }
    console.warn("[Player] Stale/invalid local player data detected. Clearing cache.");
    await storage.clear();
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) return null;

    const player: PlayerData = {
      id: data.id,
      player_name: data.player_name ?? "",
      avatar_skin: data.avatar_skin,
      avatar_hair_style: data.avatar_hair_style,
      avatar_hair_color: data.avatar_hair_color,
      avatar_outfit: data.avatar_outfit,
      pet_type: data.pet_type,
      pet_name: data.pet_name,
    };

    if (!isValidPlayerData(player)) {
      console.warn("[Player] Stale/invalid remote player data. Clearing.");
      await storage.clear();
      return null;
    }

    await storage.set(storage.keys.PLAYER_DATA, player);
    return player;
  } catch {
    return null;
  }
}

/**
 * Checks if onboarding has been completed.
 */
export async function isOnboardingComplete(): Promise<boolean> {
  const complete = await storage.get<boolean>(storage.keys.ONBOARDING_COMPLETE);
  if (complete !== true) return false;

  const local = await storage.get<PlayerData>(storage.keys.PLAYER_DATA);
  if (local && !isValidPlayerData(local)) {
    console.warn("[Player] Onboarding marked complete but data is stale. Resetting.");
    await storage.clear();
    return false;
  }

  return true;
}
