"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, Calculator, Sparkles, X } from "lucide-react";
import { useState } from "react";

export function FloatingSuggestions() {
  const pathname = usePathname();
  const [dismissedPath, setDismissedPath] = useState<string | null>(null);
  const isHome = pathname === "/";
  const isArticle = pathname.startsWith("/blog/");
  const visible = dismissedPath !== pathname;

  if ((!isHome && !isArticle) || !visible) return null;

  return (
    <aside
      className="floating-suggestions"
      aria-label="Suggested places to explore"
    >
      <button
        type="button"
        onClick={() => setDismissedPath(pathname)}
        className="floating-suggestions-close"
        aria-label="Dismiss suggestions"
      >
        <X size={14} />
      </button>

      <div className="flex items-center gap-2 pr-7">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-terracotta/12 text-terracotta">
          <Sparkles size={14} />
        </span>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[.16em] text-terracotta">
            {isArticle ? "Your next healthy step" : "Start exploring"}
          </p>
          <p className="mt-0.5 font-display text-base font-medium text-ink">
            {isArticle ? "Keep the good momentum." : "What feels useful today?"}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link href="/blog" className="floating-suggestion-link">
          <BookOpenText size={15} />
          Read blogs
        </Link>
        <Link
          href="/health-calculators"
          className="floating-suggestion-link floating-suggestion-link-primary"
        >
          <Calculator size={15} />
          Calculator
        </Link>
      </div>
    </aside>
  );
}
