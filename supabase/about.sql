-- Descrizione dell'attività ("Chi siamo"), mostrata in alto nel listino.
-- Eseguila una volta nello SQL Editor di Supabase (è inclusa anche in schema.sql).
alter table public.venues add column if not exists about text;
grant update (about) on public.venues to authenticated;
