"use server";

import { fromZonedTime } from "date-fns-tz";
import {
  getDayAvailability,
  slotTimeLabel,
  SP_TZ,
} from "@/lib/booking/availability";
import type {
  CreateBookingInput,
  CreateBookingResult,
  SlotsResult,
} from "@/lib/booking/types";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Horários livres ("HH:mm") para serviço + barbeiro (ou null) + data. */
export async function getSlotsAction(input: {
  serviceId: string;
  barberId: string | null;
  dateYMD: string;
}): Promise<SlotsResult> {
  if (
    !UUID_RE.test(input.serviceId) ||
    (input.barberId !== null && !UUID_RE.test(input.barberId))
  ) {
    return { ok: false, error: "entrada inválida" };
  }

  const result = await getDayAvailability(input);
  if ("error" in result) return { ok: false, error: result.error };

  const times = [...result.slots.keys()].sort((a, b) => a - b).map(slotTimeLabel);
  return { ok: true, times };
}

/**
 * Cria o agendamento. Toda a validação acontece aqui (a action é um endpoint
 * público); a constraint de exclusão do Postgres é a garantia final contra
 * double-booking em corrida.
 */
export async function createBookingAction(
  input: CreateBookingInput,
): Promise<CreateBookingResult> {
  const invalid = (message: string): CreateBookingResult => ({
    ok: false,
    error: "invalid_input",
    message,
  });

  if (typeof input !== "object" || input === null) return invalid("Dados inválidos.");

  const customerName = String(input.customerName ?? "").trim();
  const customerPhone = String(input.customerPhone ?? "").replace(/\D/g, "");

  if (customerName.length < 2 || customerName.length > 120) {
    return invalid("Informe seu nome completo.");
  }
  if (customerPhone.length < 10 || customerPhone.length > 13) {
    return invalid("Informe um WhatsApp válido com DDD.");
  }
  if (!UUID_RE.test(input.serviceId)) return invalid("Serviço inválido.");
  if (input.barberId !== null && !UUID_RE.test(input.barberId)) {
    return invalid("Barbeiro inválido.");
  }
  if (!TIME_RE.test(input.time)) return invalid("Horário inválido.");

  const availability = await getDayAvailability({
    serviceId: input.serviceId,
    barberId: input.barberId,
    dateYMD: input.dateYMD,
  });
  if ("error" in availability) {
    return { ok: false, error: "unavailable", message: availability.error };
  }

  // Anti-abuso: no máximo 3 agendamentos futuros ativos por telefone.
  const supabaseGuard = createAdminClient();
  const { count } = await supabaseGuard
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("customer_phone", customerPhone)
    .neq("status", "cancelled")
    .gte("starts_at", new Date().toISOString());
  if ((count ?? 0) >= 3) {
    return {
      ok: false,
      error: "invalid_input",
      message:
        "Esse WhatsApp já tem 3 horários marcados. Fale com a gente para ajustar sua agenda.",
    };
  }

  const startsAt = fromZonedTime(
    `${input.dateYMD}T${input.time}:00`,
    SP_TZ,
  );
  const freeBarberIds = availability.slots.get(startsAt.getTime());
  if (!freeBarberIds || freeBarberIds.length === 0) {
    return {
      ok: false,
      error: "slot_taken",
      message:
        "Esse horário acabou de ser preenchido. Escolha outro, por favor.",
    };
  }

  // Sem preferência → primeiro barbeiro livre (já em ordem de sort_order)
  const barberId = input.barberId ?? freeBarberIds[0];
  const barber = availability.barbers.find((b) => b.id === barberId);
  if (!barber || !freeBarberIds.includes(barberId)) {
    return {
      ok: false,
      error: "slot_taken",
      message:
        "Esse horário acabou de ser preenchido. Escolha outro, por favor.",
    };
  }

  const endsAt = new Date(
    startsAt.getTime() + availability.service.duration_min * 60_000,
  );

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("appointments")
    .insert({
      barber_id: barberId,
      service_id: availability.service.id,
      customer_name: customerName,
      customer_phone: customerPhone,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
    })
    .select("id")
    .single<{ id: string }>();

  if (error) {
    // 23P01 = exclusion_violation (corrida perdida para outro cliente)
    if (error.code === "23P01") {
      return {
        ok: false,
        error: "slot_taken",
        message:
          "Esse horário acabou de ser preenchido. Escolha outro, por favor.",
      };
    }
    console.error("[booking] insert falhou:", error.code, error.message);
    return {
      ok: false,
      error: "unavailable",
      message: "Não foi possível concluir o agendamento. Tente novamente.",
    };
  }

  return {
    ok: true,
    booking: {
      id: data.id,
      serviceName: availability.service.name,
      barberName: barber.name,
      dateYMD: input.dateYMD,
      time: input.time,
      priceCents: availability.service.price_cents,
      durationMin: availability.service.duration_min,
    },
  };
}
