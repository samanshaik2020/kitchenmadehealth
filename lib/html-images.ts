import type { SupabaseClient } from "@supabase/supabase-js";

export const HTML_IMAGE_BUCKET = "html-page-images";
export const MAX_HTML_IMAGE_BYTES = 5 * 1024 * 1024;
export const HTML_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export type HtmlImage = {
  path: string;
  name: string;
  publicUrl: string;
};

type ImageClient = Pick<SupabaseClient, "auth" | "storage">;

export function validateHtmlImage(file: File): string | null {
  if (!Object.hasOwn(HTML_IMAGE_TYPES, file.type)) return "Choose a JPG, PNG, WebP, GIF, or AVIF image.";
  if (!file.size) return "This image file is empty. Choose another image.";
  if (file.size > MAX_HTML_IMAGE_BYTES) return "Choose an image that is 5 MB or smaller.";
  return null;
}

async function getEditorId(supabase: ImageClient) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Your session has expired. Please sign in again.");
  return user.id;
}

export async function uploadHtmlImage(supabase: ImageClient, file: File): Promise<HtmlImage> {
  const validationError = validateHtmlImage(file);
  if (validationError) throw new Error(validationError);

  const editorId = await getEditorId(supabase);
  const stem = file.name.replace(/\.[^.]*$/, "").replace(/[^a-zA-Z0-9_-]+/g, "-").slice(0, 80) || "image";
  const name = `${stem}.${HTML_IMAGE_TYPES[file.type]}`;
  const path = `${editorId}/${crypto.randomUUID()}-${name}`;
  const bucket = supabase.storage.from(HTML_IMAGE_BUCKET);
  const { error } = await bucket.upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;

  return { path, name, publicUrl: bucket.getPublicUrl(path).data.publicUrl };
}

export async function listHtmlImages(supabase: ImageClient): Promise<HtmlImage[]> {
  const editorId = await getEditorId(supabase);
  const bucket = supabase.storage.from(HTML_IMAGE_BUCKET);
  const { data, error } = await bucket.list(editorId, {
    limit: 20,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error) throw error;

  return (data ?? []).filter((file) => file.id).map((file) => {
    const path = `${editorId}/${file.name}`;
    return {
      path,
      name: file.name.replace(/^[0-9a-f-]{36}-/i, ""),
      publicUrl: bucket.getPublicUrl(path).data.publicUrl,
    };
  });
}

export function htmlImageErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "Image storage could not be reached. Please try again.";
  if (message.toLowerCase().includes("bucket not found")) {
    return "Image storage is not set up yet. Run the supplied SQL in Supabase, then refresh images.";
  }
  return message;
}
