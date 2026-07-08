"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { navLinks } from "@/lib/site";

const SECTION_IDS = ["servicos", "galeria", "produtos", "sobre", "localizacao"];

/** Seção visível no momento → link ativo (scrollspy). */
function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (sections.length === 0) return;

    const visible = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.intersectionRatio);
          } else {
            visible.delete(entry.target.id);
          }
        }
        let best: string | null = null;
        let bestRatio = 0;
        for (const [id, ratio] of visible) {
          if (ratio > bestRatio) {
            best = id;
            bestRatio = ratio;
          }
        }
        setActive(best);
      },
      { rootMargin: "-64px 0px -40% 0px", threshold: [0.1, 0.3, 0.6] },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [enabled]);

  // fora da home o spy não vale — deriva em vez de resetar via setState
  return enabled ? active : null;
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const active = useActiveSection(pathname === "/");

  const isActive = (href: string) => {
    const hash = href.split("#")[1];
    if (hash) return active === hash;
    return pathname === "/" && active === null;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <nav className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-[5%]">
        <Logo />

        {/* Desktop */}
        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "px-4 py-2 text-sm tracking-[0.3px] transition-colors hover:text-primary",
                  isActive(link.href)
                    ? "font-bold text-primary"
                    : "text-foreground",
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden lg:block">
          <Button
            nativeButton={false}
            render={<Link href="/agendar" />}
            size="lg"
            className="h-12 px-8 text-sm font-bold tracking-[0.5px] uppercase"
          >
            Agendar horário
          </Button>
        </div>

        {/* Mobile trigger */}
        <button
          type="button"
          className="flex size-12 items-center justify-center lg:hidden"
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </nav>

      {/* Mobile menu — folha em tela cheia */}
      {open && (
        <div
          id="menu-mobile"
          className="fixed inset-x-0 top-16 bottom-0 z-50 flex flex-col overflow-y-auto bg-background px-[5%] pb-8 lg:hidden"
        >
          <ul className="flex flex-col divide-y divide-border">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-4 text-base"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Button
            nativeButton={false}
            render={<Link href="/agendar" onClick={() => setOpen(false)} />}
            size="lg"
            className="mt-6 h-12 w-full text-sm font-bold tracking-[0.5px] uppercase"
          >
            Agendar horário
          </Button>
        </div>
      )}
    </header>
  );
}
