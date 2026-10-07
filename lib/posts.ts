import { unstable_cache } from "next/cache";
import { cache } from "react";
import { demoCategories, demoPosts } from "@/lib/demo-data";
import { PUBLIC_POSTS_CACHE_TAG } from "@/lib/public-cache";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import type { Category, Post } from "@/lib/types";

const POST_SELECT = "*, category:categories(*)";

const LEGACY_CATEGORY_PRESENTATION: Record<
  string,
  Pick<Category, "name" | "slug" | "description">
> = {
  cookware: {
    name: "Diabetes & blood sugar",
    slug: "diabetes-blood-sugar",
    description:
      "Practical, evidence-aware guidance for steadier blood sugar, nourishing meals, and everyday diabetes care.",
  },
  "kitchen-guides": {
    name: "Home remedies",
    slug: "home-remedies",
    description:
      "Gentle, kitchen-rooted home remedies with clear limits, sensible precautions, and realistic expectations.",
  },
};

const NEW_TO_LEGACY_CATEGORY: Record<string, string> = {
  "diabetes-blood-sugar": "cookware",
  "home-remedies": "kitchen-guides",
};

function presentCategory(category: Category): Category {
  const replacement = LEGACY_CATEGORY_PRESENTATION[category.slug];
  return replacement ? { ...category, ...replacement } : category;
}

function presentPost(post: Post): Post {
  return {
    ...post,
    category: post.category ? presentCategory(post.category) : null,
  };
}

function getDemoPublishedPosts(options?: {
  category?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = options?.pageSize ?? 9;
  const filtered = options?.category
    ? demoPosts.filter((post) => post.category?.slug === options.category)
    : demoPosts;
  const start = (page - 1) * pageSize;

  return {
    posts: filtered.slice(start, start + pageSize),
    count: filtered.length,
  };
}

export const getCategories = cache(async (): Promise<Category[]> => {
  if (!isSupabaseConfigured()) return demoCategories;

  const supabase = createPublicClient(PUBLIC_POSTS_CACHE_TAG);
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) {
    return demoCategories;
  }
  const presented = (data as Category[]).map(presentCategory);
  return Array.from(
    new Map(presented.map((category) => [category.slug, category])).values(),
  );
});

export async function getPublishedPosts(options?: {
  category?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ posts: Post[]; count: number }> {
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = options?.pageSize ?? 9;

  if (!isSupabaseConfigured()) {
    return getDemoPublishedPosts(options);
  }

  try {
    return await getCachedPublishedPosts(options?.category ?? null, page, pageSize);
  } catch {
    return getDemoPublishedPosts(options);
  }
}

// PostgREST returns HTTP 206 for partial lists, which Next's fetch cache skips.
// Cache the decoded result so each category and pagination combination is reused.
const getCachedPublishedPosts = unstable_cache(async (
  categorySlug: string | null,
  page: number,
  pageSize: number,
): Promise<{ posts: Post[]; count: number }> => {
  const supabase = createPublicClient(PUBLIC_POSTS_CACHE_TAG);
  let categoryId: string | undefined;
  if (categorySlug) {
    let { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .maybeSingle();
    const legacySlug = NEW_TO_LEGACY_CATEGORY[categorySlug];
    if (!category && !categoryError && legacySlug) {
      const legacyResult = await supabase
        .from("categories")
        .select("id")
        .eq("slug", legacySlug)
        .maybeSingle();
      category = legacyResult.data;
      categoryError = legacyResult.error;
    }
    if (categoryError) throw categoryError;
    if (!category) return { posts: [], count: 0 };
    categoryId = category.id;
  }

  let query = supabase
    .from("posts")
    .select(POST_SELECT, { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return {
    posts: ((data ?? []) as unknown as Post[]).map(presentPost),
    count: count ?? 0,
  };
}, ["published-posts"], { revalidate: 300, tags: [PUBLIC_POSTS_CACHE_TAG] });

export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  if (!isSupabaseConfigured()) {
    return demoPosts.find((post) => post.slug === slug) ?? null;
  }

  const supabase = createPublicClient(PUBLIC_POSTS_CACHE_TAG);
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    return demoPosts.find((post) => post.slug === slug) ?? null;
  }
  if (!data) return null;

  const { data: affiliateLinks } = await supabase
    .from("affiliate_links")
    .select("*")
    .eq("post_id", data.id)
    .eq("active", true)
    .order("created_at");

  return {
    ...presentPost(data as unknown as Post),
    affiliate_links: affiliateLinks ?? [],
  };
});

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await getCategories();
  const stored = categories.find((category) => category.slug === slug);
  if (stored) return stored;

  const required = Object.values(LEGACY_CATEGORY_PRESENTATION).find(
    (category) => category.slug === slug,
  );
  return required ? { id: `pending-${slug}`, ...required } : null;
}

export async function getDashboardPosts(): Promise<Post[]> {
  if (!isSupabaseConfigured()) {
    return [
      ...demoPosts,
      {
        ...demoPosts[0],
        id: "demo-draft",
        title: "The Wooden Spoon Field Guide",
        slug: "wooden-spoon-field-guide",
        status: "draft",
        published_at: null,
        updated_at: "2026-07-22T13:30:00.000Z",
      },
    ];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .order("updated_at", { ascending: false });
  if (error) return getDemoPublishedPosts({ pageSize: 1000 }).posts;
  return ((data ?? []) as unknown as Post[]).map(presentPost);
}

export async function getDashboardPost(id: string): Promise<Post | null> {
  if (!isSupabaseConfigured()) {
    if (id === "demo-draft") {
      return {
        ...demoPosts[0],
        id: "demo-draft",
        title: "The Wooden Spoon Field Guide",
        slug: "wooden-spoon-field-guide",
        status: "draft",
        published_at: null,
        updated_at: "2026-07-22T13:30:00.000Z",
      };
    }
    return demoPosts.find((post) => post.id === id) ?? null;
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) return demoPosts.find((post) => post.id === id) ?? null;
  return data ? presentPost(data as unknown as Post) : null;
}
