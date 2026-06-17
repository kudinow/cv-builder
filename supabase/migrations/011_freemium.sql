-- ============================================
-- Migration 011: Freemium monetization
-- ============================================
-- Переход с токеновой модели на энтайтлменты:
--   resumes.unlocked       — конкретное резюме разблокировано навсегда (продукт resume_390)
--   profiles.access_until  — активный 30-дневный доступ (продукт pass_890)
-- Фулфилмент платежей идёт из webhook (anon, без RLS-контекста),
-- поэтому апдейты обёрнуты в SECURITY DEFINER функции, как increment_tokens.

ALTER TABLE public.resumes       ADD COLUMN IF NOT EXISTS unlocked boolean NOT NULL DEFAULT false;
ALTER TABLE public.cover_letters ADD COLUMN IF NOT EXISTS unlocked boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles      ADD COLUMN IF NOT EXISTS access_until timestamptz;
ALTER TABLE public.payments      ADD COLUMN IF NOT EXISTS product text;
ALTER TABLE public.payments      ADD COLUMN IF NOT EXISTS resume_id uuid REFERENCES public.resumes(id);

-- Подготовка для follow-up (промокоды → дни доступа). Пока не используются.
ALTER TABLE public.promo_codes ADD COLUMN IF NOT EXISTS pass_days integer;
ALTER TABLE public.promo_codes ADD COLUMN IF NOT EXISTS owner_pass_days integer;

-- Разблокировать конкретное резюме (idempotent).
CREATE OR REPLACE FUNCTION public.unlock_resume(p_resume_id uuid, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.resumes
  SET unlocked = true
  WHERE id = p_resume_id AND user_id = p_user_id;
END;
$$;

-- Начислить N дней доступа: продлеваем от max(текущий доступ, сейчас).
CREATE OR REPLACE FUNCTION public.grant_pass_days(p_user_id uuid, p_days integer)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new timestamptz;
BEGIN
  UPDATE public.profiles
  SET access_until = GREATEST(COALESCE(access_until, now()), now()) + make_interval(days => p_days)
  WHERE id = p_user_id
  RETURNING access_until INTO v_new;
  RETURN v_new;
END;
$$;

GRANT EXECUTE ON FUNCTION public.unlock_resume(uuid, uuid)   TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.grant_pass_days(uuid, integer) TO anon, authenticated, service_role;
