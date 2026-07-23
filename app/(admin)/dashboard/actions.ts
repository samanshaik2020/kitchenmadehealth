"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import sanitizeHtml from "sanitize-html";
import { z } from "zod";
import {
  databaseUpgradeMessage,
  getAuthenticatedClient,
  logActivity,
} from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type {
  ActionState,
  CommentStatus,
  PostInput,
  PostStatus,
} from "@/lib/types";
import { slugify } from "@/lib/utils";

const postFields = z.object({
    title: z.string().trim().min(1, "Title is required.").max(150),
    slug: z
      .string()
      .trim()
      .min(1, "Slug is required.")
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
    excerpt: z.string().trim().max(300, "Excerpt must be 300 characters or fewer."),
    content: z.string().trim().min(12, "Add a little more content before saving."),
    cover_image_url: z.string().trim().url("Use a valid image URL.").or(z.literal("")),
    cover_image_alt: z.string().trim().max(180, "Alt text must be 180 characters or fewer."),
    category_id: z.string().trim().min(1, "Choose a category."),
    status: z.enum(["draft", "scheduled", "published"]),
    published_at: z.string().trim(),
    seo_title: z.string().trim().max(150, "SEO title must be 150 characters or fewer."),
    seo_description: z.string().trim().max(160, "SEO description must be 160 characters or fewer."),
    primary_keyword: z.string().trim().max(100, "Focus keyword must be 100 characters or fewer."),
  });

const postSchema = postFields.superRefine((value, context) => {
    if (value.status !== "scheduled") return;
    const scheduled = new Date(value.published_at);
    if (!value.published_at || Number.isNaN(scheduled.valueOf())) {
      context.addIssue({
        code: "custom",
        path: ["published_at"],
        message: "Choose a date and time for scheduled publishing.",
      });
    } else if (scheduled <= new Date()) {
      context.addIssue({
        code: "custom",
        path: ["published_at"],
        message: "Scheduled publishing must be in the future.",
      });
    }
  });

const affiliateSchema = z.array(
  z.object({
    id: z.string().uuid().optional(),
    product_name: z.string().trim().min(1).max(160),
    merchant: z.string().trim().min(1).max(80),
    destination_url: z
      .string()
      .url()
      .refine((value) => ["http:", "https:"].includes(new URL(value).protocol), {
        message: "Affiliate URLs must use http or https.",
      }),
    button_label: z.string().trim().min(1).max(80),
    disclosure: z.string().trim().max(300),
    active: z.boolean(),
  }),
).max(30);

const autosaveSchema = postFields
  .omit({ status: true, published_at: true })
  .partial()
  .required({ title: true, slug: true, content: true });

function parsePost(formData: FormData) {
  return postSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") || slugify(String(formData.get("title") ?? "")),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    cover_image_url: formData.get("cover_image_url"),
    cover_image_alt: formData.get("cover_image_alt"),
    category_id: formData.get("category_id"),
    status: formData.get("status"),
    published_at: formData.get("published_at"),
    seo_title: formData.get("seo_title"),
    seo_description: formData.get("seo_description"),
    primary_keyword: formData.get("primary_keyword"),
  });
}

function parseRelations(formData: FormData) {
  const tagResult = z
    .array(z.string().uuid())
    .safeParse(JSON.parse(String(formData.get("tag_ids") || "[]")));
  const affiliateResult = affiliateSchema.safeParse(
    JSON.parse(String(formData.get("affiliate_links") || "[]")),
  );

  return {
    tagIds: tagResult.success ? tagResult.data : [],
    affiliates: affiliateResult.success ? affiliateResult.data : [],
    affiliateError: affiliateResult.success
      ? null
      : "Check that every affiliate product has a name and valid URL.",
  };
}

function sanitizeContent(content: string) {
  return sanitizeHtml(content, {
    allowedTags: [
      "p",
      "h2",
      "h3",
      "h4",
      "strong",
      "em",
      "s",
      "blockquote",
      "ul",
      "ol",
      "li",
      "br",
      "a",
      "img",
      "code",
      "pre",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
      }),
    },
  });
}

