-- Eliminazione dell'account da parte dell'utente (dashboard → Profilo → "Elimina il mio account").
-- Eseguila una volta nello SQL Editor di Supabase. È sicura da rieseguire.
--
-- Cosa fa: chi è connesso può cancellare SOLO il proprio account. Dall'account partono a cascata
-- il listino, le categorie, i servizi e le statistiche. Rimuove anche l'eventuale iscrizione
-- alla lista d'attesa con la stessa email. Le foto vengono cancellate prima dal sito, tramite l'archivio di Supabase.

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
  mail text;
begin
  if uid is null then raise exception 'not authenticated' using errcode = '42501'; end if;
  select lower(email) into mail from auth.users where id = uid;
  if to_regclass('public.waitlist') is not null and mail is not null then
    execute 'delete from public.waitlist where lower(email) = $1' using mail;
  end if;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
