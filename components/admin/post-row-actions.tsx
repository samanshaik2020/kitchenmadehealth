import Link from "next/link";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { deletePost, togglePostStatus } from "@/app/(admin)/dashboard/actions";
import type { Post } from "@/lib/types";

export function PostRowActions({ post }: { post: Post }) {
  const nextStatus = post.status === "published" ? "draft" : "published";
  return (
    <div className="flex items-center justify-end gap-1">
      <form action={togglePostStatus.bind(null, post.id, nextStatus)}>
        <button
          className="grid size-9 place-items-center rounded-lg text-stone hover:bg-cream hover:text-ink"
          title={nextStatus === "published" ? "Publish" : "Unpublish"}
        >
          {nextStatus === "published" ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      </form>
      <Link
        href={`/dashboard/posts/${post.id}/edit`}
        className="grid size-9 place-items-center rounded-lg text-stone hover:bg-cream hover:text-ink"
        title="Edit post"
      >
        <Pencil size={16} />
      </Link>
      <form action={deletePost.bind(null, post.id)}>
        <button className="grid size-9 place-items-center rounded-lg text-stone hover:bg-red-50 hover:text-red-700" title="Delete post">
          <Trash2 size={16} />
        </button>
      </form>
    </div>
  );
}
