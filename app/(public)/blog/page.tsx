import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Search } from "lucide-react";
import { redirect } from "next/navigation";
import { PostCard } from "@/components/blog/post-card";
import { getCategories, getPublishedPosts } from "@/lib/posts";
import { cn } from "@/lib/utils";
import { journalHref, normalizeSearchQuery, parsePage } from "@/lib/article-search";
import { DEFAULT_SOCIAL_IMAGE } from "@/lib/site-config";

type SearchParams = { category?: string; page?: string; q?: string };

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const query = await searchParams;
  const q = normalizeSearchQuery(query.q);
  const category = typeof query.category === "string" && /^[a-z0-9-]+$/.test(query.category) ? query.category : undefined;
  const path = journalHref({ category, q, page: parsePage(query.page) });
  return {
  title: "The Journal",
  description:
    "Explore thoughtful stories about healthier cooking, considered kitchen tools, and nourishing everyday rituals.",
  alternates: { canonical: path },
  robots: q ? { index: false, follow: true } : undefined,
  openGraph: { title: "The Journal", description: "Practical food and wellbeing guides from Kitchen Made Health.", url: path, images: [DEFAULT_SOCIAL_IMAGE] },
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const query = await searchParams;
  const page = parsePage(query.page);
  const q = normalizeSearchQuery(query.q);
  const category = typeof query.category === "string" && /^[a-z0-9-]+$/.test(query.category) ? query.category : undefined;
  const pageSize = 9;
  const [{ posts, count }, categories] = await Promise.all([
    getPublishedPosts({ category, q, page, pageSize }),
    getCategories(),
  ]);
  const pages = Math.max(1, Math.ceil(count / pageSize));
  if (page > pages) redirect(journalHref({ category, q, page: pages }));

  function pageHref(nextPage: number) {
    return journalHref({ category, q, page: nextPage });
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

      <section id="article-search" className="scroll-mt-24 border-b border-line bg-cream">
        <form action="/blog" method="get" className="container-wide flex flex-col gap-3 pt-7 sm:flex-row sm:items-end" role="search">
          {category && <input type="hidden" name="category" value={category} />}
          <div className="flex-1">
            <label htmlFor="journal-search" className="mb-2 block text-sm font-semibold">Search the journal</label>
            <input id="journal-search" name="q" type="search" maxLength={100} defaultValue={q} placeholder="Try blood sugar, sleep, or nutrition" className="min-h-12 w-full rounded-xl border border-line bg-paper px-4 text-base" />
          </div>
          <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink px-6 text-sm font-bold text-white"><Search size={17} />Search</button>
          {q && <Link className="inline-flex min-h-12 items-center px-3 text-sm font-semibold underline underline-offset-4" href={journalHref({ category })}>Clear search</Link>}
        </form>
        <div className="container-wide flex flex-wrap items-center gap-x-2 gap-y-3 py-5">
          <span className="mr-3 text-[9px] font-bold uppercase tracking-[.18em] text-stone">
            Browse by
          </span>
          <Link
            href={journalHref({ q })}
            className={cn(
              "rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[.11em] transition",
              !category
                ? "border-ink bg-ink text-white"
                : "border-line bg-paper text-stone hover:border-ink hover:text-ink",
            )}
          >
            All stories
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={journalHref({ category: category.slug, q })}
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
              {q ? `Results for “${q}”` : category ? "Selected shelf" : "The latest edition"}
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
            <h2 className="font-display text-3xl font-medium">{q ? "No matching stories" : "Nothing on this shelf yet"}</h2>
            <p className="mt-3 text-sm text-stone">{q ? "Try fewer words, another topic, or clear the category filter." : "Try another chapter or return again soon."}</p>
            <Link className="mt-5 inline-block font-semibold underline underline-offset-4" href="/blog#article-search">Browse all stories</Link>
          </div>
        )}

        {pages > 1 && (
          <nav className="mt-16 flex items-center justify-center gap-4" aria-label="Pagination">
            {page > 1 ? <Link
              href={pageHref(Math.max(1, page - 1))}
              aria-label="Previous page"
              className={cn(
                "grid size-12 place-items-center rounded-full border border-line bg-cream transition hover:border-ink",
                page === 1 && "pointer-events-none opacity-35",
              )}
            >
              <ArrowLeft size={16} />
            </Link> : <span aria-hidden="true" className="grid size-12 place-items-center rounded-full border border-line opacity-40"><ArrowLeft size={16} /></span>}
            <span className="text-[10px] font-bold uppercase tracking-[.15em] text-stone">
              Page {page} of {pages}
            </span>
            {page < pages ? <Link
              href={pageHref(Math.min(pages, page + 1))}
              aria-label="Next page"
              className={cn(
                "grid size-12 place-items-center rounded-full border border-line bg-cream transition hover:border-ink",
                page === pages && "pointer-events-none opacity-35",
              )}
            >
              <ArrowRight size={16} />
            </Link> : <span aria-hidden="true" className="grid size-12 place-items-center rounded-full border border-line opacity-40"><ArrowRight size={16} /></span>}
          </nav>
        )}
      </section>
    </>
  );
}
