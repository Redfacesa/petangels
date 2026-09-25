-- Pet profiles, trust flags, care, lost/found, reports, notifications, staff ops.
-- Paste on kdqqetllmtoeafrphsjc. Does not delete member data.

alter table public.pa_profiles
  add column if not exists is_staff boolean not null default false,
  add column if not exists email_verified boolean not null default false,
  add column if not exists phone_verified boolean not null default false,
  add column if not exists business_verified boolean not null default false,
  add column if not exists shelter_verified boolean not null default false,
  add column if not exists caregiver_verified boolean not null default false;

create or replace function public.pa_is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.pa_profiles
    where auth_user_id = auth.uid() and is_staff is true
  );
$$;

create table if not exists public.pa_pets (
  id text primary key default gen_random_uuid()::text,
  owner_id text not null references public.pa_profiles (id) on delete cascade,
  name text not null,
  photo_url text,
  species text not null default 'dog' check (species in ('dog', 'cat', 'other')),
  breed text not null default '',
  age text not null default '',
  city text not null default '',
  about text not null default '',
  status text not null default 'companion'
    check (status in ('companion', 'looking_for_home', 'foster_needed', 'adopted', 'lost', 'found')),
  medical_notes text not null default '',
  contact text not null default '',
  public_contact text not null default '',
  last_seen_at date,
  last_seen_place text not null default '',
  created_at timestamptz not null default now()
);

alter table public.pa_pets add column if not exists public_contact text not null default '';

alter table public.pa_posts
  add column if not exists pet_id text references public.pa_pets (id) on delete set null,
  add column if not exists lane text not null default 'community'
    check (lane in ('community', 'rescue', 'commerce'));

alter table public.pa_posts drop constraint if exists pa_posts_kind_check;
alter table public.pa_posts add constraint pa_posts_kind_check
  check (kind in ('story', 'product', 'rescue', 'adoption', 'birthday', 'update', 'question', 'advice', 'lost', 'found', 'care'));

