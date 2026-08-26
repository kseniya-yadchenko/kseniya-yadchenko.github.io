import ru from './ru.json';
import en from './en.json';
import fr from './fr.json';
import ar from './ar.json';
import additions from './additions.json';
import { DEFAULT_LANG, LANGS, type Lang } from './types';

/**
 * Строки интерфейса собираются из двух источников.
 *
 * 1. ru/en/fr/ar.json — извлекаются из макета скриптом extract-i18n.mjs
 *    и ПЕРЕЗАПИСЫВАЮТСЯ при каждой его перезапуске. Править их руками
 *    бессмысленно: следующая версия макета сотрёт правки.
 *
 * 2. additions.json — то, чего в макете нет, но что нужно на сайте.
 *    Здесь один ключ — это все четыре языка рядом, так что забыть перевод
 *    сложнее, чем в четырёх раздельных файлах. Перегенерацию переживает.
 *
 * Дополнения перекрывают извлечённое: если ключ появится в новой версии
 * макета, значение из additions.json продолжит выигрывать — и это заметно
 * при чтении файла, в отличие от молчаливого расхождения.
 */
const EXTRACTED: Record<Lang, Record<string, string>> = { ru, en, fr, ar };
const ADDITIONS: Record<string, Record<Lang, string>> = additions;

export type I18nKey = keyof typeof ru | keyof typeof additions;

const DICTIONARIES = Object.fromEntries(
  LANGS.map((lang) => {
    const merged: Record<string, string> = { ...EXTRACTED[lang] };
    for (const [key, byLang] of Object.entries(ADDITIONS)) merged[key] = byLang[lang];
    return [lang, merged];
  }),
) as Record<Lang, Record<I18nKey, string>>;

/**
 * Значения могут содержать инлайновую разметку (<em>, <b>, <br>) — так было
 * в макете, и типографика на ней держится. Поэтому в компонентах результат
 * выводится через set:html, а не как текст.
 */
export function t(lang: Lang, key: I18nKey): string {
  return DICTIONARIES[lang][key] ?? DICTIONARIES[DEFAULT_LANG][key];
}

/** Каррированный вариант, чтобы не таскать lang в каждый вызов внутри компонента. */
export function translator(lang: Lang) {
  return (key: I18nKey): string => t(lang, key);
}

export { DEFAULT_LANG };
export type { Lang };