function toDatabaseInput(input: PostInput, publishedAt?: string | null) {
  return {
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt || null,
    content: sanitizeContent(input.content),
    cover_image_url: input.cover_image_url || null,
    cover_image_alt: input.cover_image_alt || null,
    category_id: input.category_id || null,
    status: input.status,
    seo_title: input.seo_title || null,
    seo_description: input.seo_description || null,
    primary_keyword: input.primary_keyword || null,
    published_at:
      input.status === "scheduled"
        ? new Date(input.published_at).toISOString()
        : input.status === "published"
          ? publishedAt ?? new Date().toISOString()
          : null,
  };
}

function revisionSnapshot(post: Record<string, unknown>) {
  const keys = [
    "title",
    "slug",
    "excerpt",
    "content",
    "cover_image_url",
    "cover_image_alt",
    "category_id",
    "status",
    "seo_title",
    "seo_description",
    "primary_keyword",
    "published_at",
  ];
  return Object.fromEntries(keys.map((key) => [key, post[key] ?? null]));
}

async function saveRevision(
  supabase: Awaited<ReturnType<typeof getAuthenticatedClient>>["supabase"],
  userId: string,
  postId: string,
  post: Record<string, unknown>,
  source: "autosave" | "manual" | "restore" | "publish",
) {
  await supabase.from("post_revisions").insert({
    post_id: postId,
    author_id: userId,
    snapshot: revisionSnapshot(post),
    source,
  });
}

async function syncPostRelations(
  supabase: Awaited<ReturnType<typeof getAuthenticatedClient>>["supabase"],
  postId: string,
  tagIds: string[],
  affiliates: z.infer<typeof affiliateSchema>,
) {
  const { error: deleteTagsError } = await supabase
    .from("post_tags")
    .delete()
    .eq("post_id", postId);
  if (deleteTagsError) throw deleteTagsError;

  if (tagIds.length) {
    const { error } = await supabase
      .from("post_tags")
      .insert(tagIds.map((tagId) => ({ post_id: postId, tag_id: tagId })));
    if (error) throw error;
  }

  const { data: existing } = await supabase
    .from("affiliate_links")
    .select("id")
    .eq("post_id", postId);
  const retainedIds = affiliates.flatMap((item) => (item.id ? [item.id] : []));
  const removedIds = (existing ?? [])
    .map((item) => item.id as string)
    .filter((id) => !retainedIds.includes(id));

  if (removedIds.length) {
    const { error } = await supabase.from("affiliate_links").delete().in("id", removedIds);
    if (error) throw error;
  }

  for (const link of affiliates) {
    const payload = {
      post_id: postId,
      product_name: link.product_name,
      merchant: link.merchant,
      destination_url: link.destination_url,
      button_label: link.button_label,
      disclosure: link.disclosure || null,
      active: link.active,
      updated_at: new Date().toISOString(),
    };

    const result = link.id
      ? await supabase.from("affiliate_links").update(payload).eq("id", link.id)
      : await supabase.from("affiliate_links").insert(payload);
    if (result.error) throw result.error;
  }
}

function revalidateEditorial(slug?: string) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/analytics");
  if (slug) revalidatePath(`/blog/${slug}`);
}

