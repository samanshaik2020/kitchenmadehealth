import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Leaf } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grain relative grid min-h-screen place-items-center overflow-hidden bg-[#0b241a] p-6 text-center text-white">
      <Image
        src="/images/kitchen-made-health-hero.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-[#0b241a]/65" />
      <div className="relative z-10 max-w-2xl">
        <Leaf className="mx-auto text-sage" size={27} strokeWidth={1.4} />
        <p className="eyebrow mt-6 text-sage">404 · Missing from the drawer</p>
        <h1 className="mt-5 font-display text-6xl font-medium leading-[.95] tracking-[-.06em] md:text-8xl">
          This page has left the kitchen.
        </h1>
        <p className="mx-auto mt-6 max-w-md text-sm leading-7 text-white/62">
          The story may have moved, or the address may need another look.
        </p>
        <Link
          href="/"
          className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-full bg-cream px-6 text-[10px] font-bold uppercase tracking-[.13em] text-ink"
        >
          <ArrowLeft size={14} /> Return home
        </Link>
      </div>
    </main>
  );
}
