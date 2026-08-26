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
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { root, referenceHtml, referencePath, matchBrace, innerHtml } from './reference.mjs';

const html = referenceHtml();

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
    out[key] = innerHtml(html, tag, m.index + full.length).text.trim();
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
console.log(`источник: ${referencePath().split('/').pop()}`);
