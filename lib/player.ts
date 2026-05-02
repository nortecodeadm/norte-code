import { supabase } from "./supabase";
import { storage } from "./storage";

export type PetType = "dog" | "cat" | "rabbit";
export type SkinOption = "skin_1" | "skin_2" | "skin_3" | "skin_4";
export type HairOption = "hair_1" | "hair_2" | "hair_3" | "hair_4";
export type OutfitOption = "outfit_1" | "outfit_2" | "outfit_3";

export interface PlayerData {
  id: string;
  avatar_skin: SkinOption;
  avatar_hair: HairOption;
  avatar_outfit: OutfitOption;
  pet_type: PetType;
  pet_name: string;
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
      avatar_hair: data.avatar_hair,
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
 */
export async function getPlayer(userId: string): Promise<PlayerData | null> {
  // Try local first (offline-first)
  const local = await storage.get<PlayerData>(storage.keys.PLAYER_DATA);
  if (local) return local;

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
      avatar_hair: data.avatar_hair,
      avatar_outfit: data.avatar_outfit,
      pet_type: data.pet_type,
      pet_name: data.pet_name,
    };

    // Cache locally
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
  return complete === true;
}
