"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTimeBlockAction, type FormState } from "@/lib/admin/actions";
import type { BookingBarber } from "@/lib/booking/types";

const selectClass =
  "h-12 w-full border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring";

export function BlockForm({ barbers }: { barbers: BookingBarber[] }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createTimeBlockAction,
    {},
  );

  return (
    <form
      action={formAction}
      className="grid grid-cols-1 gap-4 border border-border bg-card p-6 sm:grid-cols-2 lg:grid-cols-6"
    >
      {state.error && (
        <p
          role="alert"
          className="border border-destructive bg-destructive/10 p-3 text-sm text-destructive sm:col-span-2 lg:col-span-6"
        >
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="border border-success/50 bg-success/10 p-3 text-sm text-success sm:col-span-2 lg:col-span-6">
          Bloqueio criado.
        </p>
      )}

      <div className="lg:col-span-2">
        <Label htmlFor="barber_id" className="mb-2 text-[12px] font-bold tracking-[1px] uppercase">
          Barbeiro
        </Label>
        <select id="barber_id" name="barber_id" className={selectClass}>
          <option value="">Loja toda</option>
          {barbers.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="date" className="mb-2 text-[12px] font-bold tracking-[1px] uppercase">
          Data
        </Label>
        <Input id="date" name="date" type="date" required className="h-12 rounded-none" />
      </div>

      <div>
        <Label htmlFor="start" className="mb-2 text-[12px] font-bold tracking-[1px] uppercase">
          Início
        </Label>
        <Input id="start" name="start" type="time" required className="h-12 rounded-none" />
      </div>

      <div>
        <Label htmlFor="end" className="mb-2 text-[12px] font-bold tracking-[1px] uppercase">
          Fim
        </Label>
        <Input id="end" name="end" type="time" required className="h-12 rounded-none" />
      </div>

      <div className="flex items-end">
        <Button
          type="submit"
          disabled={pending}
          className="h-12 w-full text-xs font-bold tracking-[0.5px] uppercase"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            "Bloquear"
          )}
        </Button>
      </div>

      <div className="sm:col-span-2 lg:col-span-6">
        <Label htmlFor="reason" className="mb-2 text-[12px] font-bold tracking-[1px] uppercase">
          Motivo (opcional)
        </Label>
        <Input
          id="reason"
          name="reason"
          maxLength={200}
          placeholder="Almoço, folga, feriado..."
          className="h-12 rounded-none"
        />
      </div>
    </form>
  );
}
