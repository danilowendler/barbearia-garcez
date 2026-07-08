import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClipperArt } from "@/components/site/scroll-art";
import { Reveal } from "@/components/site/reveal";

export function About() {
  return (
    <section id="sobre" className="relative grain scroll-mt-16 bg-surface-dark px-[5%] py-16 text-on-dark md:py-24 lg:py-28">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center text-center">
        <Reveal className="mb-12 md:mb-16 lg:mb-20">
          <div className="mx-auto w-full max-w-lg">
            <p className="mb-3 text-[13px] font-bold tracking-[1.5px] uppercase text-accent-red-bright md:mb-4">
              Sobre
            </p>
            <h2 className="mb-5 font-display text-4xl font-normal tracking-wide uppercase md:mb-6 md:text-6xl">
              Mais que uma barbearia, um <span className="text-accent-red">refúgio no bairro.</span>
            </h2>
            <p className="text-base font-light leading-relaxed text-on-dark-soft">
              A Barbearia Garcez nasceu do respeito pelo ofício. Um lugar para
              conversar, dar risada e sair no ponto. Nossos barbeiros não
              correm, eles vivem a tesoura e a navalha.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 md:mt-8">
              <Button
                nativeButton={false}
                render={<Link href="/agendar" />}
                size="lg"
                className="h-12 px-8 text-sm font-bold tracking-[0.5px] uppercase"
              >
                Agendar
              </Button>
              <Link
                href="/#localizacao"
                className="flex items-center gap-1 text-[13px] font-bold tracking-[1.5px] uppercase text-on-dark hover:underline"
              >
                Onde estamos
                <ChevronRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </Reveal>
        <ClipperArt />
      </div>
    </section>
  );
}
