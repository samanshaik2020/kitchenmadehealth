import type { MetadataRoute } from "next";
import { getPublishedHtmlPages } from "@/lib/html-pages";
import { getCategories, getPublishedPosts } from "@/lib/posts";
import { absoluteUrl } from "@/lib/site-config";
import { policyPages } from "@/lib/policy-pages";
import { getPublishedProducts } from "@/lib/products";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = absoluteUrl().replace(/\/$/, "");
  const [{ posts }, categories, htmlPages, products] = await Promise.all([
    getPublishedPosts({ pageSize: 1000 }),
    getCategories(),
    getPublishedHtmlPages(),
    getPublishedProducts(),
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
    ...(products.length ? [{ url: `${baseUrl}/products`, changeFrequency: "weekly" as const, priority: 0.8 }] : []),
    ...Object.keys(policyPages).map((slug) => ({ url: `${baseUrl}/${slug}`, changeFrequency: "monthly" as const, priority: 0.4 })),
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
    ...htmlPages.map((page) => ({
      url: `${baseUrl}/pages/${page.slug}`,
      lastModified: page.updated_at,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
