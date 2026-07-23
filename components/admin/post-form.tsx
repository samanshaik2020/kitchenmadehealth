"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  ArrowLeft,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  History,
  ImagePlus,
  Link2,
  LoaderCircle,
  Plus,
  RotateCcw,
  Save,
  SearchCheck,
  Send,
  ShoppingBag,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import {
  autosavePost,
  restoreRevision,
} from "@/app/(admin)/dashboard/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserCoverImage } from "@/components/ui/user-cover-image";
import { createClient } from "@/lib/supabase/client";
import type {
  ActionState,
  AffiliateLink,
  Category,
  Post,
  PostRevision,
  Tag,
} from "@/lib/types";
import { formatDate, slugify } from "@/lib/utils";

const PostEditor = dynamic(
  () =>
    import("@/components/admin/post-editor").then((module) => module.PostEditor),
  {
    ssr: false,
    loading: () => <div className="min-h-[32rem] animate-pulse bg-cream" />,
  },
);

const initialState: ActionState = { success: false, message: "" };

type PostAction = (
  previousState: ActionState,
  formData: FormData,
) => Promise<ActionState>;

type EditorAffiliate = Pick<
  AffiliateLink,
  "product_name" | "merchant" | "destination_url" | "button_label" | "disclosure" | "active"
> & { id?: string };

