"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import {
  databaseUpgradeMessage,
  getAuthenticatedClient,
  logActivity,
} from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { PUBLIC_HTML_PAGES_CACHE_TAG } from "@/lib/public-cache";
import type { ActionState, HtmlPageStatus } from "@/lib/types";
import { slugify } from "@/lib/utils";

const MAX_HTML_BYTES = 4 * 1024 * 1024;

const htmlPageFields = z.object({
  title: z.string().trim().min(2, "Add a page title.").max(150),
  slug: z
    .string()
    .trim()
    .min(1, "Add a URL slug.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
  description: z.string().trim().max(300, "Description must be 300 characters or fewer."),
  status: z.enum(["draft", "published"]),
});

function revalidateHtmlPages(slug?: string) {
  updateTag(PUBLIC_HTML_PAGES_CACHE_TAG);
  revalidatePath("/dashboard/html-pages");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/pages/${slug}`);
}

function safeFilename(name: string) {
  return (name.split(/[\\/]/).pop() || "page.html")
    .replace(/[^a-zA-Z0-9._ -]/g, "-")
    .slice(0, 180);
}

export async function createHtmlPage(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = htmlPageFields.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") || slugify(String(formData.get("title") ?? "")),
    description: formData.get("description"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Check the highlighted fields and try again.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const file = formData.get("html_file");
  if (!(file instanceof File) || file.size === 0) {
    return {
      success: false,
      message: "Choose the complete HTML file you want to publish.",
      errors: { html_file: ["An HTML file is required."] },
    };
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !["html", "htm"].includes(extension)) {
    return {
      success: false,
      message: "Only .html and .htm files can be uploaded.",
      errors: { html_file: ["Choose a .html or .htm file."] },
    };
  }
  if (file.size > MAX_HTML_BYTES) {
    return {
      success: false,
      message: "The HTML file must be 4 MB or smaller.",
      errors: { html_file: ["This file is larger than 4 MB."] },
    };
  }

  const htmlContent = await file.text();
  if (!/(?:<!doctype\s+html|<html(?:\s|>))/i.test(htmlContent)) {
    return {
      success: false,
      message: "Upload a complete HTML document, not a partial code fragment.",
      errors: { html_file: ["The file needs an <html> element or HTML doctype."] },
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: true,
      message: `Demo preview: ${parsed.data.slug}.html is valid and ready to publish.`,
    };
  }

  try {
    const { supabase, user } = await getAuthenticatedClient();
    const { data, error } = await supabase
      .from("html_pages")
      .upsert({
        author_id: user.id,
        title: parsed.data.title,
        slug: parsed.data.slug,
        description: parsed.data.description || null,
        html_content: htmlContent,
        original_filename: safeFilename(file.name),
        status: parsed.data.status,
      }, { onConflict: "slug" })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, message: "That page URL belongs to another record." };
      }
      throw error;
    }

    await logActivity(supabase, user.id, "uploaded", "html_page", data.id, {
      title: parsed.data.title,
      slug: parsed.data.slug,
      status: parsed.data.status,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to upload the HTML page.";
    return { success: false, message: databaseUpgradeMessage(message) };
  }

  revalidateHtmlPages(parsed.data.slug);
  return {
    success: true,
    message:
      parsed.data.status === "published"
        ? `Published at /pages/${parsed.data.slug}`
        : "HTML page saved as a draft.",
  };
}

export async function setHtmlPageStatus(
  id: string,
  status: HtmlPageStatus,
): Promise<ActionState> {
  const parsed = z.object({ id: z.string().uuid(), status: z.enum(["draft", "published"]) }).safeParse({
    id,
    status,
  });
  if (!parsed.success) return { success: false, message: "Invalid page update." };
  if (!isSupabaseConfigured()) return { success: true, message: "Demo page updated." };

  try {
    const { supabase, user } = await getAuthenticatedClient();
    const { data, error } = await supabase
      .from("html_pages")
      .update({ status: parsed.data.status })
      .eq("id", parsed.data.id)
      .eq("author_id", user.id)
      .select("slug")
      .single();
    if (error) throw error;

    await logActivity(supabase, user.id, parsed.data.status, "html_page", parsed.data.id, {
      slug: data.slug,
    });
    revalidateHtmlPages(data.slug);
    return {
      success: true,
      message: parsed.data.status === "published" ? "HTML page published." : "HTML page moved to draft.",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update the HTML page.";
    return { success: false, message: databaseUpgradeMessage(message) };
  }
}

export async function deleteHtmlPage(id: string): Promise<ActionState> {
  const parsed = z.string().uuid().safeParse(id);
  if (!parsed.success) return { success: false, message: "Invalid page." };
  if (!isSupabaseConfigured()) return { success: true, message: "Demo page removed." };

  try {
    const { supabase, user } = await getAuthenticatedClient();
    const { data: page, error: readError } = await supabase
      .from("html_pages")
      .select("slug,title")
      .eq("id", parsed.data)
      .eq("author_id", user.id)
      .single();
    if (readError) throw readError;

    const { error } = await supabase
      .from("html_pages")
      .delete()
      .eq("id", parsed.data)
      .eq("author_id", user.id);
    if (error) throw error;

    await logActivity(supabase, user.id, "deleted", "html_page", parsed.data, {
      title: page.title,
    });
    revalidateHtmlPages(page.slug);
    return { success: true, message: "HTML page deleted." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete the HTML page.";
    return { success: false, message: databaseUpgradeMessage(message) };
  }
}
