import { Merge, Plus, Tags } from "lucide-react";
import {
  createTaxonomy,
  mergeTaxonomy,
  renameTaxonomy,
} from "@/app/(admin)/dashboard/actions";
import { AdminPageHeader } from "@/components/admin/page-header";
import { getTaxonomyData } from "@/lib/admin-data";

export default async function TaxonomyPage() {
  const { categories, tags } = await getTaxonomyData();

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-7 lg:p-10">
      <AdminPageHeader
        eyebrow="Content architecture"
        title="Categories & tags"
        description="Keep the journal navigable. Create precise labels, rename them safely, or merge overlapping ideas without orphaning posts."
        icon={Tags}
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <TaxonomySection
          kind="category"
          title="Categories"
          description="Broad shelves used for primary navigation and URLs."
          items={categories}
        />
        <TaxonomySection
          kind="tag"
          title="Tags"
          description="Flexible labels for topics, formats, and reader intent."
          items={tags}
        />
      </div>
    </div>
  );
}

function TaxonomySection({
  kind,
  title,
  description,
  items,
}: {
  kind: "category" | "tag";
  title: string;
  description: string;
  items: Array<{ id: string; name: string; slug: string; description?: string }>;
}) {
  return (
    <section className="border border-line bg-white shadow-[0_16px_50px_rgba(16,38,29,.04)]">
      <div className="border-b border-line p-6">
        <p className="eyebrow text-terracotta">{kind === "category" ? "Primary shelves" : "Topic labels"}</p>
        <h2 className="mt-2 font-display text-3xl font-medium">{title}</h2>
        <p className="mt-2 text-xs leading-6 text-stone">{description}</p>
      </div>

      <form action={createTaxonomy.bind(null, kind)} className="grid gap-3 border-b border-line bg-cream/45 p-5 sm:grid-cols-[1fr_auto]">
        <div className="grid gap-2">
          <label className="text-[10px] font-bold uppercase tracking-[.12em] text-stone">
            New {kind}
          </label>
          <input
            name="name"
            required
            minLength={2}
            placeholder={kind === "category" ? "e.g. Pantry" : "e.g. Buying guide"}
            className="min-h-11 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-terracotta"
          />
          {kind === "category" && (
            <input
              name="description"
              placeholder="Short category description"
              className="min-h-10 rounded-xl border border-line bg-white px-3 text-xs outline-none focus:border-terracotta"
            />
          )}
        </div>
        <button className="inline-flex min-h-11 self-end items-center justify-center gap-2 rounded-full bg-ink px-5 text-[10px] font-bold uppercase tracking-[.1em] text-white">
          <Plus size={13} /> Create
        </button>
      </form>

      <div className="divide-y divide-line">
        {items.map((item) => (
          <article key={item.id} className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-display text-xl font-medium">{item.name}</p>
                <p className="mt-1 text-[10px] text-stone">/{item.slug}</p>
              </div>
              <span className="rounded-full bg-cream px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-stone">
                {kind}
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <form action={renameTaxonomy.bind(null, kind, item.id)} className="flex gap-2">
                <input
                  name="name"
                  defaultValue={item.name}
                  aria-label={`Rename ${item.name}`}
                  className="min-w-0 flex-1 rounded-lg border border-line bg-paper px-3 text-xs outline-none focus:border-terracotta"
                />
                <button className="rounded-full border border-line bg-white px-3 py-2 text-[9px] font-bold uppercase tracking-[.09em]">
                  Rename
                </button>
              </form>
              {items.length > 1 && (
                <form action={mergeTaxonomy.bind(null, kind, item.id)} className="flex gap-2">
                  <select
                    name="target_id"
                    aria-label={`Merge ${item.name} into`}
                    required
                    defaultValue=""
                    className="min-w-0 flex-1 rounded-lg border border-line bg-paper px-3 text-xs outline-none focus:border-terracotta"
                  >
                    <option value="" disabled>Merge into…</option>
                    {items.filter((target) => target.id !== item.id).map((target) => (
                      <option key={target.id} value={target.id}>{target.name}</option>
                    ))}
                  </select>
                  <button className="grid size-9 place-items-center rounded-full border border-line bg-white text-stone hover:text-terracotta" title="Merge">
                    <Merge size={13} />
                  </button>
                </form>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
