import { Hero } from "@/components/site/sections/hero";
import { Services } from "@/components/site/sections/services";
import { Gallery } from "@/components/site/sections/gallery";
import { Products } from "@/components/site/sections/products";
import { About } from "@/components/site/sections/about";
import { Testimonials } from "@/components/site/sections/testimonials";
import { Location } from "@/components/site/sections/location";
import { PoleStripe } from "@/components/site/pole";
import { getActiveServices } from "@/lib/services";

// Catálogo muda raramente — revalida a cada 5 min.
export const revalidate = 300;

export default async function HomePage() {
  const services = await getActiveServices();

  return (
    <>
      <Hero />
      <PoleStripe />
      <Services services={services} />
      <Gallery />
      <Products />
      <PoleStripe />
      <About />
      <PoleStripe />
      <Testimonials />
      <Location />
    </>
  );
}
