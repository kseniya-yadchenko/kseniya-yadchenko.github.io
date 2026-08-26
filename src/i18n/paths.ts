import { DEFAULT_LANG, LANGS, type Lang } from './types';

/**
 * base из astro.config добавляется ко всем ссылкам. Пока сайт живёт по адресу
 * <user>.github.io/<repo>/, это '/repo/'; после привязки домена — '/'.
 * Ссылки нигде не хардкодятся, поэтому переезд не требует правок в компонентах.
 */
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** Путь к странице языка: русский лежит в корне, остальные — в подкаталогах. */
export function localePath(lang: Lang): string {
  return lang === DEFAULT_LANG ? `${BASE}/` : `${BASE}/${lang}/`;
}

/** Абсолютный URL — для canonical, OG и hreflang. */
export function localeUrl(lang: Lang, site: URL | undefined): string {
  return new URL(localePath(lang), site ?? 'http://localhost:4321').href;
}

/** Ссылка на файл в public/ с учётом base. */
export function asset(path: string): string {
  return path.startsWith('#') || /^https?:/.test(path)
    ? path
    : `${BASE}/${path.replace(/^\/+/, '')}`;
}

export { LANGS };
