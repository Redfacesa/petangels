-- Country on profiles/listings, article comments, like notifications, pets_public country.
-- Paste on kdqqetllmtoeafrphsjc.

alter table public.pa_profiles
  add column if not exists country text not null default 'ZA';

alter table public.pa_listings
  add column if not exists country text not null default 'ZA';

alter table public.pa_pets
  add column if not exists country text not null default 'ZA';

alter table public.pa_animals
  add column if not exists country text not null default 'ZA';

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
    created_at,
    country
  from public.pa_pets;

grant select on public.pa_pets_public to anon, authenticated;

create table if not exists public.pa_article_comments (
  id text primary key default gen_random_uuid()::text,
  article_id text not null references public.pa_articles (id) on delete cascade,
  author_id text not null references public.pa_profiles (id) on delete cascade,
  parent_id text references public.pa_article_comments (id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists pa_article_comments_article_idx on public.pa_article_comments (article_id, created_at);

alter table public.pa_article_comments enable row level security;

drop policy if exists pa_article_comments_read on public.pa_article_comments;
create policy pa_article_comments_read on public.pa_article_comments for select using (true);

drop policy if exists pa_article_comments_write on public.pa_article_comments;
create policy pa_article_comments_write on public.pa_article_comments for insert to authenticated
  with check (
    author_id in (select id from public.pa_profiles where auth_user_id = auth.uid())
  );

drop policy if exists pa_article_comments_delete on public.pa_article_comments;
create policy pa_article_comments_delete on public.pa_article_comments for delete to authenticated
  using (
    author_id in (select id from public.pa_profiles where auth_user_id = auth.uid())
    or public.pa_is_staff()
  );

grant select on public.pa_article_comments to anon, authenticated;
grant insert, delete on public.pa_article_comments to authenticated;

create or replace function public.pa_notify_article_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  article_author uuid;
  commenter uuid;
  snippet text;
begin
  snippet := left(new.body, 80);
  select p.auth_user_id into article_author
  from public.pa_articles a
  join public.pa_profiles p on p.id = a.author_id
  where a.id = new.article_id;
  select auth_user_id into commenter from public.pa_profiles where id = new.author_id;
  if article_author is not null and article_author is distinct from commenter then
    insert into public.pa_notifications (user_id, title, body, href)
    values (article_author, 'Journal comment', snippet, '/journal/' || new.article_id);
  end if;
  return new;
end;
$$;

drop trigger if exists pa_notify_article_comment on public.pa_article_comments;
create trigger pa_notify_article_comment
  after insert on public.pa_article_comments
  for each row execute function public.pa_notify_article_comment();

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
      '/posts/' || new.post_id
    );
  end if;
  return new;
end;
$$;

drop trigger if exists pa_notify_like on public.pa_likes;
create trigger pa_notify_like
  after insert on public.pa_likes
  for each row execute function public.pa_notify_like();

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
      values (post_author, 'New comment', snippet, '/posts/' || new.post_id || '?c=' || new.id);
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
      values (parent_author, 'New reply', snippet, '/posts/' || new.post_id || '?c=' || new.id);
    end if;
  end if;
  return new;
end;
$$;
