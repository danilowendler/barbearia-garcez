import { fallbackServices, type Service } from "@/lib/data";
import { createPublicServerClient } from "@/lib/supabase/server";
import type { ServiceRow } from "@/lib/supabase/types";

function toService(row: ServiceRow): Service {
  return {
    slug: row.slug,
    name: row.name,
    shortName: row.short_name,
    description: row.description ?? "",
    priceCents: row.price_cents,
    durationMin: row.duration_min,
  };
}

/**
 * Catálogo de serviços ativos, ordenado. Lê do Supabase; se o banco estiver
 * indisponível/vazio (ex.: migrations ainda não aplicadas), usa o fallback
 * estático para o site nunca quebrar.
 */
export async function getActiveServices(): Promise<Service[]> {
  const supabase = createPublicServerClient();
  if (!supabase) return fallbackServices;

  const { data, error } = await supabase
    .from("services")
    .select(
      "id, slug, name, short_name, description, price_cents, duration_min, active, sort_order, created_at",
    )
    .eq("active", true)
    .order("sort_order");

  if (error || !data || data.length === 0) {
    if (error) {
      console.error("[services] falha ao ler do Supabase:", error.message);
    }
    return fallbackServices;
  }

  return (data as ServiceRow[]).map(toService);
}
