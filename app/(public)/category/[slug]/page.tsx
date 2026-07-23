import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/blog/post-card";
import { getCategoryBySlug, getPublishedPosts } from "@/lib/posts";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: `${category.name} Guides`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  const { posts } = await getPublishedPosts({ category: slug, pageSize: 24 });

  return (
    <>
      <section className="border-b border-line bg-cream">
        <div className="container-wide py-16 md:py-22">
          <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-bold text-stone hover:text-ink">
            <ArrowLeft size={14} /> All guides
          </Link>
          <div className="mt-10 grid gap-5 md:grid-cols-[1fr_.65fr] md:items-end">
            <div>
              <p className="eyebrow text-terracotta">KitchenWareHelp library</p>
              <h1 className="mt-3 font-display text-5xl font-semibold tracking-[-.05em] md:text-7xl">
                {category.name}
              </h1>
            </div>
            <p className="max-w-lg text-sm leading-7 text-stone md:pb-2">
              {category.description}
            </p>
          </div>
        </div>
      </section>
      <section className="container-wide py-12 md:py-16">
        <p className="mb-7 text-xs font-bold uppercase tracking-[.12em] text-stone">
          {posts.length} {posts.length === 1 ? "guide" : "guides"}
        </p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </>
  );
}
