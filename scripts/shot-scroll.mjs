// Captura estados da animação de scroll em várias posições.
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
await page.setViewport({ width: 1440, height: 900 });
await page.goto("http://localhost:3000/", {
  waitUntil: "networkidle0",
  timeout: 60_000,
});

// posições-chave: começo/meio/fim da arte do hero, sobre, galeria
const targets = await page.evaluate(() => {
  const artTop =
    document.querySelector(".scroll-art")?.getBoundingClientRect().top ?? 600;
  const abs = (sel) =>
    (document.getElementById(sel)?.getBoundingClientRect().top ?? 0) +
    window.scrollY;
  return {
    heroArtStart: artTop + window.scrollY - 800,
    heroArtMid: artTop + window.scrollY - 450,
    heroArtEnd: artTop + window.scrollY - 150,
    sobre: abs("sobre") + 400,
    galeria: abs("galeria") - 100,
  };
});

for (const [name, y] of Object.entries(targets)) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
  await new Promise((r) => setTimeout(r, 700));
  await page.screenshot({ path: `${outDir}/scroll-${name}.png` });
  console.log(`scroll-${name}.png @ y=${Math.round(y)}`);
}

await browser.close();
