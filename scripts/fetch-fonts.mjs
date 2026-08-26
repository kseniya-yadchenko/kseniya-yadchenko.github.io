/**
 * Забирает шрифты из Google Fonts в репозиторий и генерирует src/styles/fonts.css.
 *
 * Зачем self-hosting, а не <link> на fonts.googleapis.com, как в макете:
 *   · минус два внешних домена в критическом пути рендера;
 *   · шрифты — половина дизайна (Playfair Display), и падение на Georgia
 *     заметно меняет вид страницы;
 *   · часть аудитории сидит в сетях, где доступ к Google-сервисам нестабилен.
 *
 * Файлы кладутся в src/assets, а не в public: тогда их обрабатывает Vite —
 * добавляет хеш в имя и подставляет правильный префикс base. С public/ ссылки
 * сломались бы при деплое в подкаталог <user>.github.io/<repo>/.
 *
 * Вьетнамский subset отбрасывается: на сайте четыре языка, вьетнамского нет.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = resolve(root, 'src/assets/fonts');
const SKIP_SUBSETS = new Set(['vietnamese']);

const CSS_URL =
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500' +
  '&family=Jost:ital,wght@0,300;0,400;0,500;1,300&family=IBM+Plex+Sans+Arabic:wght@300;400;500&display=swap';

// Без десктопного UA Google отдаёт ttf вместо woff2 — втрое тяжелее.
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';

const css = await (await fetch(CSS_URL, { headers: { 'User-Agent': UA } })).text();

mkdirSync(OUT_DIR, { recursive: true });

const blocks = css.split('@font-face').slice(1);
const out = [];
let skipped = 0;

for (const raw of blocks) {
  const block = '@font-face' + raw.slice(0, raw.indexOf('}') + 1);
  const subset = /\/\*\s*([a-z-]+)\s*\*\//.exec(raw.split('@font-face')[0] ?? '')?.[1];
  const prev = css.slice(0, css.indexOf(raw));
  const subsetName =
    /\/\*\s*([a-z-]+)\s*\*\/\s*$/.exec(prev.split('@font-face').at(-2) ?? prev)?.[1] ?? subset;

  const family = /font-family:\s*'([^']+)'/.exec(block)?.[1];
  const weight = /font-weight:\s*(\d+)/.exec(block)?.[1];
  const style = /font-style:\s*(\w+)/.exec(block)?.[1];
  const url = /url\((https:\/\/[^)]+\.woff2)\)/.exec(block)?.[1];
  if (!family || !url) continue;

  if (subsetName && SKIP_SUBSETS.has(subsetName)) {
    skipped++;
    continue;
  }

  const slug = family.toLowerCase().replace(/\s+/g, '-');
  const name = `${slug}-${weight}-${style}-${subsetName ?? 'x'}.woff2`;

  const bin = Buffer.from(await (await fetch(url)).arrayBuffer());
  writeFileSync(resolve(OUT_DIR, name), bin);

  out.push(
    block.replace(url, `../assets/fonts/${name}`).replace(/^\s*/gm, (m) => m.replace(/\n/g, '')),
  );
}

const header = `/*
 * Сгенерировано scripts/fetch-fonts.mjs — не редактировать вручную.
 * Шрифты лежат в src/assets/fonts и обрабатываются Vite (хеш + base).
 * font-display: swap оставлен как в макете: текст показывается сразу.
 */
`;
writeFileSync(resolve(root, 'src/styles/fonts.css'), header + out.join('\n\n') + '\n');
console.log(`Скачано ${out.length} файлов, пропущено ${skipped} (вьетнамский subset)`);
