import Link from "next/link";
import { cn } from "@/lib/utils";

export function CategoryChip({
  name,
  slug,
  className,
}: {
  name: string;
  slug: string;
  className?: string;
}) {
  return (
    <Link
      href={`/category/${slug}`}
      className={cn(
        "inline-flex rounded-full bg-paper/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.11em] text-terracotta shadow-sm backdrop-blur-sm transition hover:bg-white",
        className,
      )}
    >
      {name}
    </Link>
  );
}
