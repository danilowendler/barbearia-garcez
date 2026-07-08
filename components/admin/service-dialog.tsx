"use client";

import { useState, useTransition } from "react";
import { Loader2, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveServiceAction, type FormState } from "@/lib/admin/actions";
import type { ServiceRow } from "@/lib/supabase/types";

export function ServiceDialog({ service }: { service?: ServiceRow }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<FormState>({});
  const [pending, startTransition] = useTransition();

  function formAction(formData: FormData) {
    startTransition(async () => {
      const result = await saveServiceAction({}, formData);
      setState(result);
      if (result.ok) setOpen(false);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setState({});
      }}
    >
      <DialogTrigger
        render={
          service ? (
            <Button
              size="sm"
              variant="outline"
              className="text-xs font-bold uppercase"
            />
          ) : (
            <Button size="sm" className="text-xs font-bold uppercase" />
          )
        }
      >
        {service ? (
          <>
            <Pencil className="size-3.5" aria-hidden />
            Editar
          </>
        ) : (
          <>
            <Plus className="size-4" aria-hidden />
            Novo serviço
          </>
        )}
      </DialogTrigger>
      <DialogContent className="rounded-none sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold uppercase">
            {service ? "Editar serviço" : "Novo serviço"}
          </DialogTitle>
        </DialogHeader>

        <form action={formAction} className="grid grid-cols-2 gap-4">
          {state.error && (
            <p
              role="alert"
              className="col-span-2 border border-destructive bg-destructive/10 p-3 text-sm text-destructive"
            >
              {state.error}
            </p>
          )}
          {service && <input type="hidden" name="id" value={service.id} />}

          <div className="col-span-2">
            <Label htmlFor="svc-name" className="mb-2 text-[12px] font-bold tracking-[1px] uppercase">
              Nome
            </Label>
            <Input
              id="svc-name"
              name="name"
              required
              maxLength={80}
              defaultValue={service?.name}
              className="h-11 rounded-none"
            />
          </div>

          <div>
            <Label htmlFor="svc-short" className="mb-2 text-[12px] font-bold tracking-[1px] uppercase">
              Nome curto
            </Label>
            <Input
              id="svc-short"
              name="short_name"
              required
              maxLength={24}
              defaultValue={service?.short_name}
              placeholder="Degradê"
              className="h-11 rounded-none"
            />
          </div>

          <div>
            <Label htmlFor="svc-sort" className="mb-2 text-[12px] font-bold tracking-[1px] uppercase">
              Ordem
            </Label>
            <Input
              id="svc-sort"
              name="sort_order"
              type="number"
              min={0}
              max={99}
              defaultValue={service?.sort_order ?? 0}
              className="h-11 rounded-none"
            />
          </div>

          <div>
            <Label htmlFor="svc-price" className="mb-2 text-[12px] font-bold tracking-[1px] uppercase">
              Preço (R$)
            </Label>
            <Input
              id="svc-price"
              name="price"
              required
              inputMode="decimal"
              pattern="[0-9]+([.,][0-9]{1,2})?"
              defaultValue={service ? (service.price_cents / 100).toFixed(2) : ""}
              placeholder="35,00"
              className="h-11 rounded-none"
            />
          </div>

          <div>
            <Label htmlFor="svc-duration" className="mb-2 text-[12px] font-bold tracking-[1px] uppercase">
              Duração (min)
            </Label>
            <Input
              id="svc-duration"
              name="duration"
              required
              type="number"
              min={5}
              max={480}
              step={5}
              defaultValue={service?.duration_min ?? 30}
              className="h-11 rounded-none"
            />
          </div>

          <div className="col-span-2">
            <Label htmlFor="svc-desc" className="mb-2 text-[12px] font-bold tracking-[1px] uppercase">
              Descrição
            </Label>
            <Textarea
              id="svc-desc"
              name="description"
              maxLength={300}
              rows={3}
              defaultValue={service?.description ?? ""}
              className="rounded-none"
            />
          </div>

          <label className="col-span-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="active"
              defaultChecked={service?.active ?? true}
              className="size-4 accent-primary"
            />
            Serviço ativo (visível no site)
          </label>

          <div className="col-span-2 flex justify-end gap-2">
            <Button
              type="submit"
              disabled={pending}
              className="h-11 px-6 text-xs font-bold tracking-[0.5px] uppercase"
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                "Salvar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
