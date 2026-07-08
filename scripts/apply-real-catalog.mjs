// Aplica o catálogo real (0003) no Supabase via REST — DML equivalente
// ao supabase/migrations/0003_catalogo_real.sql.
// Uso: node scripts/apply-real-catalog.mjs

import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const h = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
};

const cuts = [
  ["moicano", "Moicano", "Moicano", "Laterais zeradas e volume no topo. Atitude do começo ao fim."],
  ["americano", "Americano", "Americano", "O clássico americano com contornos marcados e acabamento limpo."],
  ["low-fade", "Low fade", "Low fade", "Degradê baixo com transição suave na altura da orelha. Discreto e alinhado."],
  ["low-fade-v", "Low fade em V", "Low fade V", "O low fade com desenho em V na nuca. O detalhe que faz a diferença."],
  ["maraca", "Maracá", "Maracá", "O corte do momento: topo texturizado e caimento natural."],
  ["moica", "Moica", "Moica", "A versão despojada do moicano, com transição mais suave."],
  ["freestyle", "Freestyle", "Freestyle", "Desenhos e riscos personalizados na navalha. Sua ideia, nosso traço."],
  ["dia-a-dia", "Do dia a dia", "Dia a dia", "Aquele corte certeiro pro dia a dia, sempre no ponto."],
];

// 1. upsert dos cortes reais
const upsert = await fetch(
  `${URL_}/rest/v1/services?on_conflict=slug`,
  {
    method: "POST",
    headers: { ...h, Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify(
      cuts.map(([slug, name, short_name, description], i) => ({
        slug,
        name,
        short_name,
        description,
        price_cents: 3500,
        duration_min: 40,
        sort_order: i,
        active: true,
      })),
    ),
  },
);
console.log("1. upsert 8 cortes:", upsert.status, upsert.ok ? "✓" : await upsert.text());

// 2. desativa o seed antigo
const oldSlugs = "degrade,social,barba,combo,sobrancelha,infantil";
const deact = await fetch(
  `${URL_}/rest/v1/services?slug=in.(${oldSlugs})`,
  { method: "PATCH", headers: h, body: JSON.stringify({ active: false }) },
);
console.log("2. desativar seed antigo:", deact.status, deact.ok ? "✓" : await deact.text());

// 3. horários oficiais
const barbers = await (
  await fetch(`${URL_}/rest/v1/barbers?select=id`, { headers: h })
).json();
const delHours = await fetch(`${URL_}/rest/v1/working_hours?id=gte.0`, {
  method: "DELETE",
  headers: h,
});
console.log("3. limpar horários antigos:", delHours.status, delHours.ok ? "✓" : "✗");

const shopHours = [
  [1, "13:00", "19:00"],
  [2, "09:00", "20:00"],
  [3, "09:00", "20:00"],
  [4, "09:00", "20:00"],
  [5, "09:00", "22:00"],
  [6, "09:00", "15:00"],
];
const rows = barbers.flatMap((b) =>
  shopHours.map(([weekday, start_time, end_time]) => ({
    barber_id: b.id,
    weekday,
    start_time,
    end_time,
  })),
);
const insHours = await fetch(`${URL_}/rest/v1/working_hours`, {
  method: "POST",
  headers: h,
  body: JSON.stringify(rows),
});
console.log(
  `4. inserir horários reais (${rows.length} linhas):`,
  insHours.status,
  insHours.ok ? "✓" : await insHours.text(),
);

// 5. conferência
const active = await (
  await fetch(
    `${URL_}/rest/v1/services?select=slug,price_cents&active=eq.true&order=sort_order`,
    { headers: h },
  )
).json();
console.log("5. serviços ativos:", active.map((s) => s.slug).join(", "));
