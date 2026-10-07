-- Run this once in the Supabase SQL Editor to enable the HTML page image library.
-- No changes to existing posts or HTML page tables are required.
begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'html-page-images',
  'html-page-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public bucket URLs can be embedded anywhere; listing requires the owner's login.
drop policy if exists "html_page_images_owner_list" on storage.objects;
create policy "html_page_images_owner_list"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'html-page-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "html_page_images_owner_upload" on storage.objects;
create policy "html_page_images_owner_upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'html-page-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

commit;
