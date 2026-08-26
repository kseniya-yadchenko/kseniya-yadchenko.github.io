# Задачи

Из `PLAN.md`. Каждая задача — один фокусный подход, ≤5 файлов, с явной проверкой.
Статус: `[ ]` не начата · `[~]` в работе · `[x]` готова

---

## Ф0 — Фундамент

- [x] **T0.1** Инициализация репозитория
  - Приёмка: `git init`, `.gitignore` (node_modules, dist, .astro, .env, .DS_Store), README с командами, макет переехал в `reference/yadchenko-site-v31.html`
  - Проверка: `git status` чист от мусора; макет сохранён как эталон для скриншот-диффов
  - Файлы: `.gitignore`, `README.md`, `reference/`

- [x] **T0.2** Astro 5 + TypeScript strict
  - Приёмка: `astro.config.mjs` с `output:'static'`, `site`, `base`, `build.format:'directory'`, `@astrojs/sitemap`; `tsconfig.json` strict; `public/.nojekyll`
  - Проверка: `npm run build` собирает пустой проект; `dist/.nojekyll` существует
  - Файлы: `package.json`, `astro.config.mjs`, `tsconfig.json`, `public/.nojekyll`

- [x] **T0.3** ESLint + Prettier
  - Приёмка: конфиги под Astro + TS, скрипты `lint` и `format`
  - Проверка: `npm run lint` проходит на пустом проекте
  - Файлы: `eslint.config.js`, `.prettierrc`, `package.json`

## Ф1 — Извлечение _(T1.1–T1.2 ‖ T1.3–T1.4)_

- [x] **T1.1** Скрипт извлечения i18n
  - Приёмка: `scripts/extract-i18n.mjs` тянет RU из `data-i`-элементов макета и EN/FR/AR из объекта `T` → `src/i18n/{ru,en,fr,ar}.json`
  - Проверка: 4 файла, в каждом 86 ключей
  - Файлы: `scripts/extract-i18n.mjs`, `src/i18n/*.json`

- [x] **T1.2** Верификатор полноты переводов
  - Приёмка: `scripts/verify-i18n.mjs` падает при расхождении наборов ключей между языками; тип `Lang` и типизированный хелпер `t()`
  - Проверка: `node scripts/verify-i18n.mjs` → «86 ключей × 4 языка, расхождений нет»
  - Файлы: `scripts/verify-i18n.mjs`, `src/i18n/types.ts`, `src/i18n/index.ts`

- [x] **T1.3** Перенос дизайн-слоя
  - Приёмка: `<style>` из макета → `src/styles/global.css` **дословно**, без рефакторинга: токены, SVG-кружева в data-URI, keyframes
  - Проверка: побайтовое сравнение содержимого стилей с макетом (кроме `@import` шрифтов)
  - Файлы: `src/styles/global.css`

- [x] **T1.4** Self-hosted шрифты
  - Приёмка: Playfair Display, Jost, IBM Plex Sans Arabic локально, `font-display:swap`, подмножества (latin+cyrillic; arabic — только для AR)
  - Проверка: в собранном `dist/` нет запросов к `fonts.googleapis.com`
  - Файлы: `public/fonts/`, `src/styles/fonts.css`

**Контрольная точка 1 — показать извлечённые данные.**

## Ф2 — Каркас

- [ ] **T2.1** `BaseLayout.astro`
  - Приёмка: `lang`/`dir`, title и description по языкам, canonical, крест-накрест `hreflang` ×4 + `x-default`, OG + Twitter, JSON-LD `Person`
  - Проверка: HTML валиден; в `/en/` ровно 5 тегов `hreflang`
  - Файлы: `src/layouts/BaseLayout.astro`, `src/data/site.ts`

## Ф3 — Компоненты и коллекции _(T3.1 ‖ T3.2–T3.3)_

- [ ] **T3.1** Content collections
  - Приёмка: Zod-схемы `articles` (издание, год, url, title/dek ×4 языка) и `notes` (дата, title/dek ×4); наполнены данными макета; **отсутствие любого языка роняет сборку**
  - Проверка: `astro check` чист; удаление одного перевода ломает сборку
  - Файлы: `src/content.config.ts`, `src/content/articles/*.md`, `src/content/notes/*.md`

