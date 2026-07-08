"use client";

import { useScrollProgress } from "@/components/site/scroll-art";
import { cn } from "@/lib/utils";

/** Faixa tricolor do barber pole (assinatura visual do M8). */
export function PoleStripe({ className }: { className?: string }) {
  return <div aria-hidden className={cn("pole-stripe h-1 w-full", className)} />;
}

/**
 * Barber pole faux-3D: listras tricolor girando (ilusão clássica — o pole
 * físico também é 2D atrás de vidro), sombreamento cilíndrico e tampas
 * cromadas. Gira sozinho em loop; o scroll acelera o giro (--progress).
 */
export function BarberPole({ className }: { className?: string }) {
  const ref = useScrollProgress<HTMLDivElement>();

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn("scroll-art flex w-fit flex-col items-center", className)}
    >
      <div className="pole-dome w-16" />
      <div className="pole-cap w-20" />
      <div className="pole-glass h-56 w-14 md:h-72 md:w-16">
        <div className="pole-stripes" />
        <div className="pole-shade" />
      </div>
      <div className="pole-cap w-20" />
    </div>
  );
}
