/**
 * Проверка доступности всех четырёх языков.
 *
 * Отдельного внимания заслуживает арабская версия: RTL, смена шрифта и
 * направления — место, где легче всего получить нечитаемую страницу, не заметив
 * этого на десктопе с русским интерфейсом.
 */
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const BASE = process.env.PREVIEW_URL ?? 'http://localhost:4321/yadchenko-website';
const PAGES = [
  ['ru', '/'],
  ['en', '/en/'],
  ['fr', '/fr/'],
  ['ar', '/ar/'],
];

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
let critical = 0;

for (const [lang, path] of PAGES) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
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
