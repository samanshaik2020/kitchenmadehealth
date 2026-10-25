"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, Calculator, X } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

const storageKey = "kmh-suggestions-dismissed";
const eventName = "kmh-suggestions-change";

function subscribe(listener: () => void) {
  window.addEventListener(eventName, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(eventName, listener);
    window.removeEventListener("storage", listener);
  };
}

function isDismissed() {
  try { return sessionStorage.getItem(storageKey) === "1"; } catch { return false; }
}

export function FloatingSuggestions() {
  const pathname = usePathname();
  const savedDismissal = useSyncExternalStore(subscribe, isDismissed, () => false);
  const [dismissed, setDismissed] = useState(false);
  if ((pathname !== "/" && !pathname.startsWith("/blog/")) || savedDismissal || dismissed) return null;

  function dismiss() {
    setDismissed(true);
    try { sessionStorage.setItem(storageKey, "1"); } catch { /* Local dismissal still works. */ }
    window.dispatchEvent(new Event(eventName));
  }

  return (
    <aside
      className="border-t border-line bg-cream"
      aria-label="Suggested places to explore"
    >
      <div className="container-wide relative py-8 pr-12">
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-0 top-5 grid size-11 place-items-center rounded-full text-stone hover:bg-paper"
        aria-label="Dismiss suggestions"
      >
        <X size={18} />
      </button>

      <p className="eyebrow text-terracotta">Keep exploring</p>
      <p className="mt-3 font-display text-2xl text-ink">Find your next useful step.</p>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/blog" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/25 px-5 text-sm font-semibold">
          <BookOpenText size={16} />
          Read the journal
        </Link>
        <Link
          href="/health-calculators"
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white"
        >
          <Calculator size={16} />
          Health calculators
        </Link>
      </div>
      </div>
    </aside>
  );
}
