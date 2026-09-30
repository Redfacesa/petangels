-- Paste on kdqqetllmtoeafrphsjc. Follows + DMs.

create table if not exists public.pa_follows (
  follower_id text not null references public.pa_profiles (id) on delete cascade,
  followee_id text not null references public.pa_profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);

create table if not exists public.pa_chats (
  id text primary key default gen_random_uuid()::text,
  a_id text not null references public.pa_profiles (id) on delete cascade,
  b_id text not null references public.pa_profiles (id) on delete cascade,
  updated_at timestamptz not null default now(),
  unique (a_id, b_id),
  check (a_id < b_id)
);

create table if not exists public.pa_chat_messages (
  id text primary key default gen_random_uuid()::text,
  chat_id text not null references public.pa_chats (id) on delete cascade,
  sender_id text not null references public.pa_profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists pa_follows_followee_idx on public.pa_follows (followee_id);
create index if not exists pa_chat_messages_chat_idx on public.pa_chat_messages (chat_id, created_at);

alter table public.pa_follows enable row level security;
alter table public.pa_chats enable row level security;
alter table public.pa_chat_messages enable row level security;

drop policy if exists pa_follows_read on public.pa_follows;
create policy pa_follows_read on public.pa_follows for select using (true);

drop policy if exists pa_follows_write on public.pa_follows;
create policy pa_follows_write on public.pa_follows for insert to authenticated
  with check (follower_id in (select id from public.pa_profiles where auth_user_id = auth.uid()));

drop policy if exists pa_follows_delete on public.pa_follows;
create policy pa_follows_delete on public.pa_follows for delete to authenticated
  using (follower_id in (select id from public.pa_profiles where auth_user_id = auth.uid()));

drop policy if exists pa_chats_read on public.pa_chats;
create policy pa_chats_read on public.pa_chats for select to authenticated
  using (
    a_id in (select id from public.pa_profiles where auth_user_id = auth.uid())
    or b_id in (select id from public.pa_profiles where auth_user_id = auth.uid())
  );

drop policy if exists pa_chats_write on public.pa_chats;
create policy pa_chats_write on public.pa_chats for insert to authenticated
  with check (
    a_id in (select id from public.pa_profiles where auth_user_id = auth.uid())
    or b_id in (select id from public.pa_profiles where auth_user_id = auth.uid())
  );

drop policy if exists pa_chats_update on public.pa_chats;
create policy pa_chats_update on public.pa_chats for update to authenticated
  using (
    a_id in (select id from public.pa_profiles where auth_user_id = auth.uid())
    or b_id in (select id from public.pa_profiles where auth_user_id = auth.uid())
  );

drop policy if exists pa_chat_messages_read on public.pa_chat_messages;
create policy pa_chat_messages_read on public.pa_chat_messages for select to authenticated
  using (
    chat_id in (
      select id from public.pa_chats
      where a_id in (select id from public.pa_profiles where auth_user_id = auth.uid())
         or b_id in (select id from public.pa_profiles where auth_user_id = auth.uid())
    )
  );

drop policy if exists pa_chat_messages_write on public.pa_chat_messages;
create policy pa_chat_messages_write on public.pa_chat_messages for insert to authenticated
  with check (
    sender_id in (select id from public.pa_profiles where auth_user_id = auth.uid())
    and chat_id in (
      select id from public.pa_chats
      where a_id in (select id from public.pa_profiles where auth_user_id = auth.uid())
         or b_id in (select id from public.pa_profiles where auth_user_id = auth.uid())
    )
  );

grant select, insert, delete on public.pa_follows to authenticated;
grant select on public.pa_follows to anon;
grant select, insert, update on public.pa_chats to authenticated;
grant select, insert on public.pa_chat_messages to authenticated;

create or replace function public.pa_open_chat(other_id text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  me text;
  lo text;
  hi text;
  cid text;
begin
  select id into me from public.pa_profiles where auth_user_id = auth.uid() limit 1;
  if me is null or other_id is null or me = other_id then
    raise exception 'cannot open chat';
  end if;
  if me < other_id then lo := me; hi := other_id; else lo := other_id; hi := me; end if;
  select id into cid from public.pa_chats where a_id = lo and b_id = hi;
  if cid is null then
    insert into public.pa_chats (a_id, b_id) values (lo, hi) returning id into cid;
  end if;
  return cid;
end;
$$;

grant execute on function public.pa_open_chat(text) to authenticated;

create or replace function public.pa_notify_follow()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid;
  who text;
begin
  if to_regclass('public.pa_notifications') is null then
    return new;
  end if;
  select auth_user_id into target from public.pa_profiles where id = new.followee_id;
  select name into who from public.pa_profiles where id = new.follower_id;
  if target is not null then
    insert into public.pa_notifications (user_id, title, body, href)
    values (target, 'New follower', coalesce(who, 'Someone') || ' followed you', '/u/' || coalesce((select handle from public.pa_profiles where id = new.follower_id), ''));
  end if;
  return new;
end;
$$;

drop trigger if exists pa_notify_follow on public.pa_follows;
create trigger pa_notify_follow after insert on public.pa_follows
  for each row execute function public.pa_notify_follow();

create or replace function public.pa_notify_chat()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  other text;
  other_auth uuid;
  who text;
begin
  if to_regclass('public.pa_notifications') is null then
    return new;
  end if;
  select case when a_id = new.sender_id then b_id else a_id end into other
    from public.pa_chats where id = new.chat_id;
  select name into who from public.pa_profiles where id = new.sender_id;
  select auth_user_id into other_auth from public.pa_profiles where id = other;
  if other_auth is not null then
    insert into public.pa_notifications (user_id, title, body, href)
    values (other_auth, coalesce(who, 'Message'), left(new.body, 80), '/messages/' || new.chat_id);
  end if;
  update public.pa_chats set updated_at = now() where id = new.chat_id;
  return new;
end;
$$;

drop trigger if exists pa_notify_chat on public.pa_chat_messages;
create trigger pa_notify_chat after insert on public.pa_chat_messages
  for each row execute function public.pa_notify_chat();

notify pgrst, 'reload schema';