export function PostForm({
  post,
  categories,
  tags,
  selectedTagIds,
  revisions,
  affiliates: initialAffiliates,
  relatedPosts,
  action,
  supabaseConfigured,
}: {
  post?: Post;
  categories: Category[];
  tags: Tag[];
  selectedTagIds: string[];
  revisions: PostRevision[];
  affiliates: AffiliateLink[];
  relatedPosts: Post[];
  action: PostAction;
  supabaseConfigured: boolean;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, initialState);
  const [, startRestore] = useTransition();
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(post));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "<p>Start writing your guide…</p>");
  const [coverUrl, setCoverUrl] = useState(post?.cover_image_url ?? "");
  const [coverAlt, setCoverAlt] = useState(post?.cover_image_alt ?? "");
  const [categoryId, setCategoryId] = useState(post?.category_id ?? "");
  const [seoTitle, setSeoTitle] = useState(post?.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(post?.seo_description ?? "");
  const [keyword, setKeyword] = useState(post?.primary_keyword ?? "");
  const [scheduledAt, setScheduledAt] = useState(toDateTimeLocal(post?.status === "scheduled" ? post.published_at : null));
  const [tagIds, setTagIds] = useState(selectedTagIds);
  const [affiliates, setAffiliates] = useState<EditorAffiliate[]>(
    initialAffiliates.map((link) => ({
      id: link.id,
      product_name: link.product_name,
      merchant: link.merchant,
      destination_url: link.destination_url,
      button_label: link.button_label,
      disclosure: link.disclosure ?? "",
      active: link.active,
    })),
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [autosaveState, setAutosaveState] = useState<"idle" | "saving" | "saved" | "failed">(
    post ? "saved" : "idle",
  );
  const [autosaveMessage, setAutosaveMessage] = useState(
    post ? `Saved ${formatDate(post.updated_at, "short")}` : "Autosave begins after the first draft save",
  );
  const fileInput = useRef<HTMLInputElement>(null);

  const markDirty = () => {
    setDirty(true);
    setAutosaveState("idle");
    setAutosaveMessage(post?.status === "published" ? "Update to save published changes" : "Unsaved changes");
  };

  useEffect(() => {
    if (!post || post.status === "published" || !dirty) return;

    const timeout = window.setTimeout(async () => {
      setAutosaveState("saving");
      setAutosaveMessage("Saving draft…");
      const result = await autosavePost(post.id, {
        title,
        slug,
        excerpt,
        content,
        cover_image_url: coverUrl,
        cover_image_alt: coverAlt,
        category_id: categoryId,
        seo_title: seoTitle,
        seo_description: seoDescription,
        primary_keyword: keyword,
      });
      if (result.success) {
        setAutosaveState("saved");
        setAutosaveMessage(`Autosaved at ${new Date(result.savedAt ?? Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
        setDirty(false);
      } else {
        setAutosaveState("failed");
        setAutosaveMessage(result.message ?? "Autosave failed");
      }
    }, 12_000);

    return () => window.clearTimeout(timeout);
  }, [
    post,
    dirty,
    title,
    slug,
    excerpt,
    content,
    coverUrl,
    coverAlt,
    categoryId,
    seoTitle,
    seoDescription,
    keyword,
  ]);

  const seoChecks = useMemo(
    () => calculateSeo({
      title: seoTitle || title,
      description: seoDescription,
      keyword,
      content,
      excerpt,
      coverUrl,
      coverAlt,
    }),
    [title, seoTitle, seoDescription, keyword, content, excerpt, coverUrl, coverAlt],
  );
  const seoScore = Math.round(
    (seoChecks.filter((check) => check.pass).length / seoChecks.length) * 100,
  );

  const fieldError = (name: string) =>
    state.errors?.[name]?.[0] ? (
      <p className="mt-1.5 text-xs text-red-700">{state.errors[name][0]}</p>
    ) : null;

  async function uploadCover(file?: File) {
    if (!file) return;
    if (!supabaseConfigured) {
      setUploadError("Connect Supabase before uploading. You can paste a public image URL for now.");
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
      markDirty();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function restore(revisionId: string) {
    if (!post || !window.confirm("Restore this revision? Your current version will be kept in history.")) return;
    startRestore(async () => {
      await restoreRevision(post.id, revisionId);
      router.refresh();
    });
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="content" value={content} />
      <input type="hidden" name="tag_ids" value={JSON.stringify(tagIds)} />
      <input type="hidden" name="affiliate_links" value={JSON.stringify(affiliates)} />

      <div className="sticky top-0 z-30 border-b border-white/10 bg-[#0b241a]/96 text-white shadow-lg backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-7 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/dashboard"
              className="grid size-9 shrink-0 place-items-center rounded-full border border-white/15 bg-white/5 text-white/65 hover:text-white"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={15} />
            </Link>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold uppercase tracking-[.1em] text-white/85">
                {post ? "Edit story" : "New story"}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 truncate text-[10px] text-white/40">
                {autosaveState === "saving" ? (
                  <LoaderCircle size={10} className="animate-spin" />
                ) : autosaveState === "saved" ? (
                  <CheckCircle2 size={10} className="text-sage" />
                ) : (
                  <Clock3 size={10} />
                )}
                {autosaveMessage}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="submit"
              name="status"
              value="draft"
              disabled={pending}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/20 px-4 text-[10px] font-bold uppercase tracking-[.09em] text-white/75 hover:bg-white/10 disabled:opacity-50"
            >
              {pending ? <LoaderCircle size={13} className="animate-spin" /> : <Save size={13} />}
              Save draft
            </button>
            <button
              type="submit"
              name="status"
              value="scheduled"
              disabled={pending || !scheduledAt}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 text-[10px] font-bold uppercase tracking-[.09em] text-amber-100 disabled:opacity-40"
            >
              <CalendarClock size={13} /> Schedule
            </button>
            <button
              type="submit"
              name="status"
              value="published"
              disabled={pending}
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-terracotta px-4 text-[10px] font-bold uppercase tracking-[.09em] text-white hover:bg-terracotta-dark disabled:opacity-50"
            >
              <Send size={13} /> {post?.status === "published" ? "Update live story" : "Publish now"}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1500px] gap-6 p-4 sm:p-7 xl:grid-cols-[minmax(0,1fr)_22rem] lg:p-10">
        <div className="space-y-6">
          {state.message && (
            <div
              className={`flex items-start gap-2 border px-4 py-3 text-sm ${
                state.success
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
              role="status"
            >
              {state.success ? <Check size={17} /> : <X size={17} />}
              {state.message}
            </div>
          )}

          <section className="border border-line bg-white p-5 shadow-[0_16px_55px_rgba(16,38,29,.04)] sm:p-8">
            <div className="flex items-center justify-between">
              <p className="eyebrow text-terracotta">The story</p>
              <span className="text-[10px] font-semibold text-stone">
                {stripHtml(content).split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <div className="mt-5">
              <Label htmlFor="title">Story title</Label>
              <Input
                id="title"
                name="title"
                value={title}
                maxLength={150}
                onChange={(event) => {
                  const value = event.target.value;
                  setTitle(value);
                  if (!slugEdited) setSlug(slugify(value));
                  markDirty();
                }}
                className="h-auto rounded-none border-0 border-b border-line bg-transparent px-0 py-4 font-display text-4xl font-medium tracking-[-.045em] shadow-none focus:border-terracotta focus:ring-0 md:text-5xl"
                placeholder="A clear, useful title"
              />
              {fieldError("title")}
            </div>
            <div className="mt-7">
              <Label>Article content</Label>
              <PostEditor
                content={content}
                onChange={(value) => {
                  setContent(value);
                  markDirty();
                }}
              />
              {fieldError("content")}
            </div>
          </section>

          <section className="border border-line bg-white p-5 shadow-[0_16px_55px_rgba(16,38,29,.04)] sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <SearchCheck className="text-terracotta" size={18} />
                  <p className="eyebrow text-terracotta">On-page SEO</p>
                </div>
                <h2 className="mt-3 font-display text-3xl font-medium">Search preview & score</h2>
                <p className="mt-2 text-xs leading-6 text-stone">
                  Useful guidance while you write—never a substitute for a genuinely helpful story.
                </p>
              </div>
              <ScoreRing score={seoScore} />
            </div>

            <div className="mt-7 border border-line bg-[#fafafa] p-4">
              <p className="text-xs text-[#1f6d3b]">
                kitchenmadehealth.com › blog › {slug || "post-slug"}
              </p>
              <p className="mt-1 text-xl text-[#1a0dab]">{seoTitle || title || "Your story title"}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-stone">
                {seoDescription || excerpt || "Your search description will appear here."}
              </p>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_.8fr]">
              <div className="grid gap-5">
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="primary_keyword">Focus keyword</Label>
                    <span className="mb-2 text-[9px] text-stone">{keyword.length}/100</span>
                  </div>
                  <Input
                    id="primary_keyword"
                    name="primary_keyword"
                    value={keyword}
                    onChange={(event) => {
                      setKeyword(event.target.value);
                      markDirty();
                    }}
                    placeholder="e.g. choose a stainless steel pan"
                    maxLength={100}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="seo_title">SEO title</Label>
                    <span className="mb-2 text-[9px] text-stone">{seoTitle.length}/150</span>
                  </div>
                  <Input
                    id="seo_title"
                    name="seo_title"
                    value={seoTitle}
                    onChange={(event) => {
                      setSeoTitle(event.target.value);
                      markDirty();
                    }}
                    placeholder="Optional — defaults to story title"
                    maxLength={150}
                  />
                  {fieldError("seo_title")}
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="seo_description">SEO description</Label>
                    <span className="mb-2 text-[9px] text-stone">{seoDescription.length}/160</span>
                  </div>
                  <Textarea
                    id="seo_description"
                    name="seo_description"
                    value={seoDescription}
                    onChange={(event) => {
                      setSeoDescription(event.target.value);
                      markDirty();
                    }}
                    placeholder="A concise reason to read this guide…"
                    maxLength={160}
                    className="min-h-24"
                  />
                  {fieldError("seo_description")}
                </div>
              </div>
              <div className="border border-line bg-cream/45 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[.13em] text-stone">Live checks</p>
                <div className="mt-4 space-y-3">
                  {seoChecks.map((check) => (
                    <div key={check.label} className="flex items-start gap-2.5">
                      <span className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full ${check.pass ? "bg-sage/25 text-sage-dark" : "bg-white text-stone"}`}>
                        {check.pass ? <Check size={10} strokeWidth={3} /> : <span className="size-1 rounded-full bg-stone/50" />}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-ink">{check.label}</p>
                        <p className="mt-0.5 text-[10px] leading-4 text-stone">{check.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <AffiliateEditor affiliates={affiliates} onChange={(value) => { setAffiliates(value); markDirty(); }} />
        </div>

        <aside className="space-y-5">
          <section className="border border-line bg-white p-5 shadow-[0_12px_40px_rgba(16,38,29,.035)]">
            <p className="eyebrow text-terracotta">Publishing</p>
            <h2 className="mt-2 font-display text-2xl font-medium">Story settings</h2>
            <div className="mt-5">
              <Label htmlFor="category_id">Category</Label>
              <select
                id="category_id"
                name="category_id"
                value={categoryId}
                onChange={(event) => {
                  setCategoryId(event.target.value);
                  markDirty();
                }}
                className="min-h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-terracotta"
              >
                <option value="" disabled>Choose a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              {fieldError("category_id")}
            </div>
            <div className="mt-5">
              <Label htmlFor="published_at">Schedule date & time</Label>
              <Input
                id="published_at"
                name="published_at"
                type="datetime-local"
                value={scheduledAt}
                min={toDateTimeLocal(new Date().toISOString())}
                onChange={(event) => {
                  setScheduledAt(event.target.value);
                  markDirty();
                }}
              />
              <p className="mt-2 text-[10px] leading-4 text-stone">
                Set a future time, then choose Schedule in the top bar.
              </p>
              {fieldError("published_at")}
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
                  markDirty();
                }}
                placeholder="your-story-slug"
              />
              {fieldError("slug")}
            </div>
            <div className="mt-5">
              <div className="flex items-center justify-between">
                <Label htmlFor="excerpt">Excerpt</Label>
                <span className="mb-2 text-[9px] text-stone">{excerpt.length}/300</span>
              </div>
              <Textarea
                id="excerpt"
                name="excerpt"
                value={excerpt}
                onChange={(event) => {
                  setExcerpt(event.target.value);
                  markDirty();
                }}
                maxLength={300}
                placeholder="A short, useful summary…"
              />
              {fieldError("excerpt")}
            </div>
          </section>

          <section className="border border-line bg-white p-5 shadow-[0_12px_40px_rgba(16,38,29,.035)]">
            <p className="eyebrow text-terracotta">Discoverability</p>
            <h2 className="mt-2 font-display text-2xl font-medium">Tags</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag) => {
                const checked = tagIds.includes(tag.id);
                return (
                  <label
                    key={tag.id}
                    className={`cursor-pointer rounded-full border px-3 py-2 text-[9px] font-bold uppercase tracking-[.09em] transition ${
                      checked ? "border-ink bg-ink text-white" : "border-line bg-paper text-stone"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setTagIds((current) =>
                          checked ? current.filter((id) => id !== tag.id) : [...current, tag.id],
                        );
                        markDirty();
                      }}
                      className="sr-only"
                    />
                    {tag.name}
                  </label>
                );
              })}
            </div>
            {!tags.length && (
              <Link href="/dashboard/taxonomy" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-terracotta">
                <Plus size={13} /> Create your first tag
              </Link>
            )}
          </section>

          <section className="border border-line bg-white p-5 shadow-[0_12px_40px_rgba(16,38,29,.035)]">
            <p className="eyebrow text-terracotta">Lead image</p>
            <h2 className="mt-2 font-display text-2xl font-medium">Cover & alt text</h2>
            <div className="relative mt-4 aspect-[4/3] overflow-hidden border border-dashed border-line bg-cream">
              {coverUrl ? (
                <>
                  <UserCoverImage src={coverUrl} alt="Cover preview" />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverUrl("");
                      markDirty();
                    }}
                    className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-ink/80 text-white"
                    aria-label="Remove cover"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="grid size-full place-items-center p-5 text-center text-stone"
                >
                  <span>
                    {uploading ? (
                      <LoaderCircle size={24} className="mx-auto animate-spin" />
                    ) : (
                      <ImagePlus size={24} className="mx-auto text-terracotta" />
                    )}
                    <span className="mt-2 block text-xs font-bold text-ink">Upload a cover</span>
                    <span className="mt-1 block text-[10px]">JPG, PNG or WebP · 5 MB max</span>
                  </span>
                </button>
              )}
            </div>
            <input
              ref={fileInput}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(event) => uploadCover(event.target.files?.[0])}
            />
            <div className="mt-3">
              <Label htmlFor="cover_image_url" className="text-xs">Or paste an image URL</Label>
              <Input
                id="cover_image_url"
                name="cover_image_url"
                value={coverUrl}
                onChange={(event) => {
                  setCoverUrl(event.target.value);
                  markDirty();
                }}
                placeholder="https://…"
                className="text-xs"
              />
              {fieldError("cover_image_url")}
            </div>
            <div className="mt-3">
              <Label htmlFor="cover_image_alt" className="text-xs">Image alt text</Label>
              <Textarea
                id="cover_image_alt"
                name="cover_image_alt"
                value={coverAlt}
                onChange={(event) => {
                  setCoverAlt(event.target.value);
                  markDirty();
                }}
                placeholder="Describe the image for readers who cannot see it"
                maxLength={180}
                className="min-h-20 text-xs"
              />
              {fieldError("cover_image_alt")}
            </div>
            {uploadError && <p className="mt-2 text-xs leading-5 text-red-700">{uploadError}</p>}
          </section>

          <SuggestedLinks posts={relatedPosts} />
          <RevisionPanel
            revisions={revisions}
            canRestore={Boolean(post)}
            onRestore={restore}
          />
        </aside>
      </div>
    </form>
  );
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "#5b7b5d" : score >= 55 ? "#c98939" : "#c9623f";
  return (
    <div
      className="grid size-20 shrink-0 place-items-center rounded-full"
      style={{ background: `conic-gradient(${color} ${score * 3.6}deg, #ece5d6 0)` }}
      aria-label={`SEO score ${score} out of 100`}
    >
      <div className="grid size-15 place-items-center rounded-full bg-white text-center">
        <span>
          <strong className="block font-display text-xl leading-none">{score}</strong>
          <span className="text-[8px] font-bold uppercase tracking-[.1em] text-stone">SEO</span>
        </span>
      </div>
    </div>
  );
}

