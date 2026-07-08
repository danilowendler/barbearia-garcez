import Image from "next/image";
import { testimonials } from "@/lib/data";
import { Reveal } from "@/components/site/reveal";

export function Testimonials() {
  return (
    <section className="bg-background px-[5%] py-16 md:py-24 lg:py-28">
      <div className="mx-auto max-w-[1440px]">
        <Reveal className="mx-auto mb-12 w-full max-w-lg text-center md:mb-16 lg:mb-20">
          <p className="mb-3 text-[13px] font-bold tracking-[1.5px] uppercase text-primary md:mb-4">
            Depoimentos
          </p>
          <h2 className="text-3xl font-bold uppercase md:text-5xl">
            Palavra de quem vive o corte na pele.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Reveal key={testimonial.name} delay={index * 100} className="bg-background">
            <figure className="flex h-full flex-col justify-between bg-background p-8 lg:p-10">
              <blockquote className="mb-8 text-lg font-bold leading-snug">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="flex items-center gap-4">
                <span className="relative size-12 shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={testimonial.avatar}
                    alt={`Foto de ${testimonial.name}`}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </span>
                <span>
                  <span className="block text-sm font-bold">
                    {testimonial.name}
                  </span>
                  <span className="block text-sm font-light text-muted-foreground">
                    {testimonial.role}
                  </span>
                </span>
              </figcaption>
            </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
