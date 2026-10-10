-- Lista "Avvisami quando il piano PRO è disponibile".
-- Eseguila nello SQL Editor di Supabase (è anche inclusa in schema.sql).
create table if not exists public.waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and length(email) <= 254),
  created_at timestamptz not null default now()
);
create unique index if not exists waitlist_email_uidx on public.waitlist (lower(email));
alter table public.waitlist enable row level security;
drop policy if exists waitlist_insert on public.waitlist;
-- Chiunque può iscriversi, ma nessuno può leggere la lista dal sito (la vedi tu da Table Editor).
create policy waitlist_insert on public.waitlist for insert to anon, authenticated with check (true);
grant insert on public.waitlist to anon, authenticated;
