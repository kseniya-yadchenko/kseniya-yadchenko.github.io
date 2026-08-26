// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * ЕДИНСТВЕННОЕ МЕСТО, которое меняется при деплое (задачи T7.2 и T7.3).
 *
 * Пока домена нет — GitHub Pages отдаёт сайт по адресу <user>.github.io/<repo>/,
 * и BASE обязан совпадать с '/<repo>'. Иначе все CSS и ссылки уедут в 404.
 * После привязки своего домена: SITE = 'https://домен', BASE = '/'.
 */
const SITE = process.env.SITE_URL ?? 'https://EXAMPLE.github.io';
const BASE = process.env.BASE_PATH ?? '/yadchenko-website';

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
