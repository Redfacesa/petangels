-- Paste on kdqqetllmtoeafrphsjc.
-- Applicants may not change adoption status. Members may not set is_staff.

drop policy if exists pa_adoptions_update on public.pa_adoptions;

do $$
begin
  if to_regclass('public.pa_pets') is not null then
    execute $pol$
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
        )
    $pol$;
  else
    execute $pol$
      create policy pa_adoptions_update on public.pa_adoptions for update to authenticated
        using (public.pa_is_staff())
        with check (public.pa_is_staff())
    $pol$;
  end if;
end $$;

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

notify pgrst, 'reload schema';
