import Link from "next/link";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { setAppointmentStatusAction } from "@/lib/admin/actions";
import { formatPrice } from "@/lib/data";
import { cn } from "@/lib/utils";
import { createSSRClient } from "@/lib/supabase/ssr";
import type { AppointmentStatus, BarberRow } from "@/lib/supabase/types";

const SP_TZ = "America/Sao_Paulo";

type AppointmentWithJoins = {
  id: string;
  customer_name: string;
  customer_phone: string;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  barber_id: string;
  services: { name: string; price_cents: number } | null;
  barbers: { name: string } | null;
};

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  completed: "Concluído",
};

const STATUS_CLASS: Record<AppointmentStatus, string> = {
  pending: "border-warning/50 bg-warning/10 text-warning",
  confirmed: "border-success/50 bg-success/10 text-success",
  cancelled: "border-destructive/50 bg-destructive/10 text-destructive",
  completed: "border-border bg-muted text-muted-foreground",
};

function shiftYMD(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span
      className={cn(
        "inline-block border px-2 py-0.5 text-[11px] font-bold tracking-[1px] uppercase",
        STATUS_CLASS[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function AppointmentCard({ appt }: { appt: AppointmentWithJoins }) {
  const start = formatInTimeZone(new Date(appt.starts_at), SP_TZ, "HH:mm");
  const end = formatInTimeZone(new Date(appt.ends_at), SP_TZ, "HH:mm");
  const dayLong = formatInTimeZone(
    new Date(appt.starts_at),
    SP_TZ,
    "EEEE, dd/MM",
    { locale: ptBR },
  );
  const phone = appt.customer_phone.startsWith("55")
    ? appt.customer_phone
    : `55${appt.customer_phone}`;
  const waMessage = `Olá ${appt.customer_name}! Aqui é da Barbearia Garcez. Confirmando seu horário de ${appt.services?.name ?? "atendimento"} ${dayLong} às ${start}. Até lá!`;

  return (
    <div className="border border-border bg-card p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-lg font-bold">
          {start}–{end}
        </span>
        <StatusBadge status={appt.status} />
      </div>
      <p className="text-sm font-bold">{appt.customer_name}</p>
      <p className="mb-1 text-sm font-light text-muted-foreground">
        {appt.services?.name} · {formatPrice(appt.services?.price_cents ?? 0)} ·{" "}
        {appt.barbers?.name}
      </p>
      <a
        href={`https://wa.me/${phone}?text=${encodeURIComponent(waMessage)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-4 inline-flex items-center gap-1 text-xs font-bold tracking-[1px] uppercase text-primary hover:underline"
      >
        <MessageCircle className="size-3.5" aria-hidden />
        Chamar no WhatsApp
      </a>
      <div className="flex flex-wrap gap-2">
        {appt.status === "pending" && (
          <form
            action={setAppointmentStatusAction.bind(null, appt.id, "confirmed")}
          >
            <Button type="submit" size="sm" className="text-xs font-bold uppercase">
              Confirmar
            </Button>
          </form>
        )}
        {appt.status === "confirmed" && (
          <form
            action={setAppointmentStatusAction.bind(null, appt.id, "completed")}
          >
            <Button
              type="submit"
              size="sm"
              variant="outline"
              className="text-xs font-bold uppercase"
            >
              Concluir
            </Button>
          </form>
        )}
        {(appt.status === "pending" || appt.status === "confirmed") && (
          <form
            action={setAppointmentStatusAction.bind(null, appt.id, "cancelled")}
          >
            <Button
              type="submit"
              size="sm"
              variant="destructive"
              className="text-xs font-bold uppercase"
            >
              Cancelar
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default async function AdminAgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string; v?: string; b?: string }>;
}) {
  const params = await searchParams;
  const todayYMD = formatInTimeZone(new Date(), SP_TZ, "yyyy-MM-dd");
  const dateYMD = /^\d{4}-\d{2}-\d{2}$/.test(params.d ?? "")
    ? params.d!
    : todayYMD;
  const view = params.v === "semana" ? "semana" : "dia";
  const barberFilter = params.b ?? "";

  const supabase = await createSSRClient();

  const rangeStart = fromZonedTime(`${dateYMD}T00:00:00`, SP_TZ);
  const rangeEnd = new Date(
    rangeStart.getTime() + (view === "semana" ? 7 : 1) * 24 * 60 * 60_000,
  );

  let query = supabase
    .from("appointments")
    .select(
      "id, customer_name, customer_phone, starts_at, ends_at, status, barber_id, services(name, price_cents), barbers(name)",
    )
    .gte("starts_at", rangeStart.toISOString())
    .lt("starts_at", rangeEnd.toISOString())
    .order("starts_at");
  if (barberFilter) query = query.eq("barber_id", barberFilter);

  const [{ data: apptsRaw }, { data: barbersRaw }] = await Promise.all([
    query,
    supabase.from("barbers").select("*").order("sort_order"),
  ]);
  const appts = (apptsRaw ?? []) as unknown as AppointmentWithJoins[];
  const barbers = (barbersRaw ?? []) as BarberRow[];

  const qs = (over: Record<string, string>) => {
    const p = new URLSearchParams();
    const merged = { d: dateYMD, v: view, b: barberFilter, ...over };
    if (merged.d !== todayYMD) p.set("d", merged.d);
    if (merged.v !== "dia") p.set("v", merged.v);
    if (merged.b) p.set("b", merged.b);
    const s = p.toString();
    return s ? `/admin?${s}` : "/admin";
  };

  const dayTitle = formatInTimeZone(
    fromZonedTime(`${dateYMD}T12:00:00`, SP_TZ),
    SP_TZ,
    "EEEE, dd 'de' MMMM",
    { locale: ptBR },
  );

  const groupedByDay = appts.reduce<Record<string, AppointmentWithJoins[]>>(
    (acc, a) => {
      const key = formatInTimeZone(new Date(a.starts_at), SP_TZ, "yyyy-MM-dd");
      (acc[key] ??= []).push(a);
      return acc;
    },
    {},
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold uppercase">Agenda</h1>
          <p className="text-sm font-light capitalize text-muted-foreground">
            {view === "dia" ? dayTitle : `Semana a partir de ${dayTitle}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={qs({ d: shiftYMD(dateYMD, view === "semana" ? -7 : -1) })}
            className="flex size-9 items-center justify-center border border-input hover:border-foreground"
            aria-label="Anterior"
          >
            <ChevronLeft className="size-4" />
          </Link>
          <Link
            href={qs({ d: todayYMD })}
            className="border border-input px-3 py-2 text-xs font-bold tracking-[1px] uppercase hover:border-foreground"
          >
            Hoje
          </Link>
          <Link
            href={qs({ d: shiftYMD(dateYMD, view === "semana" ? 7 : 1) })}
            className="flex size-9 items-center justify-center border border-input hover:border-foreground"
            aria-label="Próximo"
          >
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-2">
        {(["dia", "semana"] as const).map((v) => (
          <Link
            key={v}
            href={qs({ v })}
            className={cn(
              "border px-3 py-1.5 text-xs font-bold tracking-[1px] uppercase",
              view === v
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input text-muted-foreground hover:border-foreground",
            )}
          >
            {v}
          </Link>
        ))}
        <span className="mx-2 h-5 w-px bg-border" aria-hidden />
        <Link
          href={qs({ b: "" })}
          className={cn(
            "border px-3 py-1.5 text-xs font-bold tracking-[1px] uppercase",
            !barberFilter
              ? "border-primary bg-primary text-primary-foreground"
              : "border-input text-muted-foreground hover:border-foreground",
          )}
        >
          Todos
        </Link>
        {barbers.map((b) => (
          <Link
            key={b.id}
            href={qs({ b: b.id })}
            className={cn(
              "border px-3 py-1.5 text-xs font-bold tracking-[1px] uppercase",
              barberFilter === b.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input text-muted-foreground hover:border-foreground",
            )}
          >
            {b.name}
          </Link>
        ))}
      </div>

      {appts.length === 0 ? (
        <p className="border border-dashed border-border p-10 text-center text-sm font-light text-muted-foreground">
          Nenhum agendamento neste período.
        </p>
      ) : view === "dia" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {appts.map((a) => (
            <AppointmentCard key={a.id} appt={a} />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByDay).map(([day, list]) => (
            <section key={day}>
              <h2 className="mb-3 border-b border-border pb-2 text-sm font-bold tracking-[1.5px] uppercase capitalize">
                {formatInTimeZone(
                  fromZonedTime(`${day}T12:00:00`, SP_TZ),
                  SP_TZ,
                  "EEEE, dd/MM",
                  { locale: ptBR },
                )}
                <span className="ml-2 font-light normal-case text-muted-foreground">
                  {list.length} agendamento{list.length > 1 ? "s" : ""}
                </span>
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {list.map((a) => (
                  <AppointmentCard key={a.id} appt={a} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
