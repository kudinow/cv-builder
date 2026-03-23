-- ============================================
-- Migration 002: Tokens + Resume Hierarchy
-- ============================================

-- 1. Modify profiles: credits → tokens, remove subscription fields
ALTER TABLE profiles RENAME COLUMN credits TO tokens;
ALTER TABLE profiles ALTER COLUMN tokens SET DEFAULT 50;

ALTER TABLE profiles DROP COLUMN IF EXISTS subscription_tier;
ALTER TABLE profiles DROP COLUMN IF EXISTS subscription_expires_at;

-- 2. Modify resumes: add hierarchy and metadata
ALTER TABLE resumes ADD COLUMN parent_id uuid REFERENCES resumes(id) ON DELETE CASCADE;
ALTER TABLE resumes ADD COLUMN title text;
ALTER TABLE resumes ADD COLUMN target_position text;

-- Drop old CHECK constraint, update types, add new CHECK
ALTER TABLE resumes DROP CONSTRAINT IF EXISTS resumes_type_check;
UPDATE resumes SET type = 'master' WHERE type IN ('create', 'improve');
UPDATE resumes SET type = 'adaptation' WHERE type = 'adapt';
ALTER TABLE resumes ADD CONSTRAINT resumes_type_check CHECK (type IN ('master', 'adaptation'));

-- Index for hierarchy lookups
CREATE INDEX idx_resumes_parent_id ON resumes(parent_id) WHERE parent_id IS NOT NULL;

-- 3. Create token_packages table
CREATE TABLE token_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tokens integer NOT NULL,
  price_kopeks integer NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Seed default packages
INSERT INTO token_packages (name, tokens, price_kopeks) VALUES
  ('Малый', 500, 49900),
  ('Средний', 1500, 119900),
  ('Большой', 4000, 249900);

-- RLS: anyone can read active packages (public pricing)
ALTER TABLE token_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active packages"
  ON token_packages FOR SELECT
  USING (active = true);

-- 4. Create token_transactions table
CREATE TABLE token_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  type text NOT NULL CHECK (type IN ('purchase', 'spend', 'bonus')),
  description text NOT NULL,
  reference_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_token_transactions_user_id ON token_transactions(user_id);
CREATE INDEX idx_token_transactions_created_at ON token_transactions(created_at);

-- RLS: users can view only their own transactions
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON token_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert transactions for themselves (via API routes)
CREATE POLICY "Users can insert own transactions"
  ON token_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. Create interview_sessions table
CREATE TABLE interview_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  resume_id uuid REFERENCES resumes(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'expired')),
  mode text NOT NULL CHECK (mode IN ('create', 'improve')),
  phase integer NOT NULL DEFAULT 1,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  collected_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  uploaded_resume_text text,
  message_count integer NOT NULL DEFAULT 0,
  ai_tokens_used integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '72 hours'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_interview_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX idx_interview_sessions_status ON interview_sessions(status) WHERE status IN ('active', 'paused');

-- RLS: users can view/update only their own sessions
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON interview_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON interview_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON interview_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 6. Modify payments table
ALTER TABLE payments RENAME COLUMN credits_added TO tokens_added;
ALTER TABLE payments ADD COLUMN package_id uuid REFERENCES token_packages(id);

-- 7. Atomic token operations (prevent race conditions)
CREATE OR REPLACE FUNCTION decrement_tokens(p_user_id uuid, p_amount integer)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET tokens = tokens - p_amount
  WHERE id = p_user_id AND tokens >= p_amount;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient tokens';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_tokens(p_user_id uuid, p_amount integer)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET tokens = tokens + p_amount
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Update profile creation trigger to use tokens
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, tokens)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    50
  );
  -- Record bonus transaction
  INSERT INTO public.token_transactions (user_id, amount, type, description)
  VALUES (new.id, 50, 'bonus', 'Бонус при регистрации');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
