import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PostCard } from "@/components/blog/post-card";
import { getCategories, getPublishedPosts } from "@/lib/posts";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Kitchen Guides & Reviews",
  description:
    "Browse honest kitchenware reviews, practical buying guides, and useful care advice.",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = 9;
  const [{ posts, count }, categories] = await Promise.all([
    getPublishedPosts({ category: query.category, page, pageSize }),
    getCategories(),
  ]);
  const pages = Math.max(1, Math.ceil(count / pageSize));

  function pageHref(nextPage: number) {
    const params = new URLSearchParams();
    if (query.category) params.set("category", query.category);
    if (nextPage > 1) params.set("page", String(nextPage));
    const suffix = params.toString();
    return `/blog${suffix ? `?${suffix}` : ""}`;
  }

  return (
    <>
      <section className="border-b border-line bg-cream">
        <div className="container-wide py-16 text-center md:py-24">
          <p className="eyebrow text-terracotta">The kitchen library</p>
          <h1 className="mx-auto mt-4 max-w-3xl font-display text-5xl font-semibold tracking-[-.05em] md:text-7xl">
            Guides for a better working kitchen
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-stone">
            Clear answers, honest reviews, and thoughtful advice for every tool
            in your kitchen.
          </p>
        </div>
      </section>
      <section className="container-wide py-12 md:py-16">
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          <Link
            href="/blog"
            className={cn(
              "rounded-full border px-4 py-2 text-xs font-bold transition",
              !query.category
                ? "border-ink bg-ink text-white"
                : "border-line bg-white text-stone hover:border-ink hover:text-ink",
            )}
          >
            All guides
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/blog?category=${category.slug}`}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-bold transition",
                query.category === category.slug
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-white text-stone hover:border-ink hover:text-ink",
              )}
            >
              {category.name}
            </Link>
          ))}
        </div>
        {posts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-line bg-white p-16 text-center">
            <h2 className="font-display text-3xl font-semibold">Nothing on this shelf yet</h2>
            <p className="mt-3 text-sm text-stone">Try another category or check back soon.</p>
          </div>
        )}
        {pages > 1 && (
          <nav className="mt-12 flex items-center justify-center gap-3" aria-label="Pagination">
            <Link
              href={pageHref(Math.max(1, page - 1))}
              aria-disabled={page === 1}
              className={cn(
                "inline-flex size-11 items-center justify-center rounded-full border border-line bg-white",
                page === 1 && "pointer-events-none opacity-40",
              )}
            >
              <ArrowLeft size={17} />
            </Link>
            <span className="px-3 text-xs font-bold text-stone">Page {page} of {pages}</span>
            <Link
              href={pageHref(Math.min(pages, page + 1))}
              aria-disabled={page === pages}
              className={cn(
                "inline-flex size-11 items-center justify-center rounded-full border border-line bg-white",
                page === pages && "pointer-events-none opacity-40",
              )}
            >
              <ArrowRight size={17} />
            </Link>
          </nav>
        )}
      </section>
    </>
  );
}
