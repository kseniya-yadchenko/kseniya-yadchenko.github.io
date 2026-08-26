/**
 * Извлекает переводы из исходного макета reference/yadchenko-site-v31.html
 * в src/i18n/{ru,en,fr,ar}.json.
 *
 * Данные в макете лежат неоднородно, и это единственная причина, по которой
 * скрипт нетривиален:
 *   · EN / FR / AR — в JS-объекте `T`;
 *   · RU — объекта `T.ru` не существует (он пустой `{}`), русский текст лежит
 *     прямо в разметке как innerHTML элементов с атрибутом data-i.
 *
 * Макет подставляет переводы через `el.innerHTML = v`, поэтому для RU мы берём
 * именно innerHTML, а не текст: внутри значений встречаются <em>, <b> и <br>.
 *
 * Скрипт одноразовый по смыслу, но остаётся в репозитории как документация
 * происхождения данных: он отвечает на вопрос «откуда взялись эти 86 ключей».
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(resolve(root, 'reference/yadchenko-site-v31.html'), 'utf8');

/** Находит конец литерала объекта, начиная с индекса открывающей `{`. */
function matchBrace(src, start) {
  let depth = 0;
  let quote = null;
  for (let i = start; i < src.length; i++) {
    const ch = src[i];
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') quote = ch;
    else if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0) return i;
  }
  throw new Error('Незакрытая скобка объекта T');
}

/** EN / FR / AR — вычисляем литерал `T` как есть, без парсинга регулярками. */
function extractDictionaries() {
  const start = html.indexOf('const T={');
  if (start === -1) throw new Error('Объект T не найден в макете');
  const open = html.indexOf('{', start);
  const literal = html.slice(open, matchBrace(html, open) + 1);
  return new Function(`return ${literal}`)();
}

/**
 * RU — innerHTML элементов с data-i. Считаем вложенность одноимённых тегов,
 * чтобы не оборваться на первом же закрывающем теге внутри значения.
 */
function extractRussian() {
  const out = {};
  const openTag = /<([a-zA-Z][\w-]*)\b([^>]*\bdata-i="([^"]+)"[^>]*)>/g;
  let m;
  while ((m = openTag.exec(html)) !== null) {
    const [full, tag, , key] = m;
    if (full.endsWith('/>')) {
      out[key] = '';
      continue;
    }
    const contentStart = m.index + full.length;
    const scan = new RegExp(`</?${tag}\\b`, 'g');
    scan.lastIndex = contentStart;
    let depth = 1;
    let hit;
    while ((hit = scan.exec(html)) !== null) {
      depth += hit[0][1] === '/' ? -1 : 1;
      if (depth === 0) break;
    }
    if (depth !== 0) throw new Error(`Не найден закрывающий </${tag}> для ключа ${key}`);
    out[key] = html.slice(contentStart, hit.index).trim();
  }
  return out;
}

const T = extractDictionaries();
const dicts = { ru: extractRussian(), en: T.en, fr: T.fr, ar: T.ar };

mkdirSync(resolve(root, 'src/i18n'), { recursive: true });
for (const [lang, dict] of Object.entries(dicts)) {
  const sorted = Object.fromEntries(
    Object.keys(dict)
      .sort()
      .map((k) => [k, dict[k]]),
  );
  writeFileSync(resolve(root, `src/i18n/${lang}.json`), JSON.stringify(sorted, null, 2) + '\n');
  console.log(`${lang}.json — ${Object.keys(sorted).length} ключей`);
}
