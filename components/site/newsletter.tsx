"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";

export function Newsletter() {
  const [done, setDone] = useState(false);

  return (
    <section className="container-wide py-16 md:py-24">
      <div className="relative overflow-hidden rounded-[2rem] bg-terracotta px-6 py-12 text-white md:px-14 md:py-16">
        <div className="absolute -right-16 -top-24 size-72 rounded-full border-[44px] border-white/8" />
        <div className="relative grid gap-8 md:grid-cols-[1fr_.9fr] md:items-end">
          <div>
            <p className="eyebrow text-white/65">Notes from the kitchen</p>
            <h2 className="mt-4 max-w-xl font-display text-4xl font-semibold leading-[1.05] tracking-[-.04em] md:text-5xl">
              Better tools. Fewer regrets.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-white/75">
              One thoughtful guide every other Sunday. No clutter, no sponsored
              hype—just useful advice.
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
                className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-white transition hover:scale-105"
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
