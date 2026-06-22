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
- **Telegram сеть (РКН-блок, двусторонний)** — подсети Telegram заблокированы и на выход, и на вход. Исходящее: `api.telegram.org` запинен в `/etc/hosts` VM на рабочий IP `149.154.167.220`. Входящее (webhook от Telegram) дропается до nginx — поэтому бот работает НЕ на webhook, а на **long polling**: процесс PM2 `tg-poller` (`scripts/telegram-poller.mjs`) дёргает `getUpdates` и прокидывает апдейты на локальный `/api/telegram/webhook`. Не возвращать `setWebhook`. Если бот замолчал — проверь `pm2 logs tg-poller` и доступность IP `149.154.167.220`

## Auth

Два равноправных способа входа на `/auth`:
- **Telegram** — `@cvbuilder_support_bot`, deep link `?start=<token>` (см. `project_telegram_auth` в памяти). Юзер = `auth.users` с фейковым email `tg-<id>@telegram.cv-builder.ru`, ключ — `profiles.telegram_id`.
- **Email OTP** — `EmailAuthBlock` ([components/auth/email-auth-block.tsx](components/auth/email-auth-block.tsx)): `signInWithOtp({ email, options:{ data } })` → 6-значный код в письме → `verifyOtp({ email, token, type:"email" })` в той же вкладке (без редиректов/PKCE → кросс-браузер не ломается). Чистая логика — [lib/auth/email-otp.ts](lib/auth/email-otp.ts).

Аккаунты email и TG **раздельные, без связывания** (v1). Миграции не нужны: `handle_new_user` (миграция 012) тянет email-юзеров (`telegram_id` NULL, `auth_provider` 'email'); промо начисляет дни доступа. Email-код шлётся тем же Supabase-пайплайном, что magic link — шаблон Auth → Magic Link должен содержать `{{ .Token }}`.

## Navigation

Левый сайдбар (Linear-стиль, текст без иконок):
- Мои резюме → `/dashboard`
- Создать резюме → `/interview`
- Адаптировать → `/adapt`
- Сопроводительные письма → `/cover-letters`
- Промо-код → `/promo`

На мобилке: бургер-меню с выезжающим сайдбаром.

## Монетизация — freemium (с 2026-06)

Токеновая модель снята. Создание/просмотр резюме — бесплатно; **paywall на выгрузке**.
- **Продукты:** `resume_390` (390₽, разблокирует одно резюме навсегда, `resumes.unlocked`) и `pass_890` (890₽, 30 дней, `profiles.access_until`). Каталог — `lib/access-products.ts`.
- **Гейтинг:** `lib/access.ts` (`hasActivePass`, `canDownloadResume`). 402 `{code:'PAYWALL'}` → `components/paywall-modal.tsx`.
- **Платежи:** `/api/tokens/purchase` (по продукту) + `/api/tokens/webhook` (пере-верифицирует платёж через API YooKassa, фулфилмент через SECURITY DEFINER RPC `unlock_resume`/`grant_pass_days`).
- **Промо/реферал → дни доступа** (по 3 дня); owner-бонус дёргается из `/api/interview/finalize` (`process_referral_bonus`).
- **Токены** (`profiles.tokens`, `lib/tokens.ts spendTokens`) — мёртвый код/внутренний учёт, из UI убраны. Подробности — память `project_freemium_migration`.

## Deploy

```bash
cd resume-ai && git push origin main
ssh kudinow@81.26.183.228 "bash ~/deploy.sh"   # внешний IP VM (старый 158.160.160.206 устарел 2026-06)
```

## Key Directories

- `lib/prompts/` — системные промпты для AI
- `lib/access.ts` — энтайтлменты (hasActivePass, canDownloadResume); `lib/access-products.ts` — продукты. `lib/tokens.ts` — legacy (не используется для гейтинга)
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
