import Link from "next/link";
import { Eye, MousePointerClick, Package, Plus, Star } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductRowActions } from "@/components/admin/product-row-actions";
import { UserCoverImage } from "@/components/ui/user-cover-image";
import { getDashboardProducts } from "@/lib/products";

export default async function ProductsDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; saved?: string }>;
}) {
  const [products, query] = await Promise.all([getDashboardProducts(), searchParams]);
  const totalClicks = products.reduce((sum, product) => sum + product.click_count, 0);

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-7 lg:p-10">
      <AdminPageHeader
        eyebrow="Curated commerce"
        title="Products"
        description="Build the public product shelf with a photo, concise details, displayed price, and a tracked affiliate button. Products stay independent from article-specific links."
        icon={Package}
        action={
          <Link
            href="/dashboard/products/new"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-terracotta px-5 text-[10px] font-bold uppercase tracking-[.1em] text-white"
          >
            <Plus size={13} /> Add product
          </Link>
        }
      />

      {(query.created || query.saved) && (
        <div className="mt-6 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {query.created ? "Product added to the catalog." : "Product changes saved."}
        </div>
      )}

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Stat label="Catalog products" value={products.length} icon={<Package size={16} />} />
        <Stat
          label="Publicly visible"
          value={products.filter((product) => product.active).length}
          icon={<Eye size={16} />}
        />
        <Stat label="Product clicks" value={totalClicks} icon={<MousePointerClick size={16} />} />
      </div>

      <section className="mt-6 overflow-hidden border border-line bg-white">
        <div className="flex items-end justify-between gap-4 border-b border-line p-6">
          <div>
            <p className="eyebrow text-terracotta">Public shelf</p>
            <h2 className="mt-2 font-display text-3xl font-medium">All products</h2>
          </div>
          <Link
            href="/products"
            target="_blank"
            className="text-[9px] font-bold uppercase tracking-[.12em] text-stone hover:text-terracotta"
          >
            View live page ↗
          </Link>
        </div>

        {products.length ? (
          <div className="divide-y divide-line">
            {products.map((product) => (
              <article
                key={product.id}
                className="grid gap-5 p-5 md:grid-cols-[5.5rem_minmax(0,1fr)_auto] md:items-center"
              >
                <div className="relative aspect-square overflow-hidden bg-cream">
                  <UserCoverImage
                    src={product.image_url}
                    alt={product.image_alt ?? product.name}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-xl font-medium">{product.name}</h3>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-[.1em] ${
                        product.active
                          ? "bg-sage/20 text-sage-dark"
                          : "bg-cream text-stone"
                      }`}
                    >
                      {product.active ? "Visible" : "Hidden"}
                    </span>
                    {product.featured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[.1em] text-amber-800">
                        <Star size={9} /> Featured
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-semibold text-ink">{product.price}</p>
                  <p className="mt-1 line-clamp-2 max-w-2xl text-xs leading-5 text-stone">
                    {product.details}
                  </p>
                  <p className="mt-2 text-[9px] font-bold uppercase tracking-[.12em] text-stone">
                    {product.click_count.toLocaleString()} clicks · order {product.sort_order}
                  </p>
                </div>
                <ProductRowActions product={product} />
              </article>
            ))}
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <Package className="mx-auto text-terracotta" size={26} />
            <h3 className="mt-4 font-display text-3xl font-medium">Your product shelf is empty</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-stone">
              Add a photo, name, short details, price, and affiliate destination.
              The public card is created automatically.
            </p>
            <Link
              href="/dashboard/products/new"
              className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-[10px] font-bold uppercase tracking-[.1em] text-white"
            >
              <Plus size={13} /> Add the first product
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
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
