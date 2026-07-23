import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Clock3, Share2 } from "lucide-react";
import { notFound } from "next/navigation";
import { CategoryChip } from "@/components/blog/category-chip";
import { PostCard } from "@/components/blog/post-card";
import { demoPosts } from "@/lib/demo-data";
import { getPostBySlug, getPublishedPosts } from "@/lib/posts";
import { formatDate, readingTime } from "@/lib/utils";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return demoPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.seo_title ?? post.title,
    description: post.seo_description ?? post.excerpt,
    openGraph: {
      type: "article",
      title: post.seo_title ?? post.title,
      description: post.seo_description ?? post.excerpt ?? undefined,
      publishedTime: post.published_at ?? undefined,
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : [],
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const { posts: related } = await getPublishedPosts({
    category: post.category?.slug,
    pageSize: 4,
  });
  const relatedPosts = related.filter((item) => item.id !== post.id).slice(0, 3);

  return (
    <article>
      <header className="container-wide py-10 md:py-16">
        <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-bold text-stone hover:text-ink">
          <ArrowLeft size={14} /> Back to all guides
        </Link>
        <div className="mx-auto mt-10 max-w-4xl text-center">
          {post.category && (
            <CategoryChip name={post.category.name} slug={post.category.slug} className="bg-clay" />
          )}
          <h1 className="mt-6 font-display text-[2.75rem] font-semibold leading-[1.02] tracking-[-.055em] md:text-[4.8rem]">
            {post.title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-stone md:text-lg">
            {post.excerpt}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-stone">
            <span>By the KitchenWareHelp editors</span>
            <span className="size-1 rounded-full bg-line" />
            <span>{formatDate(post.published_at)}</span>
            <span className="size-1 rounded-full bg-line" />
            <span className="flex items-center gap-1.5"><Clock3 size={14} /> {readingTime(post.content)} min read</span>
          </div>
        </div>
      </header>

      {post.cover_image_url && (
        <div className="container-wide">
          <div className="relative aspect-[16/8.5] overflow-hidden rounded-[1.75rem] bg-clay">
            <Image src={post.cover_image_url} alt="" fill priority sizes="100vw" className="object-cover" />
          </div>
        </div>
      )}

      <div className="container-reading grid py-12 md:py-18">
        <div className="mb-9 flex items-center justify-between border-b border-line pb-5">
          <p className="eyebrow text-stone">The guide</p>
          <button className="inline-flex items-center gap-2 text-xs font-bold text-stone hover:text-ink" aria-label="Share article">
            <Share2 size={15} /> Share
          </button>
        </div>
        <div className="article-content" dangerouslySetInnerHTML={{ __html: post.content }} />
        <div className="mt-14 rounded-3xl bg-cream p-6 md:p-8">
          <p className="eyebrow text-terracotta">A note on our reviews</p>
          <p className="mt-3 text-sm leading-7 text-stone">
            We recommend tools for how they perform in real kitchens. Our editorial
            opinions are independent, and we explain the tradeoffs—not just the specs.
          </p>
        </div>
      </div>

      {relatedPosts.length > 0 && (
        <section className="border-t border-line bg-cream">
          <div className="container-wide py-14 md:py-20">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="eyebrow text-terracotta">Keep reading</p>
                <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-.04em]">More from this shelf</h2>
              </div>
              <Link href="/blog" className="hidden items-center gap-2 text-sm font-bold sm:inline-flex">
                All guides <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {relatedPosts.map((item) => <PostCard key={item.id} post={item} />)}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
