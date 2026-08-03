import Link from "next/link";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import { UserCoverImage } from "@/components/ui/user-cover-image";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  featured = false,
  index,
}: {
  product: Product;
  featured?: boolean;
  index: number;
}) {
  return (
    <article
      className={cn(
        "group overflow-hidden border border-ink/10 bg-white shadow-[0_20px_65px_rgba(16,38,29,.08)]",
        featured && "lg:col-span-2 lg:grid lg:grid-cols-[1.08fr_.92fr]",
      )}
    >
      <div
        className={cn(
          "relative aspect-[4/3] overflow-hidden bg-[#e9e1d2]",
          featured && "lg:aspect-auto lg:min-h-[34rem]",
        )}
      >
        <UserCoverImage
          src={product.image_url}
          alt={product.image_alt ?? product.name}
          className="object-cover transition duration-700 group-hover:scale-[1.035]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent" />
        <span className="absolute left-4 top-4 rounded-full border border-white/45 bg-paper/90 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-ink backdrop-blur">
          {product.featured ? "Editor's pick" : `Selection ${String(index).padStart(2, "0")}`}
        </span>
      </div>

      <div className={cn("flex flex-col p-6 sm:p-7", featured && "justify-center lg:p-12")}>
        <div className="flex items-center justify-between gap-4">
          <p className="eyebrow text-terracotta">Kitchen selection</p>
          {product.featured && (
            <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[.12em] text-sage-dark">
              <BadgeCheck size={14} /> Featured
            </span>
          )}
        </div>
        <h2
          className={cn(
            "mt-5 font-display text-3xl font-medium leading-[1.05] tracking-[-.045em]",
            featured && "sm:text-5xl",
          )}
        >
          {product.name}
        </h2>
        <p className="mt-4 text-sm leading-7 text-stone">{product.details}</p>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[.16em] text-stone">Price</p>
            <p className="mt-1 font-display text-3xl font-medium tracking-[-.04em] text-ink">
              {product.price}
            </p>
          </div>
          <Link
            href={`/shop/${product.id}`}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            className="inline-flex min-h-12 items-center gap-3 rounded-full bg-ink px-6 text-[10px] font-bold uppercase tracking-[.11em] text-white transition hover:-translate-y-0.5 hover:bg-terracotta"
            aria-label={`${product.button_label}: ${product.name}`}
          >
            {product.button_label} <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
