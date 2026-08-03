import type { MetadataRoute } from "next";
import { getCategories, getPublishedPosts } from "@/lib/posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kitchenmadehealth.com";
  const [{ posts }, categories] = await Promise.all([
    getPublishedPosts({ pageSize: 1000 }),
    getCategories(),
  ]);

  return [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/welcome`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/blog`, changeFrequency: "weekly", priority: 0.9 },
    {
      url: `${baseUrl}/health-calculators`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    { url: `${baseUrl}/products`, changeFrequency: "weekly", priority: 0.8 },
    ...categories.map((category) => ({
      url: `${baseUrl}/category/${category.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updated_at,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
