/**
 * Снимает сайт и исходный макет на одних и тех же ширинах, чтобы сравнить
 * глазами. Полноценный pixel-diff здесь бесполезен: разметка перестроена
 * (макет — один файл с клиентским переключением языка, сайт — четыре страницы),
 * поэтому побайтового совпадения не будет и не должно быть. Проверяем, что
 * не уехали типографика, сетка и вертикальный ритм.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { root, referencePath } from './reference.mjs';

const OUT = resolve(root, 'scratch/shots');
const BASE = process.env.PREVIEW_URL ?? 'http://localhost:4321/yadchenko-website';
const WIDTHS = [375, 768, 1440];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

async function shoot(page, url, name, width) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(350);
  await page.screenshot({ path: resolve(OUT, `${name}-${width}.png`), fullPage: true });
  console.log(`  ${name}-${width}.png`);
}

const page = await browser.newPage({ deviceScaleFactor: 2 });

console.log('макет:');
for (const w of WIDTHS) {
  await shoot(page, `file://${referencePath()}`, 'reference', w);
}

console.log('сайт:');
for (const [lang, path] of [
  ['ru', '/'],
  ['en', '/en/'],
  ['fr', '/fr/'],
  ['ar', '/ar/'],
]) {
  for (const w of WIDTHS) await shoot(page, `${BASE}${path}`, `site-${lang}`, w);
}

await browser.close();
