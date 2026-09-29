alter table public.pa_profiles
  add column if not exists gender text not null default 'unspecified';

alter table public.pa_profiles drop constraint if exists pa_profiles_gender_check;
alter table public.pa_profiles
  add constraint pa_profiles_gender_check
  check (gender in ('female', 'male', 'unspecified'));
