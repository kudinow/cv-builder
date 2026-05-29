-- ============================================
-- Migration 010: Fix promo code handling in handle_new_user
-- ============================================
--
-- Bug: `IF v_promo IS NOT NULL` для composite/record-типа в PL/pgSQL
-- возвращает TRUE только если ВСЕ поля строки NOT NULL. У marketing-кодов
-- с `expires_at = NULL` (бессрочные) и `owner_id = NULL` проверка всегда
-- падала в FALSE → промокод при регистрации молча игнорировался,
-- юзер получал стандартные 50 токенов вместо 50 + bonus.
--
-- Fix: используем встроенный FOUND, который PL/pgSQL выставляет после
-- последнего SELECT INTO ровно по факту наличия строки.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_promo_code text;
  v_promo record;
  v_tokens integer := 50;
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
      IF v_promo.type = 'referral' THEN
        v_tokens := v_promo.bonus_tokens;
      ELSE
        v_tokens := 50 + v_promo.bonus_tokens;
      END IF;

      INSERT INTO public.profiles (
        id, full_name, tokens, referral_code_id,
        consent_privacy, consent_marketing,
        consent_privacy_at, consent_marketing_at,
        telegram_id, telegram_username, auth_provider
      ) VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
        v_tokens,
        v_promo.id,
        v_consent_privacy,
        v_consent_marketing,
        CASE WHEN v_consent_privacy   THEN now() ELSE NULL END,
        CASE WHEN v_consent_marketing THEN now() ELSE NULL END,
        v_telegram_id,
        v_telegram_username,
        v_auth_provider
      );

      IF v_promo.type = 'referral' THEN
        INSERT INTO public.token_transactions (user_id, amount, type, description)
        VALUES (new.id, v_tokens, 'bonus', 'Бонус по реферальному коду');
      ELSE
        INSERT INTO public.token_transactions (user_id, amount, type, description)
        VALUES (new.id, 50, 'bonus', 'Бонус при регистрации');
        IF v_promo.bonus_tokens > 0 THEN
          INSERT INTO public.token_transactions (user_id, amount, type, description)
          VALUES (new.id, v_promo.bonus_tokens, 'bonus', 'Промо-код: ' || v_promo.code);
        END IF;
      END IF;

      INSERT INTO public.promo_code_uses (promo_code_id, user_id, tokens_granted, owner_tokens_pending)
      VALUES (
        v_promo.id,
        new.id,
        v_promo.bonus_tokens,
        CASE WHEN v_promo.type = 'referral' AND v_promo.owner_id IS NOT NULL THEN true ELSE false END
      );

      UPDATE public.promo_codes SET uses_count = uses_count + 1 WHERE id = v_promo.id;
      RETURN new;
    END IF;
  END IF;

  -- Дефолт: без промо
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

  INSERT INTO public.token_transactions (user_id, amount, type, description)
  VALUES (new.id, 50, 'bonus', 'Бонус при регистрации');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
