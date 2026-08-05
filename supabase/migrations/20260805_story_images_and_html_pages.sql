-- Kitchen Made Health supporting story images and hosted HTML pages.
-- Run after 20260803_products_and_health_categories.sql.

create extension if not exists "pgcrypto";

alter table public.posts
  add column if not exists supporting_image_1_url text,
  add column if not exists supporting_image_1_alt text,
  add column if not exists supporting_image_2_url text,
  add column if not exists supporting_image_2_alt text;

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

alter table public.html_pages enable row level security;

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
