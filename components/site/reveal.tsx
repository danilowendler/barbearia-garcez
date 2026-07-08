"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Scroll reveal: filho entra com fade + translateY sutil quando cruza a
 * viewport (uma vez só). Todo o movimento é CSS (.reveal em globals.css);
 * com prefers-reduced-motion o conteúdo fica sempre visível.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number; // ms — para stagger entre itens irmãos
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.setAttribute("data-revealed", "");
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal", className)}
      style={delay ? { "--reveal-delay": `${delay}ms` } as React.CSSProperties : undefined}
    >
      {children}
    </div>
  );
}
