import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, PackageOpen, ShieldCheck, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import { getPublishedProducts } from "@/lib/products";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Thoughtful Kitchen Products",
  description:
    "A considered collection of kitchen and everyday wellness products selected by Kitchen Made Health.",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage() {
  const products = await getPublishedProducts();

  return (
    <>
      <section className="grain relative overflow-hidden bg-[#0d281e] text-white">
        <div className="pointer-events-none absolute -right-32 -top-40 size-[42rem] rounded-full border border-white/[.05]" />
        <div className="pointer-events-none absolute right-10 top-10 size-[24rem] rounded-full border border-white/[.05]" />
        <div className="container-wide relative z-10 grid min-h-[33rem] items-end gap-10 py-16 md:grid-cols-[1fr_.55fr] md:py-20">
          <div>
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.2em] text-sage">
              <span className="h-px w-9 bg-terracotta" />
              Considered tools for everyday life
            </div>
            <h1 className="mt-7 max-w-4xl font-display text-6xl font-medium leading-[.88] tracking-[-.065em] md:text-[7.2rem]">
              Fewer things. <span className="italic text-sage">Better chosen.</span>
            </h1>
          </div>
          <div className="border-l border-white/18 pl-6 md:mb-2">
            <PackageOpen className="text-terracotta" size={25} strokeWidth={1.5} />
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/62">
              Useful products presented with the essential details first: what
              they are, why they may help, what they cost, and where to learn more.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-cream">
        <div className="container-wide flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 shrink-0 text-terracotta" size={17} />
            <p className="max-w-3xl text-xs leading-6 text-stone">
              Some product buttons are affiliate links. Kitchen Made Health may
              earn a commission at no additional cost to you. Selection is based
              on usefulness and editorial fit, not commission rate.
            </p>
          </div>
          <span className="shrink-0 text-[9px] font-bold uppercase tracking-[.15em] text-stone">
            {products.length} {products.length === 1 ? "selection" : "selections"}
          </span>
        </div>
      </section>

      <section className="container-wide py-16 md:py-24">
        <div className="mb-12 grid gap-5 border-b border-line pb-8 md:grid-cols-[1fr_.6fr] md:items-end">
          <div>
            <p className="eyebrow text-terracotta">The product shelf</p>
            <h2 className="mt-4 max-w-3xl font-display text-5xl font-medium tracking-[-.055em] md:text-6xl">
              Tools that earn their place.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-stone md:pb-1">
            Image-led, concise, and easy to compare. Prices are displayed as
            entered and may change on the retailer&apos;s website.
          </p>
        </div>

        {products.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index + 1}
                featured={index === 0 && product.featured}
              />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-line bg-cream/35 px-6 py-20 text-center">
            <Sparkles className="mx-auto text-terracotta" size={25} />
            <h2 className="mt-5 font-display text-3xl font-medium">The shelf is being prepared.</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-stone">
              Thoughtful product selections will appear here as they are added by
              the editor.
            </p>
            <Link
              href="/blog"
              className="mt-7 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] text-ink"
            >
              Explore the journal <ArrowUpRight size={14} />
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
