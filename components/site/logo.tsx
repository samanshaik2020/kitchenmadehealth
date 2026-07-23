import Link from "next/link";
import { ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  compact = false,
  inverse = false,
}: {
  compact?: boolean;
  inverse?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2.5",
        inverse ? "text-white" : "text-ink",
      )}
      aria-label="KitchenWareHelp home"
    >
      <span className="grid size-9 place-items-center rounded-full bg-terracotta text-white transition-transform group-hover:-rotate-6">
        <ChefHat size={19} strokeWidth={1.8} />
      </span>
      {!compact && (
        <span className="font-display text-xl font-semibold tracking-[-.025em]">
          KitchenWare<span className="text-terracotta">Help</span>
        </span>
      )}
    </Link>
  );
}
