// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * Значения по умолчанию — для локальной разработки: сайт отдаётся из корня.
 *
 * На деплое их подставляет .github/workflows/deploy.yml, который вычисляет
 * base сам: корень для своего домена и для репозитория вида <владелец>.github.io,
 * подкаталог '/<репозиторий>' в остальных случаях. Поэтому здесь имя репозитория
 * не упоминается — иначе переименование или переезд ломали бы локальную сборку.
 */
const SITE = process.env.SITE_URL ?? 'http://localhost:4321';
const BASE = process.env.BASE_PATH ?? '/';

export default defineConfig({
  site: SITE,
  base: BASE,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'ru',
        locales: { ru: 'ru', en: 'en', fr: 'fr', ar: 'ar' },
      },
    }),
  ],
});
