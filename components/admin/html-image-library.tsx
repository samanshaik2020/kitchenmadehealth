"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Check, Clipboard, ExternalLink, ImagePlus, LoaderCircle, RefreshCw, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCoverImage } from "@/components/ui/user-cover-image";
import { createClient } from "@/lib/supabase/client";
import {
  HTML_IMAGE_TYPES,
  deleteHtmlImage,
  htmlImageErrorMessage,
  listHtmlImages,
  uploadHtmlImage,
  validateHtmlImage,
  type HtmlImage,
} from "@/lib/html-images";

export function HtmlImageLibrary({ supabaseConfigured }: { supabaseConfigured: boolean }) {
  const [images, setImages] = useState<HtmlImage[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(supabaseConfigured);
  const [uploading, setUploading] = useState(false);
  const [deletingPath, setDeletingPath] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [copiedPath, setCopiedPath] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!supabaseConfigured) return;
    let cancelled = false;
    listHtmlImages(createClient())
      .then((items) => { if (!cancelled) setImages(items); })
      .catch((error) => { if (!cancelled) setError(htmlImageErrorMessage(error)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [supabaseConfigured]);

  async function refreshImages() {
    if (loading || uploading || deletingPath) return;
    setLoading(true);
    setError("");
    setNotice("");
    try {
      setImages(await listHtmlImages(createClient()));
    } catch (error) {
      setError(htmlImageErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || loading || uploading || deletingPath || !supabaseConfigured) return;
    setUploading(true);
    setError("");
    setNotice("");
    try {
      const image = await uploadHtmlImage(createClient(), file);
      setImages((current) => [image, ...current].slice(0, 20));
      setFile(null);
      if (fileInput.current) fileInput.current.value = "";
      setNotice("Image uploaded. Copy its public link to use it anywhere.");
    } catch (error) {
      setError(htmlImageErrorMessage(error));
    } finally {
      setUploading(false);
    }
  }

  async function deleteImage(image: HtmlImage) {
    if (!supabaseConfigured || loading || uploading || deletingPath) return;
    if (!window.confirm(`Delete "${image.name}" permanently? Pages using this image link may show a broken image.`)) return;
    setDeletingPath(image.path);
    setError("");
    setNotice("");
    try {
      await deleteHtmlImage(createClient(), image.path);
      setImages((current) => current.filter((item) => item.path !== image.path));
      setCopiedPath((current) => current === image.path ? "" : current);
      setNotice("Image deleted from storage and your library.");
    } catch (error) {
      setError(htmlImageErrorMessage(error));
    } finally {
      setDeletingPath("");
    }
  }

  async function copyLink(image: HtmlImage) {
    try {
      await navigator.clipboard.writeText(image.publicUrl);
      setCopiedPath(image.path);
      window.setTimeout(() => setCopiedPath((current) => current === image.path ? "" : current), 1800);
    } catch {
      setError("Copying is unavailable in this browser. Select the public URL below and copy it manually.");
    }
  }

  return (
    <section className="overflow-hidden border border-line bg-white" aria-labelledby="html-images-title">
      <div className="flex items-start justify-between gap-4 border-b border-line p-6">
        <div>
          <p className="eyebrow text-terracotta">Reusable image links</p>
          <h2 id="html-images-title" className="mt-2 font-display text-3xl font-medium">Image library</h2>
          <p className="mt-2 text-xs leading-6 text-stone">
            Upload an image and copy its public URL for any HTML page, article, or website.
            Images stay available independently of your HTML pages.
          </p>
        </div>
        <button
          type="button"
          onClick={refreshImages}
          disabled={!supabaseConfigured || loading || uploading || !!deletingPath}
          aria-label="Refresh images"
          title="Refresh images"
          className="grid size-10 shrink-0 place-items-center rounded-full border border-line text-stone hover:border-ink hover:text-ink disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <form onSubmit={upload} className="space-y-4 border-b border-line p-5 sm:p-6">
        <div>
          <Label htmlFor="html-image-file">Image file</Label>
          <Input
            ref={fileInput}
            id="html-image-file"
            type="file"
            accept={Object.keys(HTML_IMAGE_TYPES).join(",")}
            disabled={!supabaseConfigured || uploading || !!deletingPath}
            onChange={(event) => {
              const selected = event.target.files?.[0] ?? null;
              const validationError = selected ? validateHtmlImage(selected) : null;
              setFile(validationError ? null : selected);
              setError(validationError ?? "");
              setNotice("");
            }}
            aria-describedby="html-image-help"
            className="file:mr-3 file:rounded-full file:border-0 file:bg-cream file:px-3 file:py-1 file:text-xs file:font-semibold file:text-ink"
          />
          <p id="html-image-help" className="mt-2 text-[10px] leading-5 text-stone">
            JPG, PNG, WebP, GIF, or AVIF · 5 MB maximum. Uploaded images have public links.
          </p>
        </div>
        {!supabaseConfigured && (
          <p className="text-xs text-amber-800">Connect Supabase to upload and store images.</p>
        )}
        <button
          type="submit"
          disabled={!supabaseConfigured || !file || loading || uploading || !!deletingPath}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-terracotta px-5 text-[10px] font-bold uppercase tracking-[.1em] text-white hover:bg-terracotta-dark disabled:opacity-50"
        >
          {uploading ? <LoaderCircle size={15} className="animate-spin" /> : <ImagePlus size={15} />}
          {uploading ? "Uploading image…" : "Upload image & get link"}
        </button>
        {error && <p role="alert" className="border border-red-200 bg-red-50 px-3 py-2 text-xs leading-5 text-red-800">{error}</p>}
        {notice && <p role="status" className="border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs leading-5 text-emerald-800">{notice}</p>}
      </form>

      {loading ? (
        <p role="status" className="p-6 text-xs text-stone">Loading images…</p>
      ) : images.length ? (
        <div className="divide-y divide-line">
          <p className="px-6 py-3 text-[10px] text-stone">Your 20 most recent images appear here.</p>
          {images.map((image) => {
            const inputId = `html-image-url-${image.path.split("/").pop()}`;
            return (
              <article key={image.path} className="flex flex-col gap-4 p-5 sm:flex-row sm:p-6">
                <a href={image.publicUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open image ${image.name}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-cream">
                  <UserCoverImage src={image.publicUrl} alt={image.name} />
                </a>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{image.name}</p>
                  <Label htmlFor={inputId} className="mt-2 text-[10px]">Public image URL</Label>
                  <Input id={inputId} readOnly value={image.publicUrl} onFocus={(event) => event.currentTarget.select()} className="text-xs" />
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <button type="button" onClick={() => copyLink(image)} aria-label={`Copy image link for ${image.name}`} className="inline-flex min-h-9 items-center gap-2 rounded-full border border-line px-4 text-[10px] font-bold text-ink hover:bg-cream">
                      {copiedPath === image.path ? <Check size={13} /> : <Clipboard size={13} />}
                      {copiedPath === image.path ? "Copied" : "Copy link"}
                    </button>
                    <a href={image.publicUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-2 text-[10px] font-bold text-stone hover:text-ink">
                      Open image <ExternalLink size={13} />
                    </a>
                    <button
                      type="button"
                      onClick={() => deleteImage(image)}
                      disabled={!supabaseConfigured || loading || uploading || !!deletingPath}
                      aria-label={`Delete image ${image.name}`}
                      className="inline-flex min-h-9 items-center gap-2 rounded-full border border-red-200 px-4 text-[10px] font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingPath === image.path ? <LoaderCircle size={13} className="animate-spin" /> : <Trash2 size={13} />}
                      {deletingPath === image.path ? "Deleting…" : "Delete image"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="px-6 py-8 text-xs text-stone">No uploaded images yet. Your image links will appear here after uploading.</p>
      )}
    </section>
  );
}
