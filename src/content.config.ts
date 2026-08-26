import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';
import { LANGS } from './i18n/types';

/**
 * Схема намеренно требует все четыре языка у каждого текстового поля.
 * Это и есть автоматическая проверка полноты контента: если при подстановке
 * настоящих материалов забудут французский заголовок, сборка упадёт с внятной
 * ошибкой, а не покажет посетителю русский текст на французской странице.
 */
const localized = z.object(
  Object.fromEntries(LANGS.map((l) => [l, z.string().min(1)])) as Record<
    (typeof LANGS)[number],
    z.ZodString
  >,
);

const articles = defineCollection({
  loader: file('src/content/articles.yaml'),
  schema: z.object({
    year: z.number().int().min(2000).max(2100),
    url: z.string(),
    outlet: localized,
    title: localized,
    dek: localized,
  }),
});

const notes = defineCollection({
  loader: file('src/content/notes.yaml'),
  schema: z.object({
    url: z.string(),
    /** Дата хранится строкой на каждом языке: так сохраняется типографика макета. */
    date: localized,
    title: localized,
    dek: localized,
  }),
});

export const collections = { articles, notes };
