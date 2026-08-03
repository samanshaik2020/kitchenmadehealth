"use client";

import Link from "next/link";
import { ArrowUpRight, Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/site/logo";

const links = [
  { href: "/welcome", label: "Our story" },
  { href: "/blog", label: "Journal" },
  { href: "/health-calculators", label: "Health tools" },
  { href: "/category/diabetes-blood-sugar", label: "Diabetes & blood sugar" },
  { href: "/category/home-remedies", label: "Home remedies" },
  { href: "/products", label: "Products" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0d241b]/95 text-white shadow-[0_12px_40px_rgba(4,17,12,.12)] backdrop-blur-xl">
      <div className="container-wide flex h-[4.75rem] items-center justify-between">
        <Logo inverse />
        <div className="hidden items-center gap-5 min-[1120px]:flex">
          <nav className="flex items-center gap-4" aria-label="Primary navigation">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[11px] font-semibold uppercase tracking-[.13em] text-white/65 transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/blog"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-cream px-5 text-xs font-bold text-ink transition hover:-translate-y-0.5 hover:bg-white"
          >
            Explore the journal <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="flex items-center gap-1 min-[1120px]:hidden">
          <Link href="/blog" className="grid size-10 place-items-center rounded-full text-white hover:bg-white/10" aria-label="Browse articles">
            <Search size={19} />
          </Link>
          <button className="grid size-10 place-items-center rounded-full text-white" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Toggle navigation">
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-white/10 bg-[#0d241b] px-5 py-4 shadow-xl min-[1120px]:hidden" aria-label="Mobile navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-3 font-display text-xl text-white/80 hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
