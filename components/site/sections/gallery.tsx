"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { galleryImages } from "@/lib/data";
import { Reveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

const slides = galleryImages.slice(0, 4);

export function Gallery() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <section
      id="galeria"
      className="scroll-mt-16 bg-secondary px-[5%] py-16 md:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-[1440px]">
        <Reveal className="mx-auto mb-12 max-w-lg text-center md:mb-16 lg:mb-20">
          <p className="mb-3 text-[13px] font-bold tracking-[1.5px] uppercase text-primary md:mb-4">
            Galeria
          </p>
          <h2 className="mb-5 font-display text-4xl font-normal tracking-wide uppercase md:mb-6 md:text-6xl">
            Trabalhos recentes
          </h2>
          <p className="text-base font-light leading-relaxed text-muted-foreground">
            Resultados que falam por si. Veja o que entregamos todo dia.
          </p>
        </Reveal>

        <Reveal delay={120}>
        <Carousel
          setApi={setApi}
          opts={{ loop: true }}
          plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
          className="mx-auto max-w-md"
        >
          <CarouselContent>
            {slides.map((image) => (
              <CarouselItem key={image.src}>
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block aspect-[4/5] w-full overflow-hidden"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 448px) 90vw, 448px"
                    className="object-cover"
                  />
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious
            aria-label="Foto anterior"
            className="-left-4 size-11 rounded-none border-input bg-background hover:border-foreground md:-left-14"
          />
          <CarouselNext
            aria-label="Próxima foto"
            className="-right-4 size-11 rounded-none border-input bg-background hover:border-foreground md:-right-14"
          />
        </Carousel>

        <div className="mt-6 flex justify-center gap-2" role="tablist" aria-label="Fotos da galeria">
          {slides.map((image, i) => (
            <button
              key={image.src}
              type="button"
              role="tab"
              aria-selected={current === i}
              aria-label={`Foto ${i + 1}`}
              onClick={() => api?.scrollTo(i)}
              className={cn(
                "h-1 w-8 transition-colors",
                current === i ? "bg-primary" : "bg-input hover:bg-muted-foreground",
              )}
            />
          ))}
        </div>

        <p className="mt-8 text-center text-sm font-light text-muted-foreground">
          Mais cortes no Instagram{" "}
          <a
            href={site.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-primary hover:underline"
          >
            {site.instagramHandle}
          </a>
        </p>
        </Reveal>
      </div>
    </section>
  );
}
