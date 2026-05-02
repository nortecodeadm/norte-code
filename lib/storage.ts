import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  PLAYER_DATA: "@norte_code/player_data",
  LEVEL_PROGRESS: "@norte_code/level_progress",
  WORLD_ELEMENTS: "@norte_code/world_elements",
  CHAPTERS_VIEWED: "@norte_code/chapters_viewed",
  ONBOARDING_COMPLETE: "@norte_code/onboarding_complete",
} as const;

/**
 * Local storage wrapper for Norte Code.
 * All game state is persisted locally first (offline-first),
 * then synced to Supabase when connectivity is available.
 */
export const storage = {
  keys: KEYS,

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`[Storage] Error reading key "${key}":`, error);
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`[Storage] Error writing key "${key}":`, error);
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`[Storage] Error removing key "${key}":`, error);
    }
  },

  async clear(): Promise<void> {
    try {
      const keys = Object.values(KEYS);
      await Promise.all(keys.map((key) => AsyncStorage.removeItem(key)));
    } catch (error) {
      console.error("[Storage] Error clearing storage:", error);
    }
  },
};
