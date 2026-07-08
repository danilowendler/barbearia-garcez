import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { formatPrice, products } from "@/lib/data";
import { Reveal } from "@/components/site/reveal";
import { waLink } from "@/lib/site";

export function Products() {
  return (
    <section
      id="produtos"
      className="dark relative grain scroll-mt-16 bg-background px-[5%] py-16 text-foreground md:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-[1440px]">
        <Reveal className="mx-auto mb-12 max-w-lg text-center md:mb-16 lg:mb-20">
          <p className="mb-3 text-[13px] font-bold tracking-[1.5px] uppercase text-accent-red md:mb-4">
            Produtos
          </p>
          <h2 className="mb-5 font-display text-4xl font-normal tracking-wide uppercase md:mb-6 md:text-6xl">
            Leve o cuidado <span className="text-accent-red">para casa</span>
          </h2>
          <p className="text-base font-light leading-relaxed text-muted-foreground">
            Pomadas, balm e óleo para manter o corte e a barba no ponto entre
            uma visita e outra. Reserve pelo WhatsApp e retire na barbearia.
          </p>
        </Reveal>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-8">
          {products.map((product, index) => (
            <Reveal key={product.slug} delay={index * 80} className="flex flex-col">
              <div className="relative mb-4 aspect-square w-full bg-surface-card">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-accent"
                  >
                    {product.name.charAt(0)}
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold uppercase md:text-lg">
                {product.name}
              </h3>
              <p className="mb-3">
                <span className="inline-block -rotate-2 bg-accent-red px-2 py-0.5 text-sm font-bold text-white">
                  {product.priceFrom ? "a partir de " : ""}
                  {formatPrice(product.priceCents)}
                </span>
              </p>
              <a
                href={waLink(
                  `Olá! Quero reservar o produto ${product.name} na Barbearia Garcez.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto flex items-center gap-1 text-[13px] font-bold tracking-[1.5px] uppercase text-foreground hover:underline"
              >
                Reservar
                <ChevronRight className="size-4 text-accent-red" aria-hidden />
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
