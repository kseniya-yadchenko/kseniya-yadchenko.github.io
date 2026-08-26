/**
 * Находит актуальный макет в reference/.
 *
 * Макет присылают версиями (v31, v49, …), и раньше путь был зашит в скриптах —
 * при обновлении приходилось править их вручную и легко было забыть. Берём файл
 * с наибольшим номером версии.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function referencePath() {
  const files = readdirSync(resolve(root, 'reference'))
    .filter((f) => /^yadchenko-site-v(\d+)\.html$/.test(f))
    .sort((a, b) => Number(a.match(/v(\d+)/)[1]) - Number(b.match(/v(\d+)/)[1]));
  if (!files.length) throw new Error('В reference/ нет файлов вида yadchenko-site-vNN.html');
  return resolve(root, 'reference', files.at(-1));
}

export function referenceHtml() {
  return readFileSync(referencePath(), 'utf8');
}

/** Находит закрывающую скобку литерала объекта, начиная с индекса открывающей. */
export function matchBrace(src, start) {
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

/** innerHTML элемента: считаем вложенность одноимённых тегов. */
export function innerHtml(html, tag, contentStart) {
  const scan = new RegExp(`</?${tag}\\b`, 'g');
  scan.lastIndex = contentStart;
  let depth = 1;
  let hit;
  while ((hit = scan.exec(html)) !== null) {
    depth += hit[0][1] === '/' ? -1 : 1;
    if (depth === 0) return { text: html.slice(contentStart, hit.index), end: scan.lastIndex };
  }
  throw new Error(`Не найден закрывающий </${tag}>`);
}

export const LANGS = ['ru', 'en', 'fr', 'ar'];
