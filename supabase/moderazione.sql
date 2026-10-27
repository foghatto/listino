-- Moderazione: sospensione di un listino dal pannello admin.
-- Eseguila una volta nello SQL Editor di Supabase (richiede admin.sql e temi.sql già eseguiti). È sicura da rieseguire.
--
-- Un listino sospeso sparisce subito dal sito pubblico: la pagina dice "non esiste o è stato rimosso",
-- e nemmeno categorie e servizi si leggono più dall'API pubblica. Il proprietario continua a vedere
-- la propria dashboard (con un avviso) ma NON può riattivarlo: la colonna la cambia solo l'admin.
-- Non cancella nulla: per riattivare basta il pulsante "Riattiva" nel pannello.

alter table public.venues add column if not exists suspended_at timestamptz;

-- Funzione d'appoggio per le policy (eseguibile anche dal pubblico: dice solo se il listino è visibile)
create or replace function public.venue_is_public(v uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$ select exists (select 1 from public.venues where id = v and suspended_at is null); $$;
revoke all on function public.venue_is_public(uuid) from public;
grant execute on function public.venue_is_public(uuid) to anon, authenticated;

-- Lettura pubblica: solo listini non sospesi (il proprietario vede sempre il suo)
drop policy if exists venues_public_read on public.venues;
create policy venues_public_read on public.venues for select
  using (suspended_at is null or owner_id = auth.uid());

drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories for select
  using (public.venue_is_public(venue_id) or public.is_venue_owner(venue_id));

drop policy if exists services_public_read on public.services;
create policy services_public_read on public.services for select
  using ((visible and public.venue_is_public(venue_id)) or public.is_venue_owner(venue_id));

-- Elenco account del pannello: ora include anche lo stato di sospensione
drop function if exists public.admin_overview();
create function public.admin_overview()
returns table (
  user_id uuid, email text, created_at timestamptz, confirmed_at timestamptz, last_sign_in_at timestamptz,
  venue_id uuid, venue_name text, slug text, plan text, theme text, suspended_at timestamptz,
  services bigint, views bigint, wa_clicks bigint
)
language plpgsql
security definer
set search_path = public, auth
as $$
#variable_conflict use_column
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  return query
    select u.id, u.email::text, u.created_at, u.email_confirmed_at, u.last_sign_in_at,
           v.id, v.name::text, v.slug::text, v.plan::text, v.theme::text, v.suspended_at,
           (select count(*) from public.services s where s.venue_id = v.id),
           (select count(*) from public.page_views p where p.venue_id = v.id and p.kind = 'view'),
           (select count(*) from public.page_views p where p.venue_id = v.id and p.kind = 'whatsapp_click')
    from auth.users u
    left join public.venues v on v.owner_id = u.id
    order by u.created_at desc;
end;
$$;

create or replace function public.admin_set_suspended(p_venue uuid, p_suspended boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  update public.venues set suspended_at = case when p_suspended then now() else null end where id = p_venue;
end;
$$;

revoke all on function public.admin_overview(), public.admin_set_suspended(uuid, boolean) from public, anon;
grant execute on function public.admin_overview(), public.admin_set_suspended(uuid, boolean) to authenticated;
