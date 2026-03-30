-- ============================================
-- Migration 005: Consent Fields
-- ============================================

-- 1. Add consent columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS consent_privacy boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_marketing boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_privacy_at timestamptz,
  ADD COLUMN IF NOT EXISTS consent_marketing_at timestamptz;

-- 2. Update handle_new_user trigger to store consent from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_promo_code text;
  v_promo record;
  v_tokens integer := 50;
  v_consent_privacy boolean;
  v_consent_marketing boolean;
BEGIN
  -- Extract consent values from metadata
  v_consent_privacy := COALESCE((new.raw_user_meta_data->>'consent_privacy')::boolean, false);
  v_consent_marketing := COALESCE((new.raw_user_meta_data->>'consent_marketing')::boolean, false);

  -- Check for promo code in user metadata
  v_promo_code := new.raw_user_meta_data ->> 'promo_code';

  IF v_promo_code IS NOT NULL AND v_promo_code != '' THEN
    -- Find the promo code
    SELECT * INTO v_promo FROM public.promo_codes
    WHERE UPPER(code) = UPPER(v_promo_code) AND active = true
    LIMIT 1;

    IF v_promo IS NOT NULL THEN
      -- Set tokens based on promo type
      IF v_promo.type = 'referral' THEN
        v_tokens := v_promo.bonus_tokens;
      ELSE
        v_tokens := 50 + v_promo.bonus_tokens;
      END IF;

      -- Create profile with adjusted tokens and consent
      INSERT INTO public.profiles (
        id, full_name, tokens, referral_code_id,
        consent_privacy, consent_marketing,
        consent_privacy_at, consent_marketing_at
      )
      VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
        v_tokens,
        v_promo.id,
        v_consent_privacy,
        v_consent_marketing,
        CASE WHEN v_consent_privacy THEN now() ELSE NULL END,
        CASE WHEN v_consent_marketing THEN now() ELSE NULL END
      );

      -- Record bonus transaction
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

      -- Record promo code usage
      INSERT INTO public.promo_code_uses (promo_code_id, user_id, tokens_granted, owner_tokens_pending)
      VALUES (
        v_promo.id,
        new.id,
        CASE WHEN v_promo.type = 'referral' THEN v_promo.bonus_tokens ELSE v_promo.bonus_tokens END,
        CASE WHEN v_promo.type = 'referral' AND v_promo.owner_id IS NOT NULL THEN true ELSE false END
      );

      -- Increment uses_count
      UPDATE public.promo_codes SET uses_count = uses_count + 1 WHERE id = v_promo.id;

      RETURN new;
    END IF;
  END IF;

  -- Default: no promo code or invalid code
  INSERT INTO public.profiles (
    id, full_name, tokens,
    consent_privacy, consent_marketing,
    consent_privacy_at, consent_marketing_at
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    50,
    v_consent_privacy,
    v_consent_marketing,
    CASE WHEN v_consent_privacy THEN now() ELSE NULL END,
    CASE WHEN v_consent_marketing THEN now() ELSE NULL END
  );

  INSERT INTO public.token_transactions (user_id, amount, type, description)
  VALUES (new.id, 50, 'bonus', 'Бонус при регистрации');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
