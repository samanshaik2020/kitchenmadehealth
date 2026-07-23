"use client";

import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
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
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/95 backdrop-blur-lg">
      <div className="container-wide flex h-18 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-stone transition hover:text-terracotta"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <Link
            href="/blog"
            className="grid size-10 place-items-center rounded-full text-ink transition hover:bg-clay"
            aria-label="Browse articles"
          >
            <Search size={19} />
          </Link>
          <button
            className="grid size-10 place-items-center rounded-full text-ink md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label="Toggle navigation"
          >
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-line bg-paper px-5 py-4 md:hidden" aria-label="Mobile navigation">
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
