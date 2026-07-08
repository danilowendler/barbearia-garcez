// E2E do painel admin: auth gate, login, confirmar agendamento,
// bloqueio removendo slots do wizard, serviços. Cria um admin temporário
// e limpa tudo no final.
// Uso: node scripts/e2e-admin.mjs   (dev server no ar)

import { randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
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
const srh = {
  apikey: SR,
  Authorization: `Bearer ${SR}`,
  "Content-Type": "application/json",
};

let failures = 0;
const ok = (label, cond) => {
  console.log(`${cond ? "✓" : "✗ FALHOU"} — ${label}`);
  if (!cond) failures++;
};

const tomorrow = new Date(Date.now() + 24 * 60 * 60_000)
  .toISOString()
  .slice(0, 10);

// ── Setup: admin temporário + agendamento de teste (idempotente) ───────
const TEST_EMAIL = "e2e-admin@teste.local";
const TEST_PASS = randomBytes(12).toString("base64url");

// remove sobras de execuções anteriores
const existing = await (
  await fetch(`${SUPA}/auth/v1/admin/users?per_page=100`, { headers: srh })
).json();
const leftover = (existing.users ?? []).find((u) => u.email === TEST_EMAIL);
if (leftover) {
  await fetch(`${SUPA}/auth/v1/admin/users/${leftover.id}`, {
    method: "DELETE",
    headers: srh,
  });
}
await fetch(
  `${SUPA}/rest/v1/appointments?customer_name=eq.Cliente%20Admin%20E2E`,
  { method: "DELETE", headers: srh },
);
await fetch(`${SUPA}/rest/v1/time_blocks?reason=eq.Teste%20E2E`, {
  method: "DELETE",
  headers: srh,
});

const userRes = await fetch(`${SUPA}/auth/v1/admin/users`, {
  method: "POST",
  headers: srh,
  body: JSON.stringify({
    email: TEST_EMAIL,
    password: TEST_PASS,
    email_confirm: true,
  }),
});
const testUser = await userRes.json();
ok("admin temporário criado", userRes.ok);

const [{ id: barberId }] = await (
  await fetch(`${SUPA}/rest/v1/barbers?select=id&name=eq.Garcez`, {
    headers: srh,
  })
).json();
const [{ id: serviceId }] = await (
  await fetch(`${SUPA}/rest/v1/services?select=id&slug=eq.moicano`, {
    headers: srh,
  })
).json();

const apptRes = await fetch(`${SUPA}/rest/v1/appointments`, {
  method: "POST",
  headers: { ...srh, Prefer: "return=representation" },
  body: JSON.stringify({
    barber_id: barberId,
    service_id: serviceId,
    customer_name: "Cliente Admin E2E",
    customer_phone: "11977776666",
    starts_at: `${tomorrow}T14:00:00-03:00`,
    ends_at: `${tomorrow}T14:40:00-03:00`,
  }),
});
const [appt] = await apptRes.json();
ok("agendamento de teste criado (pending)", apptRes.status === 201);

// ── Browser ────────────────────────────────────────────────────────────
const browser = await puppeteer.launch({
  executablePath: edge,
  headless: "new",
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });

// 1. Gate: /admin sem sessão → login
await page.goto("http://localhost:3000/admin", {
  waitUntil: "networkidle0",
  timeout: 60_000,
});
ok(
  "/admin sem sessão redireciona para /admin/login",
  page.url().includes("/admin/login"),
);

// 2. Login
await page.type("#email", TEST_EMAIL);
await page.type("#password", TEST_PASS);
await Promise.all([
  page.waitForNavigation({ waitUntil: "networkidle0", timeout: 30_000 }),
  page.click("button[type=submit]"),
]);
ok("login leva à agenda (/admin)", page.url().endsWith("/admin"));

// 3. Agenda de amanhã mostra o agendamento; confirmar
await page.goto(`http://localhost:3000/admin?d=${tomorrow}`, {
  waitUntil: "networkidle0",
});
ok(
  "agenda mostra o cliente de teste",
  await page.evaluate(() =>
    document.body.textContent.includes("Cliente Admin E2E"),
  ),
);
await page.evaluate(() => {
  [...document.querySelectorAll("button")]
    .find((b) => b.textContent.trim() === "Confirmar")
    ?.click();
});
await page.waitForFunction(
  () => document.body.textContent.includes("Confirmado"),
  { timeout: 20_000 },
);
const [apptAfter] = await (
  await fetch(`${SUPA}/rest/v1/appointments?select=status&id=eq.${appt.id}`, {
    headers: srh,
  })
).json();
ok("confirmar atualizou o status no banco", apptAfter.status === "confirmed");

// 4. Bloqueio: loja toda amanhã o dia inteiro → wizard sem horários
await page.goto("http://localhost:3000/admin/bloqueios", {
  waitUntil: "networkidle0",
});
await page.evaluate((d) => {
  document.querySelector("#date").value = d;
  document.querySelector("#start").value = "09:00";
  document.querySelector("#end").value = "22:00";
  document.querySelector("#reason").value = "Teste E2E";
}, tomorrow);
await page.evaluate(() => {
  [...document.querySelectorAll("button")]
    .find((b) => b.textContent.trim() === "Bloquear")
    ?.click();
});
await page.waitForFunction(
  () => document.body.textContent.includes("Bloqueio criado"),
  { timeout: 20_000 },
);
ok("bloqueio criado pela UI", true);

// wizard não deve oferecer horários amanhã
await page.goto("http://localhost:3000/agendar", {
  waitUntil: "networkidle0",
});
const clickText = (t) =>
  page.evaluate((txt) => {
    [...document.querySelectorAll("button")]
      .find((b) => b.textContent.includes(txt))
      ?.click();
  }, t);
await clickText("Moicano");
await new Promise((r) => setTimeout(r, 300));
await clickText("Sem preferência");
await page.waitForFunction(
  () => document.body.textContent.includes("Escolha o dia"),
  { timeout: 15_000 },
);
// clica no tile de amanhã (2º tile habilitado ou por data)
await page.evaluate((d) => {
  const day = d.split("-")[2];
  const label = `${Number(day)} `;
  const tiles = [...document.querySelectorAll("button:not([disabled])")];
  const tile = tiles.find(
    (b) =>
      /^(Hoje|seg|ter|qua|qui|sex|s[áa]b)/i.test(b.textContent.trim()) &&
      b.textContent.includes(label),
  );
  tile?.click();
}, tomorrow);
await page.waitForFunction(
  () =>
    document.body.textContent.includes("Nenhum horário livre") ||
    [...document.querySelectorAll("button")].some((b) =>
      /^\d{2}:\d{2}$/.test(b.textContent.trim()),
    ),
  { timeout: 30_000 },
);
ok(
  "bloqueio zerou os horários de amanhã no wizard",
  await page.evaluate(() =>
    document.body.textContent.includes("Nenhum horário livre"),
  ),
);

// 5. Remover o bloqueio pela UI (verdade = banco)
const [blockRow] = await (
  await fetch(`${SUPA}/rest/v1/time_blocks?select=id&reason=eq.Teste%20E2E`, {
    headers: srh,
  })
).json();
page.on("response", (r) => {
  if (r.request().method() === "POST" && r.url().includes("/admin"))
    console.log("   [POST]", r.status(), r.url().slice(0, 80));
});
await page.goto("http://localhost:3000/admin/bloqueios", {
  waitUntil: "networkidle0",
});
await new Promise((r) => setTimeout(r, 1500)); // hidratação
const clicked = await page.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find((b) =>
    b.textContent.includes("Remover"),
  );
  btn?.click();
  return !!btn;
});
let blockGone = false;
for (let i = 0; i < 20 && !blockGone; i++) {
  await new Promise((r) => setTimeout(r, 1000));
  const rows = await (
    await fetch(`${SUPA}/rest/v1/time_blocks?select=id&id=eq.${blockRow.id}`, {
      headers: srh,
    })
  ).json();
  blockGone = rows.length === 0;
}
ok(`bloqueio removido pela UI (clicou: ${clicked})`, blockGone);

