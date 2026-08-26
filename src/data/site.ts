import type { Lang } from '../i18n/types';

/**
 * Контакты и внешние ссылки. Всё, что может понадобиться поменять без правки
 * компонентов, собрано здесь и в src/content/*.yaml.
 */

export const EMAIL = 'kseniyadchenko@icloud.com';

export const SOCIALS: ReadonlyArray<{ label: string; url: string }> = [
  { label: 'Telegram', url: 'https://t.me/kseniyadchenko' },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/kseniya-yadchenko' },
  { label: 'Substack', url: 'https://kseniyayadchenko.substack.com' },
];

export const SUBSTACK_URL = 'https://kseniyayadchenko.substack.com';

/** Лежит в public/, путь резолвится через asset() с учётом base. */
export const TRANSLATION_SAMPLE_URL = 'Yadchenko-obrazcy-perevoda.pdf';

export const NAV: ReadonlyArray<{ href: string; key: 'n1' | 'n5' | 'n2' | 'n3' | 'n6' | 'n4' }> = [
  { href: '#texts', key: 'n1' },
  { href: '#notes', key: 'n5' },
  { href: '#about', key: 'n2' },
  { href: '#serv', key: 'n3' },
  { href: '#trans', key: 'n6' },
  { href: '#contact', key: 'n4' },
];

/** Внешние ссылки открываются в новой вкладке — как в макете. */
export const isExternal = (url: string): boolean => /^https?:/.test(url);

export const META: Record<Lang, { title: string; description: string }> = {
  ru: {
    title: 'Ксения Ядченко — тексты об Африке, языках и письменностях',
    description:
      'Пишу об Африке через её языки: языковая политика, письменности и рукописи, машинный перевод для малоресурсных языков. Тексты для редакций и научный перевод.',
  },
  en: {
    title: 'Kseniya Yadchenko — writing on Africa, languages and scripts',
    description:
      'I write about Africa through its languages: language policy, writing systems and manuscripts, machine translation for low-resource languages. Commissions and academic translation.',
  },
  fr: {
    title: 'Ksenia Yadchenko — textes sur l’Afrique, les langues et les écritures',
    description:
      'J’écris sur l’Afrique à travers ses langues : politique linguistique, écritures et manuscrits, traduction automatique des langues peu dotées. Textes pour la presse et traduction scientifique.',
  },
  ar: {
    title: 'كسينيا يادتشينكو — نصوص عن أفريقيا ولغاتها وكتاباتها',
    description:
      'أكتب عن أفريقيا من خلال لغاتها: السياسة اللغوية، وأنظمة الكتابة والمخطوطات، والترجمة الآلية للغات محدودة الموارد. نصوص للمنشورات وترجمة أكاديمية.',
  },
};
