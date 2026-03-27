-- ============================================
-- Migration 003: Promo Codes System
-- ============================================

-- 1. Promo codes table
CREATE TABLE promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  type text NOT NULL CHECK (type IN ('marketing', 'referral', 'partner')),
  owner_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  bonus_tokens integer NOT NULL DEFAULT 0,
  owner_bonus_tokens integer NOT NULL DEFAULT 0,
  owner_bonus_on text CHECK (owner_bonus_on IN ('first_action')),
  max_uses integer,
  uses_count integer NOT NULL DEFAULT 0,
  per_user_limit integer NOT NULL DEFAULT 1,
  expires_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Case-insensitive unique index
CREATE UNIQUE INDEX idx_promo_codes_code ON promo_codes (UPPER(code));

-- Index for owner lookups (referral codes)
CREATE INDEX idx_promo_codes_owner_id ON promo_codes(owner_id) WHERE owner_id IS NOT NULL;

-- RLS
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can read active promo codes (needed for validation)
CREATE POLICY "Anyone can view active promo codes"
  ON promo_codes FOR SELECT
  USING (active = true);

-- 2. Promo code uses table
CREATE TABLE promo_code_uses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id uuid NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tokens_granted integer NOT NULL DEFAULT 0,
  owner_tokens_granted integer NOT NULL DEFAULT 0,
  owner_tokens_pending boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- One use per user per promo code (for per_user_limit enforcement)
CREATE UNIQUE INDEX idx_promo_code_uses_unique ON promo_code_uses(promo_code_id, user_id);
CREATE INDEX idx_promo_code_uses_user_id ON promo_code_uses(user_id);
CREATE INDEX idx_promo_code_uses_pending ON promo_code_uses(owner_tokens_pending) WHERE owner_tokens_pending = true;

-- RLS
ALTER TABLE promo_code_uses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own promo code uses"
  ON promo_code_uses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own promo code uses"
  ON promo_code_uses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Add fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code_id uuid REFERENCES promo_codes(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_first_action boolean NOT NULL DEFAULT false;
