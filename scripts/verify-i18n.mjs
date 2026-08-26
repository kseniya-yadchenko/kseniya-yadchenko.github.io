/**
 * Проверяет, что все четыре словаря описывают один и тот же набор ключей.
 *
 * Дублирует проверку, которую делает TypeScript, но нужен отдельно: гоняется
 * в CI и в `npm run build` до сборки, поэтому даёт понятную ошибку («в en нет
 * ключа nt4») вместо простыни типов. Русский словарь — эталон.
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LANGS = ['ru', 'en', 'fr', 'ar'];

const dicts = Object.fromEntries(
  LANGS.map((l) => [l, JSON.parse(readFileSync(resolve(root, `src/i18n/${l}.json`), 'utf8'))]),
);

const reference = Object.keys(dicts.ru).sort();
const problems = [];

for (const lang of LANGS) {
  const keys = Object.keys(dicts[lang]);
  const missing = reference.filter((k) => !(k in dicts[lang]));
  const extra = keys.filter((k) => !reference.includes(k));
  const empty = keys.filter((k) => !String(dicts[lang][k]).trim());

  if (missing.length) problems.push(`${lang}: нет ключей — ${missing.join(', ')}`);
  if (extra.length) problems.push(`${lang}: лишние ключи — ${extra.join(', ')}`);
  if (empty.length) problems.push(`${lang}: пустые значения — ${empty.join(', ')}`);
}

// additions.json — то, чего нет в макете. Здесь ключ хранит сразу все четыре
// языка, поэтому проверяем не совпадение наборов, а полноту каждой записи.
const additions = JSON.parse(readFileSync(resolve(root, 'src/i18n/additions.json'), 'utf8'));
for (const [key, byLang] of Object.entries(additions)) {
  const missing = LANGS.filter((l) => !String(byLang[l] ?? '').trim());
  if (missing.length) problems.push(`additions.${key}: нет перевода — ${missing.join(', ')}`);
}

// Дополнение может не только добавлять ключ, но и перекрывать текст из макета.
// Это законно, но означает расхождение с исходником: следующая версия макета
// придёт со старой формулировкой, и перекрытие продолжит действовать молча.
// Поэтому такие ключи перечисляются при каждой сборке — чтобы расхождение
// было видно, а не держалось в голове.
const overriding = Object.keys(additions).filter((k) => k in dicts.ru);

if (problems.length) {
  console.error('i18n: расхождения между словарями\n');
  for (const p of problems) console.error('  · ' + p);
  process.exit(1);
}

console.log(
  `i18n: ${reference.length} ключей из макета + ${Object.keys(additions).length} собственных, ` +
    `${LANGS.length} языка, расхождений нет`,
);
if (overriding.length) {
  console.log(
    `i18n: перекрывают текст макета — ${overriding.join(', ')} (см. src/i18n/additions.json)`,
  );
}
