import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOutAction } from "@/lib/admin/actions";
import { getAuthUser } from "@/lib/supabase/ssr";

const nav = [
  { label: "Agenda", href: "/admin" },
  { label: "Bloqueios", href: "/admin/bloqueios" },
  { label: "Serviços", href: "/admin/servicos" },
];

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user } = await getAuthUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="dark flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-[4%]">
          <Link href="/admin" className="flex flex-col leading-none">
            <span className="text-[9px] font-normal tracking-[0.35em] uppercase text-muted-foreground">
              Barbearia Garcez
            </span>
            <span className="text-lg font-bold tracking-[0.08em] uppercase">
              Admin
            </span>
          </Link>
          <nav className="flex items-center gap-1 md:gap-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-2 py-2 text-xs font-bold tracking-[1px] uppercase text-muted-foreground transition-colors hover:text-foreground md:px-3 md:text-[13px]"
              >
                {item.label}
              </Link>
            ))}
            <form action={signOutAction}>
              <button
                type="submit"
                title="Sair"
                className="flex items-center gap-1 px-2 py-2 text-xs font-bold tracking-[1px] uppercase text-muted-foreground transition-colors hover:text-destructive md:px-3"
              >
                <LogOut className="size-4" aria-hidden />
                <span className="hidden md:inline">Sair</span>
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-[4%] py-8">
        {children}
      </main>
    </div>
  );
}
