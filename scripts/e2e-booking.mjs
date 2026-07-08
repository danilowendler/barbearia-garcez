// E2E do fluxo de agendamento — dirige o wizard num Edge headless.
// Uso: node scripts/e2e-booking.mjs   (dev server precisa estar no ar)

import { readFileSync, existsSync } from "node:fs";
import puppeteer from "puppeteer-core";

const edge = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
].find((p) => existsSync(p));

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
const SUPA = env.NEXT_PUBLIC_SUPABASE_URL;
const SR = env.SUPABASE_SERVICE_ROLE_KEY;
const srHeaders = {
  apikey: SR,
  Authorization: `Bearer ${SR}`,
  "Content-Type": "application/json",
};

const ok = (label, cond) => {
  console.log(`${cond ? "✓" : "✗ FALHOU"} — ${label}`);
  if (!cond) process.exitCode = 1;
};

async function clickByText(page, selector, text) {
  await page.waitForFunction(
    (sel, t) =>
      [...document.querySelectorAll(sel)].some((el) =>
        el.textContent.includes(t),
      ),
    { timeout: 30_000 },
    selector,
    text,
  );
  await page.evaluate(
    (sel, t) => {
      const el = [...document.querySelectorAll(sel)].find((e) =>
        e.textContent.includes(t),
      );
      el.click();
    },
    selector,
    text,
  );
}

const browser = await puppeteer.launch({
  executablePath: edge,
  headless: "new",
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, isMobile: true });

// ── 1º agendamento: Degradê com Garcez ──────────────────────────────────
await page.goto("http://localhost:3000/agendar", {
  waitUntil: "networkidle0",
  timeout: 60_000,
});
await clickByText(page, "button", "Moicano");
await clickByText(page, "button", "Garcez");

// primeiro dia habilitado
await page.waitForFunction(
  () =>
    [...document.querySelectorAll("button:not([disabled])")].some((b) =>
      /Hoje|seg|ter|qua|qui|sex|s[áa]b/i.test(b.textContent),
    ),
  { timeout: 30_000 },
);
const pickedDay = await page.evaluate(() => {
  const day = [...document.querySelectorAll("button:not([disabled])")].find(
    (b) => /^(Hoje|seg|ter|qua|qui|sex|s[áa]b)/i.test(b.textContent.trim()),
  );
  day.click();
  return day.textContent.trim();
});

// primeiro horário livre
await page.waitForFunction(
  () =>
    [...document.querySelectorAll("button")].some((b) =>
      /^\d{2}:\d{2}$/.test(b.textContent.trim()),
    ),
  { timeout: 30_000 },
);
const pickedTime = await page.evaluate(() => {
  const t = [...document.querySelectorAll("button")].find((b) =>
    /^\d{2}:\d{2}$/.test(b.textContent.trim()),
  );
  t.click();
  return t.textContent.trim();
});
console.log(`(escolhido: ${pickedDay} às ${pickedTime})`);

await page.waitForSelector("#nome", { timeout: 15_000 });
await page.type("#nome", "Teste E2E Claude");
await page.type("#whatsapp", "11999998888");
await clickByText(page, "button[type=submit]", "Confirmar agendamento");

await page.waitForFunction(
  () => document.body.textContent.includes("Horário reservado!"),
  { timeout: 30_000 },
);
ok("wizard completo até a tela de sucesso", true);

const hasWa = await page.evaluate(() =>
  [...document.querySelectorAll("a")].some((a) =>
    a.href.startsWith("https://wa.me/"),
  ),
);
ok("tela de sucesso tem botão wa.me", hasWa);

// ── Banco: appointment pending criado ───────────────────────────────────
const appts = await (
  await fetch(
    `${SUPA}/rest/v1/appointments?select=id,status,starts_at,customer_name&customer_name=eq.Teste%20E2E%20Claude`,
    { headers: srHeaders },
  )
).json();
ok(
  `appointment no banco com status pending (${appts.length} registro)`,
  appts.length === 1 && appts[0].status === "pending",
);

// ── 2ª visita: mesmo barbeiro/dia → horário não deve mais aparecer ──────
await page.goto("http://localhost:3000/agendar", {
  waitUntil: "networkidle0",
});
await clickByText(page, "button", "Moicano");
await clickByText(page, "button", "Garcez");
await page.evaluate((dayText) => {
  const day = [...document.querySelectorAll("button:not([disabled])")].find(
    (b) => b.textContent.trim() === dayText,
  );
  day.click();
}, pickedDay);
await page.waitForFunction(
  () =>
    [...document.querySelectorAll("button")].some((b) =>
      /^\d{2}:\d{2}$/.test(b.textContent.trim()),
    ) || document.body.textContent.includes("Nenhum horário"),
  { timeout: 30_000 },
);
const stillThere = await page.evaluate(
  (t) =>
    [...document.querySelectorAll("button")].some(
      (b) => b.textContent.trim() === t,
    ),
  pickedTime,
);
ok(`horário ${pickedTime} sumiu da agenda do Garcez`, !stillThere);

// ── Limpeza ─────────────────────────────────────────────────────────────
const del = await fetch(
  `${SUPA}/rest/v1/appointments?customer_name=eq.Teste%20E2E%20Claude`,
  { method: "DELETE", headers: srHeaders },
);
ok(`limpeza dos dados de teste (HTTP ${del.status})`, del.status === 204);

await browser.close();
