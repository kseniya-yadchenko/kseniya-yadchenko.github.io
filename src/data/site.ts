import type { Lang } from '../i18n/types';

/**
 * Всё, что придётся заменить, когда придут настоящие материалы (задача T8.1),
 * собрано здесь и в src/content/*.yaml. Компоненты этих значений не знают.
 */

/** TODO(T8.1): заменить на рабочий адрес. Гейт публикации падает, пока здесь example.com. */
export const EMAIL = 'hello@example.com';

/** TODO(T8.1): вписать ссылки или удалить пункт. Пустой url скрывает ссылку. */
export const SOCIALS: ReadonlyArray<{ label: string; url: string }> = [
  { label: 'Telegram', url: '#' },
  { label: 'LinkedIn', url: '#' },
  { label: 'Substack', url: '#' },
];

/** TODO(T8.1): положить файл в public/cv.pdf или убрать кнопку. */
export const CV_URL = '#';

/** TODO(T8.1): настоящая ссылка на Substack. */
export const SUBSTACK_URL = '#';

export const NAV: ReadonlyArray<{ href: string; key: 'n1' | 'n5' | 'n2' | 'n3' | 'n6' | 'n4' }> = [
  { href: '#texts', key: 'n1' },
  { href: '#notes', key: 'n5' },
  { href: '#about', key: 'n2' },
  { href: '#serv', key: 'n3' },
  { href: '#trans', key: 'n6' },
  { href: '#contact', key: 'n4' },
];

/** Заголовок вкладки и описание для поисковой выдачи — по языкам. */
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
