import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Barbearia Garcez — Corte com estilo",
    template: "%s · Barbearia Garcez",
  },
  description:
    "Moicano, low fade, freestyle e mais — cortes masculinos a R$ 35 na R. Alcídia Cardoso de Oliveira, 65. Agende seu horário online, sem cadastro.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Barbearia Garcez",
    title: "Barbearia Garcez — Corte com estilo",
    description:
      "Cortes masculinos a R$ 35. Agende seu horário online, sem cadastro.",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
