"use client";

import Link from "next/link";
import { ArrowUpRight, Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/site/logo";

const links = [
  { href: "/blog", label: "All guides" },
  { href: "/category/cookware", label: "Cookware" },
  { href: "/category/knives", label: "Knives" },
  { href: "/category/appliances", label: "Appliances" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/95 backdrop-blur-xl">
      <div className="bg-sage-dark py-2 text-center text-[10px] font-bold uppercase tracking-[.15em] text-white/80">
        A healthier home begins in the kitchen
      </div>
      <div className="container-wide flex h-18 items-center justify-between">
        <Logo />
        <div className="hidden items-center gap-8 md:flex">
          <nav className="flex items-center gap-7" aria-label="Primary navigation">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-stone transition hover:text-sage-dark"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/blog"
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-ink px-4 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-sage-dark"
          >
            Start here <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="flex items-center gap-1 md:hidden">
          <Link href="/blog" className="grid size-10 place-items-center rounded-full text-ink hover:bg-clay" aria-label="Browse articles">
            <Search size={19} />
          </Link>
          <button className="grid size-10 place-items-center rounded-full text-ink" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Toggle navigation">
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-line bg-paper px-5 py-4 shadow-xl md:hidden" aria-label="Mobile navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-3 text-base font-medium text-ink hover:bg-clay"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
