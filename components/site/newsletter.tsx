"use client";

import { ArrowRight } from "lucide-react";
import { useActionState } from "react";
import { subscribeNewsletter } from "@/app/(public)/actions";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = { success: false, message: "" };

export function Newsletter() {
  const [state, formAction, pending] = useActionState(subscribeNewsletter, initialState);

  return (
    <section className="bg-paper px-3 py-3 md:px-5 md:py-5">
      <div className="grain relative overflow-hidden bg-[#10291f] px-6 py-16 text-white md:px-14 md:py-24">
        <div className="absolute -right-20 -top-36 size-[28rem] rounded-full border border-white/10" />
        <div className="absolute -right-4 -top-20 size-72 rounded-full border border-white/10" />
        <div className="container-wide relative z-10 grid gap-10 md:grid-cols-[1.1fr_.9fr] md:items-end">
          <div>
            <p className="eyebrow text-sage">A note from our kitchen</p>
            <h2 className="mt-5 max-w-2xl font-display text-5xl font-medium leading-[.98] tracking-[-.055em] md:text-7xl">
              Something worth keeping.
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-white/65">
              A considered Sunday letter about food, useful objects, and the
              gentle art of living well. No noise, only nourishment.
            </p>
          </div>
          {state.success ? (
            <p className="border border-white/15 bg-white/10 p-5 text-sm font-semibold">
              {state.message}
            </p>
          ) : (
            <div>
              <form
                action={formAction}
                className="flex border-b border-white/35 py-2"
              >
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  name="email"
                  type="email"
                  required
                  placeholder="Your email address"
                  className="min-w-0 flex-1 bg-transparent px-1 text-sm text-white outline-none placeholder:text-white/45"
                />
                <button
                  type="submit"
                  disabled={pending}
                  className="grid size-11 shrink-0 place-items-center rounded-full bg-terracotta text-white transition hover:scale-105"
                  aria-label="Subscribe"
                >
                  <ArrowRight size={18} />
                </button>
              </form>
              {state.message && (
                <p className="mt-2 text-xs text-red-200" role="alert">{state.message}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