function AffiliateEditor({
  affiliates,
  onChange,
}: {
  affiliates: EditorAffiliate[];
  onChange: (links: EditorAffiliate[]) => void;
}) {
  function update(index: number, patch: Partial<EditorAffiliate>) {
    onChange(affiliates.map((link, itemIndex) => (itemIndex === index ? { ...link, ...patch } : link)));
  }

  return (
    <section className="border border-line bg-white p-5 shadow-[0_16px_55px_rgba(16,38,29,.04)] sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-terracotta" size={18} />
            <p className="eyebrow text-terracotta">Affiliate products</p>
          </div>
          <h2 className="mt-3 font-display text-3xl font-medium">Products mentioned</h2>
          <p className="mt-2 max-w-xl text-xs leading-6 text-stone">
            Attach contextual product links. Public clicks route through Kitchen Made Health for first-party reporting.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            onChange([
              ...affiliates,
              {
                product_name: "",
                merchant: "Amazon",
                destination_url: "",
                button_label: "View product",
                disclosure: "",
                active: true,
              },
            ])
          }
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-ink px-4 text-[9px] font-bold uppercase tracking-[.1em] text-white"
        >
          <Plus size={13} /> Add product
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {affiliates.map((link, index) => (
          <div key={link.id ?? `new-${index}`} className="border border-line bg-cream/35 p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Product name">
                <Input value={link.product_name} onChange={(event) => update(index, { product_name: event.target.value })} placeholder="12-inch stainless skillet" />
              </Field>
              <Field label="Merchant">
                <Input value={link.merchant} onChange={(event) => update(index, { merchant: event.target.value })} placeholder="Amazon" />
              </Field>
              <Field label="Destination URL">
                <Input type="url" value={link.destination_url} onChange={(event) => update(index, { destination_url: event.target.value })} placeholder="https://…" />
              </Field>
              <Field label="Button label">
                <Input value={link.button_label} onChange={(event) => update(index, { button_label: event.target.value })} placeholder="View product" />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Optional disclosure note">
                <Input value={link.disclosure ?? ""} onChange={(event) => update(index, { disclosure: event.target.value })} placeholder="Why this product is included" />
              </Field>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-stone">
                <input type="checkbox" checked={link.active} onChange={(event) => update(index, { active: event.target.checked })} className="accent-terracotta" />
                Active on the public story
              </label>
              <button
                type="button"
                onClick={() => onChange(affiliates.filter((_, itemIndex) => itemIndex !== index))}
                className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.1em] text-red-700"
              >
                <Trash2 size={12} /> Remove
              </button>
            </div>
          </div>
        ))}
        {!affiliates.length && (
          <div className="border border-dashed border-line p-8 text-center">
            <Sparkles className="mx-auto text-terracotta" size={20} />
            <p className="mt-3 text-sm font-semibold">No products attached</p>
            <p className="mt-1 text-xs text-stone">Only add a product when it genuinely supports the story.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function SuggestedLinks({ posts }: { posts: Post[] }) {
  return (
    <section className="border border-line bg-[#0d281e] p-5 text-white">
      <div className="flex items-center gap-2">
        <Link2 size={15} className="text-sage" />
        <p className="eyebrow text-sage">Internal links</p>
      </div>
      <h2 className="mt-2 font-display text-2xl font-medium">Related stories</h2>
      <p className="mt-2 text-[10px] leading-5 text-white/45">
        Natural linking opportunities from your library.
      </p>
      <div className="mt-4 divide-y divide-white/10 border-y border-white/10">
        {posts.slice(0, 5).map((post) => (
          <div key={post.id} className="py-3">
            <p className="line-clamp-2 text-xs font-semibold leading-5 text-white/75">{post.title}</p>
            <div className="mt-1.5 flex items-center justify-between">
              <code className="truncate text-[9px] text-white/35">/blog/{post.slug}</code>
              <Link href={`/blog/${post.slug}`} target="_blank" className="text-white/45 hover:text-white" aria-label={`Preview ${post.title}`}>
                <ExternalLink size={11} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function RevisionPanel({
  revisions,
  canRestore,
  onRestore,
}: {
  revisions: PostRevision[];
  canRestore: boolean;
  onRestore: (id: string) => void;
}) {
  return (
    <section className="border border-line bg-white p-5">
      <div className="flex items-center gap-2">
        <History size={15} className="text-terracotta" />
        <p className="eyebrow text-terracotta">Version history</p>
      </div>
      <h2 className="mt-2 font-display text-2xl font-medium">Recent revisions</h2>
      <p className="mt-2 text-[10px] leading-5 text-stone">
        The latest 20 manual and automatic versions are retained.
      </p>
      <div className="mt-4 divide-y divide-line border-y border-line">
        {revisions.slice(0, 8).map((revision) => (
          <div key={revision.id} className="flex items-center justify-between gap-3 py-3">
            <div>
              <p className="text-[10px] font-bold capitalize text-ink">{revision.source}</p>
              <p className="mt-1 text-[9px] text-stone">{formatDate(revision.created_at)}</p>
            </div>
            <button
              type="button"
              disabled={!canRestore}
              onClick={() => onRestore(revision.id)}
              className="grid size-8 place-items-center rounded-full border border-line text-stone hover:text-terracotta disabled:opacity-40"
              title="Restore revision"
            >
              <RotateCcw size={12} />
            </button>
          </div>
        ))}
        {!revisions.length && (
          <p className="py-7 text-center text-xs text-stone">
            History begins after the first saved draft.
          </p>
        )}
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[.1em] text-stone">{label}</span>
      {children}
    </label>
  );
}

function calculateSeo({
  title,
  description,
  keyword,
  content,
  excerpt,
  coverUrl,
  coverAlt,
}: {
  title: string;
  description: string;
  keyword: string;
  content: string;
  excerpt: string;
  coverUrl: string;
  coverAlt: string;
}) {
  const normalizedKeyword = keyword.trim().toLowerCase();
  const plainContent = stripHtml(content).toLowerCase();
  const imageTags = content.match(/<img\b[^>]*>/gi) ?? [];
  const missingAlt = imageTags.filter((tag) => !/\balt=["'][^"']+["']/i.test(tag)).length;
  return [
    {
      label: "Focused title",
      detail: `${title.length} characters; aim for roughly 45–65.`,
      pass: title.length >= 40 && title.length <= 70,
    },
    {
      label: "Useful meta description",
      detail: `${description.length} characters; aim for 120–160.`,
      pass: description.length >= 110 && description.length <= 160,
    },
    {
      label: "Keyword in title",
      detail: normalizedKeyword ? "The focus phrase appears in the search title." : "Add a focus keyword.",
      pass: Boolean(normalizedKeyword && title.toLowerCase().includes(normalizedKeyword)),
    },
    {
      label: "Keyword in story",
      detail: normalizedKeyword ? "The focus phrase appears naturally in the article." : "Add a focus keyword.",
      pass: Boolean(normalizedKeyword && plainContent.includes(normalizedKeyword)),
    },
    {
      label: "Complete image alt text",
      detail: missingAlt ? `${missingAlt} inline image${missingAlt === 1 ? "" : "s"} still need alt text.` : "Every current image has descriptive alt text.",
      pass: missingAlt === 0 && (!coverUrl || coverAlt.trim().length >= 5),
    },
    {
      label: "Reader-facing excerpt",
      detail: `${excerpt.length} characters; concise summaries improve cards and sharing.`,
      pass: excerpt.length >= 70 && excerpt.length <= 300,
    },
  ];
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}
