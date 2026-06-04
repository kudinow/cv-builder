@AGENTS.md

# ResumeAI — CV Builder

AI-платформа для создания резюме и сопроводительных писем. Домен: cv-builder.ru

## Tech Stack

- Next.js 16.2.1 (App Router), React 19, TypeScript
- Supabase (PostgreSQL + Auth + RLS)
- OpenRouter API (Claude Sonnet) for AI
- PM2 + Nginx on Yandex Cloud VM

## Critical Rules

- **ВСЕГДА `getSession()` вместо `getUser()`** — getUser() вешает сервер
- **Dashboard — клиентский компонент** — серверные компоненты с Supabase зависают
- **`resume-ai` — git submodule** — коммиты делать изнутри `resume-ai/`
- **Колонка `tokens`** (не `credits`) — миграция 002 уже применена
- **Inline styles** — проект использует inline styles для цветов, не Tailwind классы
- **Middleware path matching** — `lib/supabase-middleware.ts` использует `pathname === p || pathname.startsWith(p + "/")`, не голый `startsWith`. Иначе `/adapt` ловит `/adaptaciya-resume` и др. маркетинг-URL
- **Telegram egress** — подсети api.telegram.org с прод-VM заблокированы (РКН). `api.telegram.org` запинен в `/etc/hosts` на рабочий IP `149.154.167.220`. Если бот замолчал — проверь доступность этого IP, не самого хоста (он резолвится в заблокированный адрес)

## Navigation

Левый сайдбар (Linear-стиль, текст без иконок):
- Мои резюме → `/dashboard`
- Создать резюме → `/interview`
- Адаптировать → `/adapt`
- Сопроводительные письма → `/cover-letters`
- Промо-код → `/promo`

На мобилке: бургер-меню с выезжающим сайдбаром.

## Token Costs

- Создание резюме: 100
- Улучшение резюме: 80
- Адаптация: 50
- Сопроводительное письмо: 20

## Deploy

```bash
cd resume-ai && git push origin main
ssh kudinow@158.160.160.206 "bash ~/deploy.sh"
```

## Key Directories

- `lib/prompts/` — системные промпты для AI
- `lib/tokens.ts` — сервис токенов (spendTokens, getBalance)
- `supabase/migrations/` — SQL миграции (001-007)
- `components/dashboard-nav-links.tsx` — сайдбар навигации
- `components/dashboard-shell.tsx` — layout дашборда

## Marketing / SEO

15 публичных SEO-страниц в `app/(marketing)/`:
- `obrazec-rezume`, `kak-sostavit-rezume`, `soprovoditelnoe-pismo`, `ai-resume`
- `rezume` index + 5 programmatic `rezume/[slug]` (buhgalter, menedzher-prodazh, dizayner, razrabotchik, hr)
- `rezume-na-angliyskom`, `konstruktor`, `adaptaciya-resume`
- `blog` + статьи `oshibki-v-rezume`, `dostizheniya-v-rezume`

Source of truth для данных: `lib/seo/{faq,professions,blog,pages}.ts`. Шаринг компоненты — `components/marketing/*`. `app/sitemap.ts` динамически собирает URL из `professions` и `blogPosts`.

При добавлении новой страницы: создать в `(marketing)/`, добавить в `lib/seo/pages.ts` (для RelatedTiles) и в footer колонку «Гайды».
