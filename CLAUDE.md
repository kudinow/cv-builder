@AGENTS.md

# ResumeAI — CV Builder

AI-платформа для создания резюме и сопроводительных писем. Домен: cv-builder.ru

## Tech Stack

- Next.js 16.2.1 (App Router), React 19, TypeScript
- Supabase (PostgreSQL + Auth + RLS)
- OpenRouter API (Claude Sonnet) for AI
- PM2 + Nginx on VPS 89.19.209.92 (Германия, с 2026-09-23; до этого Yandex Cloud)

## Critical Rules

- **ВСЕГДА `getSession()` вместо `getUser()`** — getUser() вешает сервер
- **Dashboard — клиентский компонент** — серверные компоненты с Supabase зависают
- **`resume-ai` — git submodule** — коммиты делать изнутри `resume-ai/`
- **Колонка `tokens`** (не `credits`) — миграция 002 уже применена
- **Inline styles** — проект использует inline styles для цветов, не Tailwind классы
- **Middleware path matching** — `lib/supabase-middleware.ts` использует `pathname === p || pathname.startsWith(p + "/")`, не голый `startsWith`. Иначе `/adapt` ловит `/adaptaciya-resume` и др. маркетинг-URL
- **Supabase free-tier авто-пауза** — проект засыпает после ~7 дней неактивности и валит вход обоими способами разом (общий GoTrue), при живом сайте на 200. Тэлл: `xlguerrejryvgwlaygbe.supabase.co` даёт NXDOMAIN на публичном DNS. Профилактика стоит: cron `0 */6 * * *` на VPS гоняет `~/supabase-keepalive.sh` (с `SUPABASE_KEEPALIVE_ENV=/home/kudinow/shared/.env.local`) (исходник — [scripts/supabase-keepalive.sh](scripts/supabase-keepalive.sh)), лог `~/logs/supabase-keepalive.log`, две неудачи подряд → алерт в TG. Разбудить можно только руками — Restore в дашборде, ~10–25 мин; сразу после Restore PostgREST ещё отдаёт 404 `PGRST205`, пока не подтянет schema cache (~3 мин)
- **Telegram-бот на long polling** — процесс PM2 `tg-poller` (`scripts/telegram-poller.mjs`) дёргает `getUpdates` и прокидывает апдейты на локальный `/api/telegram/webhook`. Исторически из-за РКН-блока на российской VM; на зарубежном VPS Telegram доступен напрямую, пины в `/etc/hosts` не нужны. `setWebhook` не возвращать без отдельного решения. Поллер должен быть **ровно один** — второй экземпляр даёт `Conflict: terminated by other getUpdates request`. Если бот замолчал — `pm2 logs tg-poller`
- **Лимиты интервью** (`INTERVIEW_LIMITS` в `lib/token-costs.ts`) — `ai_tokens_used` копит prompt+completion **каждого** хода, а история пересылается целиком → счётчик растёт квадратично (50k кончались на ~13-м ходу, 2026-09). Сверх лимита пропускается только финализация: `finalize: true` + сообщение заканчивается `INTERVIEW_FINALIZE_INSTRUCTION`. Упор в лимит логируется `[interview] Session limit hit` в `pm2 logs resume-ai`; диагностика — строка сессии в `interview_sessions` (`message_count`, `ai_tokens_used`)
- **Гео-блок western API** — OpenRouter режет российские IP (403 «Access denied by security policy»). Поэтому прод на зарубежном VPS; при переезде в РФ интервью и все AI-функции умрут

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
gh workflow run deploy -R kudinow/cv-builder   # или кнопка Run workflow в Actions
```

Сборка идёт в GitHub Actions ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)) — на VPS (1 ГБ RAM) `next build` не влезает. Workflow rsync-ает standalone-бандл в `~/releases/<sha>`, переключает `~/current`, делает `pm2 startOrReload ~/shared/ecosystem.config.cjs` и health-check; хранит 3 релиза.

- VPS `89.19.209.92` **общий** (там же tukan.su, tezis.fun и др.) — nginx/ufw/certbot менять только аддитивно. SSH: `kudinow@` (приложение, без sudo), `root@` (админ).
- Рантайм-секреты — только на сервере в `~/shared/.env.local`; в GitHub лишь `DEPLOY_*` secrets и 3 публичных `NEXT_PUBLIC_*` в Variables. Новая `NEXT_PUBLIC_*` переменная → добавить и в Variables, и в `env:` шага build.
- Откат: `ln -sfn ~/releases/<старый sha> ~/current && pm2 startOrReload ~/shared/ecosystem.config.cjs`.

## Key Directories

- `lib/prompts/` — системные промпты для AI
- `lib/access.ts` — энтайтлменты (hasActivePass, canDownloadResume); `lib/access-products.ts` — продукты. `lib/tokens.ts` — legacy (не используется для гейтинга)
- `supabase/migrations/` — SQL миграции (001-012)
- `components/dashboard-nav-links.tsx` — сайдбар навигации
- `components/dashboard-shell.tsx` — layout дашборда

## Marketing / SEO

18 публичных SEO-страниц в `app/(marketing)/`:
- `obrazec-rezume`, `kak-sostavit-rezume`, `soprovoditelnoe-pismo`, `ai-resume`
- `rezume` index + 5 programmatic `rezume/[slug]` (buhgalter, menedzher-prodazh, dizayner, razrabotchik, hr)
- `rezume-na-angliyskom`, `konstruktor`, `adaptaciya-resume`
- 3 сегментных лендинга: `rezume-marketologu`, `rezume-it`, `rezume-rukovoditelyu`
- `blog` + статьи `oshibki-v-rezume`, `dostizheniya-v-rezume`

**Сегментные лендинги** — один переиспользуемый `components/landing/segment-landing.tsx` (+ заскоупленный `segment-landing.css` под `.lp`) и серверная обёртка `segment-landing-page.tsx` (metadata + JSON-LD). Весь текст сегментов — в `lib/landing-segments.ts` (`**bold**`-разметка рендерится через `<Rich>`). Интерактив «вставь строчку» зовёт `POST /api/rewrite` (переписывание через `callOpenRouter`; валидация, rate-limit 5/мин по IP, таймаут 10с, фильтр мусора/инъекций, in-memory кэш, фолбэк-примеры из конфига; ключ только в env). Промпт — `lib/prompts/rewrite-line.ts`.

Source of truth для данных: `lib/seo/{faq,professions,blog,pages}.ts`. Шаринг компоненты — `components/marketing/*`. `app/sitemap.ts` динамически собирает URL из `professions` и `blogPosts`.

При добавлении новой страницы: создать в `(marketing)/`, добавить в `lib/seo/pages.ts` (для RelatedTiles) и в footer колонку «Гайды».
