"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import {
  deleteProduct,
  toggleProduct,
} from "@/app/(admin)/dashboard/products/actions";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import type { Product } from "@/lib/types";

export function ProductRowActions({ product }: { product: Product }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, startDelete] = useTransition();

  function confirmDelete() {
    setDeleteError("");
    startDelete(async () => {
      try {
        await deleteProduct(product.id);
        setDeleteOpen(false);
        router.refresh();
      } catch (error) {
        setDeleteError(error instanceof Error ? error.message : "The product could not be deleted.");
      }
    });
  }

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <form action={toggleProduct.bind(null, product.id, !product.active)}>
          <button
            type="submit"
            aria-label={product.active ? `Hide ${product.name}` : `Show ${product.name}`}
            className="grid size-9 place-items-center rounded-lg text-stone hover:bg-cream hover:text-ink"
            title={product.active ? "Hide from public page" : "Show on public page"}
          >
            {product.active ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </form>
        <Link
          href={`/dashboard/products/${product.id}/edit`}
          className="grid size-9 place-items-center rounded-lg text-stone hover:bg-cream hover:text-ink"
          title="Edit product"
          aria-label={`Edit ${product.name}`}
        >
          <Pencil size={16} />
        </Link>
        <button
          type="button"
          aria-label={`Delete ${product.name}`}
          disabled={deleting}
          onClick={() => {
            setDeleteError("");
            setDeleteOpen(true);
          }}
          className="grid size-9 place-items-center rounded-lg text-stone hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          title="Delete product"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <ConfirmDeleteDialog
        open={deleteOpen}
        title="Delete this product?"
        description={`“${product.name}” will be permanently removed from the public shelf, together with its click history. This cannot be undone.`}
        confirmLabel="Delete product"
        pending={deleting}
        error={deleteError}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