export async function createPost(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parsePost(formData);
  if (!parsed.success) {
    return {
      success: false,
      message: "Check the highlighted fields and try again.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  let relations: ReturnType<typeof parseRelations>;
  try {
    relations = parseRelations(formData);
  } catch {
    return { success: false, message: "Affiliate or tag data could not be read." };
  }
  if (relations.affiliateError) return { success: false, message: relations.affiliateError };

  if (!isSupabaseConfigured()) {
    return {
      success: true,
      message: "Demo preview: this post and its editorial metadata are ready to save.",
    };
  }

  try {
    const { supabase, user } = await getAuthenticatedClient();
    const payload = {
      ...toDatabaseInput(parsed.data),
      author_id: user.id,
    };
    const { data, error } = await supabase.from("posts").insert(payload).select("*").single();
    if (error) {
      if (error.code === "23505") return { success: false, message: "That slug is already in use." };
      throw error;
    }

    try {
      await syncPostRelations(supabase, data.id, relations.tagIds, relations.affiliates);
      await saveRevision(
        supabase,
        user.id,
        data.id,
        data,
        parsed.data.status === "published" ? "publish" : "manual",
      );
    } catch (relationError) {
      await supabase.from("posts").delete().eq("id", data.id);
      throw relationError;
    }

    await logActivity(
      supabase,
      user.id,
      parsed.data.status === "scheduled" ? "scheduled" : "created",
      "post",
      data.id,
      { title: parsed.data.title },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create the post.";
    return { success: false, message: databaseUpgradeMessage(message) };
  }

  revalidateEditorial(parsed.data.slug);
  redirect("/dashboard?created=1");
}

export async function updatePost(
  id: string,
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parsePost(formData);
  if (!parsed.success) {
    return {
      success: false,
      message: "Check the highlighted fields and try again.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  let relations: ReturnType<typeof parseRelations>;
  try {
    relations = parseRelations(formData);
  } catch {
    return { success: false, message: "Affiliate or tag data could not be read." };
  }
  if (relations.affiliateError) return { success: false, message: relations.affiliateError };

  if (!isSupabaseConfigured()) {
    return { success: true, message: "Demo preview: your complete editorial update is valid." };
  }

  try {
    const { supabase, user } = await getAuthenticatedClient();
    const { data: current, error: currentError } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .eq("author_id", user.id)
      .single();
    if (currentError) throw currentError;

    await saveRevision(
      supabase,
      user.id,
      id,
      current,
      parsed.data.status === "published" ? "publish" : "manual",
    );

    const { error } = await supabase
      .from("posts")
      .update(toDatabaseInput(parsed.data, current.published_at))
      .eq("id", id)
      .eq("author_id", user.id);
    if (error) {
      if (error.code === "23505") return { success: false, message: "That slug is already in use." };
      throw error;
    }

    await syncPostRelations(supabase, id, relations.tagIds, relations.affiliates);
    await logActivity(
      supabase,
      user.id,
      parsed.data.status === "scheduled" ? "scheduled" : "updated",
      "post",
      id,
      { title: parsed.data.title },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update the post.";
    return { success: false, message: databaseUpgradeMessage(message) };
  }

  revalidateEditorial(parsed.data.slug);
  redirect("/dashboard?saved=1");
}

export async function autosavePost(
  id: string,
  payload: z.input<typeof autosaveSchema>,
): Promise<{ success: boolean; savedAt?: string; message?: string }> {
  const parsed = autosaveSchema.safeParse(payload);
  if (!parsed.success) return { success: false, message: "Autosave skipped: required fields are missing." };
  if (!isSupabaseConfigured()) return { success: true, savedAt: new Date().toISOString() };

  try {
    const { supabase, user } = await getAuthenticatedClient();
    const { data: current, error: currentError } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .eq("author_id", user.id)
      .single();
    if (currentError) throw currentError;
    if (current.status === "published") {
      return { success: false, message: "Published stories save when you choose Update." };
    }

    await saveRevision(supabase, user.id, id, current, "autosave");
    const update = {
      ...parsed.data,
      content: sanitizeContent(parsed.data.content),
      excerpt: parsed.data.excerpt || null,
      cover_image_url: parsed.data.cover_image_url || null,
      cover_image_alt: parsed.data.cover_image_alt || null,
      seo_title: parsed.data.seo_title || null,
      seo_description: parsed.data.seo_description || null,
      primary_keyword: parsed.data.primary_keyword || null,
    };
    const { error } = await supabase
      .from("posts")
      .update(update)
      .eq("id", id)
      .eq("author_id", user.id);
    if (error) throw error;
    return { success: true, savedAt: new Date().toISOString() };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Autosave failed.";
    return { success: false, message: databaseUpgradeMessage(message) };
  }
}

export async function restoreRevision(postId: string, revisionId: string) {
  if (!isSupabaseConfigured()) return;
  const { supabase, user } = await getAuthenticatedClient();
  const [{ data: current }, { data: revision, error }] = await Promise.all([
    supabase.from("posts").select("*").eq("id", postId).eq("author_id", user.id).single(),
    supabase
      .from("post_revisions")
      .select("*")
      .eq("id", revisionId)
      .eq("post_id", postId)
      .eq("author_id", user.id)
      .single(),
  ]);
  if (error || !revision || !current) throw new Error("That revision could not be restored.");

  await saveRevision(supabase, user.id, postId, current, "restore");
  const snapshot = revision.snapshot as Record<string, unknown>;
  const { error: updateError } = await supabase
    .from("posts")
    .update(revisionSnapshot(snapshot))
    .eq("id", postId)
    .eq("author_id", user.id);
  if (updateError) throw new Error(updateError.message);
  await logActivity(supabase, user.id, "restored_revision", "post", postId, {
    revision_id: revisionId,
  });
  revalidatePath(`/dashboard/posts/${postId}/edit`);
  revalidateEditorial(String(snapshot.slug ?? ""));
}

export async function togglePostStatus(id: string, nextStatus: PostStatus) {
  if (!isSupabaseConfigured()) return;
  const { supabase, user } = await getAuthenticatedClient();
  const { data: post, error } = await supabase
    .from("posts")
    .update({
      status: nextStatus,
      published_at: nextStatus === "published" ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .eq("author_id", user.id)
    .select("title,slug")
    .single();
  if (error) throw new Error(error.message);
  await logActivity(supabase, user.id, nextStatus, "post", id, { title: post.title });
  revalidateEditorial(post.slug);
}

export async function deletePost(id: string) {
  if (!isSupabaseConfigured()) return;
  const { supabase, user } = await getAuthenticatedClient();
  const { data: post } = await supabase
    .from("posts")
    .select("title,slug")
    .eq("id", id)
    .eq("author_id", user.id)
    .maybeSingle();
  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", id)
    .eq("author_id", user.id);
  if (error) throw new Error(error.message);
  await logActivity(supabase, user.id, "deleted", "post", id, {
    title: post?.title ?? "Deleted post",
  });
  revalidateEditorial(post?.slug);
}

export async function bulkUpdatePosts(
  ids: string[],
  operation: "delete" | "publish" | "draft" | "category",
  categoryId?: string,
) {
  const parsedIds = z.array(z.string().min(1)).min(1).max(100).parse(ids);
  if (!isSupabaseConfigured()) return { success: true };
  const { supabase, user } = await getAuthenticatedClient();

  if (operation === "delete") {
    const { error } = await supabase
      .from("posts")
      .delete()
      .in("id", parsedIds)
      .eq("author_id", user.id);
    if (error) throw new Error(error.message);
  } else {
    const payload =
      operation === "category"
        ? { category_id: z.string().uuid().parse(categoryId) }
        : {
            status: operation === "publish" ? "published" : "draft",
            published_at: operation === "publish" ? new Date().toISOString() : null,
          };
    const { error } = await supabase
      .from("posts")
      .update(payload)
      .in("id", parsedIds)
      .eq("author_id", user.id);
    if (error) throw new Error(error.message);
  }

  await logActivity(supabase, user.id, `bulk_${operation}`, "post", null, {
    count: parsedIds.length,
  });
  revalidateEditorial();
  return { success: true };
}

export async function createTaxonomy(kind: "category" | "tag", formData: FormData) {
  if (!isSupabaseConfigured()) return;
  const name = z.string().trim().min(2).max(80).parse(formData.get("name"));
  const { supabase, user } = await getAuthenticatedClient();
  const result =
    kind === "category"
      ? await supabase
          .from("categories")
          .insert({
            name,
            slug: slugify(name),
            description: String(formData.get("description") ?? "") || null,
          })
          .select("id")
          .single()
      : await supabase
          .from("tags")
          .insert({ name, slug: slugify(name) })
          .select("id")
          .single();
  const { data, error } = result;
  if (error) throw new Error(error.message);
  await logActivity(supabase, user.id, "created", kind, data.id, { name });
  revalidatePath("/dashboard/taxonomy");
  revalidatePath("/blog");
}

export async function renameTaxonomy(
  kind: "category" | "tag",
  id: string,
  formData: FormData,
) {
  if (!isSupabaseConfigured()) return;
  const name = z.string().trim().min(2).max(80).parse(formData.get("name"));
  const { supabase, user } = await getAuthenticatedClient();
  const table = kind === "category" ? "categories" : "tags";
  const { error } = await supabase
    .from(table)
    .update({ name, slug: slugify(name) })
    .eq("id", id);
  if (error) throw new Error(error.message);
  await logActivity(supabase, user.id, "renamed", kind, id, { name });
  revalidatePath("/dashboard/taxonomy");
  revalidatePath("/blog");
}

export async function mergeTaxonomy(
  kind: "category" | "tag",
  sourceId: string,
  formData: FormData,
) {
  if (!isSupabaseConfigured()) return;
  const targetId = z.string().uuid().parse(formData.get("target_id"));
  if (targetId === sourceId) throw new Error("Choose a different destination.");
  const { supabase, user } = await getAuthenticatedClient();

  if (kind === "category") {
    const { error: updateError } = await supabase
      .from("posts")
      .update({ category_id: targetId })
      .eq("category_id", sourceId);
    if (updateError) throw new Error(updateError.message);
    const { error } = await supabase.from("categories").delete().eq("id", sourceId);
    if (error) throw new Error(error.message);
  } else {
    const { data: assignments, error: readError } = await supabase
      .from("post_tags")
      .select("post_id")
      .eq("tag_id", sourceId);
    if (readError) throw new Error(readError.message);
    if (assignments?.length) {
      const { error: upsertError } = await supabase.from("post_tags").upsert(
        assignments.map((item) => ({ post_id: item.post_id, tag_id: targetId })),
        { onConflict: "post_id,tag_id", ignoreDuplicates: true },
      );
      if (upsertError) throw new Error(upsertError.message);
    }
    const { error } = await supabase.from("tags").delete().eq("id", sourceId);
    if (error) throw new Error(error.message);
  }

  await logActivity(supabase, user.id, "merged", kind, sourceId, {
    target_id: targetId,
  });
  revalidatePath("/dashboard/taxonomy");
  revalidatePath("/blog");
}

export async function moderateComment(id: string, status: CommentStatus) {
  if (!isSupabaseConfigured()) return;
  const next = z.enum(["pending", "approved", "spam"]).parse(status);
  const { supabase, user } = await getAuthenticatedClient();
  const { error } = await supabase
    .from("comments")
    .update({ status: next, moderated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  await logActivity(supabase, user.id, `comment_${next}`, "comment", id);
  revalidatePath("/dashboard/comments");
  revalidatePath("/dashboard");
}

export async function toggleAffiliate(id: string, active: boolean) {
  if (!isSupabaseConfigured()) return;
  const { supabase, user } = await getAuthenticatedClient();
  const { error } = await supabase
    .from("affiliate_links")
    .update({ active, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  await logActivity(supabase, user.id, active ? "affiliate_enabled" : "affiliate_disabled", "affiliate", id);
  revalidatePath("/dashboard/affiliates");
}

export async function deleteAffiliate(id: string) {
  if (!isSupabaseConfigured()) return;
  const { supabase, user } = await getAuthenticatedClient();
  const { error } = await supabase.from("affiliate_links").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await logActivity(supabase, user.id, "deleted", "affiliate", id);
  revalidatePath("/dashboard/affiliates");
}
