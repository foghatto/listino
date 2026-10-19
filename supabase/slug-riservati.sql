-- Impedisce di scegliere come link nomi che coincidono con le pagine del sito (es. "dashboard").
-- Eseguila una volta nello SQL Editor di Supabase. "not valid": i link già esistenti non vengono controllati, i nuovi sì.
alter table public.venues drop constraint if exists venues_slug_reserved;
alter table public.venues add constraint venues_slug_reserved
  check (slug not in ('index','accedi','dashboard','listino','demo-pro','locandina','note-legali','assets','api','supabase','admin','login','signup','registrati','www','app','robots','sitemap','favicon')) not valid;
