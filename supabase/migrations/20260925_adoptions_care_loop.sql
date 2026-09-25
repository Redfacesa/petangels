-- Adoption applications + care booking notifications.
-- Paste on kdqqetllmtoeafrphsjc.

create table if not exists public.pa_adoptions (
  id text primary key default gen_random_uuid()::text,
  pet_id text not null references public.pa_pets (id) on delete cascade,
  applicant_id text not null references public.pa_profiles (id) on delete cascade,
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
    or pet_id in (
      select id from public.pa_pets
      where owner_id in (select id from public.pa_profiles where auth_user_id = auth.uid())
    )
    or public.pa_is_staff()
  );

drop policy if exists pa_adoptions_write on public.pa_adoptions;
create policy pa_adoptions_write on public.pa_adoptions for insert to authenticated
  with check (
    applicant_id in (select id from public.pa_profiles where auth_user_id = auth.uid())
  );

drop policy if exists pa_adoptions_update on public.pa_adoptions;
create policy pa_adoptions_update on public.pa_adoptions for update to authenticated
  using (
    pet_id in (
      select id from public.pa_pets
      where owner_id in (select id from public.pa_profiles where auth_user_id = auth.uid())
    )
    or public.pa_is_staff()
  );

grant select, insert, update on public.pa_adoptions to authenticated;

create or replace function public.pa_notify_adoption()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_auth uuid;
  applicant_auth uuid;
begin
  select p.auth_user_id into owner_auth
  from public.pa_pets pets
  join public.pa_profiles p on p.id = pets.owner_id
  where pets.id = new.pet_id;
  select auth_user_id into applicant_auth from public.pa_profiles where id = new.applicant_id;

  if tg_op = 'INSERT' and owner_auth is not null and owner_auth is distinct from applicant_auth then
    insert into public.pa_notifications (user_id, title, body, href)
    values (owner_auth, 'Adoption enquiry', left(new.message, 80), '/pets/' || new.pet_id);
  end if;

  if tg_op = 'UPDATE' and new.status is distinct from old.status and applicant_auth is not null then
    insert into public.pa_notifications (user_id, title, body, href)
    values (
      applicant_auth,
      'Adoption update',
      'Your application is now ' || new.status,
      '/pets/' || new.pet_id
    );
  end if;
  return new;
end;
$$;

drop trigger if exists pa_notify_adoption on public.pa_adoptions;
create trigger pa_notify_adoption
  after insert or update on public.pa_adoptions
  for each row execute function public.pa_notify_adoption();

create or replace function public.pa_notify_care_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  host_auth uuid;
  requester_auth uuid;
begin
  select p.auth_user_id into host_auth
  from public.pa_care_offers o
  join public.pa_profiles p on p.id = o.profile_id
  where o.id = new.offer_id;
  select auth_user_id into requester_auth from public.pa_profiles where id = new.requester_id;

  if tg_op = 'INSERT' and host_auth is not null and host_auth is distinct from requester_auth then
    insert into public.pa_notifications (user_id, title, body, href)
    values (host_auth, 'Care request', 'Someone requested ' || new.kind, '/care');
  end if;

  if tg_op = 'UPDATE' and new.status is distinct from old.status and requester_auth is not null then
    insert into public.pa_notifications (user_id, title, body, href)
    values (requester_auth, 'Care update', 'Your booking is ' || new.status, '/care');
  end if;
  return new;
end;
$$;

drop trigger if exists pa_notify_care_request on public.pa_care_requests;
create trigger pa_notify_care_request
  after insert or update on public.pa_care_requests
  for each row execute function public.pa_notify_care_request();
