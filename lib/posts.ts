import { demoCategories, demoPosts } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Category, Post } from "@/lib/types";

const POST_SELECT = "*, category:categories(*)";

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return demoCategories;

  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) {
    console.error("Unable to load categories:", error.message);
    return demoCategories;
  }
  return data as Category[];
}

export async function getPublishedPosts(options?: {
  category?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ posts: Post[]; count: number }> {
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = options?.pageSize ?? 9;

  if (!isSupabaseConfigured()) {
    const filtered = options?.category
      ? demoPosts.filter((post) => post.category?.slug === options.category)
      : demoPosts;
    const start = (page - 1) * pageSize;
    return { posts: filtered.slice(start, start + pageSize), count: filtered.length };
  }

  const supabase = await createClient();
  let categoryId: string | undefined;
  if (options?.category) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", options.category)
      .maybeSingle();
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
  if (error) {
    console.error("Unable to load posts:", error.message);
    return { posts: demoPosts.slice(0, pageSize), count: demoPosts.length };
  }
  return { posts: (data ?? []) as unknown as Post[], count: count ?? 0 };
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (!isSupabaseConfigured()) {
    return demoPosts.find((post) => post.slug === slug) ?? null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("Unable to load post:", error.message);
    return null;
  }
  return data as unknown as Post | null;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find((category) => category.slug === slug) ?? null;
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
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Post[];
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
  if (error) throw new Error(error.message);
  return data as unknown as Post | null;
}
