"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowLeft, Check, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBookingAction, getSlotsAction } from "@/lib/booking/actions";
import type {
  BookingBarber,
  BookingService,
  BookingSummary,
} from "@/lib/booking/types";
import { formatPrice } from "@/lib/data";
import { cn } from "@/lib/utils";
import { waLink } from "@/lib/site";

export type WizardDay = {
  ymd: string;
  weekday: number; // 0 = domingo
  dayName: string; // "Hoje", "seg", ...
  dayLabel: string; // "8 jul"
};

type Props = {
  services: BookingService[];
  barbers: BookingBarber[];
  workingWeekdays: Record<string, number[]>;
  days: WizardDay[];
};

const STEPS = ["Serviço", "Barbeiro", "Data e hora", "Seus dados"] as const;

function formatBRPhone(digits: string): string {
  const d = digits.slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function formatDayLong(ymd: string): string {
  return new Date(`${ymd}T12:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  });
}

const tileClass = (selected: boolean) =>
  cn(
    "w-full border p-4 text-left transition-colors",
    selected
      ? "border-2 border-primary p-[15px]"
      : "border-input hover:border-foreground",
  );

export function BookingWizard({
  services,
  barbers,
  workingWeekdays,
  days,
}: Props) {
  const [step, setStep] = useState(0);
  const [service, setService] = useState<BookingService | null>(null);
  const [barberId, setBarberId] = useState<string | null | undefined>(
    undefined,
  ); // undefined = não escolhido; null = sem preferência
  const [dateYMD, setDateYMD] = useState<string | null>(null);
  const [times, setTimes] = useState<string[] | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingSummary | null>(null);
  const [loadingSlots, startSlots] = useTransition();
  const [submitting, startSubmit] = useTransition();

  const availableWeekdays = new Set(
    barberId
      ? (workingWeekdays[barberId] ?? [])
      : Object.values(workingWeekdays).flat(),
  );

  function loadSlots(serviceId: string, barber: string | null, ymd: string) {
    setTimes(null);
    setTime(null);
    setError(null);
    startSlots(async () => {
      const result = await getSlotsAction({
        serviceId,
        barberId: barber,
        dateYMD: ymd,
      });
      if (result.ok) {
        setTimes(result.times);
      } else {
        setTimes([]);
        setError("Não foi possível carregar os horários. Tente novamente.");
      }
    });
  }

  function submit() {
    if (!service || barberId === undefined || !dateYMD || !time) return;
    setError(null);
    startSubmit(async () => {
      const result = await createBookingAction({
        serviceId: service.id,
        barberId,
        dateYMD,
        time,
        customerName: name,
        customerPhone: phone,
      });
      if (result.ok) {
        setBooking(result.booking);
      } else if (result.error === "slot_taken") {
        setError(result.message);
        setStep(2);
        loadSlots(service.id, barberId, dateYMD);
      } else {
        setError(result.message);
      }
    });
  }

  // ── Tela de sucesso ────────────────────────────────────────────────────
  if (booking) {
    const message = `Olá! Sou ${name.trim()}. Agendei ${booking.serviceName} com ${booking.barberName} para ${formatDayLong(booking.dateYMD)} às ${booking.time}. Aguardo a confirmação!`;
    return (
      <div className="border border-border p-8 md:p-12">
        <div className="mb-6 flex size-12 items-center justify-center bg-primary text-primary-foreground">
          <Check className="size-6" aria-hidden />
        </div>
        <h2 className="mb-2 font-display text-3xl font-normal tracking-wide uppercase md:text-4xl">
          Horário reservado!
        </h2>
        <p className="mb-8 text-base font-light text-muted-foreground">
          Seu pedido foi registrado e aguarda confirmação da barbearia.
        </p>
        <dl className="mb-8 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2">
          {[
            ["Serviço", booking.serviceName],
            ["Barbeiro", booking.barberName],
            ["Data", formatDayLong(booking.dateYMD)],
            [
              "Horário",
              `${booking.time} · ${booking.durationMin} min · ${formatPrice(booking.priceCents)}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="bg-background p-4">
              <dt className="text-[11px] font-bold tracking-[1.5px] uppercase text-muted-foreground">
                {label}
              </dt>
              <dd className="mt-1 text-sm font-bold">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-wrap gap-4">
          <Button
            nativeButton={false}
            render={
              <a
                href={waLink(message)}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            size="lg"
            className="h-12 px-8 text-sm font-bold tracking-[0.5px] uppercase"
          >
            Confirmar no WhatsApp
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/" />}
            size="lg"
            variant="outline"
            className="h-12 px-8 text-sm font-bold tracking-[0.5px] uppercase"
          >
            Voltar ao início
          </Button>
        </div>
      </div>
    );
  }

  // ── Wizard ─────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Progresso */}
      <ol className="mb-8 flex flex-wrap gap-x-6 gap-y-2 border-b border-border pb-4">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={cn(
              "text-[12px] font-bold tracking-[1.5px] uppercase",
              i === step
                ? "text-primary"
                : i < step
                  ? "text-foreground"
                  : "text-muted-foreground",
            )}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      {step > 0 && (
        <button
          type="button"
          onClick={() => {
            setError(null);
            setStep(step - 1);
          }}
          className="mb-6 flex items-center gap-1 text-[13px] font-bold tracking-[1.5px] uppercase text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Voltar
        </button>
      )}

      {error && (
        <p
          role="alert"
          className="mb-6 border border-destructive bg-destructive/5 p-4 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      {/* 1 — Serviço */}
      {step === 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {services.map((s) => (
            <button
              key={s.id}
              type="button"
              className={tileClass(service?.id === s.id)}
              onClick={() => {
                setService(s);
                setTimes(null);
                setTime(null);
                setStep(1);
              }}
            >
              <span className="mb-1 block text-base font-bold uppercase">
                {s.name}
              </span>
              <span className="mb-3 block text-sm font-light text-muted-foreground">
                {s.description}
              </span>
              <span className="text-sm font-bold">
                {formatPrice(s.priceCents)}
                <span className="ml-2 font-light text-muted-foreground">
                  {s.durationMin} min
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      {/* 2 — Barbeiro */}
      {step === 1 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            type="button"
            className={tileClass(barberId === null)}
            onClick={() => {
              setBarberId(null);
              setTimes(null);
              setTime(null);
              setStep(2);
            }}
          >
            <span className="mb-1 block text-base font-bold uppercase">
              Sem preferência
            </span>
            <span className="block text-sm font-light text-muted-foreground">
              O primeiro barbeiro livre no horário escolhido
            </span>
          </button>
          {barbers.map((b) => (
            <button
              key={b.id}
              type="button"
              className={tileClass(barberId === b.id)}
              onClick={() => {
                setBarberId(b.id);
                setTimes(null);
                setTime(null);
                setStep(2);
              }}
            >
              <span className="mb-1 block text-base font-bold uppercase">
                {b.name}
              </span>
              <span className="block text-sm font-light text-muted-foreground">
                Barbeiro
              </span>
            </button>
          ))}
        </div>
      )}

      {/* 3 — Data e hora */}
      {step === 2 && service && barberId !== undefined && (
        <div>
          <p className="mb-3 text-[13px] font-bold tracking-[1.5px] uppercase">
            Escolha o dia
          </p>
          <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
            {days.map((d) => {
              const closed = !availableWeekdays.has(d.weekday);
              return (
                <button
                  key={d.ymd}
                  type="button"
                  disabled={closed}
                  className={cn(
                    "flex min-w-16 shrink-0 flex-col items-center border px-3 py-2",
                    dateYMD === d.ymd
                      ? "border-2 border-primary px-[11px] py-[7px]"
                      : "border-input hover:border-foreground",
                    closed && "cursor-not-allowed opacity-35 hover:border-input",
                  )}
                  onClick={() => {
                    setDateYMD(d.ymd);
                    loadSlots(service.id, barberId, d.ymd);
                  }}
                >
                  <span className="text-[11px] font-bold tracking-[1px] uppercase">
                    {d.dayName}
                  </span>
                  <span className="text-sm font-light">{d.dayLabel}</span>
                </button>
              );
            })}
          </div>

          {dateYMD && (
            <>
              <p className="mb-3 text-[13px] font-bold tracking-[1.5px] uppercase">
                Escolha o horário
              </p>
              {loadingSlots ? (
                <p className="flex items-center gap-2 text-sm font-light text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Buscando horários livres...
                </p>
              ) : times && times.length > 0 ? (
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {times.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={cn(
                        "border py-2 text-sm font-bold",
                        time === t
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input hover:border-foreground",
                      )}
                      onClick={() => {
                        setTime(t);
                        setStep(3);
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              ) : times ? (
                <p className="text-sm font-light text-muted-foreground">
                  Nenhum horário livre neste dia. Tente outra data.
                </p>
              ) : null}
            </>
          )}
        </div>
      )}

      {/* 4 — Seus dados */}
      {step === 3 && service && dateYMD && time && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="max-w-md"
        >
          <div className="mb-6 border border-border p-4 text-sm">
            <span className="font-bold uppercase">{service.name}</span>
            <span className="font-light text-muted-foreground">
              {" "}
              · {formatDayLong(dateYMD)} às {time} ·{" "}
              {formatPrice(service.priceCents)}
            </span>
          </div>

          <div className="mb-4">
            <Label htmlFor="nome" className="mb-2 text-[13px] font-bold tracking-[1px] uppercase">
              Seu nome
            </Label>
            <Input
              id="nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={120}
              autoComplete="name"
              placeholder="Nome e sobrenome"
              className="h-12 rounded-none"
            />
          </div>

          <div className="mb-8">
            <Label htmlFor="whatsapp" className="mb-2 text-[13px] font-bold tracking-[1px] uppercase">
              Seu WhatsApp
            </Label>
            <Input
              id="whatsapp"
              value={formatBRPhone(phone)}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
              required
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="(11) 98765-4321"
              className="h-12 rounded-none"
            />
            <p className="mt-2 text-xs font-light text-muted-foreground">
              Usamos só para confirmar seu horário. Nada de spam.
            </p>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={submitting || name.trim().length < 2 || phone.length < 10}
            className="h-12 w-full text-sm font-bold tracking-[0.5px] uppercase sm:w-auto sm:px-10"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Reservando...
              </>
            ) : (
              <>
                Confirmar agendamento
                <ChevronRight className="size-4" aria-hidden />
              </>
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
