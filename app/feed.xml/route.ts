import { getPublishedPosts } from "@/lib/posts";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kitchenmadehealth.com";
  const { posts } = await getPublishedPosts({ pageSize: 50 });

  const escapeXml = (value: string) =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&apos;");

  const items = posts
    .map(
      (post) => `<item>
  <title>${escapeXml(post.title)}</title>
  <link>${baseUrl}/blog/${post.slug}</link>
  <guid>${baseUrl}/blog/${post.slug}</guid>
  <description>${escapeXml(post.excerpt ?? "")}</description>
  <pubDate>${new Date(post.published_at ?? post.created_at).toUTCString()}</pubDate>
</item>`,
    )
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>KitchenMadeHealth</title>
  <link>${baseUrl}</link>
  <description>Thoughtful kitchenware guides, honest reviews, and practical advice.</description>
  ${items}
</channel>
</rss>`,
    {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
