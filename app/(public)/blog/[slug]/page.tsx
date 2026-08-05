import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Clock3, ExternalLink, Leaf, ShoppingBag } from "lucide-react";
import { notFound } from "next/navigation";
import { CategoryChip } from "@/components/blog/category-chip";
import { PostCard } from "@/components/blog/post-card";
import { ShareButton } from "@/components/blog/share-button";
import { PostViewTracker } from "@/components/blog/post-view-tracker";
import { UserCoverImage } from "@/components/ui/user-cover-image";
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
  const supportingImages = [
    { url: post.supporting_image_1_url, alt: post.supporting_image_1_alt },
    { url: post.supporting_image_2_url, alt: post.supporting_image_2_alt },
  ].filter((image): image is { url: string; alt: string | null | undefined } => Boolean(image.url));

  return (
    <article>
      <PostViewTracker postId={post.id} />
      <header className="relative min-h-[calc(100svh-4.75rem)] overflow-hidden bg-[#0b241a] text-white">
        {post.cover_image_url && (
          <UserCoverImage
            src={post.cover_image_url}
            alt={post.cover_image_alt ?? ""}
            priority
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,22,15,.3)_0%,rgba(6,22,15,.25)_30%,rgba(6,22,15,.94)_100%)]" />
        <div className="container-wide relative z-10 flex min-h-[calc(100svh-4.75rem)] flex-col justify-between py-9 md:py-12">
          <Link
            href="/blog"
            className="inline-flex w-fit items-center gap-2 text-[10px] font-bold uppercase tracking-[.15em] text-white/65 transition hover:text-white"
          >
            <ArrowLeft size={13} /> Back to the journal
          </Link>

          <div className="max-w-5xl pb-5">
            {post.category && (
              <CategoryChip name={post.category.name} slug={post.category.slug} />
            )}
            <h1 className="text-balance mt-6 font-display text-[3.4rem] font-medium leading-[.94] tracking-[-.06em] sm:text-6xl md:text-[5.8rem]">
              {post.title}
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-white/68 md:text-base md:leading-8">
              {post.excerpt}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4 text-[9px] font-bold uppercase tracking-[.15em] text-white/55">
              <span>By Kitchen Made Health</span>
              <span className="h-px w-7 bg-white/30" />
              <span>{formatDate(post.published_at)}</span>
              <span className="h-px w-7 bg-white/30" />
              <span className="flex items-center gap-1.5">
                <Clock3 size={12} /> {readingTime(post.content)} min read
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container-wide grid gap-10 py-14 lg:grid-cols-[13rem_minmax(0,760px)_1fr] lg:py-24">
        <aside className="hidden lg:block">
          <div className="sticky top-32 border-t border-line pt-5">
            <p className="eyebrow text-terracotta">Field note</p>
            <p className="mt-4 text-xs leading-6 text-stone">
              Save this story for your next quiet moment in the kitchen.
            </p>
            <div className="mt-6">
              <ShareButton title={post.title} />
            </div>
          </div>
        </aside>

        <div>
          <div className="mb-10 flex items-center justify-between border-b border-line pb-5 lg:hidden">
            <p className="eyebrow text-stone">The story</p>
            <ShareButton title={post.title} />
          </div>
          <div className="article-content" dangerouslySetInnerHTML={{ __html: post.content }} />
          {supportingImages.length > 0 && (
            <section
              className={`mt-12 grid gap-4 ${supportingImages.length > 1 ? "sm:grid-cols-2" : ""}`}
              aria-label="Story gallery"
            >
              {supportingImages.map((image, index) => (
                <figure
                  key={image.url}
                  className="relative aspect-[4/3] overflow-hidden bg-cream shadow-[0_18px_48px_rgba(16,38,29,.08)]"
                >
                  <UserCoverImage
                    src={image.url}
                    alt={image.alt ?? `Supporting image ${index + 1} for ${post.title}`}
                    className="object-cover"
                  />
                </figure>
              ))}
            </section>
          )}
          {post.affiliate_links && post.affiliate_links.length > 0 && (
            <section className="mt-14 border-y border-line py-8">
              <div className="flex items-center gap-3">
                <ShoppingBag className="text-terracotta" size={20} strokeWidth={1.5} />
                <div>
                  <p className="eyebrow text-terracotta">Shop this guide</p>
                  <p className="mt-1 text-xs text-stone">
                    Useful products mentioned in this story. Some links may earn us a commission.
                  </p>
                </div>
              </div>
              <div className="mt-6 divide-y divide-line border-y border-line">
                {post.affiliate_links.map((link) => (
                  <div key={link.id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-display text-xl font-medium">{link.product_name}</h3>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-[.13em] text-stone">
                        {link.merchant}
                      </p>
                    </div>
                    <Link
                      href={`/go/${link.id}`}
                      target="_blank"
                      rel="nofollow sponsored noopener"
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-ink px-5 text-[10px] font-bold uppercase tracking-[.12em] text-white"
                    >
                      {link.button_label} <ExternalLink size={13} />
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}
          <div className="mt-16 border-y border-line py-8">
            <Leaf className="text-terracotta" size={21} strokeWidth={1.5} />
            <p className="eyebrow mt-5 text-terracotta">Our considered promise</p>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone">
              We recommend tools for how they perform in real kitchens. Our
              editorial opinions are independent, and we make the tradeoffs as
              visible as the benefits.
            </p>
          </div>
        </div>

        <div className="hidden lg:block">
          <p className="vertical-label ml-auto text-[9px] font-bold uppercase tracking-[.25em] text-stone/50">
            Kitchen Made Health · Journal
          </p>
        </div>
      </div>

      {relatedPosts.length > 0 && (
        <section className="bg-cream">
          <div className="container-wide py-16 md:py-24">
            <div className="mb-12 flex items-end justify-between border-b border-line pb-7">
              <div>
                <p className="eyebrow text-terracotta">Keep reading</p>
                <h2 className="mt-3 font-display text-5xl font-medium tracking-[-.05em]">
                  More from this shelf
                </h2>
              </div>
              <Link
                href="/blog"
                className="hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[.13em] sm:inline-flex"
              >
                All stories <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="grid gap-x-8 gap-y-12 md:grid-cols-3">
              {relatedPosts.map((item, index) => (
                <PostCard key={item.id} post={item} index={index + 1} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
