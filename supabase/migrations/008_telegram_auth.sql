-- ============================================
-- Migration 008: Telegram Auth
-- ============================================

-- 1. Расширяем profiles полями TG
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS telegram_id       bigint,
  ADD COLUMN IF NOT EXISTS telegram_username text,
  ADD COLUMN IF NOT EXISTS auth_provider     text NOT NULL DEFAULT 'email'
    CHECK (auth_provider IN ('email', 'telegram'));

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_telegram_id
  ON public.profiles(telegram_id)
  WHERE telegram_id IS NOT NULL;

-- 2. Таблица одноразовых запросов на TG-вход
CREATE TABLE IF NOT EXISTS public.telegram_auth_requests (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token             text UNIQUE NOT NULL,
  status            text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','ready','consumed','expired')),
  consent_privacy   boolean NOT NULL DEFAULT false,
  consent_marketing boolean NOT NULL DEFAULT false,
  promo_code        text,
  full_name         text,
  intent            text NOT NULL
    CHECK (intent IN ('login','register')),
  telegram_id       bigint,
  auth_user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  auth_token_hash   text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  expires_at        timestamptz NOT NULL DEFAULT now() + interval '5 minutes',
  consumed_at       timestamptz
);

CREATE INDEX IF NOT EXISTS idx_telegram_auth_requests_status_expires
  ON public.telegram_auth_requests(status, expires_at);

ALTER TABLE public.telegram_auth_requests ENABLE ROW LEVEL SECURITY;
-- К таблице ходит только service_role из server routes; политик для anon не добавляем.

-- 3. Обновляем триггер: читать telegram_id / telegram_username / auth_provider
--    Логика consent/promo сохранена 1:1 из 005_consent_fields.sql.
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

    IF v_promo IS NOT NULL THEN
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
