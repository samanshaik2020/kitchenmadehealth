import type { SupabaseClient } from "@supabase/supabase-js";

export const POST_PDF_BUCKET = "post-pdfs";
// MB is decimal. Files must be strictly below 5 MB, including in Storage.
export const PDF_SIZE_LIMIT = 5_000_000;
export type PostPdfAttachment = { path: string; name: string; size: number };
export type LibraryPdf = PostPdfAttachment & { publicUrl: string };
type PdfClient = Pick<SupabaseClient, "auth" | "storage">;

export function validatePostPdf(file: File): string | null {
  if (!/\.pdf$/i.test(file.name) || (file.type && file.type !== "application/pdf")) return "Choose a PDF file.";
  if (!file.size) return "This PDF is empty. Choose another file.";
  if (file.size >= PDF_SIZE_LIMIT) return "The PDF must be below 5 MB. Choose a smaller file.";
  return null;
}

export function isPostPdfPath(path: string, ownerId: string) {
  const [folder, filename, ...extra] = path.split("/");
  return folder === ownerId && !extra.length && /^[a-zA-Z0-9_-]+\.pdf$/.test(filename ?? "");
}

export async function uploadPostPdf(supabase: PdfClient, file: File): Promise<PostPdfAttachment> {
  const validationError = validatePostPdf(file);
  if (validationError) throw new Error(validationError);
  if (await file.slice(0, 5).text() !== "%PDF-") throw new Error("This file is not a valid PDF. Choose another file.");
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Your session has expired. Please sign in again.");
  const stem = file.name.replace(/\.pdf$/i, "").replace(/[^a-zA-Z0-9_-]+/g, "-").slice(0, 100) || "document";
  const path = `${user.id}/${crypto.randomUUID()}-${stem}.pdf`;
  const { error } = await supabase.storage.from(POST_PDF_BUCKET).upload(path, file, {
    contentType: "application/pdf", upsert: false,
  });
  if (error) throw error;
  return { path, name: file.name.slice(0, 180), size: file.size };
}

export async function listPostPdfs(supabase: PdfClient): Promise<LibraryPdf[]> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Your session has expired. Please sign in again.");
  const bucket = supabase.storage.from(POST_PDF_BUCKET);
  const { data, error } = await bucket.list(user.id, { limit: 100, sortBy: { column: "created_at", order: "desc" } });
  if (error) throw error;
  return (data ?? []).flatMap(file => {
    const size: unknown = file.metadata?.size;
    if (!file.id || !isPostPdfPath(`${user.id}/${file.name}`, user.id) || file.metadata?.mimetype !== "application/pdf" || typeof size !== "number" || size <= 0 || size >= PDF_SIZE_LIMIT) return [];
    const path = `${user.id}/${file.name}`;
    const name = file.name.replace(/^[0-9a-f-]{36}-/i, "");
    return [{ path, name, size, publicUrl: bucket.getPublicUrl(path).data.publicUrl }];
  });
}

// Check the stored file when saving, rather than trusting submitted metadata.
export async function verifyPostPdf(supabase: PdfClient, ownerId: string, attachment: PostPdfAttachment | null) {
  if (!attachment) return null;
  if (!isPostPdfPath(attachment.path, ownerId)) throw new Error("Choose a PDF uploaded from your own account.");
  const { data, error } = await supabase.storage.from(POST_PDF_BUCKET).info(attachment.path);
  if (error || !data) throw new Error("The attached PDF could not be found. Upload it again.");
  if (data.contentType !== "application/pdf" || typeof data.size !== "number" || data.size <= 0 || data.size >= PDF_SIZE_LIMIT) {
    throw new Error("The attachment must be a PDF below 5 MB.");
  }
  return { ...attachment, size: data.size };
}

export function pdfUploadErrorMessage(error: unknown) {
  const message = error && typeof error === "object" && "message" in error && typeof error.message === "string" ? error.message : "PDF storage could not be reached. Please try again.";
  return message.toLowerCase().includes("bucket not found")
    ? "PDF storage is not set up yet. Run the pending Supabase migration, then try again."
    : message;
}
