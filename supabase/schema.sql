-- ListinoRapido — schema Supabase
-- Esegui l'intero file in: Supabase → SQL Editor → New query → Run.
-- Modello: un utente (auth.users) possiede una o più "venues" (attività) → categorie → servizi.

create extension if not exists pgcrypto;

-- ───────────────────────── Tabelle ─────────────────────────

create table if not exists public.venues (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  slug        text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$'),
  name        text not null,
  tagline     text,
  whatsapp    text,                       -- solo cifre con prefisso, es. 393331234567
  cover_url   text,
  plan        text not null default 'free' check (plan in ('free', 'pro')),
  created_at  timestamptz not null default now()
);

create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  venue_id    uuid not null references public.venues(id) on delete cascade,
  name        text not null,
  name_i18n   jsonb not null default '{}'::jsonb,   -- {"en": "...", "fr": "..."} (piano PRO)
  position    int  not null default 0
);

create table if not exists public.services (
  id               uuid primary key default gen_random_uuid(),
  venue_id         uuid not null references public.venues(id) on delete cascade,
  category_id      uuid not null references public.categories(id) on delete cascade,
  name             text not null,
  name_i18n        jsonb not null default '{}'::jsonb,
  description      text,
  description_i18n jsonb not null default '{}'::jsonb,
  price_cents      int  not null check (price_cents >= 0),
  duration_min     int  check (duration_min > 0),
  image_url        text,
  visible          boolean not null default true,
  position         int  not null default 0,
  created_at       timestamptz not null default now()
);

create table if not exists public.page_views (
  id          bigint generated always as identity primary key,
  venue_id    uuid not null references public.venues(id) on delete cascade,
  kind        text not null default 'view' check (kind in ('view', 'qr_scan', 'whatsapp_click')),
  service_id  uuid references public.services(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists categories_venue_idx on public.categories (venue_id, position);
create index if not exists services_venue_idx   on public.services (venue_id, category_id, position);
create index if not exists page_views_venue_idx on public.page_views (venue_id, created_at desc);

-- ───────────────────────── Limite piano Free (10 servizi) ─────────────────────────

create or replace function public.enforce_free_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan  text;
  v_count int;
begin
  select plan into v_plan from public.venues where id = new.venue_id;
  if v_plan = 'free' then
    select count(*) into v_count from public.services where venue_id = new.venue_id;
    if v_count >= 10 then
      raise exception 'Piano Free: massimo 10 servizi. Passa al piano Professionale.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists services_free_limit on public.services;
create trigger services_free_limit
  before insert on public.services
  for each row execute function public.enforce_free_limit();

-- ───────────────────────── Sicurezza (RLS) ─────────────────────────

create or replace function public.is_venue_owner(v uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.venues where id = v and owner_id = auth.uid());
$$;

alter table public.venues      enable row level security;
alter table public.categories  enable row level security;
alter table public.services    enable row level security;
alter table public.page_views  enable row level security;

-- Venues: il listino è pubblico (lo apre chiunque inquadri il QR), la modifica è del proprietario.
drop policy if exists venues_public_read  on public.venues;
drop policy if exists venues_owner_insert on public.venues;
drop policy if exists venues_owner_update on public.venues;
drop policy if exists venues_owner_delete on public.venues;
create policy venues_public_read  on public.venues for select using (true);
create policy venues_owner_insert on public.venues for insert to authenticated
  with check (owner_id = auth.uid() and plan = 'free');          -- nessuno si crea una venue già PRO
create policy venues_owner_update on public.venues for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy venues_owner_delete on public.venues for delete to authenticated
  using (owner_id = auth.uid());

-- Il piano può cambiarlo solo il backend (service_role, es. webhook di pagamento), mai il client.
revoke update on public.venues from anon, authenticated;
grant  update (slug, name, tagline, whatsapp, cover_url) on public.venues to authenticated;

-- Categorie
drop policy if exists categories_public_read on public.categories;
drop policy if exists categories_owner_write on public.categories;
create policy categories_public_read on public.categories for select using (true);
create policy categories_owner_write on public.categories for all to authenticated
  using (public.is_venue_owner(venue_id)) with check (public.is_venue_owner(venue_id));

-- Servizi: il pubblico vede solo quelli "visibili", il proprietario tutti.
drop policy if exists services_public_read on public.services;
drop policy if exists services_owner_write on public.services;
create policy services_public_read on public.services for select
  using (visible or public.is_venue_owner(venue_id));
create policy services_owner_write on public.services for all to authenticated
  using (public.is_venue_owner(venue_id)) with check (public.is_venue_owner(venue_id));

-- Statistiche: chiunque può registrare una visita, solo il proprietario le legge.
drop policy if exists page_views_insert on public.page_views;
drop policy if exists page_views_owner_read on public.page_views;
create policy page_views_insert on public.page_views for insert to anon, authenticated
  with check (true);
create policy page_views_owner_read on public.page_views for select to authenticated
  using (public.is_venue_owner(venue_id));

-- ───────────────────────── Storage immagini servizi ─────────────────────────
-- Struttura file: service-images/<user_id>/<nome-file>

insert into storage.buckets (id, name, public)
values ('service-images', 'service-images', true)
on conflict (id) do nothing;

drop policy if exists service_images_public_read  on storage.objects;
drop policy if exists service_images_owner_insert on storage.objects;
drop policy if exists service_images_owner_update on storage.objects;
drop policy if exists service_images_owner_delete on storage.objects;
create policy service_images_public_read on storage.objects for select
  using (bucket_id = 'service-images');
create policy service_images_owner_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'service-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy service_images_owner_update on storage.objects for update to authenticated
  using (bucket_id = 'service-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy service_images_owner_delete on storage.objects for delete to authenticated
  using (bucket_id = 'service-images' and (storage.foldername(name))[1] = auth.uid()::text);
