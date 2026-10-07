"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition } from "react";
import {
  Check,
  Clipboard,
  Code2,
  ExternalLink,
  FileCode2,
  FileUp,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import {
  createHtmlPage,
  deleteHtmlPage,
  setHtmlPageStatus,
} from "@/app/(admin)/dashboard/html-pages/actions";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { HtmlImageLibrary } from "@/components/admin/html-image-library";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState, HtmlPage } from "@/lib/types";
import { formatDate, slugify } from "@/lib/utils";

const initialState: ActionState = { success: false, message: "" };

export function HtmlPageManager({
  pages,
  supabaseConfigured,
}: {
  pages: HtmlPage[];
  supabaseConfigured: boolean;
}) {
  const router = useRouter();
  const [state, formAction, uploading] = useActionState(createHtmlPage, initialState);
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [filename, setFilename] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const [feedback, setFeedback] = useState<ActionState | null>(null);
  const [activeId, setActiveId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<HtmlPage | null>(null);

  const fieldError = (name: string) =>
    state.errors?.[name]?.[0] ? (
      <p className="mt-1.5 text-xs text-red-700">{state.errors[name][0]}</p>
    ) : null;

  function updateStatus(page: HtmlPage) {
    const nextStatus = page.status === "published" ? "draft" : "published";
    setActiveId(page.id);
    setFeedback(null);
    startTransition(async () => {
      const result = await setHtmlPageStatus(page.id, nextStatus);
      setFeedback(result);
      setActiveId("");
      if (result.success) router.refresh();
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setActiveId(deleteTarget.id);
    setFeedback(null);
    startTransition(async () => {
      const result = await deleteHtmlPage(deleteTarget.id);
      setFeedback(result);
      setActiveId("");
      if (result.success) {
        setDeleteTarget(null);
        router.refresh();
      }
    });
  }

  async function copyUrl(page: HtmlPage) {
    const url = new URL(`/pages/${page.slug}`, window.location.origin).toString();
    await navigator.clipboard.writeText(url);
    setCopiedId(page.id);
    window.setTimeout(() => setCopiedId(""), 1800);
  }

  return (
    <div className="mt-8 grid gap-7 xl:grid-cols-[minmax(0,1fr)_25rem] xl:items-start">
      <div className="space-y-7">
      <section className="overflow-hidden border border-line bg-white">
        <div className="border-b border-line p-6">
          <p className="eyebrow text-terracotta">Generated URLs</p>
          <h2 className="mt-2 font-display text-3xl font-medium">Published HTML pages</h2>
          <p className="mt-2 text-xs leading-6 text-stone">
            Re-upload with the same slug to replace the file without changing its public URL.
          </p>
        </div>

        {feedback?.message && (
          <p
            role="status"
            className={`m-5 border px-4 py-3 text-xs ${
              feedback.success
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {feedback.message}
          </p>
        )}

        {pages.length ? (
          <div className="divide-y divide-line">
            {pages.map((page) => (
              <article key={page.id} className="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-center md:p-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-xl font-medium">{page.title}</h3>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-[.1em] ${
                        page.status === "published"
                          ? "bg-sage/20 text-sage-dark"
                          : "bg-cream text-stone"
                      }`}
                    >
                      {page.status}
                    </span>
                  </div>
                  <code className="mt-2 block truncate text-[10px] text-terracotta">
                    /pages/{page.slug}
                  </code>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-stone">
                    {page.description || `Uploaded from ${page.original_filename}`}
                  </p>
                  <p className="mt-2 text-[9px] font-bold uppercase tracking-[.1em] text-stone/70">
                    Updated {formatDate(page.updated_at, "short")} · {page.original_filename}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  {page.status === "published" && (
                    <>
                      <button
                        type="button"
                        onClick={() => copyUrl(page)}
                        className="grid size-10 place-items-center rounded-full border border-line text-stone hover:border-ink hover:text-ink"
                        aria-label={`Copy URL for ${page.title}`}
                        title="Copy public URL"
                      >
                        {copiedId === page.id ? <Check size={15} /> : <Clipboard size={15} />}
                      </button>
                      <Link
                        href={`/pages/${page.slug}`}
                        target="_blank"
                        className="grid size-10 place-items-center rounded-full border border-line text-stone hover:border-ink hover:text-ink"
                        aria-label={`Open ${page.title}`}
                        title="Open public page"
                      >
                        <ExternalLink size={15} />
                      </Link>
                    </>
                  )}
                  <button
                    type="button"
                    disabled={pending && activeId === page.id}
                    onClick={() => updateStatus(page)}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line px-4 text-[9px] font-bold uppercase tracking-[.08em] text-ink hover:bg-cream disabled:opacity-50"
                  >
                    {pending && activeId === page.id ? (
                      <LoaderCircle size={13} className="animate-spin" />
                    ) : (
                      <RefreshCw size={13} />
                    )}
                    {page.status === "published" ? "Make draft" : "Publish"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(page)}
                    className="grid size-10 place-items-center rounded-full text-stone hover:bg-red-50 hover:text-red-700"
                    aria-label={`Delete ${page.title}`}
                    title="Delete page"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <FileCode2 className="mx-auto text-terracotta" size={28} />
            <h3 className="mt-4 font-display text-3xl font-medium">No HTML pages yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-stone">
              Upload a self-contained HTML document and its public URL will appear here.
            </p>
          </div>
        )}
      </section>
      <HtmlImageLibrary supabaseConfigured={supabaseConfigured} />
      </div>

      <aside className="border border-line bg-white p-5 shadow-[0_16px_55px_rgba(16,38,29,.05)] sm:p-6 xl:sticky xl:top-6">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-terracotta/10 text-terracotta">
            <FileUp size={18} />
          </span>
          <div>
            <p className="eyebrow text-terracotta">Upload & publish</p>
            <h2 className="mt-1 font-display text-2xl font-medium">New HTML page</h2>
          </div>
        </div>

        {!supabaseConfigured && (
          <p className="mt-5 border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
            Preview mode is active. Connect Supabase to store and publish this file.
          </p>
        )}

        {state.message && (
          <div
            className={`mt-5 flex items-start gap-2 border px-3 py-2 text-xs ${
              state.success
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
            role="status"
          >
            {state.success ? <Check size={15} /> : <X size={15} />}
            {state.message}
          </div>
        )}

        <form action={formAction} className="mt-6 space-y-5">
          <div>
            <Label htmlFor="html-title">Page title</Label>
            <Input
              id="html-title"
              name="title"
              value={title}
              maxLength={150}
              onChange={(event) => {
                const value = event.target.value;
                setTitle(value);
                if (!slugEdited) setSlug(slugify(value));
              }}
              placeholder="Nutrition calculator"
            />
            {fieldError("title")}
          </div>

          <div>
            <Label htmlFor="html-slug">Public URL slug</Label>
            <div className="flex min-h-11 items-center rounded-xl border border-line bg-white focus-within:border-terracotta focus-within:ring-2 focus-within:ring-terracotta/10">
              <span className="pl-3 text-xs text-stone">/pages/</span>
              <input
                id="html-slug"
                name="slug"
                value={slug}
                onChange={(event) => {
                  setSlug(slugify(event.target.value));
                  setSlugEdited(true);
                }}
                className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm outline-none"
                placeholder="nutrition-calculator"
              />
            </div>
            {fieldError("slug")}
          </div>

          <div>
            <Label htmlFor="html-description">Short description</Label>
            <Textarea
              id="html-description"
              name="description"
              maxLength={300}
              className="min-h-24"
              placeholder="What this standalone page does…"
            />
            {fieldError("description")}
          </div>

          <div>
            <Label htmlFor="html-file">Complete HTML file</Label>
            <label
              htmlFor="html-file"
              className="flex min-h-28 cursor-pointer flex-col items-center justify-center border border-dashed border-line bg-cream/50 px-4 text-center hover:border-terracotta"
            >
              <Code2 size={22} className="text-terracotta" />
              <span className="mt-2 text-xs font-bold text-ink">
                {filename || "Choose .html or .htm file"}
              </span>
              <span className="mt-1 text-[10px] text-stone">Self-contained · 4 MB maximum</span>
            </label>
            <input
              id="html-file"
              name="html_file"
              type="file"
              accept=".html,.htm,text/html"
              required
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                const titleInput = event.currentTarget.form?.elements.namedItem("title");
                const currentTitle = titleInput instanceof HTMLInputElement
                  ? titleInput.value.trim()
                  : title.trim();
                setFilename(file?.name ?? "");
                if (!file || currentTitle) return;
                const inferredTitle = file.name.replace(/\.html?$/i, "").replace(/[-_]+/g, " ");
                const normalizedTitle = inferredTitle.replace(/\b\w/g, (character) => character.toUpperCase());
                setTitle(normalizedTitle);
                if (!slugEdited) setSlug(slugify(inferredTitle));
              }}
            />
            {fieldError("html_file")}
          </div>

          <div>
            <Label htmlFor="html-status">Publishing status</Label>
            <select
              id="html-status"
              name="status"
              defaultValue="published"
              className="min-h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-terracotta"
            >
              <option value="published">Publish now</option>
              <option value="draft">Save as draft</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-terracotta px-5 text-[10px] font-bold uppercase tracking-[.11em] text-white hover:bg-terracotta-dark disabled:opacity-55"
          >
            {uploading ? <LoaderCircle size={15} className="animate-spin" /> : <FileUp size={15} />}
            {uploading ? "Uploading page" : "Generate public URL"}
          </button>
        </form>

        <div className="mt-6 flex gap-3 border-t border-line pt-5">
          <LockKeyhole size={16} className="mt-0.5 shrink-0 text-sage-dark" />
          <p className="text-[10px] leading-5 text-stone">
            Uploaded code runs in a restricted browser sandbox. It cannot read your editor login,
            cookies, camera, microphone, location, or payment permissions.
          </p>
        </div>
      </aside>

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title="Delete this HTML page?"
        description={
          deleteTarget
            ? `The URL /pages/${deleteTarget.slug} will stop working immediately. This cannot be undone.`
            : "This page will be permanently removed."
        }
        pending={pending && activeId === deleteTarget?.id}
        error={!feedback?.success && activeId === deleteTarget?.id ? feedback?.message : ""}
        onCancel={() => {
          if (!pending) setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
