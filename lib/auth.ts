import { supabase } from "./supabase";

/**
 * Ensures the user has an active anonymous session.
 * If a session already exists (persisted via AsyncStorage), it's restored automatically.
 * If not, a new anonymous sign-in is performed.
 *
 * @returns The user's UUID (auth.uid()) or null if auth fails.
 */
export async function ensureAnonymousSession(): Promise<string | null> {
  try {
    // Check if there's already a session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      return session.user.id;
    }

    // No session — perform anonymous sign-in
    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
      console.error("[Auth] Anonymous sign-in failed:", error.message);
      return null;
    }

    return data.user?.id ?? null;
  } catch (error) {
    console.error("[Auth] Unexpected error during auth:", error);
    return null;
  }
}

/**
 * Gets the current user ID without triggering sign-in.
 * Returns null if no session exists.
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}
