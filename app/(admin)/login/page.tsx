import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Leaf } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/site/logo";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Editor sign in" };

export default function LoginPage() {
  const configured = isSupabaseConfigured();

  return (
    <main className="grid min-h-screen bg-[#0b241a] lg:grid-cols-[.82fr_1.18fr]">
      <section className="relative z-10 flex min-h-screen flex-col bg-paper px-5 py-5 sm:px-10 sm:py-8 lg:px-16">
        <div className="flex items-center justify-between">
          <Logo />
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] text-stone hover:text-ink"
          >
            <ArrowLeft size={13} /> Visit site
          </Link>
        </div>
        <div className="mx-auto my-auto w-full max-w-md py-14">
          <div className="flex items-center gap-3">
            <Leaf className="text-terracotta" size={17} />
            <p className="eyebrow text-terracotta">Private editorial workspace</p>
          </div>
          <h1 className="mt-5 font-display text-6xl font-medium leading-[.93] tracking-[-.06em]">
            Welcome back to the kitchen.
          </h1>
          <p className="mt-5 text-sm leading-7 text-stone">
            Write beautifully. Publish deliberately. Understand what your
            readers value—all from one calm editorial desk.
          </p>
          <LoginForm demoMode={!configured} />
        </div>
        <p className="text-[9px] font-bold uppercase tracking-[.16em] text-stone/70">
          Kitchen Made Health · Editorial OS
        </p>
      </section>

      <section className="grain relative hidden overflow-hidden lg:block">
        <Image
          src="/images/kitchen-made-health-hero.webp"
          alt="Fresh produce and kitchen objects in warm garden light"
          fill
          priority
          className="object-cover"
          sizes="60vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071b13]/85 via-[#071b13]/10 to-[#071b13]/20" />
        <div className="absolute inset-x-12 bottom-12 z-10 flex items-end justify-between border-t border-white/25 pt-7 text-white">
          <blockquote className="max-w-2xl font-display text-4xl italic leading-[1.12]">
            “Every good story begins by paying closer attention.”
          </blockquote>
          <p className="vertical-label text-[9px] font-bold uppercase tracking-[.2em] text-white/45">
            Kitchen Made Health
          </p>
        </div>
      </section>
    </main>
  );
}
