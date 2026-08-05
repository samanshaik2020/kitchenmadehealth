-- KitchenMadeHealth initial schema
-- Run this file in the Supabase SQL Editor.
-- Then run both SQL files in supabase/migrations in date order to add the
-- complete editorial workflow, health categories, and product catalog.

create extension if not exists "pgcrypto";

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  title text not null check (char_length(title) between 1 and 150),
  slug text not null unique,
  excerpt text check (char_length(excerpt) <= 300),
  content text not null,
  cover_image_url text,
  supporting_image_1_url text,
  supporting_image_1_alt text,
  supporting_image_2_url text,
  supporting_image_2_alt text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  seo_title text,
  seo_description text check (char_length(seo_description) <= 160),
  view_count integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_posts_status
  on public.posts(status) where status = 'published';
create index if not exists idx_posts_slug on public.posts(slug);
create index if not exists idx_posts_category on public.posts(category_id);
create index if not exists idx_posts_published_at
  on public.posts(published_at desc) where status = 'published';

create table if not exists public.html_pages (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 150),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text check (char_length(description) <= 300),
  html_content text not null
    check (octet_length(html_content) between 1 and 4194304),
  original_filename text not null
    check (char_length(original_filename) between 1 and 180),
  status text not null default 'published'
    check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_html_pages_public
  on public.html_pages(status, published_at desc);
create index if not exists idx_html_pages_author
  on public.html_pages(author_id, updated_at desc);

create or replace function public.set_post_timestamps()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  if new.status = 'published' and old.status is distinct from 'published' then
    new.published_at = now();
  elsif new.status = 'draft' then
    new.published_at = null;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_post_timestamps on public.posts;
create trigger trg_post_timestamps
  before update on public.posts
  for each row execute function public.set_post_timestamps();

create or replace function public.set_html_page_timestamps()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  elsif new.status = 'draft' then
    new.published_at = null;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_html_page_timestamps on public.html_pages;
create trigger trg_html_page_timestamps
  before insert or update on public.html_pages
  for each row execute function public.set_html_page_timestamps();

alter table public.posts enable row level security;
alter table public.categories enable row level security;
alter table public.html_pages enable row level security;

drop policy if exists "public_read_published" on public.posts;
create policy "public_read_published"
  on public.posts for select
  using (status = 'published' or auth.uid() = author_id);

drop policy if exists "author_insert" on public.posts;
create policy "author_insert"
  on public.posts for insert
  to authenticated
  with check (auth.uid() = author_id);

drop policy if exists "author_update" on public.posts;
create policy "author_update"
  on public.posts for update
  to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

drop policy if exists "author_delete" on public.posts;
create policy "author_delete"
  on public.posts for delete
  to authenticated
  using (auth.uid() = author_id);

drop policy if exists "html_pages_public_read" on public.html_pages;
create policy "html_pages_public_read"
  on public.html_pages for select
  using (status = 'published' or auth.uid() = author_id);

drop policy if exists "html_pages_author_insert" on public.html_pages;
create policy "html_pages_author_insert"
  on public.html_pages for insert
  to authenticated
  with check (auth.uid() = author_id);

drop policy if exists "html_pages_author_update" on public.html_pages;
create policy "html_pages_author_update"
  on public.html_pages for update
  to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

drop policy if exists "html_pages_author_delete" on public.html_pages;
create policy "html_pages_author_delete"
  on public.html_pages for delete
  to authenticated
  using (auth.uid() = author_id);

drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read"
  on public.categories for select
  using (true);

drop policy if exists "categories_admin_insert" on public.categories;
create policy "categories_admin_insert"
  on public.categories for insert
  to authenticated
  with check (true);

drop policy if exists "categories_admin_update" on public.categories;
create policy "categories_admin_update"
  on public.categories for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "categories_admin_delete" on public.categories;
create policy "categories_admin_delete"
  on public.categories for delete
  to authenticated
  using (true);

insert into public.categories (name, slug, description)
values
  ('Diabetes & blood sugar', 'diabetes-blood-sugar', 'Practical, evidence-aware guidance for steadier blood sugar, nourishing meals, and everyday diabetes care.'),
  ('Knives', 'knives', 'Sharper buying advice, care tips, and practical knife skills.'),
  ('Appliances', 'appliances', 'Honest guidance for the machines earning space on your counter.'),
  ('Home remedies', 'home-remedies', 'Gentle, kitchen-rooted home remedies with clear limits, sensible precautions, and realistic expectations.')
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description;

-- Create a public bucket called "post-images" in Storage before applying
-- the policies below, or uncomment this safe insert:
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do update set public = true;

drop policy if exists "public_read_post_images" on storage.objects;
create policy "public_read_post_images"
  on storage.objects for select
  using (bucket_id = 'post-images');

drop policy if exists "authenticated_upload_post_images" on storage.objects;
create policy "authenticated_upload_post_images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'post-images');

drop policy if exists "authenticated_update_post_images" on storage.objects;
create policy "authenticated_update_post_images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'post-images')
  with check (bucket_id = 'post-images');

drop policy if exists "authenticated_delete_post_images" on storage.objects;
create policy "authenticated_delete_post_images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'post-images');
