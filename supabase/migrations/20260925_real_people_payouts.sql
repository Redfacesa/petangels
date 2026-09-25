-- Real-people mode + private payout details
-- Paste on kdqqetllmtoeafrphsjc

-- Remove demo seed so the feed is empty until members post.
delete from public.pa_likes;
delete from public.pa_posts where id in ('post-bruno', 'post-luna', 'post-happypaws', 'post-foster', 'post-bella');
delete from public.pa_listings where id like 'prd-%';
delete from public.pa_animals where id in ('bruno', 'milo', 'bella');
delete from public.pa_cases where id in ('rc-1', 'rc-2');
do $$
begin
  if to_regclass('public.pa_shelter_map') is not null then
    update public.pa_shelter_map
      set profile_id = null
      where profile_id in ('p-cape', 'p-manace', 'p-happypaws', 'p-pawstransport');
  end if;
end $$;
delete from public.pa_profiles where id in ('p-manace', 'p-happypaws', 'p-cape', 'p-pawstransport');

create table if not exists public.pa_payout_accounts (
  profile_id text primary key references public.pa_profiles (id) on delete cascade,
  bank_name text not null default '',
  account_name text not null default '',
  account_number text not null default '',
  branch_code text not null default '',
  status text not null default 'submitted' check (status in ('submitted', 'issued')),
  admin_note text,
  updated_at timestamptz not null default now()
);

alter table public.pa_payout_accounts enable row level security;

drop policy if exists pa_payout_own_read on public.pa_payout_accounts;
create policy pa_payout_own_read on public.pa_payout_accounts for select to authenticated
  using (profile_id in (select id from public.pa_profiles where auth_user_id = auth.uid()));

drop policy if exists pa_payout_own_write on public.pa_payout_accounts;
create policy pa_payout_own_write on public.pa_payout_accounts for insert to authenticated
  with check (profile_id in (select id from public.pa_profiles where auth_user_id = auth.uid()));

drop policy if exists pa_payout_own_update on public.pa_payout_accounts;
create policy pa_payout_own_update on public.pa_payout_accounts for update to authenticated
  using (profile_id in (select id from public.pa_profiles where auth_user_id = auth.uid()))
  with check (profile_id in (select id from public.pa_profiles where auth_user_id = auth.uid()));

comment on table public.pa_payout_accounts is
  'Private bank details. Admin issues RedFace merchant/subaccount on pa_profiles.redface_merchant_id.';

grant select, insert, update on public.pa_payout_accounts to authenticated;

-- Members may read their own sales (incoming) as well as purchases.
drop policy if exists pa_pay_read on public.pa_pay_events;
create policy pa_pay_read on public.pa_pay_events for select to authenticated
  using (
    payer_id = auth.uid()
    or payee_profile_id in (select id from public.pa_profiles where auth_user_id = auth.uid())
  );

-- Dashboard SQL (no JWT) can still set merchant IDs. Logged-in members cannot,
-- including on INSERT (upsert / first profile row).
create or replace function public.pa_lock_admin_profile_fields()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is not null then
    if tg_op = 'INSERT' then
      new.redface_merchant_id := null;
      new.verified := false;
    elsif tg_op = 'UPDATE' then
      new.redface_merchant_id := old.redface_merchant_id;
      new.verified := old.verified;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists pa_lock_admin_profile_fields on public.pa_profiles;
create trigger pa_lock_admin_profile_fields
  before insert or update on public.pa_profiles
  for each row execute function public.pa_lock_admin_profile_fields();

create or replace function public.pa_lock_payout_admin_fields()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    new.status := 'submitted';
    new.admin_note := null;
    return new;
  end if;
  if auth.uid() is not null then
    new.status := old.status;
    new.admin_note := old.admin_note;
  end if;
  return new;
end;
$$;

drop trigger if exists pa_lock_payout_admin_fields on public.pa_payout_accounts;
create trigger pa_lock_payout_admin_fields
  before insert or update on public.pa_payout_accounts
  for each row execute function public.pa_lock_payout_admin_fields();

-- After you review bank details, issue the RedFace merchant / subaccount:
-- update public.pa_profiles set redface_merchant_id = '<merchant-or-subaccount-id>' where id = '<user-uuid>';
-- update public.pa_payout_accounts set status = 'issued' where profile_id = '<user-uuid>';
