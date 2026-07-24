import Link from "next/link";
import { ArrowUpRight, Instagram, Mail } from "lucide-react";
import { Logo } from "@/components/site/logo";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#0a1e16] text-white">
      <div className="pointer-events-none absolute -bottom-28 right-0 font-display text-[18rem] leading-none text-white/[.025]">
        K
      </div>
      <div className="container-wide relative grid gap-12 py-16 md:grid-cols-[1.45fr_.55fr_.55fr] md:py-20">
        <div>
          <Logo inverse />
          <p className="mt-6 max-w-md font-display text-2xl leading-[1.3] text-white/65">
            Make the room where you cook the place where feeling well begins.
          </p>
        </div>
        <div>
          <p className="eyebrow mb-4 text-white/45">Explore</p>
          <div className="space-y-3 text-sm">
            <Link className="block text-white/75 hover:text-white" href="/welcome">Our story</Link>
            <Link className="block text-white/75 hover:text-white" href="/blog">The journal</Link>
            <Link className="block text-white/75 hover:text-white" href="/health-calculators">Health tools</Link>
            <Link className="block text-white/75 hover:text-white" href="/category/cookware">Cookware</Link>
            <Link className="block text-white/75 hover:text-white" href="/category/kitchen-guides">Kitchen rituals</Link>
          </div>
        </div>
        <div>
          <p className="eyebrow mb-4 text-white/45">Keep in touch</p>
          <div className="space-y-3 text-sm">
            <a className="flex items-center gap-2 text-white/75 hover:text-white" href="mailto:hello@kitchenmadehealth.com">
              <Mail size={15} /> Email us
            </a>
            <a className="flex items-center gap-2 text-white/75 hover:text-white" href="#" aria-label="KitchenMadeHealth on Instagram">
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
          <p>© {new Date().getFullYear()} Kitchen Made Health.</p>
          <p>From garden. To kitchen. To a life well lived.</p>
        </div>
      </div>
    </footer>
  );
}
