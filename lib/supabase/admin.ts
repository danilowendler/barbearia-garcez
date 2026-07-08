import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Client com a service role key — bypassa RLS. Uso exclusivo em Server
 * Actions/route handlers que validam tudo antes de escrever (agendamentos).
 * O import de "server-only" garante em build que nunca vaza para o client.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase admin: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias.",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
