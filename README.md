# Персональный сайт Ксении Ядченко

**https://kseniya-yadchenko.github.io**

Статический сайт-визитка на четырёх языках (RU / EN / FR / AR), собирается Astro,
публикуется на GitHub Pages.

Документы проекта: [`SPEC.md`](SPEC.md) — что и зачем строим,
[`PLAN.md`](PLAN.md) — как, [`TASKS.md`](TASKS.md) — текущий статус,
[`docs/hosting-research.md`](docs/hosting-research.md) — сравнение хостингов и доменов.

## Команды

```bash
npm install
npm run dev                 # http://localhost:4321/
npm run build               # → dist/
npm run preview

npm run check               # типы и ссылки
npm run lint                # eslint + prettier
npm run i18n:verify         # полнота переводов
npm run check:overflow      # горизонтальное переполнение, 4 языка × 4 ширины
npm run check:placeholders  # гейт публикации: href="#" и example.com
npm run shots               # скриншоты сайта и макета в scratch/shots
```

## Где что лежит

```
src/i18n/{ru,en,fr,ar}.json   строки интерфейса, 62 ключа × 4 языка
src/content/articles.yaml     публикации, секция 01
src/content/notes.yaml        малая форма, секция 02
src/data/site.ts              почта, соцсети, CV, meta-теги
src/styles/global.css         дословная копия стилей макета
src/styles/overrides.css      отклонения от макета, с объяснением каждого
src/components/               10 компонентов по секциям
src/pages/                    четыре страницы, различаются только языком
reference/                    исходный макет — эталон для сверки
scripts/                      извлечение данных и проверки
```

Правка контента не требует правки кода: тексты живут в `src/i18n`, списки —
в `src/content`, контакты — в `src/data/site.ts`.

## Как обновить сайт из нового макета

Макет присылают версиями. Положить новый файл в `reference/` (скрипты сами
возьмут файл с наибольшим номером версии) и выполнить:

```bash
npm run i18n:extract    # строки интерфейса → src/i18n/*.json
npm run content:build   # статьи и заметки → src/content/*.yaml
npm run css:extract     # стили → src/styles/global.css
npm run build
```

Отклонения от макета живут в `src/styles/overrides.css` и переживают
перегенерацию. Контакты и внешние ссылки — в `src/data/site.ts`, вручную.

## Как добавить публикацию или заметку

Дописать блок в `src/content/articles.yaml` (или `notes.yaml`). Схема требует
все четыре языка — если одного не хватает, сборка упадёт с понятной ошибкой.
Но если запись есть в макете, проще обновить макет и перегенерировать.

## Как устроены языки

У каждого языка свой URL (`/`, `/en/`, `/fr/`, `/ar/`) и свой готовый HTML.
Это отличие от исходного макета, где переводы подставлялись на клиенте и
поисковики видели только русскую версию. Арабская версия отдаётся с `dir="rtl"`;
отдельной таблицы стилей для неё нет — макет написан на логических CSS-свойствах.

## Деплой

Пуш в `main` → GitHub Actions собирает и публикует. Ручных шагов нет.

`base` и `site` workflow вычисляет сам: если в `public/CNAME` лежит домен —
сайт собирается под него, иначе под `<user>.github.io/<repo>/`. Это закрывает
самые частые грабли Astro на GitHub Pages — сайт без стилей из-за неверного `base`.

Репозиторий назван `kseniya-yadchenko.github.io` — по совпадению имени
с владельцем GitHub Pages понимает, что сайт надо отдавать из корня домена,
а не из подкаталога. Workflow это учитывает и собирает с `base=/`.

### Свой домен

Купить, прописать DNS, положить домен в `public/CNAME`, включить Enforce HTTPS.
`base` и `site` workflow пересчитает сам. Подробности — в `PLAN.md`, фаза 7.

## Статус контента

Контент перенесён из макета v49: настоящая публикация со ссылкой, рабочая почта,
Telegram, LinkedIn, Substack. Заглушками остаются ссылки на три заметки в «Малой
форме» и PDF с фрагментом перевода. Перед публикацией:

```bash
npm run build && node scripts/check-placeholders.mjs --strict
```

Пока эта команда падает, сайт показывать людям рано.
