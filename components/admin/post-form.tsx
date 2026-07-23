"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  ImagePlus,
  LoaderCircle,
  Save,
  Send,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserCoverImage } from "@/components/ui/user-cover-image";
import { createClient } from "@/lib/supabase/client";
import type { ActionState, Category, Post } from "@/lib/types";
import { slugify } from "@/lib/utils";

const PostEditor = dynamic(
  () =>
    import("@/components/admin/post-editor").then((module) => module.PostEditor),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[32rem] animate-pulse rounded-xl bg-cream" />
    ),
  },
);

const initialState: ActionState = { success: false, message: "" };

type PostAction = (
  previousState: ActionState,
  formData: FormData,
) => Promise<ActionState>;

export function PostForm({
  post,
  categories,
  action,
  supabaseConfigured,
}: {
  post?: Post;
  categories: Category[];
  action: PostAction;
  supabaseConfigured: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(post));
  const [content, setContent] = useState(post?.content ?? "<p>Start writing your guide…</p>");
  const [coverUrl, setCoverUrl] = useState(post?.cover_image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const fieldError = (name: string) =>
    state.errors?.[name]?.[0] ? (
      <p className="mt-1.5 text-xs text-red-700">{state.errors[name][0]}</p>
    ) : null;

  async function uploadCover(file?: File) {
    if (!file) return;
    if (!supabaseConfigured) {
      setUploadError("Connect Supabase before uploading. You can paste a public image URL below for now.");
      return;
    }
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      setUploadError("Choose a JPG, PNG, or WebP image under 5 MB.");
      return;
    }

    setUploading(true);
    setUploadError("");
    try {
      const supabase = createClient();
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `covers/${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage
        .from("post-images")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("post-images").getPublicUrl(path);
      setCoverUrl(data.publicUrl);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="content" value={content} />
      <div className="sticky top-0 z-30 border-b border-line bg-[#f5f3ef]/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-7 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/dashboard" className="grid size-9 shrink-0 place-items-center rounded-full border border-line bg-white text-stone hover:text-ink">
              <ArrowLeft size={16} />
            </Link>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink">{post ? "Edit post" : "New post"}</p>
              <p className="truncate text-[11px] text-stone">{post ? post.title : "Untitled draft"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              name="status"
              value="draft"
              disabled={pending}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-white px-4 text-xs font-bold text-ink hover:border-ink disabled:opacity-50"
            >
              {pending ? <LoaderCircle size={14} className="animate-spin" /> : <Save size={14} />} Save draft
            </button>
            <button
              type="submit"
              name="status"
              value="published"
              disabled={pending}
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-terracotta px-4 text-xs font-bold text-white hover:bg-terracotta-dark disabled:opacity-50"
            >
              <Send size={14} /> {post?.status === "published" ? "Update" : "Publish"}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 p-4 sm:p-7 lg:grid-cols-[1fr_20rem] lg:p-10">
        <div className="space-y-6">
          {state.message && (
            <div
              className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${
                state.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
              }`}
              role="status"
            >
              {state.success ? <Check size={17} /> : <X size={17} />}
              {state.message}
            </div>
          )}
          <section className="rounded-2xl border border-line bg-white p-5 shadow-[0_10px_35px_rgba(56,43,35,.035)] sm:p-7">
            <div>
              <Label htmlFor="title">Post title</Label>
              <Input
                id="title"
                name="title"
                value={title}
                maxLength={150}
                onChange={(event) => {
                  const value = event.target.value;
                  setTitle(value);
                  if (!slugEdited) setSlug(slugify(value));
                }}
                className="h-auto border-0 border-b border-line bg-transparent px-0 py-3 font-display text-3xl font-semibold tracking-[-.035em] shadow-none focus:border-terracotta focus:ring-0"
                placeholder="A clear, useful title"
              />
              {fieldError("title")}
            </div>
            <div className="mt-6">
              <Label>Article content</Label>
              <PostEditor content={content} onChange={setContent} />
              {fieldError("content")}
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white p-5 shadow-[0_10px_35px_rgba(56,43,35,.035)] sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-semibold">Search preview</h2>
                <p className="mt-1 text-xs text-stone">Control how this guide appears in search results.</p>
              </div>
              <span className="rounded-full bg-cream px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone">SEO</span>
            </div>
            <div className="mt-6 rounded-xl border border-line bg-[#fafafa] p-4">
              <p className="text-xs text-[#1f6d3b]">kitchenmadehealth.com › blog › {slug || "post-slug"}</p>
              <p className="mt-1 text-lg text-[#1a0dab]">{title || "Your post title"}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-stone">Your SEO description will appear here when you add it below.</p>
            </div>
            <div className="mt-5 grid gap-5">
              <div>
                <Label htmlFor="seo_title">SEO title</Label>
                <Input id="seo_title" name="seo_title" defaultValue={post?.seo_title ?? ""} placeholder="Optional — defaults to post title" maxLength={150} />
                {fieldError("seo_title")}
              </div>
              <div>
                <Label htmlFor="seo_description">SEO description</Label>
                <Textarea id="seo_description" name="seo_description" defaultValue={post?.seo_description ?? ""} placeholder="A concise reason to read this guide…" maxLength={160} className="min-h-22" />
                {fieldError("seo_description")}
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-line bg-white p-5 shadow-[0_10px_35px_rgba(56,43,35,.035)]">
            <h2 className="text-sm font-bold">Post settings</h2>
            <div className="mt-5">
              <Label htmlFor="category_id">Category</Label>
              <select id="category_id" name="category_id" defaultValue={post?.category_id ?? ""} className="min-h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-terracotta">
                <option value="" disabled>Choose a category</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              {fieldError("category_id")}
            </div>
            <div className="mt-5">
              <Label htmlFor="slug">URL slug</Label>
              <Input
                id="slug"
                name="slug"
                value={slug}
                onChange={(event) => {
                  setSlug(slugify(event.target.value));
                  setSlugEdited(true);
                }}
                placeholder="your-post-slug"
              />
              {fieldError("slug")}
            </div>
            <div className="mt-5">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea id="excerpt" name="excerpt" defaultValue={post?.excerpt ?? ""} maxLength={300} placeholder="A short, useful summary…" />
              {fieldError("excerpt")}
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white p-5 shadow-[0_10px_35px_rgba(56,43,35,.035)]">
            <h2 className="text-sm font-bold">Cover image</h2>
            <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-xl border border-dashed border-line bg-cream">
              {coverUrl ? (
                <>
                  <UserCoverImage src={coverUrl} alt="Cover preview" />
                  <button type="button" onClick={() => setCoverUrl("")} className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-ink/80 text-white" aria-label="Remove cover">
                    <X size={14} />
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => fileInput.current?.click()} className="grid size-full place-items-center p-5 text-center text-stone">
                  <span>
                    {uploading ? <LoaderCircle size={24} className="mx-auto animate-spin" /> : <ImagePlus size={24} className="mx-auto text-terracotta" />}
                    <span className="mt-2 block text-xs font-bold text-ink">Upload a cover</span>
                    <span className="mt-1 block text-[10px]">JPG, PNG or WebP · 5 MB max</span>
                  </span>
                </button>
              )}
            </div>
            <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => uploadCover(event.target.files?.[0])} />
            <div className="mt-3">
              <Label htmlFor="cover_image_url" className="text-xs">Or paste an image URL</Label>
              <Input id="cover_image_url" name="cover_image_url" value={coverUrl} onChange={(event) => setCoverUrl(event.target.value)} placeholder="https://…" className="text-xs" />
              {fieldError("cover_image_url")}
              {uploadError && <p className="mt-2 text-xs leading-5 text-red-700">{uploadError}</p>}
            </div>
          </section>
        </aside>
      </div>
    </form>
  );
}
