import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/blog/post-card";
import { getCategories, getCategoryBySlug, getPublishedPosts } from "@/lib/posts";

type PageProps = { params: Promise<{ slug: string }> };

export const revalidate = 300;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

const categoryArt: Record<string, string> = {
  "diabetes-blood-sugar":
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1800&q=88",
  knives:
    "https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=1800&q=88",
  appliances:
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1800&q=88",
  "home-remedies":
    "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=1800&q=88",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: `${category.name} Stories`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const [category, { posts }] = await Promise.all([
    getCategoryBySlug(slug),
    getPublishedPosts({ category: slug, pageSize: 24 }),
  ]);
  if (!category) notFound();
  const heroImage = categoryArt[slug] ?? "/images/kitchen-made-health-hero.webp";

  return (
    <>
      <section className="grid min-h-[34rem] bg-[#0d281e] text-white lg:grid-cols-[.9fr_1.1fr]">
        <div className="order-2 flex items-end px-6 py-14 md:px-12 lg:order-1 lg:px-[max(3rem,calc((100vw-1260px)/2))]">
          <div className="max-w-2xl">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.15em] text-white/55 transition hover:text-white"
            >
              <ArrowLeft size={13} /> The journal
            </Link>
            <p className="eyebrow mt-12 text-sage">Kitchen chapter</p>
            <h1 className="mt-5 font-display text-6xl font-medium leading-[.9] tracking-[-.06em] md:text-8xl">
              {category.name}
            </h1>
            <p className="mt-7 max-w-lg text-sm leading-7 text-white/62">
              {category.description}
            </p>
          </div>
        </div>
        <div className="order-1 relative min-h-[25rem] overflow-hidden lg:order-2">
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d281e]/65 via-transparent to-transparent lg:block" />
          <div className="absolute bottom-6 right-6 grid size-24 place-items-center rounded-full border border-white/40 bg-black/15 text-center text-[9px] font-bold uppercase tracking-[.15em] backdrop-blur">
            The good
            <br />
            kitchen
          </div>
        </div>
      </section>

      <section className="container-wide py-16 md:py-24">
        <div className="mb-12 flex items-end justify-between border-b border-line pb-7">
          <div>
            <p className="eyebrow text-terracotta">Explore the chapter</p>
            <h2 className="mt-3 font-display text-4xl font-medium tracking-[-.045em] md:text-5xl">
              {posts.length} {posts.length === 1 ? "story" : "stories"} to begin
            </h2>
          </div>
          <Link
            href="/blog"
            className="hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[.13em] sm:inline-flex"
          >
            All chapters <ArrowUpRight size={14} />
          </Link>
        </div>
        {posts.length > 0 ? (
          <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <PostCard key={post.id} post={post} index={index + 1} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-line bg-cream/40 p-14 text-center">
            <p className="font-display text-3xl">This chapter is still being written.</p>
            <Link href="/blog" className="mt-5 inline-flex items-center gap-2 text-sm font-bold">
              Explore all stories <ArrowUpRight size={15} />
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
