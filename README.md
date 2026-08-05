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
6. Copy `.env.example` to `.env.local` and add the project URL and anon key.
7. Add an email/password editor in Supabase Authentication.
8. Restart `npm run dev`, then sign in at `/login`.

The SQL setup creates the public `post-images` and `product-images` buckets and their policies. The
service-role key is intentionally not used by the app; authenticated operations
are enforced through row-level security.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Deployment

Import the repository into Vercel, add the environment variables, and set
`NEXT_PUBLIC_SITE_URL` to the production origin. Attach `kitchenmadehealth.com`
and `www.kitchenmadehealth.com` in the Vercel domain settings.
