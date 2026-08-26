/**
 * Проверяет, что страница нигде не уезжает по горизонтали.
 *
 * Макет построен на CSS Grid с широкими строками спецификации и длинными
 * ссылками — на узких экранах такое ломается тихо: появляется горизонтальная
 * прокрутка, которую на десктопе не видно. Проверяем все четыре языка, потому
 * что длина слов у них разная, а арабский к тому же RTL.
 */
import { chromium } from 'playwright';

const BASE = process.env.PREVIEW_URL ?? 'http://localhost:4321/yadchenko-website';
const PAGES = [
  ['ru', '/'],
  ['en', '/en/'],
  ['fr', '/fr/'],
  ['ar', '/ar/'],
];
const WIDTHS = [320, 375, 768, 1440];

const browser = await chromium.launch();
const page = await browser.newPage();
let failed = 0;

for (const [lang, path] of PAGES) {
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });

    const result = await page.evaluate(() => {
      const root = document.documentElement;
      const offenders = [...document.querySelectorAll('*')]
        .filter((el) => el.getBoundingClientRect().width > root.clientWidth + 1)
        .map(
          (el) =>
            el.tagName.toLowerCase() +
            (el.className ? '.' + String(el.className).split(' ')[0] : ''),
        );
      return {
        scrollW: root.scrollWidth,
        clientW: root.clientWidth,
        offenders: [...new Set(offenders)].slice(0, 4),
      };
    });

    const ok = result.scrollW <= result.clientW + 1;
    if (!ok) failed++;
    console.log(
      `${ok ? 'OK  ' : 'FAIL'} ${lang} @${width}px  scroll=${result.scrollW} client=${result.clientW}` +
        (result.offenders.length ? `  → ${result.offenders.join(', ')}` : ''),
    );
  }
}

await browser.close();
if (failed) {
  console.error(`\nГоризонтальное переполнение на ${failed} комбинациях.`);
  process.exit(1);
}
console.log('\nПереполнения нет ни на одной ширине.');
