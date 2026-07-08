import "server-only";

import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  AppointmentRow,
  BarberRow,
  ServiceRow,
  TimeBlockRow,
  WorkingHoursRow,
} from "@/lib/supabase/types";

export const SP_TZ = "America/Sao_Paulo";
export const BOOKING_HORIZON_DAYS = 14;
/** Antecedência mínima para agendar (minutos). */
export const LEAD_TIME_MIN = 30;

type Interval = { start: number; end: number }; // epoch ms

/**
 * Slots livres de UM barbeiro: candidatos a cada `durationMin` a partir do
 * início de cada período de trabalho; válido se couber inteiro no período,
 * não colidir com ocupados e não estar antes de `notBefore`.
 * Função pura — testável sem banco.
 */
export function computeFreeSlots({
  periods,
  busy,
  durationMin,
  notBefore,
}: {
  periods: Interval[];
  busy: Interval[];
  durationMin: number;
  notBefore: number;
}): number[] {
  const dur = durationMin * 60_000;
  const out: number[] = [];
  for (const period of periods) {
    for (let t = period.start; t + dur <= period.end; t += dur) {
      if (t < notBefore) continue;
      const conflict = busy.some((b) => t < b.end && t + dur > b.start);
      if (!conflict) out.push(t);
    }
  }
  return out;
}

export function isValidYMD(dateYMD: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateYMD)) return false;
  const [y, m, d] = dateYMD.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

/** Weekday (0 = domingo) de uma data-calendário. */
export function weekdayOf(dateYMD: string): number {
  const [y, m, d] = dateYMD.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function todayYMDInSP(): string {
  return formatInTimeZone(new Date(), SP_TZ, "yyyy-MM-dd");
}

function isWithinHorizon(dateYMD: string): boolean {
  const today = todayYMDInSP();
  if (dateYMD < today) return false;
  const [y, m, d] = today.split("-").map(Number);
  const max = new Date(Date.UTC(y, m - 1, d + BOOKING_HORIZON_DAYS));
  return dateYMD <= max.toISOString().slice(0, 10);
}

export type DayAvailability = {
  service: ServiceRow;
  /** ms de início → ids dos barbeiros livres naquele horário (ordem = sort_order) */
  slots: Map<number, string[]>;
  barbers: BarberRow[];
};

/**
 * Disponibilidade de um dia para um serviço, para um barbeiro específico
 * (`barberId`) ou para todos os ativos (`null` = sem preferência).
 * Livre = working_hours − time_blocks (do barbeiro e da loja) − appointments
 * não cancelados. Tudo no fuso de São Paulo.
 */
export async function getDayAvailability({
  serviceId,
  barberId,
  dateYMD,
}: {
  serviceId: string;
  barberId: string | null;
  dateYMD: string;
}): Promise<DayAvailability | { error: string }> {
  if (!isValidYMD(dateYMD) || !isWithinHorizon(dateYMD)) {
    return { error: "data inválida ou fora do período de agendamento" };
  }

  const supabase = createAdminClient();

  const { data: service } = await supabase
    .from("services")
    .select("*")
    .eq("id", serviceId)
    .eq("active", true)
    .maybeSingle<ServiceRow>();
  if (!service) return { error: "serviço não encontrado" };

  let barbersQuery = supabase
    .from("barbers")
    .select("*")
    .eq("active", true)
    .order("sort_order");
  if (barberId) barbersQuery = barbersQuery.eq("id", barberId);
  const { data: barbers } = await barbersQuery.overrideTypes<BarberRow[]>();
  if (!barbers || barbers.length === 0) {
    return { error: "barbeiro não encontrado" };
  }
  const barberIds = barbers.map((b) => b.id);

  const dayStart = fromZonedTime(`${dateYMD}T00:00:00`, SP_TZ);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60_000);
  const weekday = weekdayOf(dateYMD);

  const [{ data: hours }, { data: blocks }, { data: appts }] =
    await Promise.all([
      supabase
        .from("working_hours")
        .select("*")
        .in("barber_id", barberIds)
        .eq("weekday", weekday)
        .overrideTypes<WorkingHoursRow[]>(),
      supabase
        .from("time_blocks")
        .select("*")
        .lt("starts_at", dayEnd.toISOString())
        .gt("ends_at", dayStart.toISOString())
        .overrideTypes<TimeBlockRow[]>(),
      supabase
        .from("appointments")
        .select("*")
        .in("barber_id", barberIds)
        .neq("status", "cancelled")
        .lt("starts_at", dayEnd.toISOString())
        .gt("ends_at", dayStart.toISOString())
        .overrideTypes<AppointmentRow[]>(),
    ]);

  const notBefore = Date.now() + LEAD_TIME_MIN * 60_000;
  const slots = new Map<number, string[]>();

  for (const barber of barbers) {
    const periods: Interval[] = (hours ?? [])
      .filter((h) => h.barber_id === barber.id)
      .map((h) => ({
        start: fromZonedTime(`${dateYMD}T${h.start_time}`, SP_TZ).getTime(),
        end: fromZonedTime(`${dateYMD}T${h.end_time}`, SP_TZ).getTime(),
      }));

    const busy: Interval[] = [
      ...(blocks ?? [])
        .filter((b) => b.barber_id === null || b.barber_id === barber.id)
        .map((b) => ({
          start: new Date(b.starts_at).getTime(),
          end: new Date(b.ends_at).getTime(),
        })),
      ...(appts ?? [])
        .filter((a) => a.barber_id === barber.id)
        .map((a) => ({
          start: new Date(a.starts_at).getTime(),
          end: new Date(a.ends_at).getTime(),
        })),
    ];

    for (const t of computeFreeSlots({
      periods,
      busy,
      durationMin: service.duration_min,
      notBefore,
    })) {
      const list = slots.get(t) ?? [];
      list.push(barber.id);
      slots.set(t, list);
    }
  }

  return { service, slots, barbers };
}

export function slotTimeLabel(epochMs: number): string {
  return formatInTimeZone(new Date(epochMs), SP_TZ, "HH:mm");
}
