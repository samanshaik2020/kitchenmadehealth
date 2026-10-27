# KitchenMadeHealth

A production-ready editorial blog and private publishing dashboard for
`kitchenmadehealth.com`, built with Next.js 16.2.11, TypeScript, Tailwind CSS,
Supabase, and Tiptap.

## What is included

- Editorial homepage with featured and recent guides
- Paginated `/blog` library with category filters
- Dynamic category and article routes with SEO metadata
- Sitemap, robots rules, and RSS feed
- Supabase email/password authentication
- Private editorial dashboard with draft/published states
- Tiptap rich-text editor, SEO controls, a cover, and two supporting image uploads
- Sandboxed standalone HTML page publishing with stable `/pages/{slug}` URLs
- HTML page image library with reusable public image URLs, copy-link and delete buttons
- Homepage category images from the latest published post in each category
- One PDF attachment per story, strictly below 5 MB
- YouTube video links inserted directly into article content
- A visible Images & PDFs library with reusable public links
- Validated Server Actions for create, edit, publish, unpublish, and delete
- RLS-protected database and Storage policies
- Independent public product catalog with affiliate buttons and click tracking
- Sample-data preview when Supabase is not configured

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Without environment variables, the public site
and dashboard run in preview mode with sample content.

## Connect Supabase

1. Create a Supabase project.
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL Editor.
3. Run [`supabase/migrations/20260723_editorial_workspace.sql`](supabase/migrations/20260723_editorial_workspace.sql).
4. Run [`supabase/migrations/20260803_products_and_health_categories.sql`](supabase/migrations/20260803_products_and_health_categories.sql).
5. Run [`supabase/migrations/20260805_story_images_and_html_pages.sql`](supabase/migrations/20260805_story_images_and_html_pages.sql).
6. Run [`supabase/migrations/20261007_html_page_images.sql`](supabase/migrations/20261007_html_page_images.sql) to enable reusable image uploads in the HTML pages editor.
7. Run [`supabase/migrations/20261007_html_page_image_delete.sql`](supabase/migrations/20261007_html_page_image_delete.sql) to enable deleting your uploaded library images.
8. Run [`supabase/migrations/20261022_post_pdfs_and_youtube.sql`](supabase/migrations/20261022_post_pdfs_and_youtube.sql) for post PDFs and homepage YouTube links.
9. Copy `.env.example` to `.env.local` and add the project URL and anon key.
10. Add an email/password editor in Supabase Authentication.
11. Restart `npm run dev`, then sign in at `/login`.

In **Images & PDFs** (`/dashboard/media`), upload images or PDFs and copy their
public links. In the story editor, use **PDF attachment → Choose uploaded PDF**
to attach or replace one of your uploaded PDFs. Uploading is kept in the media
library rather than the blog editor. Files
must be strictly below 5,000,000 bytes; empty files and other formats are rejected.
Save or update the story to show its **Open PDF** link below the article. Removing
the attachment and saving hides the link. Detached files remain in Storage so
older story revisions can restore them. PDFs use a public bucket, like story images.

In the article editor toolbar, choose **YouTube**, paste a video URL, optionally
add a title, and choose **Insert video**. Watch, share, Shorts, live, and embed
URLs are accepted. The video is saved in the article body and uses YouTube's
privacy-enhanced embed host. Invalid URLs and unrelated iframes are rejected.
Article videos are optional. An uninserted video URL never blocks saving or
publishing. Source URLs are also optional. Publish errors are summarized and
focused above the editor.

Use **Homepage videos** (`/dashboard/videos`) to replace the six picks from the
Kitchen Made Health YouTube channel,
reorder them by slot, or clear a slot. The watchlist appears directly above the
footer in two rows of three on desktop, two columns on tablets, and one on phones.
Saved slots override the starter picks, including slots intentionally cleared.

The main health categories use distinct local topic photographs so article
thumbnail text does not compete with category titles. Custom categories choose
a recent published post cover that is not already shown in the homepage journal.
Generic hero images are skipped. Publishing,
updating, moving, unpublishing, or deleting a post invalidates the homepage cache.

In **Images & PDFs → Image library**, use **Upload image & get link**.
JPG, PNG, WebP, GIF, and AVIF images up to 5 MB receive public URLs that can be
copied into any HTML document or website. The library shows your 20 most recent
uploads after a refresh. Uploading another image creates a new URL; existing
images remain available independently of published HTML pages.
Use **Delete image** to permanently remove an uploaded file after confirmation.
Pages using its URL may show a broken image; existing browser caches may still
display a previously loaded copy. Each editor can delete only their own uploads.

The SQL setup creates the public `post-images` and `product-images` buckets and their policies. The
service-role key is intentionally not used by the app; authenticated operations
are enforced through row-level security.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run test:audit
npm run build
node scripts/test-html-images.mjs
node scripts/test-post-media.mjs
```

## Deployment

Import the repository into Vercel, add the environment variables, and set
`SITE_URL` to `https://www.kitchenmadehealth.com` for Production. The legacy
`NEXT_PUBLIC_SITE_URL` is a fallback; production rejects localhost and non-HTTPS
values so a development setting cannot enter canonical tags, sitemaps, or feeds.
Redeploy after changing a production environment variable. Attach `kitchenmadehealth.com`
and `www.kitchenmadehealth.com` in the Vercel domain settings.

The journal supports title/excerpt search through `?q=`, combined with category
filters and pagination. Search result pages are not indexed. Public article,
category, and listing pages include canonical URLs. Post publication and edits
refresh the sitemap and feed, with a timed refresh as a fallback.

The main navigation and sitemap hide the product catalog while there are no
active products. Supply `NEXT_PUBLIC_INSTAGRAM_URL` only when a real profile is
ready; otherwise the social link stays hidden. Policy and contact pages live at
`/privacy-policy`, `/terms`, `/medical-disclaimer`, `/editorial-policy`,
`/affiliate-disclosure`, and `/contact`; their text is in `lib/policy-pages.ts`.
Review that text when the site's data collection or editorial practices change.

Source URLs are optional when saving, publishing, scheduling, or restoring a
story. Draft instructions and unfinished template links still block publication.
The editor toolbar includes link
and unlink controls. These checks catch unfinished material; they do not verify
clinical claims or establish that a reviewer has examined an article. The public
byline links to the editorial desk policy and makes the current review status
explicit. Add real reviewer details only after a specific qualified review.

Standalone HTML retains its separate sandbox policy. The legacy German-version
quiz URL redirects to `/pages/why-do-cravings-hit-at-3-pm`. Keep its replacement
published before deploying the redirect. Working notes, content backups, and
audit screenshots belong in the ignored `artifacts/` folder.
