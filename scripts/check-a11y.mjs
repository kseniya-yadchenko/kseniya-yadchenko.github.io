/**
 * Проверка доступности всех четырёх языков.
 *
 * Отдельного внимания заслуживает арабская версия: RTL, смена шрифта и
 * направления — место, где легче всего получить нечитаемую страницу, не заметив
 * этого на десктопе с русским интерфейсом.
 */
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const BASE = process.env.PREVIEW_URL ?? 'http://localhost:4321';
const PAGES = [
  ['ru', '/'],
  ['en', '/en/'],
  ['fr', '/fr/'],
  ['ar', '/ar/'],
];

/**
 * Проверяет, что превью действительно отдаёт нужную страницу.
 *
 * Без этого проверки давали ложный зелёный: если сервер поднят со старым base
 * или не поднят вовсе, Playwright спокойно загружает страницу 404, а на ней
 * ни переполнения, ни нарушений доступности, разумеется, нет.
 */
async function assertLoaded(page, url) {
  const response = await page.goto(url, { waitUntil: 'networkidle' });
  const status = response?.status() ?? 0;
  if (status !== 200)
    throw new Error(`${url} вернул ${status}, а не 200 — превью поднято не по тому адресу?`);
  const hasContent = await page.evaluate(() => Boolean(document.querySelector('main .hero h1')));
  if (!hasContent)
    throw new Error(`${url} отдал страницу без ожидаемой разметки — вероятно, это 404`);
}

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
let critical = 0;

for (const [lang, path] of PAGES) {
  await assertLoaded(page, `${BASE}${path}`);
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  const serious = violations.filter((v) => ['critical', 'serious'].includes(v.impact));
  critical += serious.length;

  if (violations.length === 0) {
    console.log(`OK   ${lang} — нарушений нет`);
  } else {
    console.log(`${serious.length ? 'FAIL' : 'WARN'} ${lang}`);
    for (const v of violations) {
      console.log(`       [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length})`);
    }
  }
}

await browser.close();
if (critical) {
  console.error(`\nНарушений уровня critical/serious: ${critical}`);
  process.exit(1);
}
console.log('\nНарушений critical/serious нет.');
