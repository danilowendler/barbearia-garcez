import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Client Supabase com sessão em cookies — para o painel admin (Server
 * Components e Server Actions). As policies de RLS do papel `authenticated`
 * valem aqui, então o acesso já é limitado ao dono logado.
 */
export async function createSSRClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Chamado de um Server Component (cookies read-only): o proxy
            // cuida do refresh da sessão, então é seguro ignorar.
          }
        },
      },
    },
  );
}

/** Sessão atual (ou null). Toda action/página admin passa por aqui. */
export async function getAuthUser() {
  const supabase = await createSSRClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}
