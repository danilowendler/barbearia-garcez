import type { Metadata } from "next";
import { formatInTimeZone } from "date-fns-tz";
import { ptBR } from "date-fns/locale";
import { BookingWizard, type WizardDay } from "@/components/booking/wizard";
import { Button } from "@/components/ui/button";
import type { BookingBarber, BookingService } from "@/lib/booking/types";
import { site, waLink } from "@/lib/site";
import { createPublicServerClient } from "@/lib/supabase/server";
import type {
  BarberRow,
  ServiceRow,
  WorkingHoursRow,
} from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Agendamento",
  description:
    "Escolha o serviço, o barbeiro, o dia e o horário — confirme só com nome e WhatsApp.",
};

// Slots dependem do relógio — sempre dinâmico.
export const dynamic = "force-dynamic";

const SP_TZ = "America/Sao_Paulo";
const HORIZON_DAYS = 14;

function buildDays(): WizardDay[] {
  const days: WizardDay[] = [];
  const now = Date.now();
  for (let i = 0; i <= HORIZON_DAYS; i++) {
    const date = new Date(now + i * 24 * 60 * 60_000);
    days.push({
      ymd: formatInTimeZone(date, SP_TZ, "yyyy-MM-dd"),
      weekday: Number(formatInTimeZone(date, SP_TZ, "i")) % 7, // ISO→ 0 = domingo
      dayName:
        i === 0
          ? "Hoje"
          : formatInTimeZone(date, SP_TZ, "EEEEEE", { locale: ptBR }),
      dayLabel: formatInTimeZone(date, SP_TZ, "d MMM", { locale: ptBR }),
    });
  }
  return days;
}

export default async function AgendarPage() {
  const supabase = createPublicServerClient();

  let services: BookingService[] = [];
  let barbers: BookingBarber[] = [];
  let workingWeekdays: Record<string, number[]> = {};

  if (supabase) {
    const [svcRes, barberRes, hoursRes] = await Promise.all([
      supabase
        .from("services")
        .select("id, slug, name, short_name, description, price_cents, duration_min")
        .eq("active", true)
        .order("sort_order"),
      supabase
        .from("barbers")
        .select("id, name")
        .eq("active", true)
        .order("sort_order"),
      supabase.from("working_hours").select("barber_id, weekday"),
    ]);

    services = ((svcRes.data ?? []) as ServiceRow[]).map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      shortName: row.short_name,
      description: row.description ?? "",
      priceCents: row.price_cents,
      durationMin: row.duration_min,
    }));
    barbers = ((barberRes.data ?? []) as BarberRow[]).map((row) => ({
      id: row.id,
      name: row.name,
    }));
    workingWeekdays = (
      (hoursRes.data ?? []) as Pick<WorkingHoursRow, "barber_id" | "weekday">[]
    ).reduce<Record<string, number[]>>((acc, row) => {
      (acc[row.barber_id] ??= []).push(row.weekday);
      return acc;
    }, {});
  }

  if (services.length === 0 || barbers.length === 0) {
    return (
      <section className="mx-auto max-w-[1440px] px-[5%] py-20">
        <p className="mb-3 text-[13px] font-bold tracking-[1.5px] uppercase text-primary">
          Agendamento
        </p>
        <h1 className="mb-5 font-display text-4xl font-normal tracking-wide uppercase md:text-6xl">
          Agendamento online indisponível
        </h1>
        <p className="mb-8 max-w-md text-base font-light text-muted-foreground">
          Estamos ajustando a agenda. Enquanto isso, chame a gente no WhatsApp
          que marcamos seu horário na hora.
        </p>
        <Button
          nativeButton={false}
          render={
            <a
              href={waLink("Olá! Quero agendar um horário na Barbearia Garcez.")}
              target="_blank"
              rel="noopener noreferrer"
            />
          }
          size="lg"
          className="h-12 px-8 text-sm font-bold tracking-[0.5px] uppercase"
        >
          Agendar pelo WhatsApp
        </Button>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-[5%] py-12 md:py-16">
      <p className="mb-3 text-[13px] font-bold tracking-[1.5px] uppercase text-accent-red">
        Agendamento
      </p>
      <h1 className="mb-2 font-display text-4xl font-normal tracking-wide uppercase md:text-5xl">
        Escolha seu horário
      </h1>
      <p className="mb-10 max-w-md text-base font-light text-muted-foreground">
        Sem cadastro, sem complicação: {site.name} na sua agenda em menos de um
        minuto.
      </p>
      <BookingWizard
        services={services}
        barbers={barbers}
        workingWeekdays={workingWeekdays}
        days={buildDays()}
      />
    </section>
  );
}
