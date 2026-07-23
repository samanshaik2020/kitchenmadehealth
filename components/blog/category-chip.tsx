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
        "inline-flex rounded-full border border-white/45 bg-paper/90 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.16em] text-ink shadow-sm backdrop-blur-md transition hover:bg-white",
        className,
      )}
    >
      {name}
    </Link>
  );
}
