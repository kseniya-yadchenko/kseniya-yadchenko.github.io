/**
 * Разносит списки публикаций и заметок из макета по контент-коллекциям.
 *
 * В макете список статей живёт теми же ключами, что и интерфейс: t1, m1, t1d
 * и так далее. Это работает, пока записей ровно столько, сколько нарисовано, —
 * добавление статьи требует правки четырёх словарей и разметки. Здесь они
 * переезжают в src/content/*.yaml, где одна запись — один объект со всеми
 * четырьмя языками рядом, а из словарей удаляются, чтобы данные не разъехались.
 *
 * Скрипт читает именно разметку, а не только словари: ссылки на публикации
 * есть только в атрибутах href, и брать их надо оттуда. Заодно это значит, что
 * при следующей версии макета достаточно перезапустить скрипт.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { root, referenceHtml, referencePath, innerHtml, LANGS } from './reference.mjs';

const html = referenceHtml();
const dicts = Object.fromEntries(
  LANGS.map((l) => [l, JSON.parse(readFileSync(resolve(root, `src/i18n/${l}.json`), 'utf8'))]),
);

const used = new Set();
const byLang = (key) => {
  used.add(key);
  return Object.fromEntries(LANGS.map((l) => [l, dicts[l][key]]));
};

/** Все ссылки заданного класса вместе с href и списком data-i внутри. */
function collectLinks(className) {
  const out = [];
  const re = new RegExp(`<a\\b([^>]*\\bclass="${className}"[^>]*)>`, 'g');
  let m;
  while ((m = re.exec(html)) !== null) {
    const attrs = m[1];
    const { text } = innerHtml(html, 'a', m.index + m[0].length);
    out.push({
      href: /href="([^"]*)"/.exec(attrs)?.[1] ?? '#',
      keys: [...text.matchAll(/data-i="([^"]+)"/g)].map((k) => k[1]),
    });
  }
  return out;
}

/** Слаг из английского заголовка: стабильный, читаемый, не зависит от порядка. */
function slug(title) {
  return title
    .toLowerCase()
    .replace(/<[^>]*>/g, ' ')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 6)
    .join('-');
}

const articles = collectLinks('item').map(({ href, keys }) => {
  const meta = keys.find((k) => /^m\d+$/.test(k));
  const title = keys.find((k) => /^t\d+$/.test(k));
  const dek = keys.find((k) => /^t\d+d$/.test(k));
  const metaByLang = byLang(meta);
  // Год нужен отдельным числом: по нему сортируется список, а в самой подписи
  // рядом с ним может стоять что угодно («Sysblok · 2026 · in Russian»).
  const year = Number(/\b(19|20)\d{2}\b/.exec(metaByLang.ru)?.[0]);
  if (!Number.isInteger(year)) throw new Error(`Не удалось определить год из «${metaByLang.ru}»`);
  return {
    id: slug(dicts.en[title]),
    year,
    url: href,
    meta: metaByLang,
    title: byLang(title),
    dek: byLang(dek),
  };
});

const notes = collectLinks('note').map(({ href, keys }) => {
  const date = keys.find((k) => /^d\d+$/.test(k));
  const title = keys.find((k) => /^nt\d+$/.test(k));
  const dek = keys.find((k) => /^nd\d+$/.test(k));
  return {
    id: slug(dicts.en[title]),
    url: href,
    date: byLang(date),
    title: byLang(title),
    dek: byLang(dek),
  };
});

/** Минимальный YAML-сериализатор: нужны только строки, числа и вложенные объекты. */
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
# Сгенерировано scripts/build-content.mjs из reference/${referencePath().split('/').pop()}.
# Правки руками возможны, но следующий запуск скрипта их перезапишет — если
# макет обновился, правьте макет.
#
# Поля meta/title/dek обязаны быть на всех четырёх языках: схема
# в src/content.config.ts роняет сборку, если языка не хватает.

`;

writeFileSync(
  resolve(root, 'src/content/articles.yaml'),
  banner('Публикации, секция 01') + toYaml(articles) + '\n',
);
writeFileSync(
  resolve(root, 'src/content/notes.yaml'),
  banner('Малая форма, секция 02') + toYaml(notes) + '\n',
);

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

console.log(`articles.yaml — ${articles.length}: ${articles.map((a) => a.id).join(', ')}`);
console.log(`notes.yaml — ${notes.length}: ${notes.map((n) => n.id).join(', ')}`);
console.log(`из словарей удалено ${used.size} ключей, осталось ${Object.keys(dicts.ru).length}`);
