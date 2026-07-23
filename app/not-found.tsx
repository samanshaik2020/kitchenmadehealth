import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-paper p-6 text-center">
      <div>
        <p className="eyebrow text-terracotta">404 · Missing utensil</p>
        <h1 className="mt-4 font-display text-5xl font-semibold tracking-[-.05em]">
          This page isn’t in the drawer.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-stone">
          The guide may have moved, or the address may need another look.
        </p>
        <Link href="/" className="mt-7 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white">
          <ArrowLeft size={16} /> Back home
        </Link>
      </div>
    </main>
  );
}
