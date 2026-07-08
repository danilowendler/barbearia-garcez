import Link from "next/link";
import { MapPin, MessageCircle } from "lucide-react";

// lucide-react removeu ícones de marca; glifo do Instagram inline.
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}
import { Logo } from "@/components/site/logo";
import { navLinks, site, waLink } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-secondary text-foreground">
      <div className="mx-auto max-w-[1440px] px-[5%] py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <Logo className="mb-5" />
            <p className="max-w-xs text-sm font-light leading-relaxed text-muted-foreground">
              Tradição e precisão em cada detalhe. O degradê perfeito te espera
              na {site.address}.
            </p>
          </div>

          <div>
            <h2 className="mb-4 text-[13px] font-bold tracking-[1.5px] uppercase">
              Páginas
            </h2>
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-block py-1 text-sm font-light text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/agendar"
                  className="inline-block py-1 text-sm font-light text-muted-foreground transition-colors hover:text-foreground"
                >
                  Agendamento
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-[13px] font-bold tracking-[1.5px] uppercase">
              Contato
            </h2>
            <ul className="space-y-1">
              <li>
                <a
                  href={waLink("Olá! Vim pelo site da Barbearia Garcez.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 py-1 text-sm font-light text-muted-foreground transition-colors hover:text-foreground"
                >
                  <MessageCircle className="size-4" aria-hidden />
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={site.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 py-1 text-sm font-light text-muted-foreground transition-colors hover:text-foreground"
                >
                  <MapPin className="size-4" aria-hidden />
                  {site.address}
                </a>
              </li>
              <li>
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 py-1 text-sm font-light text-muted-foreground transition-colors hover:text-foreground"
                >
                  <InstagramIcon className="size-4" />
                  {site.instagramHandle}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-[13px] font-bold tracking-[1.5px] uppercase">
              Horários
            </h2>
            <ul className="space-y-1">
              {site.openingHours.map((item) => (
                <li
                  key={item.days}
                  className="flex justify-between gap-4 py-1 text-sm font-light text-muted-foreground"
                >
                  <span>{item.days}</span>
                  <span>{item.hours}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <p className="text-sm font-light text-muted-foreground">
            © {new Date().getFullYear()} {site.name}. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
