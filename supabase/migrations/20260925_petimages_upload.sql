-- Fix 403 on profile photo upload to petimages.
-- Paste on kdqqetllmtoeafrphsjc.

update storage.buckets
set
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = null
where id = 'petimages';

drop policy if exists petimages_auth_insert on storage.objects;
create policy petimages_auth_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'petimages'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists petimages_auth_update on storage.objects;
create policy petimages_auth_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'petimages'
    and split_part(name, '/', 1) = auth.uid()::text
  )
  with check (
    bucket_id = 'petimages'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists petimages_auth_delete on storage.objects;
create policy petimages_auth_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'petimages'
    and split_part(name, '/', 1) = auth.uid()::text
  );

-- Needed after public listing was removed: Storage upload checks SELECT on the new object.
drop policy if exists petimages_auth_select on storage.objects;
create policy petimages_auth_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'petimages'
    and split_part(name, '/', 1) = auth.uid()::text
  );
