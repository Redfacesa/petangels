-- Pet Angels hardening (run after 20260921_pet_angels.sql)
-- Safe to paste in the SQL editor on kdqqetllmtoeafrphsjc.

-- 1) Stop anon listing every object in petimages. Public URLs still work
--    because the bucket is public. Known paths stay fetchable.
drop policy if exists petimages_public_read on storage.objects;

drop policy if exists petimages_auth_delete on storage.objects;
create policy petimages_auth_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'petimages'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 2) Owners can edit / delete their own content.
drop policy if exists pa_posts_update on public.pa_posts;
create policy pa_posts_update on public.pa_posts for update to authenticated
  using (author_id in (select id from public.pa_profiles where auth_user_id = auth.uid()))
  with check (author_id in (select id from public.pa_profiles where auth_user_id = auth.uid()));

drop policy if exists pa_posts_delete on public.pa_posts;
create policy pa_posts_delete on public.pa_posts for delete to authenticated
  using (author_id in (select id from public.pa_profiles where auth_user_id = auth.uid()));

drop policy if exists pa_listings_update on public.pa_listings;
create policy pa_listings_update on public.pa_listings for update to authenticated
  using (seller_id in (select id from public.pa_profiles where auth_user_id = auth.uid()))
  with check (seller_id in (select id from public.pa_profiles where auth_user_id = auth.uid()));

drop policy if exists pa_listings_delete on public.pa_listings;
create policy pa_listings_delete on public.pa_listings for delete to authenticated
  using (seller_id in (select id from public.pa_profiles where auth_user_id = auth.uid()));

drop policy if exists pa_animals_update on public.pa_animals;
create policy pa_animals_update on public.pa_animals for update to authenticated
  using (org_id in (select id from public.pa_profiles where auth_user_id = auth.uid()))
  with check (org_id in (select id from public.pa_profiles where auth_user_id = auth.uid()));

drop policy if exists pa_animals_delete on public.pa_animals;
create policy pa_animals_delete on public.pa_animals for delete to authenticated
  using (org_id in (select id from public.pa_profiles where auth_user_id = auth.uid()));

drop policy if exists pa_cases_update on public.pa_cases;
create policy pa_cases_update on public.pa_cases for update to authenticated
  using (org_id in (select id from public.pa_profiles where auth_user_id = auth.uid()))
  with check (org_id in (select id from public.pa_profiles where auth_user_id = auth.uid()));

drop policy if exists pa_cases_delete on public.pa_cases;
create policy pa_cases_delete on public.pa_cases for delete to authenticated
  using (org_id in (select id from public.pa_profiles where auth_user_id = auth.uid()));

-- 3) Indexes for RLS ownership checks.
create index if not exists pa_profiles_auth_user_id_idx on public.pa_profiles (auth_user_id);
create index if not exists pa_posts_author_id_idx on public.pa_posts (author_id);
create index if not exists pa_listings_seller_id_idx on public.pa_listings (seller_id);
create index if not exists pa_animals_org_id_idx on public.pa_animals (org_id);
create index if not exists pa_cases_org_id_idx on public.pa_cases (org_id);
create index if not exists pa_pay_events_payer_id_idx on public.pa_pay_events (payer_id);
create index if not exists pa_pay_events_payee_idx on public.pa_pay_events (payee_profile_id);

comment on column public.pa_profiles.redface_merchant_id is
  'Public checkout identifier used in RedFace Pay URLs (/pay/{id}). Not an API secret.';

-- 4) Unique handles on signup (email prefix collisions).
create or replace function public.pa_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_handle text;
  next_handle text;
begin
  base_handle := lower(regexp_replace(
    coalesce(nullif(new.raw_user_meta_data->>'handle', ''), split_part(new.email, '@', 1)),
    '[^a-z0-9]+',
    '',
    'g'
  ));
  if base_handle is null or base_handle = '' then
    base_handle := 'angel';
  end if;
  base_handle := left(base_handle, 18);
  next_handle := base_handle;
  if exists (select 1 from public.pa_profiles p where p.handle = next_handle) then
    next_handle := left(base_handle, 12) || left(replace(new.id::text, '-', ''), 6);
  end if;

  insert into public.pa_profiles (id, auth_user_id, handle, name, account_type, city)
  values (
    new.id::text,
    new.id,
    next_handle,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), 'Pet Angel'),
    coalesce(nullif(new.raw_user_meta_data->>'account_type', ''), 'pet_parent'),
    coalesce(new.raw_user_meta_data->>'city', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
