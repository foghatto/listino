-- Eliminazione di un account dal pannello admin (admin.html → colonna "Elimina").
-- Eseguila una volta nello SQL Editor di Supabase. È sicura da rieseguire.
-- Richiede che supabase/admin.sql sia già stato eseguito (tabella admins e funzione is_admin).
--
-- Cosa fa: solo gli amministratori possono cancellare un account altrui. Dall'account partono a cascata
-- listino, categorie, servizi e statistiche; viene tolta anche l'eventuale iscrizione alla lista d'attesa
-- con la stessa email. Non si può eliminare se stessi né un altro amministratore.
-- Le foto vengono cancellate prima dal pannello tramite l'archivio (serve la policy qui sotto).

drop policy if exists service_images_admin_delete on storage.objects;
create policy service_images_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'service-images' and public.is_admin());

create or replace function public.admin_delete_user(p_user uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  mail text;
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  if p_user = auth.uid() then raise exception 'cannot delete yourself' using errcode = 'P0001'; end if;
  if exists (select 1 from public.admins where user_id = p_user) then
    raise exception 'cannot delete an admin' using errcode = 'P0001';
  end if;
  select lower(email) into mail from auth.users where id = p_user;
  if not found then raise exception 'user not found' using errcode = 'P0002'; end if;
  if to_regclass('public.waitlist') is not null and mail is not null then
    execute 'delete from public.waitlist where lower(email) = $1' using mail;
  end if;
  delete from auth.users where id = p_user;
end;
$$;

revoke all on function public.admin_delete_user(uuid) from public, anon;
grant execute on function public.admin_delete_user(uuid) to authenticated;
