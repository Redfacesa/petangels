-- Pet Angels schema on project kdqqetllmtoeafrphsjc
-- Identity + content live here. Money still moves through RedFace Pay.

create extension if not exists "pgcrypto";

create table if not exists public.pa_profiles (
  id text primary key,
  auth_user_id uuid unique references auth.users (id) on delete set null,
  handle text unique not null,
  name text not null,
  account_type text not null check (account_type in ('pet_parent', 'merchant', 'shelter')),
  bio text not null default '',
  city text not null default '',
  avatar_url text,
  cover_url text,
  verified boolean not null default false,
  pets text[] not null default '{}',
  categories text[] not null default '{}',
  redface_merchant_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.pa_posts (
  id text primary key default gen_random_uuid()::text,
  author_id text not null references public.pa_profiles (id) on delete cascade,
  kind text not null check (kind in ('story', 'product', 'rescue', 'adoption', 'birthday', 'update')),
  title text not null,
  body text not null default '',
  images text[] not null default '{}',
  likes int not null default 0,
  comments int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.pa_listings (
  id text primary key default gen_random_uuid()::text,
  seller_id text not null references public.pa_profiles (id) on delete cascade,
  kind text not null check (kind in ('product', 'service')),
  title text not null,
  price numeric(12, 2) not null,
  from_price boolean not null default false,
  category text not null default '',
  image_url text,
  city text,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.pa_animals (
  id text primary key default gen_random_uuid()::text,
  org_id text not null references public.pa_profiles (id) on delete cascade,
  name text not null,
  species text not null check (species in ('dog', 'cat', 'other')),
  age text not null default '',
  city text not null default '',
  status text not null check (status in ('looking_for_home', 'foster_needed', 'adopted')),
  image_url text,
  story text not null default '',
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.pa_cases (
  id text primary key default gen_random_uuid()::text,
  org_id text not null references public.pa_profiles (id) on delete cascade,
  title text not null,
  city text not null default '',
  urgency text not null check (urgency in ('high', 'medium')),
  summary text not null default '',
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.pa_likes (
  user_id uuid not null references auth.users (id) on delete cascade,
  post_id text not null references public.pa_posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

-- Checkout is RedFace Pay; we only record the handoff.
create table if not exists public.pa_pay_events (
  id uuid primary key default gen_random_uuid(),
  payer_id uuid references auth.users (id) on delete set null,
  payee_profile_id text references public.pa_profiles (id) on delete set null,
  kind text not null,
  amount_zar numeric(12, 2) not null,
  label text not null,
  redface_merchant_id text,
  status text not null default 'redirected',
  created_at timestamptz not null default now()
);

alter table public.pa_profiles enable row level security;
alter table public.pa_posts enable row level security;
alter table public.pa_listings enable row level security;
alter table public.pa_animals enable row level security;
alter table public.pa_cases enable row level security;
alter table public.pa_likes enable row level security;
alter table public.pa_pay_events enable row level security;

drop policy if exists pa_profiles_read on public.pa_profiles;
create policy pa_profiles_read on public.pa_profiles for select using (true);

drop policy if exists pa_profiles_insert on public.pa_profiles;
create policy pa_profiles_insert on public.pa_profiles for insert to authenticated
  with check (auth_user_id = auth.uid());

drop policy if exists pa_profiles_update on public.pa_profiles;
create policy pa_profiles_update on public.pa_profiles for update to authenticated
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

drop policy if exists pa_posts_read on public.pa_posts;
create policy pa_posts_read on public.pa_posts for select using (true);

drop policy if exists pa_posts_write on public.pa_posts;
create policy pa_posts_write on public.pa_posts for insert to authenticated
  with check (author_id in (select id from public.pa_profiles where auth_user_id = auth.uid()));

drop policy if exists pa_listings_read on public.pa_listings;
create policy pa_listings_read on public.pa_listings for select using (true);

drop policy if exists pa_listings_write on public.pa_listings;
create policy pa_listings_write on public.pa_listings for insert to authenticated
  with check (seller_id in (select id from public.pa_profiles where auth_user_id = auth.uid()));

drop policy if exists pa_animals_read on public.pa_animals;
create policy pa_animals_read on public.pa_animals for select using (true);

drop policy if exists pa_animals_write on public.pa_animals;
create policy pa_animals_write on public.pa_animals for insert to authenticated
  with check (
    org_id in (
      select id from public.pa_profiles
      where auth_user_id = auth.uid()
        and account_type = 'shelter'
    )
  );

drop policy if exists pa_cases_read on public.pa_cases;
create policy pa_cases_read on public.pa_cases for select using (true);

drop policy if exists pa_cases_write on public.pa_cases;
create policy pa_cases_write on public.pa_cases for insert to authenticated
  with check (org_id in (select id from public.pa_profiles where auth_user_id = auth.uid()));

drop policy if exists pa_likes_read on public.pa_likes;
create policy pa_likes_read on public.pa_likes for select using (true);

drop policy if exists pa_likes_write on public.pa_likes;
create policy pa_likes_write on public.pa_likes for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists pa_likes_delete on public.pa_likes;
create policy pa_likes_delete on public.pa_likes for delete to authenticated
  using (user_id = auth.uid());

drop policy if exists pa_pay_insert on public.pa_pay_events;
create policy pa_pay_insert on public.pa_pay_events for insert to authenticated
  with check (payer_id = auth.uid());

drop policy if exists pa_pay_read on public.pa_pay_events;
create policy pa_pay_read on public.pa_pay_events for select to authenticated
  using (payer_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('petimages', 'petimages', true)
on conflict (id) do update set public = true;

drop policy if exists petimages_public_read on storage.objects;
create policy petimages_public_read on storage.objects
  for select using (bucket_id = 'petimages');

drop policy if exists petimages_auth_insert on storage.objects;
create policy petimages_auth_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'petimages'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists petimages_auth_update on storage.objects;
create policy petimages_auth_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'petimages'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create or replace function public.pa_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.pa_profiles (id, auth_user_id, handle, name, account_type, city)
  values (
    new.id::text,
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'handle', ''), split_part(new.email, '@', 1)),
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), 'Pet Angel'),
    coalesce(nullif(new.raw_user_meta_data->>'account_type', ''), 'pet_parent'),
    coalesce(new.raw_user_meta_data->>'city', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists pa_on_auth_user_created on auth.users;
create trigger pa_on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.pa_handle_new_user();

insert into public.pa_profiles (id, handle, name, account_type, bio, city, avatar_url, verified, pets, categories)
values
  (
    'p-manace', 'manace', 'Manace', 'pet_parent',
    'Pet parent in Cape Town. Bruno and Luna run the house.',
    'Cape Town',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80',
    false, array['Bruno', 'Luna'], '{}'
  ),
  (
    'p-happypaws', 'happypaws', 'Happy Paws', 'merchant',
    'Neighbourhood pet store — food, toys, beds, and grooming.',
    'Cape Town',
    'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=240&q=80',
    true, '{}', array['Food', 'Toys', 'Beds', 'Grooming']
  ),
  (
    'p-cape', 'capeanimalrescue', 'Cape Animal Rescue', 'shelter',
    'Verified rescue organisation. We rehome, foster, and fundraise for animals in need.',
    'Cape Town',
    'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=240&q=80',
    true, '{}', '{}'
  ),
  (
    'p-pawstransport', 'pawstransport', 'Paws Transport', 'merchant',
    'Safe animal transportation across the Western Cape.',
    'Cape Town',
    'https://images.unsplash.com/photo-1444212477490-ca407925329e?auto=format&fit=crop&w=240&q=80',
    true, '{}', array['Pet transport']
  )
on conflict (id) do nothing;

insert into public.pa_posts (id, author_id, kind, title, body, images, likes, comments, created_at)
values
  (
    'post-bruno', 'p-cape', 'story', 'Bruno''s recovery story',
    'Bruno was rescued three weeks ago. Look at him now — eating, walking, and leaning on every volunteer who walks past.',
    array[
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80'
    ],
    2400, 186, '2026-09-18T10:00:00Z'
  ),
  (
    'post-luna', 'p-manace', 'birthday', 'Luna''s first birthday',
    'Cake (cat-safe, obviously), a cardboard box, and the whole living room as her kingdom.',
    array['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80'],
    812, 64, '2026-09-19T16:00:00Z'
  ),
  (
    'post-happypaws', 'p-happypaws', 'product', 'New products from Happy Paws',
    'Handmade treats, orthopaedic beds, and a restock of grain-free kibble. Shop the marketplace — checkout runs on RedFace Pay.',
    array['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=900&q=80'],
    340, 22, '2026-09-20T09:00:00Z'
  ),
  (
    'post-foster', 'p-cape', 'rescue', '5 dogs in Cape Town need foster homes',
    'Short-term fosters keep these dogs out of overcrowded kennels while we find forever homes.',
    array['https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80'],
    1902, 211, '2026-09-20T14:00:00Z'
  ),
  (
    'post-bella', 'p-cape', 'adoption', 'Bella has been adopted!',
    'Two years of waiting. Tonight she sleeps in a bed that is hers. This is why the network exists.',
    array['https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=900&q=80'],
    5102, 402, '2026-09-21T08:00:00Z'
  )
on conflict (id) do nothing;

insert into public.pa_listings (id, seller_id, kind, title, price, from_price, category, image_url, city, featured)
values
  ('prd-dogfood', 'p-happypaws', 'product', 'Dog food', 249, false, 'Pet food', 'https://images.unsplash.com/photo-1589924691995-400dc9fcc63e?auto=format&fit=crop&w=700&q=80', 'Cape Town', true),
  ('prd-scratch', 'p-happypaws', 'product', 'Cat scratching post', 399, false, 'Accessories', 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&w=700&q=80', 'Cape Town', false),
  ('prd-treats', 'p-happypaws', 'product', 'Handmade dog treats', 80, false, 'Pet food', 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=700&q=80', 'Cape Town', false),
  ('prd-house', 'p-happypaws', 'product', 'Dog house', 1200, false, 'Beds', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=700&q=80', 'Cape Town', false),
  ('prd-groom', 'p-happypaws', 'service', 'Dog grooming', 250, true, 'Grooming', 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=700&q=80', 'Cape Town', false),
  ('prd-transport', 'p-pawstransport', 'service', 'Animal transportation', 150, true, 'Pet transport', 'https://images.unsplash.com/photo-1444212477490-ca407925329e?auto=format&fit=crop&w=700&q=80', 'Cape Town', false)
on conflict (id) do nothing;

insert into public.pa_animals (id, org_id, name, species, age, city, status, image_url, story, verified)
values
  (
    'bruno', 'p-cape', 'Bruno', 'dog', '3 years', 'Cape Town', 'looking_for_home',
    'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
    'Rescued three weeks ago. Gentle, house-trained, and recovering well. Adoption is verified through Cape Animal Rescue — not an open classifieds listing.',
    true
  ),
  (
    'milo', 'p-cape', 'Milo', 'cat', '8 months', 'Cape Town', 'looking_for_home',
    'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=800&q=80',
    'Playful indoor kitten. Vaccinated. Rehoming only through a verified rescue organisation.',
    true
  ),
  (
    'bella', 'p-cape', 'Bella', 'dog', '2 years', 'Cape Town', 'adopted',
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80',
    'Adopted. Her story stays on the network so the next Bruno has a chance.',
    true
  )
on conflict (id) do nothing;

insert into public.pa_cases (id, org_id, title, city, urgency, summary, image_url)
values
  (
    'rc-1', 'p-cape', 'Injured stray, Sea Point promenade', 'Cape Town', 'high',
    'Witness report. Needs transport to vet and overnight holding.',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80'
  ),
  (
    'rc-2', 'p-cape', 'Litter of 6 kittens, Khayelitsha', 'Cape Town', 'medium',
    'Foster and feeding support requested. Mother is friendly.',
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80'
  )
on conflict (id) do nothing;
