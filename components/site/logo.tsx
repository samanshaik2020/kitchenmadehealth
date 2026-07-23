import Link from "next/link";
import { HeartPulse } from "lucide-react";
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
      <span className="grid size-9 place-items-center rounded-full bg-sage-dark text-white shadow-[0_8px_20px_rgba(49,92,71,.18)] transition-transform group-hover:scale-105">
        <HeartPulse size={18} strokeWidth={1.8} />
      </span>
      {!compact && (
        <span
          className={cn(
            "font-display font-semibold tracking-[-.025em]",
            small ? "text-base" : "text-xl",
          )}
        >
          Kitchen Made <span className="text-terracotta">Health</span>
        </span>
      )}
    </Link>
  );
}
