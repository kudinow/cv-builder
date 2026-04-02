-- Add title column to cover_letters
-- Run in Supabase SQL Editor

alter table public.cover_letters
  add column if not exists title text;