- [ ] **T3.2** Обвязка: `Header`, `Footer`, `Manifesto`
  - Приёмка: навигация, переключатель языка **ссылками**, sticky-поведение и смена подписи при скролле — как в макете
  - Проверка: рендерятся на всех 4 языках
  - Файлы: `src/components/{Header,Footer,Manifesto}.astro`

- [ ] **T3.3** Секции 01–06 + Hero
  - Приёмка: `Hero`, `Texts`, `Notes`, `About`, `Services`, `Translation`, `Contact`; строки из i18n, списки из коллекций
  - Проверка: `astro check` чист; ни одной строки, зашитой в компонент
  - Файлы: `src/components/*.astro` (7 файлов)

## Ф4 — Маршруты

- [ ] **T4.1** Четыре страницы
  - Приёмка: `/`, `/en/`, `/fr/`, `/ar/`, собранные из компонентов
  - Проверка: `curl -s localhost:4321/en/ | grep "I write about Africa"` находит текст; то же для FR и AR
  - Файлы: `src/pages/index.astro`, `src/pages/{en,fr,ar}/index.astro`

- [ ] **T4.2** Переключатель языка
  - Приёмка: обычные `<a href>` без JS; активный язык — `aria-current`
  - Проверка: работает с отключённым JavaScript
  - Файлы: `src/components/Header.astro`

## Ф5 — RTL и визуальная сверка

- [ ] **T5.1** Арабская версия
  - Приёмка: `dir="rtl"`, IBM Plex Sans Arabic, все 6 секций сверены
  - Проверка: `curl -s localhost:4321/ar/ | grep 'dir="rtl"'`; визуально сетка не разъезжается
  - Файлы: `src/pages/ar/index.astro`, `src/styles/global.css`

- [ ] **T5.2** Скриншот-диффы против макета
  - Приёмка: 375 / 768 / 1440 px × 4 языка, рядом с `reference/yadchenko-site-v31.html`
  - Проверка: расхождений в дизайне нет
  - Файлы: `tests/visual.spec.ts`

**Контрольная точка 2 — показать скриншоты рядом с макетом.**

## Ф6 — Качество в CI

- [ ] **T6.1** Базовый пайплайн — `astro check` → `build` → `verify-i18n` → `lychee`
- [ ] **T6.2** Playwright + axe — 4 языка открываются, переключатель работает, AR отдаёт RTL, 0 critical-нарушений
- [ ] **T6.3** Lighthouse CI — Perf ≥ 95, A11y ≥ 95, SEO = 100
  - Проверка (все три): пайплайн зелёный на живом PR
  - Файлы: `.github/workflows/ci.yml`, `tests/`, `lighthouserc.json`

## Ф7 — Деплой

- [ ] **T7.1** Workflow деплоя
  - Приёмка: `deploy.yml` — build → `upload-pages-artifact` → `deploy-pages`, permissions `pages:write`, `id-token:write`
  - Проверка: зелёный прогон; `dist/_astro/` в артефакте
  - Файлы: `.github/workflows/deploy.yml`

- [ ] **T7.2** Репозиторий и настройки Pages _(нужен ты — `gh` CLI не установлен)_
  - Приёмка: репозиторий создан, Settings → Pages → source «GitHub Actions», `base` в конфиге совпадает с URL
  - Проверка: сайт открывается на `<user>.github.io/<repo>/`, стили подгружаются

- [ ] **T7.3** Домен _(нужен ты — покупка)_
  - Приёмка: домен на reg.ru; apex — A-записи `185.199.108–111.153`, `www` — CNAME на `<user>.github.io`; `public/CNAME`; `base` → `/`; Enforce HTTPS
  - Проверка: домен открывается по HTTPS, все 4 языка, OG-карточка разворачивается в мессенджере
  - Файлы: `public/CNAME`, `astro.config.mjs`

## Ф8 — Контент _(когда придут материалы)_

- [ ] **T8.1** Подстановка настоящего контента — правка `src/i18n/*.json`, `src/content/**`, `src/data/site.ts`, `public/cv.pdf`, `public/og.png`. **Компоненты не трогаем**
- [ ] **T8.2** Гейт публикации — ноль `href="#"` и ноль `example.com` в `dist/`, проверкой в CI

**Контрольная точка 3 — перед покупкой домена. Контрольная точка 4 — финальная вычитка перед публикацией.**
