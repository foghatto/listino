-- Orari e contatti dell'attività + promozioni ed etichette sui servizi.
-- Eseguila una volta nello SQL Editor di Supabase (è inclusa anche in schema.sql).
alter table public.venues   add column if not exists address   text;
alter table public.venues   add column if not exists phone     text;
alter table public.venues   add column if not exists instagram text;
alter table public.venues   add column if not exists hours     jsonb;
grant update (address, phone, instagram, hours) on public.venues to authenticated;

alter table public.services add column if not exists old_price_cents integer check (old_price_cents is null or old_price_cents >= 0);
alter table public.services add column if not exists badge text check (badge is null or badge in ('new','top'));
