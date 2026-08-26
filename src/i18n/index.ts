import ru from './ru.json';
import en from './en.json';
import fr from './fr.json';
import ar from './ar.json';
import { DEFAULT_LANG, type Lang } from './types';

/**
 * Ключи задаёт русский словарь — он извлечён из разметки макета и является
 * эталоном. Типизация ниже намеренно жёсткая: если в en/fr/ar не хватает ключа,
 * `astro check` падает на этапе сборки, а не показывает молча русский текст.
 */
export type I18nKey = keyof typeof ru;

const DICTIONARIES: Record<Lang, Record<I18nKey, string>> = { ru, en, fr, ar };

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
