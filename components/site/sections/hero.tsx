import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScissorsCut } from "@/components/site/scroll-art";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <section className="bg-surface-dark text-on-dark">
      <div className="px-[5%] py-16 md:py-24 lg:py-28">
        <div className="mx-auto max-w-[1440px]">
          <div className="w-full max-w-2xl">
            <h1 className="mb-5 text-5xl font-bold leading-[1.05] uppercase md:mb-6 md:text-7xl">
              O corte que define o&nbsp;homem.
            </h1>
            <p className="max-w-lg text-lg font-light leading-relaxed text-on-dark-soft">
              Tradição e precisão em cada detalhe. O degradê perfeito te espera
              na {site.address}.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 md:mt-8">
              <Button
                nativeButton={false}
                render={<Link href="/agendar" />}
                size="lg"
                className="h-12 px-8 text-sm font-bold tracking-[0.5px] uppercase"
              >
                Agende seu horário
              </Button>
              <Button
                nativeButton={false}
                render={<Link href="/#servicos" />}
                size="lg"
                variant="outline"
                className="h-12 border-on-dark bg-transparent px-8 text-sm font-bold tracking-[0.5px] uppercase text-on-dark hover:bg-on-dark/10 hover:text-on-dark"
              >
                Serviços
              </Button>
            </div>
          </div>
        </div>
      </div>
      <ScissorsCut />
    </section>
  );
}
