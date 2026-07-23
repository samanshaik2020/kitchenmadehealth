import { demoPosts } from "@/lib/demo-data";
import { getCategories, getDashboardPosts } from "@/lib/posts";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type {
  ActivityEntry,
  AffiliateLink,
  Comment,
  NewsletterSubscriber,
  Post,
  PostRevision,
  Tag,
} from "@/lib/types";

export async function getTags(): Promise<Tag[]> {
  if (!isSupabaseConfigured()) {
    return [
      { id: "tag-buying", name: "Buying Guide", slug: "buying-guide" },
      { id: "tag-care", name: "Care & Maintenance", slug: "care-maintenance" },
      { id: "tag-small", name: "Small Kitchen", slug: "small-kitchen" },
    ];
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from("tags").select("*").order("name");
  return error ? [] : (data as Tag[]);
}

export async function getPostEditorData(postId?: string) {
  const [allPosts, tags] = await Promise.all([getDashboardPosts(), getTags()]);
  const current = postId ? allPosts.find((post) => post.id === postId) : undefined;
  const currentTerms = new Set(
    (current?.title ?? "")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 3),
  );
  const related = allPosts
    .filter((post) => post.id !== postId)
    .map((post) => {
      const sharedTerms = post.title
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((word) => currentTerms.has(word)).length;
      const sameCategory =
        current?.category_id && post.category_id === current.category_id ? 4 : 0;
      return { post, score: sameCategory + sharedTerms };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((item) => item.post);

  if (!postId || !isSupabaseConfigured()) {
    return {
      tags,
      selectedTagIds: [] as string[],
      revisions: [] as PostRevision[],
      affiliates: [] as AffiliateLink[],
      relatedPosts: related,
    };
  }

  const supabase = await createClient();
  const [revisionResult, affiliateResult, tagResult] = await Promise.all([
    supabase
      .from("post_revisions")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("affiliate_links")
      .select("*")
      .eq("post_id", postId)
      .order("created_at"),
    supabase.from("post_tags").select("tag_id").eq("post_id", postId),
  ]);

  return {
    tags,
    selectedTagIds: (tagResult.data ?? []).map((item) => item.tag_id as string),
    revisions: (revisionResult.data ?? []) as PostRevision[],
    affiliates: (affiliateResult.data ?? []) as AffiliateLink[],
    relatedPosts: related,
  };
}

export async function getAnalyticsData() {
  const posts = await getDashboardPosts();
  const totalViews = posts.reduce((sum, post) => sum + post.view_count, 0);

  if (!isSupabaseConfigured()) {
    return {
      totalViews,
      weeklyViews: 184,
      subscriberCount: 126,
      affiliateClicks: 42,
      pendingComments: 3,
      topPosts: [...demoPosts]
        .slice(0, 5)
        .map((post, index) => ({ ...post, weekly_views: [61, 42, 33, 28, 20][index] })),
      subscribers: [] as NewsletterSubscriber[],
    };
  }

  const supabase = await createClient();
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [viewsResult, subscribersResult, affiliatesResult, commentsResult] =
    await Promise.all([
      supabase.from("post_views").select("post_id").gte("viewed_at", since),
      supabase
        .from("newsletter_subscribers")
        .select("*", { count: "exact" })
        .eq("status", "active")
        .order("subscribed_at", { ascending: false })
        .limit(8),
      supabase.from("affiliate_links").select("click_count"),
      supabase
        .from("comments")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);

  const weeklyByPost = new Map<string, number>();
  for (const view of viewsResult.data ?? []) {
    weeklyByPost.set(view.post_id, (weeklyByPost.get(view.post_id) ?? 0) + 1);
  }

  const topPosts = posts
    .map((post) => ({ ...post, weekly_views: weeklyByPost.get(post.id) ?? 0 }))
    .sort((a, b) => b.weekly_views - a.weekly_views)
    .slice(0, 5);

  return {
    totalViews,
    weeklyViews: viewsResult.data?.length ?? 0,
    subscriberCount: subscribersResult.count ?? 0,
    affiliateClicks: (affiliatesResult.data ?? []).reduce(
      (sum, item) => sum + Number(item.click_count ?? 0),
      0,
    ),
    pendingComments: commentsResult.count ?? 0,
    topPosts,
    subscribers: (subscribersResult.data ?? []) as NewsletterSubscriber[],
  };
}

export async function getAdminComments(): Promise<Comment[]> {
  if (!isSupabaseConfigured()) {
    return [
      {
        id: "comment-demo-1",
        post_id: demoPosts[0].id,
        author_name: "Maya R.",
        author_email: "maya@example.com",
        body: "The three-pan foundation made this much easier to understand. Thank you!",
        status: "pending",
        created_at: new Date().toISOString(),
        moderated_at: null,
        post: { id: demoPosts[0].id, title: demoPosts[0].title, slug: demoPosts[0].slug },
      },
    ];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("*, post:posts(id,title,slug)")
    .order("created_at", { ascending: false });
  return error ? [] : (data as unknown as Comment[]);
}

export async function getActivityLog(): Promise<ActivityEntry[]> {
  if (!isSupabaseConfigured()) {
    return [
      {
        id: "activity-demo-1",
        actor_id: null,
        action: "published",
        entity_type: "post",
        entity_id: demoPosts[0].id,
        metadata: { title: demoPosts[0].title },
        created_at: new Date().toISOString(),
      },
    ];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  return error ? [] : (data as ActivityEntry[]);
}

export async function getAffiliateLinks(): Promise<(AffiliateLink & { post?: Post | null })[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("affiliate_links")
    .select("*, post:posts(*)")
    .order("updated_at", { ascending: false });
  return error ? [] : (data as unknown as (AffiliateLink & { post?: Post | null })[]);
}

export async function getTaxonomyData() {
  const [categories, tags] = await Promise.all([getCategories(), getTags()]);
  return { categories, tags };
}
