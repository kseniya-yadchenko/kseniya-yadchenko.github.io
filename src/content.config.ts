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

const articleSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  url: z.string(),
  /** Подпись у статьи целиком, как в макете: издание, год и иногда язык
   *  оригинала, разделённые <br>. Хранится строкой, потому что состав
   *  зависит от языка: русскому читателю «· на русском» не нужно. */
  meta: localized,
  title: localized,
  dek: localized,
});

/** Из макета — перезаписывается build-content.mjs. */
const articles = defineCollection({
  loader: file('src/content/articles.yaml'),
  schema: articleSchema,
});

/** Пришедшие напрямую, минуя макет. Скрипты этот файл не трогают. */
const articlesExtra = defineCollection({
  loader: file('src/content/articles-extra.yaml'),
  schema: articleSchema,
});

const noteSchema = z.object({
  url: z.string(),
  /** Дата хранится строкой на каждом языке: так сохраняется типографика макета. */
  date: localized,
  /** ISO-дата только для сортировки; на странице не показывается. */
  published: z.string().date().optional(),
  title: localized,
  dek: localized,
});

/** Из макета — перезаписывается build-content.mjs. */
const notes = defineCollection({ loader: file('src/content/notes.yaml'), schema: noteSchema });

/** Пришедшие напрямую, минуя макет. Скрипты этот файл не трогают. */
const notesExtra = defineCollection({
  loader: file('src/content/notes-extra.yaml'),
  schema: noteSchema,
});

export const collections = { articles, articlesExtra, notes, notesExtra };
