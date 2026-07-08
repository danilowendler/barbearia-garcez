"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInAction, type FormState } from "@/lib/admin/actions";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    signInAction,
    {},
  );

  return (
    <div className="dark flex min-h-screen items-center justify-center bg-background px-[5%] text-foreground">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-[10px] font-normal tracking-[0.35em] uppercase text-muted-foreground">
            Barbearia
          </p>
          <p className="text-2xl font-bold tracking-[0.08em] uppercase">
            Garcez
          </p>
          <p className="mt-2 text-sm font-light text-muted-foreground">
            Painel do administrador
          </p>
        </div>

        <form action={formAction} className="border border-border bg-card p-6">
          {state.error && (
            <p
              role="alert"
              className="mb-4 border border-destructive bg-destructive/10 p-3 text-sm text-destructive"
            >
              {state.error}
            </p>
          )}
          <div className="mb-4">
            <Label htmlFor="email" className="mb-2 text-[12px] font-bold tracking-[1px] uppercase">
              E-mail
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="username"
              className="h-12 rounded-none"
            />
          </div>
          <div className="mb-6">
            <Label htmlFor="password" className="mb-2 text-[12px] font-bold tracking-[1px] uppercase">
              Senha
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="h-12 rounded-none"
            />
          </div>
          <Button
            type="submit"
            disabled={pending}
            className="h-12 w-full text-sm font-bold tracking-[0.5px] uppercase"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
