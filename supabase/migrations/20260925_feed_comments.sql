-- Comments + replies on feed posts (Instagram / Facebook style).
-- Paste on kdqqetllmtoeafrphsjc. Does not delete data.

create table if not exists public.pa_comments (
  id text primary key default gen_random_uuid()::text,
  post_id text not null references public.pa_posts (id) on delete cascade,
  author_id text not null references public.pa_profiles (id) on delete cascade,
  parent_id text references public.pa_comments (id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists pa_comments_post_id_idx on public.pa_comments (post_id, created_at);
create index if not exists pa_comments_parent_id_idx on public.pa_comments (parent_id);

alter table public.pa_comments enable row level security;

drop policy if exists pa_comments_read on public.pa_comments;
create policy pa_comments_read on public.pa_comments for select using (true);

drop policy if exists pa_comments_write on public.pa_comments;
create policy pa_comments_write on public.pa_comments for insert to authenticated
  with check (
    author_id in (select id from public.pa_profiles where auth_user_id = auth.uid())
    and (
      parent_id is null
      or parent_id in (select id from public.pa_comments c where c.post_id = pa_comments.post_id)
    )
  );

drop policy if exists pa_comments_update on public.pa_comments;
create policy pa_comments_update on public.pa_comments for update to authenticated
  using (author_id in (select id from public.pa_profiles where auth_user_id = auth.uid()))
  with check (author_id in (select id from public.pa_profiles where auth_user_id = auth.uid()));

drop policy if exists pa_comments_delete on public.pa_comments;
create policy pa_comments_delete on public.pa_comments for delete to authenticated
  using (
    author_id in (select id from public.pa_profiles where auth_user_id = auth.uid())
    or public.pa_is_staff()
  );

grant select on public.pa_comments to anon, authenticated;
grant insert, update, delete on public.pa_comments to authenticated;

create or replace function public.pa_comments_touch_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.pa_posts set comments = comments + 1 where id = new.post_id;
    return new;
  end if;
  if tg_op = 'DELETE' then
    update public.pa_posts set comments = greatest(comments - 1, 0) where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists pa_comments_touch_count on public.pa_comments;
create trigger pa_comments_touch_count
  after insert or delete on public.pa_comments
  for each row execute function public.pa_comments_touch_count();

create or replace function public.pa_notify_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  post_author uuid;
  parent_author uuid;
  snippet text;
begin
  snippet := left(new.body, 80);
  select p.auth_user_id into post_author
  from public.pa_posts posts
  join public.pa_profiles p on p.id = posts.author_id
  where posts.id = new.post_id;

  if post_author is not null then
    select auth_user_id into parent_author
    from public.pa_profiles
    where id = new.author_id;
    if post_author is distinct from parent_author then
      insert into public.pa_notifications (user_id, title, body, href)
      values (post_author, 'New comment', snippet, '/home');
    end if;
  end if;

  if new.parent_id is not null then
    select p.auth_user_id into parent_author
    from public.pa_comments c
    join public.pa_profiles p on p.id = c.author_id
    where c.id = new.parent_id;
    if parent_author is not null and parent_author is distinct from (
      select auth_user_id from public.pa_profiles where id = new.author_id
    ) then
      insert into public.pa_notifications (user_id, title, body, href)
      values (parent_author, 'New reply', snippet, '/home');
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists pa_notify_comment on public.pa_comments;
create trigger pa_notify_comment
  after insert on public.pa_comments
  for each row execute function public.pa_notify_comment();
