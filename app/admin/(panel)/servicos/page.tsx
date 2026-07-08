import { ServiceDialog } from "@/components/admin/service-dialog";
import { Button } from "@/components/ui/button";
import { toggleServiceActiveAction } from "@/lib/admin/actions";
import { formatPrice } from "@/lib/data";
import { cn } from "@/lib/utils";
import { createSSRClient } from "@/lib/supabase/ssr";
import type { ServiceRow } from "@/lib/supabase/types";

export default async function AdminServicosPage() {
  const supabase = await createSSRClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .order("sort_order");
  const services = (data ?? []) as ServiceRow[];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-bold uppercase">Serviços</h1>
          <p className="text-sm font-light text-muted-foreground">
            Preços e duração — as alterações aparecem no site em instantes.
          </p>
        </div>
        <ServiceDialog />
      </div>

      <ul className="divide-y divide-border border border-border">
        {services.map((service) => (
          <li
            key={service.id}
            className={cn(
              "flex flex-wrap items-center justify-between gap-3 bg-card p-4",
              !service.active && "opacity-60",
            )}
          >
            <div className="min-w-0">
              <p className="text-sm font-bold uppercase">
                {service.name}
                {!service.active && (
                  <span className="ml-2 border border-border px-1.5 py-0.5 text-[10px] font-bold tracking-[1px] text-muted-foreground">
                    Inativo
                  </span>
                )}
              </p>
              <p className="text-sm font-light text-muted-foreground">
                {formatPrice(service.price_cents)} · {service.duration_min} min
                {service.description ? ` · ${service.description}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <ServiceDialog service={service} />
              <form
                action={toggleServiceActiveAction.bind(
                  null,
                  service.id,
                  !service.active,
                )}
              >
                <Button
                  type="submit"
                  size="sm"
                  variant={service.active ? "destructive" : "secondary"}
                  className="text-xs font-bold uppercase"
                >
                  {service.active ? "Desativar" : "Reativar"}
                </Button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
