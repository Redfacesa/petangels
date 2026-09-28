-- Persist like counts on posts so every account sees the same heart count.
-- Paste on kdqqetllmtoeafrphsjc.

create or replace function public.pa_bump_post_likes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.pa_posts
    set likes = (select count(*)::int from public.pa_likes where post_id = new.post_id)
    where id = new.post_id;
  return new;
end;
$$;

create or replace function public.pa_drop_post_likes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.pa_posts
    set likes = (select count(*)::int from public.pa_likes where post_id = old.post_id)
    where id = old.post_id;
  return old;
end;
$$;

drop trigger if exists pa_likes_bump on public.pa_likes;
create trigger pa_likes_bump
  after insert on public.pa_likes
  for each row execute function public.pa_bump_post_likes();

drop trigger if exists pa_likes_drop on public.pa_likes;
create trigger pa_likes_drop
  after delete on public.pa_likes
  for each row execute function public.pa_drop_post_likes();

update public.pa_posts p
  set likes = coalesce((select count(*)::int from public.pa_likes l where l.post_id = p.id), 0);
