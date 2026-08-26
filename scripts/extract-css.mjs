/**
 * Переносит <style> из макета в src/styles/global.css дословно.
 *
 * Файл намеренно не форматируется и не рефакторится: дизайн — главная ценность
 * макета, и любая «уборка» рискует незаметно его сдвинуть. Отклонения живут
 * отдельно, в overrides.css.
 *
 * Единственная правка — удаление осиротевших объявлений: в макете попадаются
 * свойства без селектора (остатки вырезанных блоков). Браузеры их молча
 * игнорируют, PostCSS отказывается собирать файл целиком.
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { root, referenceHtml, referencePath } from './reference.mjs';

const css = /<style>([\s\S]*?)<\/style>/.exec(referenceHtml())?.[1]?.trim();
if (!css) throw new Error('В макете нет блока <style>');

const kept = [];
const dropped = [];
let depth = 0;

for (const line of css.split('\n')) {
  const isOrphan = depth <= 0 && /^\s*[-a-z]+\s*:/.test(line) && !/^\s*--/.test(line);
  if (isOrphan) dropped.push(line.trim());
  else kept.push(line);
  depth += (line.match(/\{/g) ?? []).length - (line.match(/\}/g) ?? []).length;
  if (depth < 0) depth = 0;
}

const header = `/*
 * Перенесено ДОСЛОВНО из reference/${referencePath().split('/').pop()}
 * скриптом scripts/extract-css.mjs. Не редактировать вручную: при следующей
 * версии макета файл перезапишется.
 *
 * Отклонения от макета лежат в overrides.css, который подключается ПОСЛЕ этого
 * файла в BaseLayout.astro — иначе переопределения не сработали бы.
 *
 * Макет написан на логических свойствах (padding-inline, margin-inline-start,
 * inset-inline, text-align:start) и не содержит ни одного left/right — благодаря
 * этому арабская RTL-версия работает без отдельной таблицы стилей. Это свойство
 * нужно сохранять при любых правках макета.
 */
@import './fonts.css';
`;

writeFileSync(resolve(root, 'src/styles/global.css'), header + kept.join('\n').trim() + '\n');

console.log(`global.css — ${kept.length} строк из ${referencePath().split('/').pop()}`);
if (dropped.length) {
  console.log(`удалено осиротевших объявлений: ${dropped.length}`);
  for (const d of dropped) console.log(`  ${d.slice(0, 90)}`);
}
