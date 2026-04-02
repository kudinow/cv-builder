-- Cover Letters: standalone cover letter generation
-- Run in Supabase SQL Editor

create table if not exists public.cover_letters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  resume_id uuid references public.resumes(id) on delete set null,
  resume_text text not null,
  vacancy_url text,
  vacancy_text text not null,
  cover_letter text not null default '',
  status text not null default 'processing'
    check (status in ('processing', 'done', 'error')),
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.cover_letters enable row level security;

-- Users can CRUD only their own cover letters
create policy "Users can view own cover letters"
  on public.cover_letters for select
  using (auth.uid() = user_id);

create policy "Users can create own cover letters"
  on public.cover_letters for insert
  with check (auth.uid() = user_id);

create policy "Users can update own cover letters"
  on public.cover_letters for update
  using (auth.uid() = user_id);

create policy "Users can delete own cover letters"
  on public.cover_letters for delete
  using (auth.uid() = user_id);

-- Indexes
create index idx_cover_letters_user_id on public.cover_letters(user_id);
create index idx_cover_letters_created_at on public.cover_letters(created_at desc);
