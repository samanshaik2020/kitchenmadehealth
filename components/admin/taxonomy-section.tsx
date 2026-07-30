"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { LoaderCircle, Merge, Plus, Save, Trash2 } from "lucide-react";
import {
  createTaxonomy,
  deleteTaxonomy,
  mergeTaxonomy,
  renameTaxonomy,
} from "@/app/(admin)/dashboard/actions";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import type { ActionState } from "@/lib/types";

type TaxonomyKind = "category" | "tag";

type TaxonomyItem = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

const initialState: ActionState = { success: false, message: "" };

export function TaxonomySection({
  kind,
  title,
  description,
  items,
}: {
  kind: TaxonomyKind;
  title: string;
  description: string;
  items: TaxonomyItem[];
}) {
  return (
    <section
      id={kind === "category" ? "categories" : "tags"}
      className="border border-line bg-white shadow-[0_16px_50px_rgba(16,38,29,.04)]"
    >
      <div className="border-b border-line p-6">
        <p className="eyebrow text-terracotta">
          {kind === "category" ? "Primary shelves" : "Topic labels"}
        </p>
        <h2 className="mt-2 font-display text-3xl font-medium">{title}</h2>
        <p className="mt-2 text-xs leading-6 text-stone">{description}</p>
      </div>

      <CreateTaxonomyForm kind={kind} />

      <div className="divide-y divide-line">
        {items.map((item) => (
          <TaxonomyItemEditor key={item.id} kind={kind} item={item} items={items} />
        ))}
        {!items.length && (
          <div className="p-6 text-center">
            <p className="font-display text-xl font-medium">No {title.toLowerCase()} yet</p>
            <p className="mt-1 text-xs leading-5 text-stone">Use the form above to create the first one.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function CreateTaxonomyForm({ kind }: { kind: TaxonomyKind }) {
  const [state, formAction, pending] = useActionState(
    createTaxonomy.bind(null, kind),
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid gap-3 border-b border-line bg-cream/45 p-5 sm:grid-cols-[1fr_auto]"
    >
      <div className="grid gap-2">
        <label
          htmlFor={`new-${kind}-name`}
          className="text-[10px] font-bold uppercase tracking-[.12em] text-stone"
        >
          New {kind}
        </label>
        <input
          id={`new-${kind}-name`}
          name="name"
          required
          minLength={2}
          maxLength={80}
          placeholder={kind === "category" ? "e.g. Pantry" : "e.g. Buying guide"}
          className="min-h-11 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-terracotta"
        />
        {kind === "category" && (
          <input
            name="description"
            maxLength={240}
            aria-label="Category description"
            placeholder="Short category description"
            className="min-h-10 rounded-xl border border-line bg-white px-3 text-xs outline-none focus:border-terracotta"
          />
        )}
        <ActionMessage state={state} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 self-end items-center justify-center gap-2 rounded-full bg-ink px-5 text-[10px] font-bold uppercase tracking-[.1em] text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? <LoaderCircle size={13} className="animate-spin" /> : <Plus size={13} />}
        {pending ? "Creating" : "Create"}
      </button>
    </form>
  );
}

function TaxonomyItemEditor({
  kind,
  item,
  items,
}: {
  kind: TaxonomyKind;
  item: TaxonomyItem;
  items: TaxonomyItem[];
}) {
  const [updateState, updateAction, updating] = useActionState(
    renameTaxonomy.bind(null, kind, item.id),
    initialState,
  );
  const [mergeState, mergeAction, merging] = useActionState(
    mergeTaxonomy.bind(null, kind, item.id),
    initialState,
  );
  const [deleteState, deleteAction, deleting] = useActionState(
    deleteTaxonomy.bind(null, kind, item.id),
    initialState,
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteFormRef = useRef<HTMLFormElement>(null);

  return (
    <article className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-display text-xl font-medium">{item.name}</p>
          <p className="mt-1 text-[10px] text-stone">/{item.slug}</p>
        </div>
        <span className="rounded-full bg-cream px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-stone">
          {kind}
        </span>
      </div>

      <form action={updateAction} className="mt-4 grid gap-3">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <input
            name="name"
            defaultValue={item.name}
            required
            minLength={2}
            maxLength={80}
            aria-label={`Name for ${item.name}`}
            className="min-h-10 min-w-0 rounded-lg border border-line bg-paper px-3 text-xs outline-none focus:border-terracotta"
          />
          <button
            type="submit"
            disabled={updating}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-line bg-white px-4 text-[9px] font-bold uppercase tracking-[.09em] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {updating ? <LoaderCircle size={12} className="animate-spin" /> : <Save size={12} />}
            {updating ? "Saving" : "Save"}
          </button>
        </div>
        {kind === "category" && (
          <textarea
            name="description"
            defaultValue={item.description ?? ""}
            maxLength={240}
            rows={2}
            aria-label={`Description for ${item.name}`}
            placeholder="Short category description"
            className="min-w-0 resize-y rounded-lg border border-line bg-paper px-3 py-2 text-xs leading-5 outline-none focus:border-terracotta"
          />
        )}
        <ActionMessage state={updateState} />
      </form>

      <div className="mt-4 flex flex-col gap-3 border-t border-line/70 pt-4 sm:flex-row sm:items-start sm:justify-between">
        {items.length > 1 ? (
          <form action={mergeAction} className="flex min-w-0 flex-1 flex-wrap gap-2">
            <select
              name="target_id"
              aria-label={`Merge ${item.name} into`}
              required
              defaultValue=""
              className="min-h-9 min-w-44 flex-1 rounded-lg border border-line bg-paper px-3 text-xs outline-none focus:border-terracotta"
            >
              <option value="" disabled>Merge into…</option>
              {items
                .filter((target) => target.id !== item.id)
                .map((target) => (
                  <option key={target.id} value={target.id}>{target.name}</option>
                ))}
            </select>
            <button
              type="submit"
              disabled={merging}
              className="inline-flex min-h-9 items-center justify-center gap-2 rounded-full border border-line bg-white px-3 text-[9px] font-bold uppercase tracking-[.09em] text-stone hover:text-terracotta disabled:cursor-not-allowed disabled:opacity-60"
              title="Merge"
            >
              {merging ? <LoaderCircle size={12} className="animate-spin" /> : <Merge size={12} />}
              Merge
            </button>
            <ActionMessage state={mergeState} className="basis-full" />
          </form>
        ) : (
          <p className="flex-1 text-[10px] leading-4 text-stone">
            Create another {kind} before using merge.
          </p>
        )}

        <form ref={deleteFormRef} action={deleteAction} className="sm:text-right">
          <button
            type="button"
            disabled={deleting}
            onClick={() => setDeleteOpen(true)}
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 text-[9px] font-bold uppercase tracking-[.09em] text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? <LoaderCircle size={12} className="animate-spin" /> : <Trash2 size={12} />}
            {deleting ? "Deleting" : "Delete"}
          </button>
          <ActionMessage state={deleteState} className="mt-2" />
        </form>
        <ConfirmDeleteDialog
          open={deleteOpen}
          title={`Delete ${kind}?`}
          description={
            kind === "category"
              ? `“${item.name}” will be permanently deleted. Posts using this category will become uncategorized.`
              : `“${item.name}” will be permanently deleted and removed from every post.`
          }
          confirmLabel={`Delete ${kind}`}
          pending={deleting}
          error={!deleteState.success ? deleteState.message : ""}
          onCancel={() => setDeleteOpen(false)}
          onConfirm={() => deleteFormRef.current?.requestSubmit()}
        />
      </div>
    </article>
  );
}

function ActionMessage({
  state,
  className = "",
}: {
  state: ActionState;
  className?: string;
}) {
  if (!state.message) return null;

  return (
    <p
      role={state.success ? "status" : "alert"}
      className={`${className} text-[10px] leading-4 ${
        state.success ? "text-sage-dark" : "text-red-700"
      }`}
    >
      {state.message}
    </p>
  );
}
