import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Barbearia Garcez — Início"
      className={cn("flex flex-col leading-none", className)}
    >
      <span className="text-[10px] font-normal tracking-[0.35em] uppercase text-muted-foreground">
        Barbearia
      </span>
      <span className="font-display text-2xl font-normal tracking-[0.08em] uppercase">
        Garcez
      </span>
    </Link>
  );
}
