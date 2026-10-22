-- Post PDF attachments and the six homepage YouTube links.
begin;

alter table public.posts add column if not exists pdf_attachment jsonb;
alter table public.posts drop constraint if exists posts_pdf_attachment_check;
alter table public.posts add constraint posts_pdf_attachment_check check (
  pdf_attachment is null or coalesce((
    jsonb_typeof(pdf_attachment) = 'object'
    and jsonb_typeof(pdf_attachment->'path') = 'string'
    and (pdf_attachment->>'path') ~ ('^' || author_id::text || '/[a-zA-Z0-9_-]+\.pdf$')
    and jsonb_typeof(pdf_attachment->'name') = 'string'
    and char_length(pdf_attachment->>'name') between 1 and 180
    and jsonb_typeof(pdf_attachment->'size') = 'number'
    and (pdf_attachment->>'size')::numeric > 0
    and (pdf_attachment->>'size')::numeric < 5000000
  ), false)
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('post-pdfs', 'post-pdfs', true, 4999999, array['application/pdf']::text[])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "post_pdfs_owner_read" on storage.objects;
create policy "post_pdfs_owner_read" on storage.objects for select to authenticated
  using (bucket_id = 'post-pdfs' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "post_pdfs_owner_upload" on storage.objects;
create policy "post_pdfs_owner_upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'post-pdfs' and (storage.foldername(name))[1] = (select auth.uid())::text
    and name ~ ('^' || (select auth.uid())::text || '/[a-zA-Z0-9_-]+\.pdf$'));

-- Keep detached files so saved revisions can still restore their attachments.
create table if not exists public.youtube_videos (
  slot smallint primary key check (slot between 1 and 6),
  video_id text check (video_id is null or video_id ~ '^[a-zA-Z0-9_-]{11}$'),
  title text not null default '' check (char_length(title) <= 180),
  updated_by uuid not null references auth.users(id),
  updated_at timestamptz not null default now()
);
alter table public.youtube_videos enable row level security;
drop policy if exists "youtube_videos_read" on public.youtube_videos;
create policy "youtube_videos_read" on public.youtube_videos for select using (true);
drop policy if exists "youtube_videos_insert" on public.youtube_videos;
create policy "youtube_videos_insert" on public.youtube_videos for insert to authenticated
  with check (updated_by = (select auth.uid()));
drop policy if exists "youtube_videos_update" on public.youtube_videos;
create policy "youtube_videos_update" on public.youtube_videos for update to authenticated
  using (true) with check (updated_by = (select auth.uid()));

commit;
