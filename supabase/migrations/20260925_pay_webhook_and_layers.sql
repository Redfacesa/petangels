-- Payment webhook fields + optional Care / Shelter Map tables
-- Paste in SQL editor on kdqqetllmtoeafrphsjc

alter table public.pa_pay_events
  add column if not exists provider text not null default 'redface',
  add column if not exists provider_ref text,
  add column if not exists paid_at timestamptz,
  add column if not exists raw_event jsonb;

create unique index if not exists pa_pay_events_provider_ref_uidx
  on public.pa_pay_events (provider, provider_ref)
  where provider_ref is not null;

comment on column public.pa_pay_events.provider is
  'redface | paystack — money is collected off this database; this row is the Pet Angels receipt.';

create table if not exists public.pa_caregivers (
  id text primary key default gen_random_uuid()::text,
  profile_id text references public.pa_profiles (id) on delete set null,
  name text not null,
  city text not null default '',
  suburb text not null default '',
  kinds text[] not null default '{}',
  from_price numeric(12, 2) not null default 0,
  rating numeric(3, 2) not null default 0,
  bio text not null default '',
  photo_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.pa_shelter_map (
  id text primary key default gen_random_uuid()::text,
  profile_id text references public.pa_profiles (id) on delete set null,
  name text not null,
  city text not null,
  province text not null default '',
  lat double precision not null,
  lng double precision not null,
  story text not null default '',
  episode text,
  created_at timestamptz not null default now()
);

alter table public.pa_caregivers enable row level security;
alter table public.pa_shelter_map enable row level security;

drop policy if exists pa_caregivers_read on public.pa_caregivers;
create policy pa_caregivers_read on public.pa_caregivers for select using (active = true);

drop policy if exists pa_shelter_map_read on public.pa_shelter_map;
create policy pa_shelter_map_read on public.pa_shelter_map for select using (true);

drop policy if exists pa_caregivers_write on public.pa_caregivers;
create policy pa_caregivers_write on public.pa_caregivers for insert to authenticated
  with check (profile_id in (select id from public.pa_profiles where auth_user_id = auth.uid()));

insert into public.pa_shelter_map (id, profile_id, name, city, province, lat, lng, story, episode)
values
  (
    'map-cape', 'p-cape', 'Cape Animal Rescue', 'Cape Town', 'Western Cape',
    -33.9249, 18.4241,
    'Verified partner. Bruno, Milo and the active cases live here.',
    'Pilot · Shelter of the Week'
  )
on conflict (id) do nothing;
