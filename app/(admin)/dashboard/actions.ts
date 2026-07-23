"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import sanitizeHtml from "sanitize-html";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { ActionState, PostInput, PostStatus } from "@/lib/types";
import { slugify } from "@/lib/utils";

const postSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(150),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
  excerpt: z.string().trim().max(300, "Excerpt must be 300 characters or fewer."),
  content: z.string().trim().min(12, "Add a little more content before saving."),
  cover_image_url: z.string().trim().url("Use a valid image URL.").or(z.literal("")),
  category_id: z.string().trim().min(1, "Choose a category."),
  status: z.enum(["draft", "published"]),
  seo_title: z.string().trim().max(150, "SEO title must be 150 characters or fewer."),
  seo_description: z.string().trim().max(160, "SEO description must be 160 characters or fewer."),
});

function parsePost(formData: FormData) {
  return postSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") || slugify(String(formData.get("title") ?? "")),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    cover_image_url: formData.get("cover_image_url"),
    category_id: formData.get("category_id"),
    status: formData.get("status"),
    seo_title: formData.get("seo_title"),
    seo_description: formData.get("seo_description"),
  });
}

async function getAuthenticatedClient() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Your session has expired. Please sign in again.");
  return { supabase, user };
}

function toDatabaseInput(input: PostInput, authorId: string) {
  return {
    ...input,
    content: sanitizeHtml(input.content, {
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
    }),
    author_id: authorId,
    excerpt: input.excerpt || null,
    category_id: input.category_id || null,
    cover_image_url: input.cover_image_url || null,
    seo_title: input.seo_title || null,
    seo_description: input.seo_description || null,
    published_at: input.status === "published" ? new Date().toISOString() : null,
  };
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
  if (!isSupabaseConfigured()) {
    return { success: true, message: "Demo preview: the post is valid and ready to save once Supabase is connected." };
  }

  try {
    const { supabase, user } = await getAuthenticatedClient();
    const { error } = await supabase.from("posts").insert(toDatabaseInput(parsed.data, user.id));
    if (error) {
      if (error.code === "23505") return { success: false, message: "That slug is already in use." };
      throw error;
    }
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Unable to create the post." };
  }

  revalidatePath("/");
  revalidatePath("/blog");
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
  if (!isSupabaseConfigured()) {
    return { success: true, message: "Demo preview: your changes are valid. Connect Supabase to persist them." };
  }

  try {
    const { supabase, user } = await getAuthenticatedClient();
    const { error } = await supabase
      .from("posts")
      .update({
        ...toDatabaseInput(parsed.data, user.id),
        author_id: undefined,
      })
      .eq("id", id)
      .eq("author_id", user.id);
    if (error) {
      if (error.code === "23505") return { success: false, message: "That slug is already in use." };
      throw error;
    }
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Unable to update the post." };
  }

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${parsed.data.slug}`);
  redirect("/dashboard?saved=1");
}

export async function togglePostStatus(id: string, nextStatus: PostStatus) {
  if (!isSupabaseConfigured()) return;
  const { supabase, user } = await getAuthenticatedClient();
  const { error } = await supabase
    .from("posts")
    .update({
      status: nextStatus,
      published_at: nextStatus === "published" ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .eq("author_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/dashboard");
}

export async function deletePost(id: string) {
  if (!isSupabaseConfigured()) return;
  const { supabase, user } = await getAuthenticatedClient();
  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", id)
    .eq("author_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/dashboard");
}
