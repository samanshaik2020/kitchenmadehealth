import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { PostCard } from "@/components/blog/post-card";
import { getCategories, getPublishedPosts } from "@/lib/posts";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "The Journal",
  description:
    "Explore thoughtful stories about healthier cooking, considered kitchen tools, and nourishing everyday rituals.",
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
      <section className="grain relative overflow-hidden bg-[#0d281e] text-white">
        <Image
          src="/images/kitchen-made-health-hero.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-right opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b261c] via-[#0b261c]/95 to-[#0b261c]/30" />
        <div className="container-wide relative z-10 grid min-h-[31rem] items-end gap-10 py-14 md:grid-cols-[1fr_.55fr] md:py-20">
          <div>
            <p className="eyebrow text-sage">The Kitchen Made Health journal</p>
            <h1 className="mt-6 max-w-4xl font-display text-6xl font-medium leading-[.88] tracking-[-.065em] md:text-[7.5rem]">
              Good things,{" "}
              <span className="outline-type italic">well considered.</span>
            </h1>
          </div>
          <div className="border-l border-white/20 pl-6 md:mb-2">
            <BookOpen className="text-terracotta" size={24} strokeWidth={1.5} />
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/62">
              Field notes, honest reviews, and useful rituals for a kitchen
              that nourishes more than appetite.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-cream">
        <div className="container-wide flex flex-wrap items-center gap-x-2 gap-y-3 py-5">
          <span className="mr-3 text-[9px] font-bold uppercase tracking-[.18em] text-stone">
            Browse by
          </span>
          <Link
            href="/blog"
            className={cn(
              "rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[.11em] transition",
              !query.category
                ? "border-ink bg-ink text-white"
                : "border-line bg-paper text-stone hover:border-ink hover:text-ink",
            )}
          >
            All stories
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/blog?category=${category.slug}`}
              className={cn(
                "rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[.11em] transition",
                query.category === category.slug
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-paper text-stone hover:border-ink hover:text-ink",
              )}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="container-wide py-16 md:py-24">
        <div className="mb-12 flex items-end justify-between border-b border-line pb-7">
          <div>
            <p className="eyebrow text-terracotta">
              {query.category ? "Selected shelf" : "The latest edition"}
            </p>
            <h2 className="mt-3 font-display text-4xl font-medium tracking-[-.045em] md:text-5xl">
              {count} considered {count === 1 ? "story" : "stories"}
            </h2>
          </div>
          <p className="hidden font-display text-xl italic text-stone/65 sm:block">
            Read slowly. Keep what serves you.
          </p>
        </div>

        {posts.length > 0 ? (
          <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <PostCard key={post.id} post={post} index={(page - 1) * pageSize + index + 1} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-line bg-cream/40 p-16 text-center">
            <h2 className="font-display text-3xl font-medium">Nothing on this shelf yet</h2>
            <p className="mt-3 text-sm text-stone">Try another chapter or return again soon.</p>
          </div>
        )}

        {pages > 1 && (
          <nav className="mt-16 flex items-center justify-center gap-4" aria-label="Pagination">
            <Link
              href={pageHref(Math.max(1, page - 1))}
              aria-disabled={page === 1}
              className={cn(
                "grid size-12 place-items-center rounded-full border border-line bg-cream transition hover:border-ink",
                page === 1 && "pointer-events-none opacity-35",
              )}
            >
              <ArrowLeft size={16} />
            </Link>
            <span className="text-[10px] font-bold uppercase tracking-[.15em] text-stone">
              Page {page} of {pages}
            </span>
            <Link
              href={pageHref(Math.min(pages, page + 1))}
              aria-disabled={page === pages}
              className={cn(
                "grid size-12 place-items-center rounded-full border border-line bg-cream transition hover:border-ink",
                page === pages && "pointer-events-none opacity-35",
              )}
            >
              <ArrowRight size={16} />
            </Link>
          </nav>
        )}
      </section>
    </>
  );
}
