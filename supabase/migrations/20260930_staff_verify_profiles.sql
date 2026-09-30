-- Paste on kdqqetllmtoeafrphsjc.
-- Staff can set business/shelter/caregiver ticks on other members.

create or replace function public.pa_is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.pa_profiles
    where is_staff is true
      and (auth_user_id = auth.uid() or id = auth.uid()::text)
  );
$$;

drop policy if exists pa_profiles_update on public.pa_profiles;
create policy pa_profiles_update on public.pa_profiles for update to authenticated
  using (auth_user_id = auth.uid() or public.pa_is_staff())
  with check (auth_user_id = auth.uid() or public.pa_is_staff());

notify pgrst, 'reload schema';

-- Staff row so the lock trigger does not undo Business / Shelter / Caregiver ticks.
update public.pa_profiles p
set is_staff = true
from auth.users u
where (p.auth_user_id = u.id or p.id = u.id::text)
  and lower(u.email) = 'redfacesa@gmail.com';
