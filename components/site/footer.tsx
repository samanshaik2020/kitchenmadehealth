import Link from "next/link";
import { ArrowUpRight, Instagram, Mail } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { getInstagramUrl } from "@/lib/site-config";

export function SiteFooter({ showProducts = false }: { showProducts?: boolean }) {
  const instagramUrl = getInstagramUrl();
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
            <Link className="block text-white/75 hover:text-white" href="/category/diabetes-blood-sugar">Diabetes &amp; blood sugar</Link>
            <Link className="block text-white/75 hover:text-white" href="/category/home-remedies">Home remedies</Link>
            {showProducts && <Link className="block text-white/75 hover:text-white" href="/products">Products</Link>}
          </div>
        </div>
        <div>
          <p className="eyebrow mb-4 text-white/45">Keep in touch</p>
          <div className="space-y-3 text-sm">
            <a className="flex items-center gap-2 text-white/75 hover:text-white" href="mailto:hello@kitchenmadehealth.com">
              <Mail size={15} /> Email us
            </a>
            {instagramUrl && <a className="flex items-center gap-2 text-white/75 hover:text-white" href={instagramUrl} aria-label="KitchenMadeHealth on Instagram" rel="noopener noreferrer">
              <Instagram size={15} /> Instagram
            </a>}
            <Link className="block text-white/75 hover:text-white" href="/contact">Contact & corrections</Link>
            <Link className="flex items-center gap-2 text-white/75 hover:text-white" href="/login">
              Editor login <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>
      <nav className="container-wide flex flex-wrap gap-x-6 gap-y-2 border-t border-white/15 py-6 text-sm text-white/80" aria-label="Policies and editorial information">
        <Link className="py-2 underline-offset-4 hover:underline" href="/privacy-policy">Privacy policy</Link>
        <Link className="py-2 underline-offset-4 hover:underline" href="/terms">Terms of use</Link>
        <Link className="py-2 underline-offset-4 hover:underline" href="/medical-disclaimer">Medical disclaimer</Link>
        <Link className="py-2 underline-offset-4 hover:underline" href="/editorial-policy">Editorial policy</Link>
        <Link className="py-2 underline-offset-4 hover:underline" href="/affiliate-disclosure">Affiliate disclosure</Link>
      </nav>
      <div className="border-t border-white/10">
        <div className="container-wide flex flex-col gap-2 py-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Kitchen Made Health.</p>
          <p>From garden. To kitchen. To a life well lived.</p>
        </div>
      </div>
    </footer>
  );
}
