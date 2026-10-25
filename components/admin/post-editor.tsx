"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { useState } from "react";
import Link from "next/link";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Heading2,
  ImageIcon,
  Italic,
  List,
  ListOrdered,
  Link2,
  Unlink,
  Quote,
  Redo2,
  Undo2,
  Youtube,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getYouTubeVideoId } from "@/lib/youtube";
import { YouTubeNode } from "@/components/admin/youtube-node";

export function PostEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (html: string) => void;
}) {
  const [showVideo, setShowVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoError, setVideoError] = useState("");
  const editor = useEditor({
    extensions: [StarterKit, Image, YouTubeNode],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        role: "textbox",
        "aria-label": "Article content",
        "aria-multiline": "true",
        class:
          "article-content min-h-[28rem] max-w-none px-5 py-6 outline-none sm:px-8",
      },
    },
    onUpdate: ({ editor: instance }) => onChange(instance.getHTML()),
  });

  if (!editor) {
    return <div className="min-h-[32rem] animate-pulse rounded-xl bg-cream" />;
  }

  const tools = [
    {
      label: "Bold",
      icon: Bold,
      active: editor.isActive("bold"),
      action: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "Italic",
      icon: Italic,
      active: editor.isActive("italic"),
      action: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: "Heading",
      icon: Heading2,
      active: editor.isActive("heading", { level: 2 }),
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "Bullet list",
      icon: List,
      active: editor.isActive("bulletList"),
      action: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Numbered list",
      icon: ListOrdered,
      active: editor.isActive("orderedList"),
      action: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "Quote",
      icon: Quote,
      active: editor.isActive("blockquote"),
      action: () => editor.chain().focus().toggleBlockquote().run(),
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white focus-within:border-terracotta focus-within:ring-2 focus-within:ring-terracotta/10">
      <div className="flex flex-wrap items-center gap-1 border-b border-line bg-[#faf9f7] px-3 py-2">
        {tools.map(({ label, icon: Icon, active, action }) => (
          <button
            key={label}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={active}
            onClick={action}
            className={cn(
              "grid size-8 place-items-center rounded-lg text-stone transition hover:bg-white hover:text-ink",
              active && "bg-white text-terracotta shadow-sm",
            )}
          >
            <Icon size={15} />
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-line" />
        <button type="button" title="Add or edit source link" aria-label="Add or edit source link" className="grid size-8 place-items-center rounded-lg text-stone hover:bg-white hover:text-ink" onClick={() => {
          const url = window.prompt("Paste an HTTPS source URL", editor.getAttributes("link").href || "");
          if (url === null) return;
          if (!url.trim()) { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
          try { const parsed = new URL(url); if (parsed.protocol !== "https:") return; editor.chain().focus().extendMarkRange("link").setLink({ href: parsed.href }).run(); } catch { /* Keep the current link if the new URL is invalid. */ }
        }}><Link2 size={15} /></button>
        <button type="button" title="Remove link" aria-label="Remove link" className="grid size-8 place-items-center rounded-lg text-stone hover:bg-white hover:text-ink" onClick={() => editor.chain().focus().extendMarkRange("link").unsetLink().run()}><Unlink size={15} /></button>
        <button
          type="button"
          title="Add image by URL"
          className="grid size-8 place-items-center rounded-lg text-stone hover:bg-white hover:text-ink"
          onClick={() => {
            const url = window.prompt("Paste an image URL");
            if (!url) return;
            const alt = window.prompt("Describe this image for readers who cannot see it");
            editor.chain().focus().setImage({ src: url, alt: alt?.trim() || "" }).run();
          }}
        >
          <ImageIcon size={15} />
        </button>
        <Link href="/dashboard/media#images" target="_blank" className="px-2 py-2 text-xs font-semibold text-stone hover:text-ink">Image library</Link>
        <button type="button" aria-label="Add YouTube video" aria-expanded={showVideo} onClick={() => setShowVideo(!showVideo)} className="inline-flex min-h-9 items-center gap-2 rounded-lg px-2 text-xs font-semibold text-stone hover:bg-white hover:text-ink"><Youtube size={17} />YouTube</button>
        <span className="ml-auto flex gap-1">
          <button
            type="button"
            title="Undo"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="grid size-8 place-items-center rounded-lg text-stone hover:bg-white disabled:opacity-35"
          >
            <Undo2 size={15} />
          </button>
          <button
            type="button"
            title="Redo"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="grid size-8 place-items-center rounded-lg text-stone hover:bg-white disabled:opacity-35"
          >
            <Redo2 size={15} />
          </button>
        </span>
      </div>
      {showVideo && <div role="region" aria-label="Add YouTube video" className="space-y-3 border-b border-line bg-cream/50 p-4">
        <label className="block text-xs font-semibold" htmlFor="article-youtube-url">YouTube video link</label>
        <input id="article-youtube-url" type="url" value={videoUrl} onChange={(event) => { setVideoUrl(event.target.value); setVideoError(""); }} placeholder="https://www.youtube.com/watch?v=…" className="min-h-11 w-full rounded-lg border border-line bg-white px-3 text-sm" aria-invalid={Boolean(videoError)} aria-describedby={videoError ? "article-youtube-error" : undefined} />
        <label className="block text-xs font-semibold" htmlFor="article-youtube-title">Video title (optional)</label>
        <input id="article-youtube-title" value={videoTitle} maxLength={180} onChange={(event) => setVideoTitle(event.target.value)} placeholder="A short description for readers" className="min-h-11 w-full rounded-lg border border-line bg-white px-3 text-sm" />
        <p className="text-xs leading-5 text-stone">Paste a YouTube watch, share, Shorts, or live link. The video will appear at your cursor in this article.</p>
        {videoError && <p id="article-youtube-error" role="alert" className="text-xs text-red-700">{videoError}</p>}
        <div className="flex gap-3"><button type="button" className="min-h-11 rounded-full bg-ink px-5 text-xs font-bold text-white" onClick={() => {
          const videoId = getYouTubeVideoId(videoUrl);
          if (!videoId) { setVideoError("Paste a valid YouTube video link."); return; }
          editor.chain().focus().insertContent({ type: "youtubeVideo", attrs: { videoId, title: videoTitle.trim() || "YouTube video" } }).run();
          setShowVideo(false); setVideoUrl(""); setVideoTitle(""); setVideoError("");
        }}>Insert video</button><button type="button" onClick={() => { setShowVideo(false); setVideoError(""); }} className="min-h-11 px-3 text-xs font-semibold">Cancel</button></div>
      </div>}
      <EditorContent editor={editor} />
    </div>
  );
}
