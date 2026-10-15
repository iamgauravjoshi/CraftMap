// Supabase-ready data layer. Works fully offline with localStorage until
// NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are configured.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!client) client = createClient(url, key);
  return client;
}

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function signInWithProvider(provider: "google" | "github" | "twitter") {
  const sb = supabase();
  if (!sb) {
    // Demo mode: caller should treat this as a mock signed-in user.
    return { demo: true as const, provider };
  }
  return sb.auth.signInWithOAuth({ provider, options: { redirectTo: `${location.origin}/` } });
}

export async function signInWithEmail(email: string) {
  const sb = supabase();
  if (!sb) return { demo: true as const, email };
  return sb.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/` } });
}
