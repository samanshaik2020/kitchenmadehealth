import { cn } from "@/lib/utils";

export function Badge({
  children,
  variant = "neutral",
  className,
}: {
  children: React.ReactNode;
  variant?: "neutral" | "published" | "scheduled" | "draft";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[.08em]",
        variant === "published" && "bg-sage/20 text-sage-dark",
        variant === "scheduled" && "bg-amber-100 text-amber-800",
        variant === "draft" && "bg-clay text-brown",
        variant === "neutral" && "bg-cream text-stone",
        className,
      )}
    >
      {children}
    </span>
  );
}
