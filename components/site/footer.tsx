import Link from "next/link";
import { ArrowUpRight, Instagram, Mail } from "lucide-react";
import { Logo } from "@/components/site/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-ink text-white">
      <div className="container-wide grid gap-12 py-14 md:grid-cols-[1.35fr_.65fr_.65fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">
            Thoughtful guides for buying better kitchen tools, caring for them
            well, and cooking with more confidence.
          </p>
        </div>
        <div>
          <p className="eyebrow mb-4 text-white/45">Explore</p>
          <div className="space-y-3 text-sm">
            <Link className="block text-white/75 hover:text-white" href="/blog">All guides</Link>
            <Link className="block text-white/75 hover:text-white" href="/category/cookware">Cookware</Link>
            <Link className="block text-white/75 hover:text-white" href="/category/knives">Knives</Link>
          </div>
        </div>
        <div>
          <p className="eyebrow mb-4 text-white/45">Keep in touch</p>
          <div className="space-y-3 text-sm">
            <a className="flex items-center gap-2 text-white/75 hover:text-white" href="mailto:hello@kitchenwarehelp.com">
              <Mail size={15} /> Email us
            </a>
            <a className="flex items-center gap-2 text-white/75 hover:text-white" href="#" aria-label="KitchenWareHelp on Instagram">
              <Instagram size={15} /> Instagram
            </a>
            <Link className="flex items-center gap-2 text-white/75 hover:text-white" href="/login">
              Editor login <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-wide flex flex-col gap-2 py-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} KitchenWareHelp.</p>
          <p>Buy thoughtfully. Cook beautifully.</p>
        </div>
      </div>
    </footer>
  );
}
