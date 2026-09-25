-- After bank approval (pa_payout_accounts.status = issued),
-- a member may save their RedFace subaccount id. Verified stays admin-only.
-- Paste on kdqqetllmtoeafrphsjc. Does not delete data.

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
      new.verified := old.verified;
      if new.redface_merchant_id is distinct from old.redface_merchant_id then
        if not exists (
          select 1
          from public.pa_payout_accounts p
          where p.profile_id = new.id
            and p.status = 'issued'
        ) then
          new.redface_merchant_id := old.redface_merchant_id;
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
