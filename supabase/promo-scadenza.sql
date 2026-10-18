-- Scadenza delle promozioni: l'ultimo giorno valido. Dopo quella data il servizio torna al prezzo pieno da solo.
-- Eseguila una volta nello SQL Editor di Supabase (è inclusa anche in schema.sql).
alter table public.services add column if not exists promo_until date;
