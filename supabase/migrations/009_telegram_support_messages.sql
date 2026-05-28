-- ResumeAI: maps admin chat message_id → user chat for the support relay.
-- Lookup happens on every admin Reply: reply_to_message.message_id → user_chat_id.

create table if not exists public.telegram_support_messages (
  id bigserial primary key,
  admin_message_id bigint not null,
  user_chat_id bigint not null,
  user_telegram_id bigint,
  direction text not null check (direction in ('inbound', 'outbound')),
  created_at timestamptz not null default now()
);

create index if not exists telegram_support_messages_admin_msg_idx
  on public.telegram_support_messages (admin_message_id);

alter table public.telegram_support_messages enable row level security;
-- no policies: access only via service-role client
