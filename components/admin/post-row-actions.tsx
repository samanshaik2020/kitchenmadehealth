"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { deletePost, togglePostStatus } from "@/app/(admin)/dashboard/actions";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import type { Post } from "@/lib/types";

export function PostRowActions({ post }: { post: Post }) {
  const router = useRouter();
  const nextStatus = post.status === "published" ? "draft" : "published";
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, startDelete] = useTransition();

  function confirmDelete() {
    setDeleteError("");
    startDelete(async () => {
      try {
        await deletePost(post.id);
        setDeleteOpen(false);
        router.refresh();
      } catch (error) {
        setDeleteError(error instanceof Error ? error.message : "The blog could not be deleted.");
      }
    });
  }

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <form action={togglePostStatus.bind(null, post.id, nextStatus)}>
          <button
            type="submit"
            aria-label={nextStatus === "published" ? `Publish ${post.title}` : `Unpublish ${post.title}`}
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
          aria-label={`Edit ${post.title}`}
        >
          <Pencil size={16} />
        </Link>
        <button
          type="button"
          aria-label={`Delete ${post.title}`}
          disabled={deleting}
          onClick={() => {
            setDeleteError("");
            setDeleteOpen(true);
          }}
          className="grid size-9 place-items-center rounded-lg text-stone hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          title="Delete post"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <ConfirmDeleteDialog
        open={deleteOpen}
        title="Delete this blog?"
        description={`“${post.title}” will be permanently deleted, including its revisions, comments, and related editorial data. This cannot be undone.`}
        confirmLabel="Delete blog"
        pending={deleting}
        error={deleteError}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
