-- ============================================
-- Migration 004: Referral Trigger Updates
-- ============================================

-- 1. Update handle_new_user to process promo codes from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_promo_code text;
  v_promo record;
  v_tokens integer := 50;
BEGIN
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
        v_tokens := v_promo.bonus_tokens; -- 80 for referral
      ELSE
        -- For marketing/partner: give standard 50 + promo bonus
        v_tokens := 50 + v_promo.bonus_tokens;
      END IF;

      -- Create profile with adjusted tokens
      INSERT INTO public.profiles (id, full_name, tokens, referral_code_id)
      VALUES (new.id, COALESCE(new.raw_user_meta_data ->> 'full_name', ''), v_tokens, v_promo.id);

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
  INSERT INTO public.profiles (id, full_name, tokens)
  VALUES (new.id, COALESCE(new.raw_user_meta_data ->> 'full_name', ''), 50);

  INSERT INTO public.token_transactions (user_id, amount, type, description)
  VALUES (new.id, 50, 'bonus', 'Бонус при регистрации');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Function to process referral bonus when user makes first action
CREATE OR REPLACE FUNCTION public.process_referral_bonus(p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_pending record;
BEGIN
  -- Check if user already had first action
  IF (SELECT has_first_action FROM public.profiles WHERE id = p_user_id) THEN
    RETURN;
  END IF;

  -- Mark first action
  UPDATE public.profiles SET has_first_action = true WHERE id = p_user_id;

  -- Find pending referral bonus
  SELECT pcu.id, pcu.promo_code_id, pc.owner_id, pc.owner_bonus_tokens
  INTO v_pending
  FROM public.promo_code_uses pcu
  JOIN public.promo_codes pc ON pc.id = pcu.promo_code_id
  WHERE pcu.user_id = p_user_id
    AND pcu.owner_tokens_pending = true
    AND pc.owner_id IS NOT NULL
    AND pc.owner_bonus_tokens > 0
  LIMIT 1;

  IF v_pending IS NULL THEN
    RETURN;
  END IF;

  -- Grant bonus to referrer
  UPDATE public.profiles
  SET tokens = tokens + v_pending.owner_bonus_tokens
  WHERE id = v_pending.owner_id;

  -- Record transaction for referrer
  INSERT INTO public.token_transactions (user_id, amount, type, description, reference_id)
  VALUES (v_pending.owner_id, v_pending.owner_bonus_tokens, 'bonus', 'Реферальный бонус', p_user_id);

  -- Mark as processed
  UPDATE public.promo_code_uses
  SET owner_tokens_pending = false, owner_tokens_granted = v_pending.owner_bonus_tokens
  WHERE id = v_pending.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
