/**
 * Разносит данные из плоского словаря i18n по контент-коллекциям.
 *
 * В макете список публикаций и заметок жил теми же ключами, что и интерфейс:
 * t1..t5, m1..m5, nt1..nt3 и так далее. Это работает, пока записей ровно
 * столько же, сколько нарисовано, — добавление шестой статьи потребовало бы
 * править четыре словаря и разметку.
 *
 * Здесь эти 24 ключа переезжают в src/content/*.yaml, где одна запись — один
 * объект со всеми четырьмя языками рядом. Из словаря они удаляются, чтобы
 * данные не разъехались по двум местам.
 *
 * Отдельно разбирается поле m1..m5: в макете это «Издание<br>Год» одной
 * строкой. Год вынесен в отдельное числовое поле — он одинаков во всех языках
 * и по нему сортируется список.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LANGS = ['ru', 'en', 'fr', 'ar'];

const dicts = Object.fromEntries(
  LANGS.map((l) => [l, JSON.parse(readFileSync(resolve(root, `src/i18n/${l}.json`), 'utf8'))]),
);

const byLang = (fn) => Object.fromEntries(LANGS.map((l) => [l, fn(dicts[l])]));

const ARTICLE_IDS = [
  'adlam-unicode',
  'ajami-script',
  'language-of-instruction',
  'low-resource-mt',
  'fieldwork-grammar',
];
const NOTE_IDS = ['ajami-unicode-block', 'unesco-language-report', 'tifinagh-road-signs'];

const used = [];

const articles = ARTICLE_IDS.map((id, idx) => {
  const n = idx + 1;
  used.push(`m${n}`, `t${n}`, `t${n}d`);
  // «Системный Блокъ<br>2025» → издание + год
  const parts = byLang((d) => d[`m${n}`].split(/<br\s*\/?>/i));
  return {
    id,
    year: Number(parts.ru[1].trim()),
    url: '#', // TODO(T8.1): настоящая ссылка на публикацию
    outlet: Object.fromEntries(LANGS.map((l) => [l, parts[l][0].trim()])),
    title: byLang((d) => d[`t${n}`]),
    dek: byLang((d) => d[`t${n}d`]),
  };
});

const notes = NOTE_IDS.map((id, idx) => {
  const n = idx + 1;
  used.push(`d${n}`, `nt${n}`, `nd${n}`);
  return {
    id,
    url: '#', // TODO(T8.1): настоящая ссылка на запись
    date: byLang((d) => d[`d${n}`]),
    title: byLang((d) => d[`nt${n}`]),
    dek: byLang((d) => d[`nd${n}`]),
  };
});

/** Минимальный YAML-сериализатор: нам нужны только строки, числа и вложенные объекты. */
function toYaml(items) {
  const esc = (v) =>
    typeof v === 'number'
      ? String(v)
      : `"${String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  return items
    .map((item) => {
      const lines = [];
      for (const [key, value] of Object.entries(item)) {
        if (value && typeof value === 'object') {
          lines.push(`  ${key}:`);
          for (const [k, v] of Object.entries(value)) lines.push(`    ${k}: ${esc(v)}`);
        } else {
          lines.push(`  ${key}: ${esc(value)}`);
        }
      }
      return '-' + lines.join('\n').slice(1);
    })
    .join('\n\n');
}

mkdirSync(resolve(root, 'src/content'), { recursive: true });

const banner = (what) => `# ${what}
# Одна запись — один блок. Поля title/dek/outlet обязаны быть на всех четырёх
# языках: схема в src/content.config.ts роняет сборку, если языка не хватает.
# url: "#" — плейсхолдер, заменяется в задаче T8.1.

`;

writeFileSync(
  resolve(root, 'src/content/articles.yaml'),
  banner('Публикации, секция 01') + toYaml(articles) + '\n',
);
writeFileSync(
  resolve(root, 'src/content/notes.yaml'),
  banner('Малая форма, секция 02') + toYaml(notes) + '\n',
);

// Вычищаем переехавшие ключи из словарей.
for (const lang of LANGS) {
  const dict = dicts[lang];
  for (const key of used) delete dict[key];
  const sorted = Object.fromEntries(
    Object.keys(dict)
      .sort()
      .map((k) => [k, dict[k]]),
  );
  writeFileSync(resolve(root, `src/i18n/${lang}.json`), JSON.stringify(sorted, null, 2) + '\n');
}

console.log(`articles.yaml — ${articles.length} записей`);
console.log(`notes.yaml — ${notes.length} записей`);
console.log(`из словарей удалено ${used.length} ключей, осталось ${Object.keys(dicts.ru).length}`);
