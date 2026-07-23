import Link from "next/link";
import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  compact = false,
  inverse = false,
  small = false,
}: {
  compact?: boolean;
  inverse?: boolean;
  small?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2.5",
        inverse ? "text-white" : "text-ink",
      )}
      aria-label="KitchenMadeHealth home"
    >
      <span
        className={cn(
          "grid size-10 place-items-center rounded-full border transition-transform group-hover:rotate-[-8deg] group-hover:scale-105",
          inverse
            ? "border-white/25 bg-white/10 text-cream"
            : "border-ink/15 bg-ink text-cream",
        )}
      >
        <Leaf size={17} strokeWidth={1.6} />
      </span>
      {!compact && (
        <span
          className={cn(
            "font-display font-medium tracking-[-.035em]",
            small ? "text-base" : "text-[1.35rem]",
          )}
        >
          Kitchen Made <span className={inverse ? "text-sage" : "text-terracotta"}>Health</span>
        </span>
      )}
    </Link>
  );
}