// 6. Serviços listados
await page.goto("http://localhost:3000/admin/servicos", {
  waitUntil: "networkidle0",
});
const svcCount = await page.evaluate(
  () => document.querySelectorAll("ul > li").length,
);
ok(`página de serviços lista o catálogo (${svcCount} itens)`, svcCount >= 6);

// 7. Logout
await new Promise((r) => setTimeout(r, 800));
await page.evaluate(() => {
  [...document.querySelectorAll("button")]
    .find((b) => b.getAttribute("title") === "Sair")
    ?.click();
});
let loggedOut = false;
for (let i = 0; i < 20 && !loggedOut; i++) {
  await new Promise((r) => setTimeout(r, 1000));
  try {
    loggedOut = page.url().includes("/admin/login");
  } catch {
    /* navegação */
  }
}
ok("logout volta para /admin/login", loggedOut);

await browser.close();

// ── Limpeza ────────────────────────────────────────────────────────────
const delAppt = await fetch(`${SUPA}/rest/v1/appointments?id=eq.${appt.id}`, {
  method: "DELETE",
  headers: srh,
});
const delUser = await fetch(`${SUPA}/auth/v1/admin/users/${testUser.id}`, {
  method: "DELETE",
  headers: srh,
});
const delBlocks = await fetch(
  `${SUPA}/rest/v1/time_blocks?reason=eq.Teste%20E2E`,
  { method: "DELETE", headers: srh },
);
ok(
  `limpeza (appt ${delAppt.status}, user ${delUser.status}, blocks ${delBlocks.status})`,
  delAppt.status === 204 && delUser.ok,
);

process.exit(failures === 0 ? 0 : 1);
