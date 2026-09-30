-- Paste on kdqqetllmtoeafrphsjc. Adds missing profile columns + adoption table.

alter table public.pa_profiles
  add column if not exists country text not null default 'ZA',
  add column if not exists gender text not null default 'unspecified',
  add column if not exists is_staff boolean not null default false,
  add column if not exists email_verified boolean not null default false,
  add column if not exists phone_verified boolean not null default false,
  add column if not exists business_verified boolean not null default false,
  add column if not exists shelter_verified boolean not null default false,
  add column if not exists caregiver_verified boolean not null default false;

alter table public.pa_profiles drop constraint if exists pa_profiles_gender_check;
alter table public.pa_profiles
  add constraint pa_profiles_gender_check
  check (gender in ('female', 'male', 'unspecified'));

create table if not exists public.pa_adoptions (
  id text primary key default gen_random_uuid()::text,
  pet_id text not null,
  applicant_id text not null,
  message text not null default '',
  status text not null default 'requested'
    check (status in ('requested', 'viewed', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pet_id, applicant_id)
);

alter table public.pa_adoptions enable row level security;

drop policy if exists pa_adoptions_read on public.pa_adoptions;
create policy pa_adoptions_read on public.pa_adoptions for select to authenticated
  using (
    applicant_id in (select id from public.pa_profiles where auth_user_id = auth.uid())
    or applicant_id = auth.uid()::text
    or public.pa_is_staff()
  );

drop policy if exists pa_adoptions_write on public.pa_adoptions;
create policy pa_adoptions_write on public.pa_adoptions for insert to authenticated
  with check (
    applicant_id in (select id from public.pa_profiles where auth_user_id = auth.uid())
    or applicant_id = auth.uid()::text
  );

drop policy if exists pa_adoptions_update on public.pa_adoptions;
create policy pa_adoptions_update on public.pa_adoptions for update to authenticated
  using (
    public.pa_is_staff()
    or exists (
      select 1
      from public.pa_pets pets
      join public.pa_profiles p on p.id = pets.owner_id
      where pets.id = pet_id
        and p.auth_user_id = auth.uid()
    )
  )
  with check (
    public.pa_is_staff()
    or exists (
      select 1
      from public.pa_pets pets
      join public.pa_profiles p on p.id = pets.owner_id
      where pets.id = pet_id
        and p.auth_user_id = auth.uid()
    )
  );

grant select, insert, update on public.pa_adoptions to authenticated;

notify pgrst, 'reload schema';
