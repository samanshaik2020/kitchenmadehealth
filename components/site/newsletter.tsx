"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";

export function Newsletter() {
  const [done, setDone] = useState(false);

  return (
    <section className="container-wide py-16 md:py-24">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-sage-dark px-6 py-12 text-white shadow-[0_24px_80px_rgba(23,59,46,.18)] md:px-14 md:py-16">
        <div className="absolute -right-16 -top-24 size-72 rounded-full border-[44px] border-white/8" />
        <div className="relative grid gap-8 md:grid-cols-[1fr_.9fr] md:items-end">
          <div>
            <p className="eyebrow text-white/65">The Sunday reset</p>
            <h2 className="mt-4 max-w-xl font-display text-4xl font-semibold leading-[1.05] tracking-[-.04em] md:text-5xl">
              A healthier kitchen, one useful note at a time.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-white/75">
              Seasonal ideas, practical guides, and small changes that make
              everyday cooking feel better.
            </p>
          </div>
          {done ? (
            <p className="rounded-2xl bg-white/12 p-5 text-sm font-semibold">
              You’re on the list. Welcome to the kitchen.
            </p>
          ) : (
            <form
              className="flex rounded-full bg-white p-1.5 shadow-xl"
              onSubmit={(event) => {
                event.preventDefault();
                setDone(true);
              }}
            >
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="Your email address"
                className="min-w-0 flex-1 bg-transparent px-4 text-sm text-ink outline-none placeholder:text-stone"
              />
              <button
                className="grid size-11 shrink-0 place-items-center rounded-full bg-terracotta text-white transition hover:scale-105"
                aria-label="Subscribe"
              >
                <ArrowRight size={18} />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
