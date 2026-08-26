# Персональный сайт Ксении Ядченко

Статический сайт-визитка на четырёх языках (RU / EN / FR / AR), собирается Astro,
публикуется на GitHub Pages.

Документы проекта: [`SPEC.md`](SPEC.md) — что и зачем строим,
[`PLAN.md`](PLAN.md) — как, [`TASKS.md`](TASKS.md) — текущий статус,
[`docs/hosting-research.md`](docs/hosting-research.md) — сравнение хостингов и доменов.

## Команды

```bash
npm install
npm run dev                 # http://localhost:4321/yadchenko-website/
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

## Как добавить публикацию или заметку

Дописать блок в `src/content/articles.yaml` (или `notes.yaml`). Схема требует
все четыре языка — если одного не хватает, сборка упадёт с понятной ошибкой.

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

### Что нужно сделать руками один раз

1. Создать репозиторий на GitHub и запушить `main`.
2. Settings → Pages → Source: **GitHub Actions**.
3. Для своего домена: купить, прописать DNS, положить домен в `public/CNAME`,
   включить Enforce HTTPS. Подробности — в `PLAN.md`, фаза 7.

## Статус контента

Тексты, фотография и структура перенесены из макета. Ссылки на публикации,
почта, соцсети и CV — пока заглушки (`#`, `hello@example.com`). Перед публикацией:

```bash
npm run build && node scripts/check-placeholders.mjs --strict
```

Пока эта команда падает, сайт показывать людям рано.
# yadchenko-website
