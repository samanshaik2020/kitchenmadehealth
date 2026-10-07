-- Run manually in the Supabase SQL Editor after 20261007_html_page_images.sql.
-- The earlier migration supplies SELECT permission, also required for deletion.
begin;

drop policy if exists "html_page_images_owner_delete" on storage.objects;
create policy "html_page_images_owner_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'html-page-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

commit;
