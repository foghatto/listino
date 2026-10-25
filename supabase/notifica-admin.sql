-- Avviso via email all'amministratore quando qualcuno crea il proprio listino.
-- Eseguila nello SQL Editor di Supabase DOPO aver:
--   1) messo online api/notify-signup.js (si pubblica da sola con il deploy),
--   2) impostato su Vercel le variabili NOTIFY_WEBHOOK_SECRET, RESEND_API_KEY, ADMIN_NOTIFY_EMAIL (vedi README).
-- Prima di eseguirla sostituisci:
--   INCOLLA-QUI-IL-SEGRETO  con lo stesso valore di NOTIFY_WEBHOOK_SECRET su Vercel
--   l'indirizzo del sito     se non è listino-green.vercel.app (es. https://www.listinorapido.it)
-- È sicura da rieseguire (per cambiare segreto o indirizzo). Non contiene l'email di destinazione: quella sta su Vercel.

create extension if not exists pg_net with schema extensions;

create or replace function public.notify_new_venue()
returns trigger
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  mail text;
begin
  select email into mail from auth.users where id = new.owner_id;
  begin
    perform net.http_post(
      url     := 'https://listino-green.vercel.app/api/notify-signup',
      headers := jsonb_build_object('Content-Type', 'application/json', 'x-webhook-secret', 'Babbasone23!'),
      body    := jsonb_build_object('venue_id', new.id, 'name', new.name, 'slug', new.slug, 'email', mail, 'created_at', new.created_at)
    );
  exception when others then
    null;   -- se l'avviso non parte, la registrazione dell'utente deve comunque riuscire
  end;
  return new;
end;
$$;

revoke all on function public.notify_new_venue() from public, anon, authenticated;

drop trigger if exists trg_notify_new_venue on public.venues;
create trigger trg_notify_new_venue
  after insert on public.venues
  for each row execute function public.notify_new_venue();
