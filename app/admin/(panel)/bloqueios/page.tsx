import { Trash2 } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { ptBR } from "date-fns/locale";
import { BlockForm } from "@/components/admin/block-form";
import { Button } from "@/components/ui/button";
import { deleteTimeBlockAction } from "@/lib/admin/actions";
import { createSSRClient } from "@/lib/supabase/ssr";
import type { BarberRow, TimeBlockRow } from "@/lib/supabase/types";

const SP_TZ = "America/Sao_Paulo";

export default async function AdminBloqueiosPage() {
  const supabase = await createSSRClient();

  const [{ data: blocksRaw }, { data: barbersRaw }] = await Promise.all([
    supabase
      .from("time_blocks")
      .select("*")
      .gte("ends_at", new Date().toISOString())
      .order("starts_at"),
    supabase.from("barbers").select("*").eq("active", true).order("sort_order"),
  ]);
  const blocks = (blocksRaw ?? []) as TimeBlockRow[];
  const barbers = (barbersRaw ?? []) as BarberRow[];
  const barberName = (id: string | null) =>
    id ? (barbers.find((b) => b.id === id)?.name ?? "—") : "Loja toda";

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold uppercase">Bloqueios</h1>
      <p className="mb-6 text-sm font-light text-muted-foreground">
        Folgas, almoço e feriados — os horários bloqueados somem do agendamento
        online na hora.
      </p>

      <BlockForm barbers={barbers.map((b) => ({ id: b.id, name: b.name }))} />

      <h2 className="mt-10 mb-3 text-sm font-bold tracking-[1.5px] uppercase">
        Próximos bloqueios
      </h2>
      {blocks.length === 0 ? (
        <p className="border border-dashed border-border p-10 text-center text-sm font-light text-muted-foreground">
          Nenhum bloqueio futuro.
        </p>
      ) : (
        <ul className="divide-y divide-border border border-border">
          {blocks.map((block) => (
            <li
              key={block.id}
              className="flex flex-wrap items-center justify-between gap-3 bg-card p-4"
            >
              <div>
                <p className="text-sm font-bold capitalize">
                  {formatInTimeZone(
                    new Date(block.starts_at),
                    SP_TZ,
                    "EEEE, dd/MM · HH:mm",
                    { locale: ptBR },
                  )}
                  {" — "}
                  {formatInTimeZone(new Date(block.ends_at), SP_TZ, "HH:mm")}
                </p>
                <p className="text-sm font-light text-muted-foreground">
                  {barberName(block.barber_id)}
                  {block.reason ? ` · ${block.reason}` : ""}
                </p>
              </div>
              <form action={deleteTimeBlockAction.bind(null, block.id)}>
                <Button
                  type="submit"
                  size="sm"
                  variant="destructive"
                  className="text-xs font-bold uppercase"
                >
                  <Trash2 className="size-3.5" aria-hidden />
                  Remover
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