create table if not exists public.pa_care_offers (
  id text primary key default gen_random_uuid()::text,
  profile_id text not null references public.pa_profiles (id) on delete cascade,
  name text not null,
  city text not null default '',
  suburb text not null default '',
  kinds text[] not null default '{}',
  walk_zar numeric(12, 2) not null default 0,
  sit_zar numeric(12, 2) not null default 0,
  overnight_zar numeric(12, 2) not null default 0,
  bio text not null default '',
  photo_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.pa_care_requests (
  id text primary key default gen_random_uuid()::text,
  offer_id text not null references public.pa_care_offers (id) on delete cascade,
  requester_id text not null references public.pa_profiles (id) on delete cascade,
  kind text not null default 'walk',
  status text not null default 'requested'
    check (status in ('requested', 'accepted', 'completed', 'declined')),
  created_at timestamptz not null default now()
);

create table if not exists public.pa_reports (
  id text primary key default gen_random_uuid()::text,
  reporter_id text not null references public.pa_profiles (id) on delete cascade,
  target_kind text not null,
  target_id text not null,
  reason text not null,
  welfare boolean not null default false,
  status text not null default 'reported'
    check (status in ('reported', 'reviewing', 'action_taken', 'closed')),
  admin_note text,
  created_at timestamptz not null default now()
);

create table if not exists public.pa_notifications (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  body text not null default '',
  href text not null default '/home',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.pa_pets enable row level security;
alter table public.pa_care_offers enable row level security;
alter table public.pa_care_requests enable row level security;
alter table public.pa_reports enable row level security;
alter table public.pa_notifications enable row level security;

drop policy if exists pa_pets_read on public.pa_pets;
drop policy if exists pa_pets_owner_staff_read on public.pa_pets;
create policy pa_pets_owner_staff_read on public.pa_pets for select to authenticated
  using (
    owner_id in (select id from public.pa_profiles where auth_user_id = auth.uid())
    or public.pa_is_staff()
  );

drop policy if exists pa_pets_write on public.pa_pets;
create policy pa_pets_write on public.pa_pets for insert to authenticated
  with check (
    owner_id in (select id from public.pa_profiles where auth_user_id = auth.uid())
    and (
      status in ('companion', 'lost', 'found')
      or (
        status in ('looking_for_home', 'foster_needed', 'adopted')
        and owner_id in (
          select id from public.pa_profiles
          where auth_user_id = auth.uid()
            and account_type = 'shelter'
        )
      )
    )
  );

drop policy if exists pa_pets_update on public.pa_pets;
create policy pa_pets_update on public.pa_pets for update to authenticated
  using (owner_id in (select id from public.pa_profiles where auth_user_id = auth.uid()))
  with check (owner_id in (select id from public.pa_profiles where auth_user_id = auth.uid()));

drop policy if exists pa_animals_write on public.pa_animals;
create policy pa_animals_write on public.pa_animals for insert to authenticated
  with check (
    org_id in (
      select id from public.pa_profiles
      where auth_user_id = auth.uid()
        and account_type = 'shelter'
    )
  );

drop policy if exists pa_care_offers_read on public.pa_care_offers;
create policy pa_care_offers_read on public.pa_care_offers for select using (active = true or public.pa_is_staff());

drop policy if exists pa_care_offers_write on public.pa_care_offers;
create policy pa_care_offers_write on public.pa_care_offers for insert to authenticated
  with check (profile_id in (select id from public.pa_profiles where auth_user_id = auth.uid()));

drop policy if exists pa_care_offers_update on public.pa_care_offers;
create policy pa_care_offers_update on public.pa_care_offers for update to authenticated
  using (profile_id in (select id from public.pa_profiles where auth_user_id = auth.uid()) or public.pa_is_staff());

drop policy if exists pa_care_req_read on public.pa_care_requests;
create policy pa_care_req_read on public.pa_care_requests for select to authenticated
  using (
    requester_id in (select id from public.pa_profiles where auth_user_id = auth.uid())
    or offer_id in (
      select id from public.pa_care_offers
      where profile_id in (select id from public.pa_profiles where auth_user_id = auth.uid())
    )
    or public.pa_is_staff()
  );

drop policy if exists pa_care_req_write on public.pa_care_requests;
create policy pa_care_req_write on public.pa_care_requests for insert to authenticated
  with check (requester_id in (select id from public.pa_profiles where auth_user_id = auth.uid()));

drop policy if exists pa_care_req_update on public.pa_care_requests;
create policy pa_care_req_update on public.pa_care_requests for update to authenticated
  using (
    offer_id in (
      select id from public.pa_care_offers
      where profile_id in (select id from public.pa_profiles where auth_user_id = auth.uid())
    )
    or public.pa_is_staff()
  );

drop policy if exists pa_reports_insert on public.pa_reports;
create policy pa_reports_insert on public.pa_reports for insert to authenticated
  with check (reporter_id in (select id from public.pa_profiles where auth_user_id = auth.uid()));

drop policy if exists pa_reports_read on public.pa_reports;
create policy pa_reports_read on public.pa_reports for select to authenticated
  using (
    reporter_id in (select id from public.pa_profiles where auth_user_id = auth.uid())
    or public.pa_is_staff()
  );

drop policy if exists pa_reports_staff on public.pa_reports;
create policy pa_reports_staff on public.pa_reports for update to authenticated
  using (public.pa_is_staff());

drop policy if exists pa_notes_read on public.pa_notifications;
create policy pa_notes_read on public.pa_notifications for select to authenticated
  using (user_id = auth.uid());

drop policy if exists pa_notes_update on public.pa_notifications;
create policy pa_notes_update on public.pa_notifications for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists pa_notes_insert on public.pa_notifications;

drop policy if exists pa_payout_staff_read on public.pa_payout_accounts;
create policy pa_payout_staff_read on public.pa_payout_accounts for select to authenticated
  using (public.pa_is_staff());

drop policy if exists pa_payout_staff_update on public.pa_payout_accounts;
create policy pa_payout_staff_update on public.pa_payout_accounts for update to authenticated
  using (public.pa_is_staff());

grant select, insert, update on public.pa_pets to authenticated;
grant select, insert, update on public.pa_care_offers to authenticated;
grant select, insert, update on public.pa_care_requests to authenticated;
grant select, insert, update on public.pa_reports to authenticated;
grant select, update on public.pa_notifications to authenticated;
grant select on public.pa_care_offers to anon;

-- Public listing fields only. medical_notes and private contact stay on the table.
create or replace view public.pa_pets_public as
  select
    id,
    owner_id,
    name,
    photo_url,
    species,
    breed,
    age,
    city,
    about,
    status,
    last_seen_at,
    last_seen_place,
    public_contact,
    created_at
  from public.pa_pets;

revoke all on public.pa_pets_public from public;
grant select on public.pa_pets_public to anon, authenticated;
revoke select on public.pa_pets from anon;

create or replace function public.pa_lock_admin_profile_fields()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is not null then
    if tg_op = 'INSERT' then
      new.redface_merchant_id := null;
      new.verified := false;
      new.is_staff := false;
      new.business_verified := false;
      new.shelter_verified := false;
      new.caregiver_verified := false;
      new.phone_verified := false;
      new.email_verified := exists (
        select 1 from auth.users u
        where u.id = coalesce(new.auth_user_id, auth.uid())
          and u.email_confirmed_at is not null
      );
    elsif tg_op = 'UPDATE' then
      if not public.pa_is_staff() then
        new.verified := old.verified;
        new.is_staff := old.is_staff;
        new.business_verified := old.business_verified;
        new.shelter_verified := old.shelter_verified;
        new.caregiver_verified := old.caregiver_verified;
        new.phone_verified := old.phone_verified;
        new.email_verified := old.email_verified;
        if new.redface_merchant_id is distinct from old.redface_merchant_id then
          if not exists (
            select 1 from public.pa_payout_accounts p
            where p.profile_id = new.id and p.status = 'issued'
          ) then
            new.redface_merchant_id := old.redface_merchant_id;
          end if;
        end if;
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists pa_lock_admin_profile_fields on public.pa_profiles;
create trigger pa_lock_admin_profile_fields
  before insert or update on public.pa_profiles
  for each row execute function public.pa_lock_admin_profile_fields();

create or replace function public.pa_notify_like()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  author_auth uuid;
  pet_name text;
  post_title text;
begin
  select p.auth_user_id, posts.title, pets.name
    into author_auth, post_title, pet_name
  from public.pa_posts posts
  join public.pa_profiles p on p.id = posts.author_id
  left join public.pa_pets pets on pets.id = posts.pet_id
  where posts.id = new.post_id;
  if author_auth is not null and author_auth is distinct from new.user_id then
    insert into public.pa_notifications (user_id, title, body, href)
    values (
      author_auth,
      'New like',
      coalesce(pet_name || '''s story was liked', post_title || ' was liked'),
      '/home'
    );
  end if;
  return new;
end;
$$;

revoke insert on public.pa_notifications from authenticated, anon;

drop trigger if exists pa_notify_like on public.pa_likes;
create trigger pa_notify_like
  after insert on public.pa_likes
  for each row execute function public.pa_notify_like();

grant execute on function public.pa_is_staff() to authenticated;

-- Mark yourself staff (dashboard SQL, no JWT):
-- update public.pa_profiles set is_staff = true where id = '<your-user-uuid>';
