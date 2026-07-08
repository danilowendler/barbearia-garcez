import { existsSync } from "node:fs";
import puppeteer from "puppeteer-core";

const edge = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
].find((p) => existsSync(p));

const outDir = process.argv[2];
const browser = await puppeteer.launch({
  executablePath: edge,
  headless: "new",
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, isMobile: true });
await page.goto("http://localhost:3000/agendar", {
  waitUntil: "networkidle0",
  timeout: 60_000,
});
await page.screenshot({ path: `${outDir}/agendar-step1.png`, fullPage: true });

// avança até data e hora
const click = (t) =>
  page.evaluate((txt) => {
    [...document.querySelectorAll("button")]
      .find((b) => b.textContent.includes(txt))
      ?.click();
  }, t);
await click("Moicano");
await new Promise((r) => setTimeout(r, 300));
await click("Sem preferência");
await page.waitForFunction(
  () => document.body.textContent.includes("Escolha o dia"),
  { timeout: 15_000 },
);
await page.evaluate(() => {
  [...document.querySelectorAll("button:not([disabled])")]
    .find((b) => /^(Hoje|seg|ter|qua|qui|sex|s[áa]b)/i.test(b.textContent.trim()))
    ?.click();
});
await page.waitForFunction(
  () =>
    [...document.querySelectorAll("button")].some((b) =>
      /^\d{2}:\d{2}$/.test(b.textContent.trim()),
    ),
  { timeout: 30_000 },
);
await page.screenshot({ path: `${outDir}/agendar-step3.png`, fullPage: true });
console.log("screenshots salvos");
await browser.close();
