import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { CategoryChip } from "@/components/blog/category-chip";
import { UserCoverImage } from "@/components/ui/user-cover-image";
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
        "group overflow-hidden rounded-[2rem] border border-line bg-white shadow-[0_14px_45px_rgba(23,59,46,.06)] transition duration-300 hover:-translate-y-1.5 hover:border-sage/60 hover:shadow-[0_24px_60px_rgba(23,59,46,.12)]",
        featured && "grid min-h-[31rem] md:grid-cols-[1.15fr_.85fr]",
      )}
    >
      <div
        className={cn(
          "relative aspect-[4/3] overflow-hidden bg-clay",
          featured && "md:aspect-auto",
        )}
      >
        <Link
          href={`/blog/${post.slug}`}
          className="absolute inset-0"
          aria-label={`Read ${post.title}`}
        >
          {post.cover_image_url && (
            <UserCoverImage
              src={post.cover_image_url}
              alt=""
              className="object-cover transition duration-700 group-hover:scale-[1.035]"
            />
          )}
        </Link>
        {post.category && (
          <CategoryChip
            name={post.category.name}
            slug={post.category.slug}
            className="absolute left-5 top-5 z-10"
          />
        )}
      </div>
      <div className={cn("flex flex-col p-6 md:p-7", featured && "justify-center p-7 md:p-11")}>
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
          className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-sage-dark"
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
