import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { CategoryChip } from "@/components/blog/category-chip";
import type { Post } from "@/lib/types";
import { cn, formatDate, readingTime } from "@/lib/utils";

export function PostCard({
  post,
  featured = false,
}: {
  post: Post;
  featured?: boolean;
}) {
  return (
    <article
      className={cn(
        "group overflow-hidden rounded-[1.5rem] border border-line bg-white shadow-[0_12px_40px_rgba(56,43,35,.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(56,43,35,.1)]",
        featured && "grid min-h-[29rem] md:grid-cols-[1.2fr_.8fr]",
      )}
    >
      <Link
        href={`/blog/${post.slug}`}
        className={cn(
          "relative block aspect-[4/3] overflow-hidden bg-clay",
          featured && "md:aspect-auto",
        )}
        aria-label={`Read ${post.title}`}
      >
        {post.cover_image_url && (
          <Image
            src={post.cover_image_url}
            alt=""
            fill
            className="object-cover transition duration-700 group-hover:scale-[1.035]"
            sizes={featured ? "(max-width: 768px) 100vw, 60vw" : "(max-width: 768px) 100vw, 33vw"}
          />
        )}
        {post.category && (
          <CategoryChip
            name={post.category.name}
            slug={post.category.slug}
            className="absolute left-5 top-5"
          />
        )}
      </Link>
      <div className={cn("flex flex-col p-6", featured && "justify-center p-7 md:p-10")}>
        <div className="mb-4 flex items-center gap-3 text-xs font-medium text-stone">
          <span>{formatDate(post.published_at, "short")}</span>
          <span className="size-1 rounded-full bg-line" />
          <span className="flex items-center gap-1.5">
            <Clock3 size={13} /> {readingTime(post.content)} min read
          </span>
        </div>
        <h2
          className={cn(
            "font-display text-[1.65rem] font-semibold leading-[1.1] tracking-[-.035em] text-ink",
            featured && "text-3xl md:text-[2.45rem]",
          )}
        >
          <Link href={`/blog/${post.slug}`} className="transition hover:text-terracotta">
            {post.title}
          </Link>
        </h2>
        <p className="mt-4 line-clamp-3 text-[15px] leading-7 text-stone">
          {post.excerpt}
        </p>
        <Link
          href={`/blog/${post.slug}`}
          className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-terracotta"
        >
          Read the guide
          <ArrowUpRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
      </div>
    </article>
  );
}
