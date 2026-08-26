export const LANGS = ['ru', 'en', 'fr', 'ar'] as const;
export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = 'ru';

/** Языки с письмом справа налево. Влияет на атрибут dir и на выбор шрифта. */
export const RTL_LANGS: readonly Lang[] = ['ar'];

export const isRTL = (lang: Lang): boolean => RTL_LANGS.includes(lang);

/** Подписи в переключателе языка — намеренно не переводятся. */
export const LANG_LABELS: Record<Lang, string> = {
  ru: 'RU',
  en: 'EN',
  fr: 'FR',
  ar: 'AR',
};

/** Значение атрибута hreflang. */
export const HREFLANG: Record<Lang, string> = {
  ru: 'ru',
  en: 'en',
  fr: 'fr',
  ar: 'ar',
};
