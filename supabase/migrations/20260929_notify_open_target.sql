-- Deep-link likes to the post and comments/replies to that comment on the post.
-- Paste on kdqqetllmtoeafrphsjc. Does not delete notifications.

create or replace function public.pa_notify_like()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  author_auth uuid;
  post_title text;
begin
  select p.auth_user_id, posts.title
    into author_auth, post_title
  from public.pa_posts posts
  join public.pa_profiles p on p.id = posts.author_id
  where posts.id = new.post_id;
  if author_auth is not null and author_auth is distinct from new.user_id then
    insert into public.pa_notifications (user_id, title, body, href)
    values (
      author_auth,
      'New like',
      'Liked your post: ' || coalesce(nullif(btrim(post_title), ''), 'Open to see it'),
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
  commenter uuid;
  post_title text;
  snippet text;
  dest text;
begin
  snippet := left(btrim(new.body), 80);
  dest := '/posts/' || new.post_id || '?c=' || new.id;
  select p.auth_user_id, posts.title
    into post_author, post_title
  from public.pa_posts posts
  join public.pa_profiles p on p.id = posts.author_id
  where posts.id = new.post_id;
  select auth_user_id into commenter from public.pa_profiles where id = new.author_id;

  if post_author is not null and post_author is distinct from commenter then
    insert into public.pa_notifications (user_id, title, body, href)
    values (
      post_author,
      'New comment',
      snippet || ' — on: ' || coalesce(nullif(btrim(post_title), ''), 'your post'),
      dest
    );
  end if;

  if new.parent_id is not null then
    select p.auth_user_id into parent_author
    from public.pa_comments c
    join public.pa_profiles p on p.id = c.author_id
    where c.id = new.parent_id;
    if parent_author is not null and parent_author is distinct from commenter then
      insert into public.pa_notifications (user_id, title, body, href)
      values (
        parent_author,
        'New reply',
        snippet || ' — on: ' || coalesce(nullif(btrim(post_title), ''), 'your comment'),
        dest
      );
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists pa_notify_comment on public.pa_comments;
create trigger pa_notify_comment
  after insert on public.pa_comments
  for each row execute function public.pa_notify_comment();

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
  article_title text;
begin
  snippet := left(btrim(new.body), 80);
  select p.auth_user_id, a.title into article_author, article_title
  from public.pa_articles a
  join public.pa_profiles p on p.id = a.author_id
  where a.id = new.article_id;
  select auth_user_id into commenter from public.pa_profiles where id = new.author_id;
  if article_author is not null and article_author is distinct from commenter then
    insert into public.pa_notifications (user_id, title, body, href)
    values (
      article_author,
      'Journal comment',
      snippet || ' — on: ' || coalesce(nullif(btrim(article_title), ''), 'your article'),
      '/journal/' || new.article_id || '?c=' || new.id
    );
  end if;
  return new;
end;
$$;

-- Point existing alerts at the matching post / comment when we can still find them.
update public.pa_notifications n
set href = '/posts/' || c.post_id || '?c=' || c.id
from public.pa_comments c
where n.title in ('New comment', 'New reply')
  and (n.href is null or n.href in ('/home', '/home/') or n.href = '/posts/' || c.post_id)
  and left(btrim(c.body), 80) = left(btrim(n.body), 80)
  and n.created_at between c.created_at - interval '15 seconds' and c.created_at + interval '15 seconds';

update public.pa_notifications n
set href = '/posts/' || l.post_id
from public.pa_likes l
join public.pa_posts p on p.id = l.post_id
join public.pa_profiles pr on pr.id = p.author_id
where n.title = 'New like'
  and n.user_id = pr.auth_user_id
  and (n.href is null or n.href in ('/home', '/home/'))
  and n.created_at between l.created_at - interval '15 seconds' and l.created_at + interval '15 seconds';
