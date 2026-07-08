import { createClient } from "@supabase/supabase-js";

/**
 * Client server-side com a anon key — para leituras públicas (catálogo)
 * em Server Components. Sujeito às policies de RLS do papel `anon`.
 */
export function createPublicServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
