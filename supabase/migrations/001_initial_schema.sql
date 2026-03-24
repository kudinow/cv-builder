-- ResumeAI: Initial database schema
-- Run this migration in Supabase SQL Editor

-- ============================================
-- Table: profiles
-- ============================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  credits integer not null default 1,
  subscription_tier text not null default 'free'
    check (subscription_tier in ('free', 'pro', 'unlimited')),
  subscription_expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Users can read/update only their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- Table: resumes
-- ============================================
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('adapt', 'create')),
  status text not null default 'processing'
    check (status in ('processing', 'done', 'error')),
  original_text text,
  vacancy_url text,
  vacancy_text text,
  adapted_text text,
  cover_letter text,
  changes_log jsonb default '[]'::jsonb,
  pdf_path text,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.resumes enable row level security;

-- Users can CRUD only their own resumes
create policy "Users can view own resumes"
  on public.resumes for select
  using (auth.uid() = user_id);

create policy "Users can create own resumes"
  on public.resumes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own resumes"
  on public.resumes for update
  using (auth.uid() = user_id);

create policy "Users can delete own resumes"
  on public.resumes for delete
  using (auth.uid() = user_id);

-- Index for dashboard listing
create index idx_resumes_user_id on public.resumes(user_id);
create index idx_resumes_created_at on public.resumes(created_at desc);

-- ============================================
-- Table: payments
-- ============================================
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null, -- in kopeks (копейки)
  payment_id text, -- YooKassa payment ID
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'refunded')),
  credits_added integer not null default 0,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.payments enable row level security;

-- Users can view only their own payments
create policy "Users can view own payments"
  on public.payments for select
  using (auth.uid() = user_id);

-- Index
create index idx_payments_user_id on public.payments(user_id);
create index idx_payments_payment_id on public.payments(payment_id);

-- ============================================
-- Storage bucket for generated PDFs
-- ============================================
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

-- Users can access only their own files
create policy "Users can upload own resume PDFs"
  on storage.objects for insert
  with check (
    bucket_id = 'resumes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view own resume PDFs"
  on storage.objects for select
  using (
    bucket_id = 'resumes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
