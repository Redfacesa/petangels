-- Animal journal / articles. Paste on kdqqetllmtoeafrphsjc.

create table if not exists public.pa_articles (
  id text primary key default gen_random_uuid()::text,
  author_id text not null references public.pa_profiles (id) on delete cascade,
  title text not null,
  excerpt text not null default '',
  body text not null,
  cover_url text,
  created_at timestamptz not null default now()
);

alter table public.pa_articles enable row level security;

drop policy if exists pa_articles_read on public.pa_articles;
create policy pa_articles_read on public.pa_articles for select using (true);

drop policy if exists pa_articles_write on public.pa_articles;
create policy pa_articles_write on public.pa_articles for insert to authenticated
  with check (author_id in (select id from public.pa_profiles where auth_user_id = auth.uid()));

drop policy if exists pa_articles_update on public.pa_articles;
create policy pa_articles_update on public.pa_articles for update to authenticated
  using (author_id in (select id from public.pa_profiles where auth_user_id = auth.uid()));

drop policy if exists pa_articles_delete on public.pa_articles;
create policy pa_articles_delete on public.pa_articles for delete to authenticated
  using (
    author_id in (select id from public.pa_profiles where auth_user_id = auth.uid())
    or public.pa_is_staff()
  );

grant select on public.pa_articles to anon, authenticated;
grant insert, update, delete on public.pa_articles to authenticated;

create index if not exists pa_articles_created_idx on public.pa_articles (created_at desc);
