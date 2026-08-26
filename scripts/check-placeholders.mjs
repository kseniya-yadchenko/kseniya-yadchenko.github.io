/**
 * Гейт публикации (задача T8.2).
 *
 * Пока настоящий контент не подставлен, в сборке остаются заглушки из макета:
 * пустые ссылки href="#" и адрес hello@example.com. Сайт с таким контентом
 * технически работает, и именно поэтому его легко случайно опубликовать —
 * ничего не падает, глаз замыливается.
 *
 * Скрипт делает это состояние видимым. В CI на pull request он предупреждает,
 * в режиме --strict (перед публикацией) — падает.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const strict = process.argv.includes('--strict');

const PATTERNS = [
  { name: 'пустая ссылка href="#"', re: /href="#"/g },
  { name: 'адрес-заглушка example.com', re: /[\w.-]+@example\.com/g },
];

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : full.endsWith('.html') ? [full] : [];
  });
}

let total = 0;
const report = [];

for (const file of walk(dist)) {
  const html = readFileSync(file, 'utf8');
  const hits = PATTERNS.map((p) => ({ name: p.name, n: (html.match(p.re) ?? []).length })).filter(
    (h) => h.n > 0,
  );
  if (hits.length) {
    report.push(
      `  ${file.replace(dist, 'dist')}: ` + hits.map((h) => `${h.name} × ${h.n}`).join(', '),
    );
    total += hits.reduce((s, h) => s + h.n, 0);
  }
}

if (total === 0) {
  console.log('плейсхолдеры: не найдено — можно публиковать');
  process.exit(0);
}

console[strict ? 'error' : 'warn'](`плейсхолдеры: найдено ${total}\n` + report.join('\n'));
if (strict) {
  console.error(
    '\nПубликация заблокирована. Подставьте контент (задача T8.1) или снимите --strict.',
  );
  process.exit(1);
}
console.warn('\nЭто ожидаемо до задачи T8.1. Перед публикацией запустите с --strict.');
