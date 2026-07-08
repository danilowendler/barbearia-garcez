"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice, type Service } from "@/lib/data";
import { Reveal } from "@/components/site/reveal";

export function Services({ services }: { services: Service[] }) {
  return (
    <section id="servicos" className="dark relative grain scroll-mt-16 bg-background px-[5%] py-16 text-foreground md:py-24 lg:py-28">
      <div className="mx-auto max-w-[1440px]">
        <Reveal className="mx-auto mb-12 w-full max-w-lg text-center md:mb-16 lg:mb-20">
          <p className="mb-3 text-[13px] font-bold tracking-[1.5px] uppercase text-accent-red md:mb-4">
            Serviços
          </p>
          <h2 className="mb-5 font-display text-4xl font-normal tracking-wide uppercase md:mb-6 md:text-6xl">
            Preço justo, <span className="text-accent-red">navalha afiada.</span>
          </h2>
          <p className="text-base font-light leading-relaxed text-muted-foreground">
            Do clássico ao moderno, cada serviço é executado com a maestria de
            quem conhece o ofício. Sem pressa.
          </p>
        </Reveal>

        <Reveal delay={120} className="border border-border">
          <Tabs
            defaultValue={services[0].slug}
            orientation="vertical"
            className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr]"
          >
            {services.map((service) => (
              <TabsContent
                key={service.slug}
                value={service.slug}
                className="order-2 md:order-none"
              >
                <div className="flex h-full flex-col justify-center p-6 md:p-10 lg:p-16">
                  <p className="mb-4 text-[13px] font-bold tracking-[1.5px] uppercase text-muted-foreground">
                    {service.durationMin} min
                  </p>
                  <h3 className="mb-4 text-2xl font-bold uppercase md:mb-5 md:text-4xl">
                    {service.name}
                  </h3>
                  <p className="max-w-md text-base font-light leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-6 md:mt-8">
                    <span className="text-3xl font-bold">
                      {formatPrice(service.priceCents)}
                    </span>
                    <Link
                      href="/agendar"
                      className="flex items-center gap-1 text-[13px] font-bold tracking-[1.5px] uppercase text-foreground hover:underline"
                    >
                      Agendar
                      <ChevronRight className="size-4 text-accent-red" aria-hidden />
                    </Link>
                  </div>
                </div>
              </TabsContent>
            ))}

            <TabsList className="order-1 grid h-full w-full auto-rows-fr grid-cols-1 rounded-none border-b border-border bg-transparent p-0 md:order-none md:border-b-0 md:border-l">
              {services.map((service) => (
                <TabsTrigger
                  key={service.slug}
                  value={service.slug}
                  className="h-full items-center justify-between rounded-none border-0 border-b border-border px-6 py-4 text-left text-lg font-bold uppercase last:border-b-0 data-active:bg-primary data-active:text-primary-foreground md:px-8 md:py-5 md:text-xl"
                >
                  {service.shortName}
                  <span className="text-sm font-light tracking-normal normal-case opacity-70">
                    {formatPrice(service.priceCents)}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </Reveal>
      </div>
    </section>
  );
}
