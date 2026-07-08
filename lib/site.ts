export const site = {
  name: "Barbearia Garcez",
  shortName: "Garcez",
  description:
    "Cortes masculinos modernos, degradê, barba e sobrancelha. Agende seu horário online.",
  address: "R. Alcídia Cardoso de Oliveira, 65",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=R.+Alc%C3%ADdia+Cardoso+de+Oliveira+65",
  instagram: "https://www.instagram.com/barber_garcez",
  instagramHandle: "@barber_garcez",
  whatsapp: "5515996254233",
  openingHours: [
    { days: "Segunda", hours: "13h às 19h" },
    { days: "Ter a Qui", hours: "9h às 20h" },
    { days: "Sexta", hours: "9h às 22h" },
    { days: "Sábado", hours: "9h às 15h" },
    { days: "Domingo", hours: "Fechado" },
  ],
} as const;

export function waLink(message?: string) {
  const base = `https://wa.me/${site.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const navLinks = [
  { label: "Início", href: "/" },
  { label: "Serviços", href: "/#servicos" },
  { label: "Galeria", href: "/#galeria" },
  { label: "Produtos", href: "/#produtos" },
  { label: "Sobre", href: "/#sobre" },
  { label: "Localização", href: "/#localizacao" },
] as const;
