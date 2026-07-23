import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/site/logo";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Editor sign in" };

export default function LoginPage() {
  const configured = isSupabaseConfigured();

  return (
    <main className="grid min-h-screen bg-paper lg:grid-cols-[.95fr_1.05fr]">
      <section className="flex min-h-screen flex-col px-5 py-5 sm:px-10 sm:py-8 lg:px-16">
        <div className="flex items-center justify-between">
          <Logo />
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-stone hover:text-ink">
            <ArrowLeft size={14} /> Visit site
          </Link>
        </div>
        <div className="mx-auto my-auto w-full max-w-md py-14">
          <p className="eyebrow text-terracotta">Private editor</p>
          <h1 className="mt-4 font-display text-5xl font-semibold tracking-[-.05em]">
            Welcome back to the kitchen.
          </h1>
          <p className="mt-4 text-sm leading-7 text-stone">
            Sign in to write, review, and publish KitchenMadeHealth guides.
          </p>
          <LoginForm demoMode={!configured} />
        </div>
        <p className="text-xs text-stone">KitchenMadeHealth editorial workspace</p>
      </section>
      <section className="relative hidden overflow-hidden bg-clay lg:block">
        <Image
          src="https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=1400&q=85"
          alt="Warm kitchen with wooden worktops"
          fill
          priority
          className="object-cover"
          sizes="52vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-transparent to-transparent" />
        <blockquote className="absolute bottom-12 left-12 max-w-lg font-display text-3xl leading-tight text-white">
          “The kitchen is where useful things become beautiful through use.”
        </blockquote>
      </section>
    </main>
  );
}
