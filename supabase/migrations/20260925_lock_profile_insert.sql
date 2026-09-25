-- Idempotent: match live DB after real-people payouts.
-- Safe to paste even if the INSERT lock was already applied.
-- Does not delete likes or demo rows.

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
