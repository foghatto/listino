-- Pannello amministratore (admin.html): elenco di tutti gli account e della lista d'attesa.
-- Eseguila una volta nello SQL Editor di Supabase. Poi aggiungi te stesso come amministratore (vedi in fondo).
--
-- Sicurezza: la tabella "admins" non è leggibile dal sito (RLS attiva, nessuna policy) e le due funzioni
-- rispondono solo se chi le chiama è in quella tabella. Gli altri utenti ricevono "forbidden".

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$ select exists (select 1 from public.admins where user_id = auth.uid()); $$;

create or replace function public.admin_overview()
returns table (
  user_id uuid, email text, created_at timestamptz, confirmed_at timestamptz, last_sign_in_at timestamptz,
  venue_id uuid, venue_name text, slug text, plan text, services bigint, views bigint, wa_clicks bigint
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
           v.id, v.name::text, v.slug::text, v.plan::text,
           (select count(*) from public.services s where s.venue_id = v.id),
           (select count(*) from public.page_views p where p.venue_id = v.id and p.kind = 'view'),
           (select count(*) from public.page_views p where p.venue_id = v.id and p.kind = 'whatsapp_click')
    from auth.users u
    left join public.venues v on v.owner_id = u.id
    order by u.created_at desc;
end;
$$;

create or replace function public.admin_waitlist()
returns table (email text, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  return query select w.email::text, w.created_at from public.waitlist w order by w.created_at desc;
end;
$$;

revoke all on function public.is_admin(), public.admin_overview(), public.admin_waitlist() from public, anon;
grant execute on function public.is_admin(), public.admin_overview(), public.admin_waitlist() to authenticated;

-- Per nominarti amministratore (sostituisci l'email con la tua, quella con cui accedi al sito):
--   insert into public.admins (user_id) select id from auth.users where lower(email) = lower('la-tua-email@esempio.it') on conflict do nothing;
