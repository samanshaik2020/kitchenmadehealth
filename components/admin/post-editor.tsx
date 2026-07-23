"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Heading2,
  ImageIcon,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function PostEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit, Image],
    content,
    immediatelyRender: true,
    editorProps: {
      attributes: {
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
      <EditorContent editor={editor} />
    </div>
  );
}
