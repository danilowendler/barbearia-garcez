import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { formatPrice, products } from "@/lib/data";
import { Reveal } from "@/components/site/reveal";
import { waLink } from "@/lib/site";

export function Products() {
  return (
    <section
      id="produtos"
      className="scroll-mt-16 bg-background px-[5%] py-16 md:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-[1440px]">
        <Reveal className="mx-auto mb-12 max-w-lg text-center md:mb-16 lg:mb-20">
          <p className="mb-3 text-[13px] font-bold tracking-[1.5px] uppercase text-primary md:mb-4">
            Produtos
          </p>
          <h2 className="mb-5 text-3xl font-bold uppercase md:mb-6 md:text-5xl">
            Leve o cuidado para casa
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
              <p className="mb-3 text-sm font-light text-muted-foreground">
                {product.priceFrom ? "a partir de " : ""}
                {formatPrice(product.priceCents)}
              </p>
              <a
                href={waLink(
                  `Olá! Quero reservar o produto ${product.name} na Barbearia Garcez.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto flex items-center gap-1 text-[13px] font-bold tracking-[1.5px] uppercase text-primary hover:underline"
              >
                Reservar
                <ChevronRight className="size-4" aria-hidden />
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
