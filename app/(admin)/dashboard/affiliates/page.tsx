import Link from "next/link";
import { ExternalLink, MousePointerClick, Plus, ShoppingBag, Trash2 } from "lucide-react";
import {
  deleteAffiliate,
  toggleAffiliate,
} from "@/app/(admin)/dashboard/actions";
import { AdminPageHeader } from "@/components/admin/page-header";
import { getAffiliateLinks } from "@/lib/admin-data";

export default async function AffiliatesPage() {
  const links = await getAffiliateLinks();
  const clicks = links.reduce((sum, link) => sum + link.click_count, 0);

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-7 lg:p-10">
      <AdminPageHeader
        eyebrow="Commerce with context"
        title="Affiliate links"
        description="Manage the products mentioned in your guides. Every public button runs through a first-party redirect so clicks are counted without exposing tracking logic in the article."
        icon={ShoppingBag}
        action={
          <Link
            href="/dashboard/posts/new"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-terracotta px-5 text-[10px] font-bold uppercase tracking-[.1em] text-white"
          >
            <Plus size={13} /> Add through editor
          </Link>
        }
      />

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Stat label="Managed links" value={links.length} />
        <Stat label="Active links" value={links.filter((link) => link.active).length} />
        <Stat label="Tracked clicks" value={clicks} icon={<MousePointerClick size={16} />} />
      </div>

      <section className="mt-6 overflow-hidden border border-line bg-white">
        <div className="border-b border-line p-6">
          <p className="eyebrow text-terracotta">Product directory</p>
          <h2 className="mt-2 font-display text-3xl font-medium">All affiliate products</h2>
        </div>
        {links.length ? (
          <div className="divide-y divide-line">
            {links.map((link) => (
              <article key={link.id} className="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-xl font-medium">{link.product_name}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.1em] ${link.active ? "bg-sage/20 text-sage-dark" : "bg-cream text-stone"}`}>
                      {link.active ? "Active" : "Paused"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-stone">
                    {link.merchant} · {link.click_count} clicks
                    {link.post?.title ? ` · ${link.post.title}` : ""}
                  </p>
                  <a
                    href={link.destination_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex max-w-xl items-center gap-1 truncate text-[10px] text-terracotta"
                  >
                    {link.destination_url} <ExternalLink size={10} />
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <form action={toggleAffiliate.bind(null, link.id, !link.active)}>
                    <button className="rounded-full border border-line px-4 py-2 text-[9px] font-bold uppercase tracking-[.1em]">
                      {link.active ? "Pause" : "Enable"}
                    </button>
                  </form>
                  <form action={deleteAffiliate.bind(null, link.id)}>
                    <button className="grid size-9 place-items-center rounded-full bg-red-50 text-red-700" title="Delete link">
                      <Trash2 size={13} />
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="p-14 text-center">
            <ShoppingBag className="mx-auto text-terracotta" size={24} />
            <h3 className="mt-4 font-display text-2xl font-medium">No product links yet</h3>
            <p className="mt-2 text-sm text-stone">Add products while editing a story.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon?: React.ReactNode }) {
  return (
    <article className="border border-line bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[.12em] text-stone">{label}</p>
        <span className="text-terracotta">{icon}</span>
      </div>
      <p className="mt-4 font-display text-4xl font-medium">{value.toLocaleString()}</p>
    </article>
  );
}
