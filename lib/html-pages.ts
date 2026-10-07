import { PUBLIC_HTML_PAGES_CACHE_TAG } from "@/lib/public-cache";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import type { HtmlPage } from "@/lib/types";

const HTML_PAGE_LIST_SELECT =
  "id,author_id,title,slug,description,original_filename,status,published_at,created_at,updated_at";

export async function getDashboardHtmlPages(): Promise<HtmlPage[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("html_pages")
    .select(HTML_PAGE_LIST_SELECT)
    .eq("author_id", user.id)
    .order("updated_at", { ascending: false });

  return error ? [] : (data as HtmlPage[]);
}

export async function getPublishedHtmlPageBySlug(
  slug: string,
): Promise<Pick<HtmlPage, "title" | "html_content" | "updated_at"> | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createPublicClient(PUBLIC_HTML_PAGES_CACHE_TAG);
  const { data, error } = await supabase
    .from("html_pages")
    .select("title,html_content,updated_at")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  return error || !data
    ? null
    : (data as Pick<HtmlPage, "title" | "html_content" | "updated_at">);
}

export async function getPublishedHtmlPages(): Promise<
  Array<Pick<HtmlPage, "slug" | "updated_at">>
> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createPublicClient(PUBLIC_HTML_PAGES_CACHE_TAG);
  const { data, error } = await supabase
    .from("html_pages")
    .select("slug,updated_at")
    .eq("status", "published")
    .order("updated_at", { ascending: false });

  return error ? [] : (data as Array<Pick<HtmlPage, "slug" | "updated_at">>);
}
