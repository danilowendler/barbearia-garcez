// Fallback estático do catálogo — a fonte da verdade é o Supabase
// (lib/services.ts); estes dados espelham o seed 0002_seed.sql.

export type Service = {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  priceCents: number;
  durationMin: number;
};

// Catálogo real (WhatsApp Business da barbearia) — todos os cortes R$ 35 / 40 min.
export const fallbackServices: Service[] = [
  {
    slug: "moicano",
    name: "Moicano",
    shortName: "Moicano",
    description:
      "Laterais zeradas e volume no topo. Atitude do começo ao fim.",
    priceCents: 3500,
    durationMin: 40,
  },
  {
    slug: "americano",
    name: "Americano",
    shortName: "Americano",
    description:
      "O clássico americano com contornos marcados e acabamento limpo.",
    priceCents: 3500,
    durationMin: 40,
  },
  {
    slug: "low-fade",
    name: "Low fade",
    shortName: "Low fade",
    description:
      "Degradê baixo com transição suave na altura da orelha. Discreto e alinhado.",
    priceCents: 3500,
    durationMin: 40,
  },
  {
    slug: "low-fade-v",
    name: "Low fade em V",
    shortName: "Low fade V",
    description:
      "O low fade com desenho em V na nuca. O detalhe que faz a diferença.",
    priceCents: 3500,
    durationMin: 40,
  },
  {
    slug: "maraca",
    name: "Maracá",
    shortName: "Maracá",
    description:
      "O corte do momento: topo texturizado e caimento natural.",
    priceCents: 3500,
    durationMin: 40,
  },
  {
    slug: "moica",
    name: "Moica",
    shortName: "Moica",
    description:
      "A versão despojada do moicano, com transição mais suave.",
    priceCents: 3500,
    durationMin: 40,
  },
  {
    slug: "freestyle",
    name: "Freestyle",
    shortName: "Freestyle",
    description:
      "Desenhos e riscos personalizados na navalha. Sua ideia, nosso traço.",
    priceCents: 3500,
    durationMin: 40,
  },
  {
    slug: "dia-a-dia",
    name: "Do dia a dia",
    shortName: "Dia a dia",
    description:
      "Aquele corte certeiro pro dia a dia, sempre no ponto.",
    priceCents: 3500,
    durationMin: 40,
  },
];

export type Product = {
  slug: string;
  name: string;
  priceCents: number;
  priceFrom?: boolean;
  image?: string;
};

// Produtos do catálogo (venda na loja — reserva pelo WhatsApp).
export const products: Product[] = [
  { slug: "pomada-fox-grande", name: "Pomada Fox grande", priceCents: 3500, image: "/images/produtos/pomada-fox-grande.jpeg" },
  { slug: "pomada-fox-80g", name: "Pomada Fox 80g", priceCents: 2000, image: "/images/produtos/pomada-fox-80g.jpeg" },
  { slug: "pomada-em-po", name: "Pomada em pó", priceCents: 4000, image: "/images/produtos/pomada-em-po.jpeg" },
  {
    slug: "minoxidil",
    name: "Minoxidil (P, M e G)",
    priceCents: 5000,
    priceFrom: true,
    image: "/images/produtos/minoxidil.jpeg",
  },
  { slug: "balm-barba", name: "Balm para barba", priceCents: 3500, image: "/images/produtos/balm-barba.jpeg" },
  { slug: "oleo-barba", name: "Óleo para barba", priceCents: 3500, image: "/images/produtos/oleo-barba.jpeg" },
];

export function formatPrice(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  avatar: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "O degradê saiu exatamente como eu queria. Precisão que eu não encontrava mais.",
    name: "Lucas Martins",
    role: "Cliente do bairro",
    avatar: "/images/testimonial-1.jpg",
  },
  {
    quote:
      "Ambiente raiz, conversa boa e navalha afiada. Saí me sentindo novo.",
    name: "Rafael Almeida",
    role: "Cliente fiel",
    avatar: "/images/testimonial-2.jpg",
  },
  {
    quote:
      "Meu filho não corta com mais ninguém. A paciência com os pequenos é rara.",
    name: "Thiago Souza",
    role: "Pai do Pedro",
    avatar: "/images/testimonial-3.jpg",
  },
];

export const galleryImages = [
  {
    src: "/images/cortes/corte-1.png",
    alt: "Low fade com topo cacheado finalizado na Barbearia Garcez",
  },
  {
    src: "/images/cortes/corte-2.png",
    alt: "Corte degradê com acabamento na navalha",
  },
  {
    src: "/images/cortes/corte-3.png",
    alt: "Corte finalizado com contornos alinhados",
  },
  {
    src: "/images/cortes/corte-4.png",
    alt: "Degradê com desenho personalizado na nuca",
  },
];
