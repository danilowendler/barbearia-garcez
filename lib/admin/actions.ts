"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { fromZonedTime } from "date-fns-tz";
import { createSSRClient, getAuthUser } from "@/lib/supabase/ssr";
import type { AppointmentStatus } from "@/lib/supabase/types";

const SP_TZ = "America/Sao_Paulo";

export type FormState = { error?: string; ok?: boolean };

// ── Auth ────────────────────────────────────────────────────────────────────

export async function signInAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Informe e-mail e senha." };

  const supabase = await createSSRClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "E-mail ou senha incorretos." };

  redirect("/admin");
}

export async function signOutAction() {
  const supabase = await createSSRClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

async function requireUser() {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/admin/login");
  return supabase;
}

// ── Agenda ──────────────────────────────────────────────────────────────────

const ALLOWED_STATUS: AppointmentStatus[] = [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
];

export async function setAppointmentStatusAction(
  id: string,
  status: AppointmentStatus,
) {
  if (!ALLOWED_STATUS.includes(status)) return;
  const supabase = await requireUser();
  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id);
  if (error) console.error("[admin] status:", error.message);
  revalidatePath("/admin");
}

// ── Bloqueios ───────────────────────────────────────────────────────────────

export async function createTimeBlockAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await requireUser();

  const barberRaw = String(formData.get("barber_id") ?? "");
  const dateYMD = String(formData.get("date") ?? "");
  const startTime = String(formData.get("start") ?? "");
  const endTime = String(formData.get("end") ?? "");
  const reason = String(formData.get("reason") ?? "").trim() || null;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateYMD)) return { error: "Data inválida." };
  if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
    return { error: "Horário inválido." };
  }
  if (startTime >= endTime) {
    return { error: "O início precisa ser antes do fim." };
  }

  const { error } = await supabase.from("time_blocks").insert({
    barber_id: barberRaw || null,
    starts_at: fromZonedTime(`${dateYMD}T${startTime}:00`, SP_TZ).toISOString(),
    ends_at: fromZonedTime(`${dateYMD}T${endTime}:00`, SP_TZ).toISOString(),
    reason,
  });
  if (error) return { error: "Não foi possível criar o bloqueio." };

  revalidatePath("/admin/bloqueios");
  return { ok: true };
}

export async function deleteTimeBlockAction(id: string) {
  const supabase = await requireUser();
  const { error } = await supabase.from("time_blocks").delete().eq("id", id);
  if (error) console.error("[admin] bloqueio:", error.message);
  revalidatePath("/admin/bloqueios");
}

// ── Serviços ────────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

export async function saveServiceAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await requireUser();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const shortName = String(formData.get("short_name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const priceRaw = String(formData.get("price") ?? "").replace(",", ".");
  const durationRaw = String(formData.get("duration") ?? "");
  const sortRaw = String(formData.get("sort_order") ?? "0");
  const active = formData.get("active") === "on";

  if (name.length < 1 || name.length > 80) return { error: "Nome inválido." };
  if (shortName.length < 1 || shortName.length > 24) {
    return { error: "Nome curto inválido (máx. 24 caracteres)." };
  }
  const priceCents = Math.round(Number(priceRaw) * 100);
  if (!Number.isFinite(priceCents) || priceCents < 0 || priceCents > 100_000_00) {
    return { error: "Preço inválido." };
  }
  const duration = Number(durationRaw);
  if (!Number.isInteger(duration) || duration < 5 || duration > 480) {
    return { error: "Duração inválida (5 a 480 minutos)." };
  }
  const sortOrder = Number.isInteger(Number(sortRaw)) ? Number(sortRaw) : 0;

  const values = {
    name,
    short_name: shortName,
    description,
    price_cents: priceCents,
    duration_min: duration,
    sort_order: sortOrder,
    active,
  };

  const { error } = id
    ? await supabase.from("services").update(values).eq("id", id)
    : await supabase
        .from("services")
        .insert({ ...values, slug: slugify(name) || `servico-${Date.now()}` });

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Já existe um serviço com esse nome."
          : "Não foi possível salvar o serviço.",
    };
  }

  revalidatePath("/admin/servicos");
  revalidatePath("/");
  return { ok: true };
}

export async function toggleServiceActiveAction(id: string, active: boolean) {
  const supabase = await requireUser();
  const { error } = await supabase
    .from("services")
    .update({ active })
    .eq("id", id);
  if (error) console.error("[admin] serviço:", error.message);
  revalidatePath("/admin/servicos");
  revalidatePath("/");
}
