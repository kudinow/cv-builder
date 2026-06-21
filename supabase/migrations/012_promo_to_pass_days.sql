-- ============================================
-- Migration 012: Promo & referral → pass days
-- ============================================

-- 1. Backfill дней доступа на существующие промокоды (все по 3 дня).
UPDATE public.promo_codes SET pass_days = 3
  WHERE pass_days IS NULL AND type IN ('marketing', 'partner');
UPDATE public.promo_codes SET pass_days = COALESCE(pass_days, 3),
                              owner_pass_days = COALESCE(owner_pass_days, 3)
  WHERE type = 'referral';

-- 2. handle_new_user: при регистрации с промо начисляем ДНИ доступа, не токены.
--    База — версия из миграции 010 (live), токен-бонусы заменены на grant_pass_days.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_promo_code text;
  v_promo record;
  v_consent_privacy boolean;
  v_consent_marketing boolean;
  v_telegram_id bigint;
  v_telegram_username text;
  v_auth_provider text;
BEGIN
  v_consent_privacy   := COALESCE((new.raw_user_meta_data ->> 'consent_privacy')::boolean, false);
  v_consent_marketing := COALESCE((new.raw_user_meta_data ->> 'consent_marketing')::boolean, false);
  v_telegram_id       := NULLIF(new.raw_user_meta_data ->> 'telegram_id', '')::bigint;
  v_telegram_username := new.raw_user_meta_data ->> 'telegram_username';
  v_auth_provider     := CASE
    WHEN new.raw_user_meta_data ->> 'auth_provider' IN ('email', 'telegram')
      THEN new.raw_user_meta_data ->> 'auth_provider'
    ELSE 'email'
  END;
  v_promo_code        := new.raw_user_meta_data ->> 'promo_code';

  IF v_promo_code IS NOT NULL AND v_promo_code != '' THEN
    SELECT * INTO v_promo FROM public.promo_codes
    WHERE UPPER(code) = UPPER(v_promo_code) AND active = true
    LIMIT 1;

    IF FOUND THEN
      INSERT INTO public.profiles (
        id, full_name, tokens, referral_code_id,
        consent_privacy, consent_marketing,
        consent_privacy_at, consent_marketing_at,
        telegram_id, telegram_username, auth_provider
      ) VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
        50,
        v_promo.id,
        v_consent_privacy,
        v_consent_marketing,
        CASE WHEN v_consent_privacy   THEN now() ELSE NULL END,
        CASE WHEN v_consent_marketing THEN now() ELSE NULL END,
        v_telegram_id,
        v_telegram_username,
        v_auth_provider
      );

      -- Freemium: грант — дни доступа.
      IF COALESCE(v_promo.pass_days, 0) > 0 THEN
        PERFORM public.grant_pass_days(new.id, v_promo.pass_days);
      END IF;

      INSERT INTO public.promo_code_uses (promo_code_id, user_id, tokens_granted, owner_tokens_pending)
      VALUES (
        v_promo.id,
        new.id,
        COALESCE(v_promo.pass_days, 0),  -- переиспользовано под «дни»
        CASE WHEN v_promo.type = 'referral' AND v_promo.owner_id IS NOT NULL
                  AND COALESCE(v_promo.owner_pass_days, 0) > 0 THEN true ELSE false END
      );

      UPDATE public.promo_codes SET uses_count = uses_count + 1 WHERE id = v_promo.id;
      RETURN new;
    END IF;
  END IF;

  -- Дефолт: без промо.
  INSERT INTO public.profiles (
    id, full_name, tokens,
    consent_privacy, consent_marketing,
    consent_privacy_at, consent_marketing_at,
    telegram_id, telegram_username, auth_provider
  ) VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    50,
    v_consent_privacy,
    v_consent_marketing,
    CASE WHEN v_consent_privacy   THEN now() ELSE NULL END,
    CASE WHEN v_consent_marketing THEN now() ELSE NULL END,
    v_telegram_id,
    v_telegram_username,
    v_auth_provider
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. process_referral_bonus: owner-бонус в ДНЯХ на первом действии приглашённого.
CREATE OR REPLACE FUNCTION public.process_referral_bonus(p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_pending record;
BEGIN
  IF (SELECT has_first_action FROM public.profiles WHERE id = p_user_id) THEN
    RETURN;
  END IF;

  UPDATE public.profiles SET has_first_action = true WHERE id = p_user_id;

  SELECT pcu.id, pc.owner_id, pc.owner_pass_days
  INTO v_pending
  FROM public.promo_code_uses pcu
  JOIN public.promo_codes pc ON pc.id = pcu.promo_code_id
  WHERE pcu.user_id = p_user_id
    AND pcu.owner_tokens_pending = true
    AND pc.owner_id IS NOT NULL
    AND COALESCE(pc.owner_pass_days, 0) > 0
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  PERFORM public.grant_pass_days(v_pending.owner_id, v_pending.owner_pass_days);

  UPDATE public.promo_code_uses
  SET owner_tokens_pending = false, owner_tokens_granted = v_pending.owner_pass_days
  WHERE id = v_pending.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Документируем переиспользование колонок под счётчик ДНЕЙ (с миграции 012).
COMMENT ON COLUMN public.promo_code_uses.tokens_granted       IS 'reused as pass-days count since migration 012 (freemium)';
COMMENT ON COLUMN public.promo_code_uses.owner_tokens_granted IS 'reused as owner pass-days count since migration 012 (freemium)';
