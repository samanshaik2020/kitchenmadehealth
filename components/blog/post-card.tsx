import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { UserCoverImage } from "@/components/ui/user-cover-image";
import type { Post } from "@/lib/types";
import { cn, formatDate, readingTime } from "@/lib/utils";

export function PostCard({
  post,
  featured = false,
  index,
}: {
  post: Post;
  featured?: boolean;
  index?: number;
}) {
  return (
    <article
      className={cn(
        "group",
        featured && "grid overflow-hidden bg-paper md:grid-cols-[1.15fr_.85fr]",
      )}
    >
      <Link
        href={`/blog/${post.slug}`}
        className={cn(
          "relative block aspect-[4/3] overflow-hidden bg-clay",
          featured && "min-h-[28rem] md:aspect-auto",
        )}
        aria-label={`Read ${post.title}`}
      >
        {post.cover_image_url && (
          <UserCoverImage
            src={post.cover_image_url}
            alt=""
            className="object-cover transition duration-700 group-hover:scale-[1.04]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent opacity-60" />
        {post.category && (
          <span className="absolute left-4 top-4 rounded-full border border-white/40 bg-paper/90 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.15em] text-ink backdrop-blur">
            {post.category.name}
          </span>
        )}
        <span className="absolute bottom-4 right-4 grid size-11 translate-y-3 place-items-center rounded-full bg-cream text-ink opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight size={16} />
        </span>
      </Link>

      <div className={cn("pt-6", featured && "flex flex-col justify-center p-8 md:p-12")}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-[.14em] text-stone">
            <span>{formatDate(post.published_at, "short")}</span>
            <span className="h-px w-6 bg-line" />
            <span className="flex items-center gap-1.5">
              <Clock3 size={11} /> {readingTime(post.content)} min
            </span>
          </div>
          {index && (
            <span className="font-display text-2xl italic text-terracotta/55">
              0{index}
            </span>
          )}
        </div>
        <h2
          className={cn(
            "mt-4 font-display text-[2rem] font-medium leading-[1.08] tracking-[-.045em] text-ink",
            featured && "text-4xl md:text-5xl",
          )}
        >
          <Link href={`/blog/${post.slug}`} className="transition hover:text-terracotta">
            {post.title}
          </Link>
        </h2>
        <p className="mt-4 line-clamp-3 text-sm leading-7 text-stone">{post.excerpt}</p>
        <Link
          href={`/blog/${post.slug}`}
          className="mt-6 inline-flex w-fit items-center gap-2 border-b border-ink/40 pb-1.5 text-[10px] font-bold uppercase tracking-[.13em] text-ink transition hover:border-terracotta hover:text-terracotta"
        >
          Read the guide
          <ArrowUpRight
            size={14}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
      </div>
    </article>
  );
}
