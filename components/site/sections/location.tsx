import { Clock, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site, waLink } from "@/lib/site";
import { Reveal } from "@/components/site/reveal";

const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(
  `${site.name}, ${site.address}`,
)}&output=embed`;

export function Location() {
  return (
    <section
      id="localizacao"
      className="scroll-mt-16 bg-background px-[5%] py-16 md:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-[1440px]">
        <Reveal className="mb-12 max-w-lg md:mb-16 lg:mb-20">
          <p className="mb-3 text-[13px] font-bold tracking-[1.5px] uppercase text-accent-red md:mb-4">
            Localização
          </p>
          <h2 className="mb-5 font-display text-4xl font-normal tracking-wide uppercase md:mb-6 md:text-6xl">
            Encontre-nos
          </h2>
          <p className="text-base font-light leading-relaxed text-muted-foreground">
            Estamos de portas abertas no coração do bairro.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-[0.6fr_1fr] lg:gap-20">
          <Reveal className="flex flex-col divide-y divide-border">
            <div className="flex gap-4 py-6 first:pt-0">
              <MapPin className="mt-1 size-5 shrink-0 text-primary" aria-hidden />
              <div>
                <h3 className="mb-2 text-lg font-bold uppercase">
                  {site.name}
                </h3>
                <p className="mb-4 text-sm font-light text-muted-foreground">
                  {site.address}
                </p>
                <a
                  href={site.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] font-bold tracking-[1.5px] uppercase text-primary hover:underline"
                >
                  Ver no mapa
                </a>
              </div>
            </div>

            <div className="flex gap-4 py-6">
              <Clock className="mt-1 size-5 shrink-0 text-primary" aria-hidden />
              <div>
                <h3 className="mb-2 text-lg font-bold uppercase">Horários</h3>
                <ul className="space-y-1 text-sm font-light text-muted-foreground">
                  {site.openingHours.map((item) => (
                    <li key={item.days} className="flex gap-4">
                      <span className="w-20 shrink-0">{item.days}</span>
                      <span>{item.hours}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-4 py-6 last:pb-0">
              <MessageCircle
                className="mt-1 size-5 shrink-0 text-primary"
                aria-hidden
              />
              <div>
                <h3 className="mb-2 text-lg font-bold uppercase">Contato</h3>
                <p className="mb-4 text-sm font-light text-muted-foreground">
                  Chama no WhatsApp para tirar dúvidas ou agendar.
                </p>
                <Button
                  nativeButton={false}
                  render={
                    <a
                      href={waLink(
                        "Olá! Quero agendar um horário na Barbearia Garcez.",
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                  size="lg"
                  className="h-12 px-8 text-sm font-bold tracking-[0.5px] uppercase"
                >
                  Falar agora
                </Button>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120} className="aspect-[3/2] w-full border border-border">
            <iframe
              src={mapEmbedUrl}
              title={`Mapa — ${site.name}, ${site.address}`}
              className="size-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
