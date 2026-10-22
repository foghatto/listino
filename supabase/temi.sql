-- Temi colore (PRO) assegnabili dal pannello admin.
-- Eseguila una volta nello SQL Editor di Supabase (richiede prima admin.sql). È sicura da rieseguire.
--
-- Il cliente NON può cambiare il tema da solo: la colonna non rientra tra quelle aggiornabili dal sito
-- (grant update per colonna) e la creazione di un listino con un tema è bloccata dalla policy.
-- Solo le funzioni qui sotto (riservate agli admin) la modificano. Il tema si vede solo con piano PRO.

alter table public.venues add column if not exists theme text;
alter table public.venues drop constraint if exists venues_theme_check;
alter table public.venues add constraint venues_theme_check check (theme is null or theme in ('rose', 'gold', 'ocean'));

drop policy if exists venues_owner_insert on public.venues;
create policy venues_owner_insert on public.venues for insert to authenticated
  with check (owner_id = auth.uid() and plan = 'free' and theme is null);

-- L'elenco account ora include anche il tema (cambia il tipo di ritorno: va ricreata)
drop function if exists public.admin_overview();
create function public.admin_overview()
returns table (
  user_id uuid, email text, created_at timestamptz, confirmed_at timestamptz, last_sign_in_at timestamptz,
  venue_id uuid, venue_name text, slug text, plan text, theme text, services bigint, views bigint, wa_clicks bigint
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
           v.id, v.name::text, v.slug::text, v.plan::text, v.theme::text,
           (select count(*) from public.services s where s.venue_id = v.id),
           (select count(*) from public.page_views p where p.venue_id = v.id and p.kind = 'view'),
           (select count(*) from public.page_views p where p.venue_id = v.id and p.kind = 'whatsapp_click')
    from auth.users u
    left join public.venues v on v.owner_id = u.id
    order by u.created_at desc;
end;
$$;

create or replace function public.admin_set_theme(p_venue uuid, p_theme text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  update public.venues set theme = nullif(p_theme, '') where id = p_venue;
end;
$$;

create or replace function public.admin_set_plan(p_venue uuid, p_plan text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  if p_plan not in ('free', 'pro') then raise exception 'invalid plan' using errcode = '22023'; end if;
  update public.venues set plan = p_plan where id = p_venue;
end;
$$;

revoke all on function public.admin_overview(), public.admin_set_theme(uuid, text), public.admin_set_plan(uuid, text) from public, anon;
grant execute on function public.admin_overview(), public.admin_set_theme(uuid, text), public.admin_set_plan(uuid, text) to authenticated;
