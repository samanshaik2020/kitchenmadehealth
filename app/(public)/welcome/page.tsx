import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, Leaf, MoveDownRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Welcome to Kitchen Made Health",
  description:
    "Meet Kitchen Made Health—a thoughtful guide to the tools, ingredients, and rituals behind a nourishing home.",
};

const promises = [
  ["Honest", "We name the tradeoffs, skip the hype, and recommend only what earns a place in real kitchens."],
  ["Beautiful", "Because the things that care for us can also bring texture, warmth, and joy to ordinary days."],
  ["Useful", "Every story should leave you with one clear idea you can carry into your next meal."],
];

export default function WelcomePage() {
  return (
    <>
      <section className="grain relative min-h-[calc(100svh-4.75rem)] overflow-hidden bg-[#091f17] text-white">
        <Image
          src="/images/kitchen-made-health-hero.webp"
          alt="A soulful arrangement of fresh produce and kitchen objects"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[67%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,20,14,.96)_0%,rgba(5,20,14,.78)_40%,rgba(5,20,14,.1)_78%)]" />
        <div className="container-wide relative z-10 flex min-h-[calc(100svh-4.75rem)] flex-col justify-between py-10">
          <div className="hero-rise flex items-center justify-between">
            <p className="eyebrow text-sage">Our introduction</p>
            <p className="hidden text-[9px] font-bold uppercase tracking-[.2em] text-white/45 sm:block">
              Est. in the everyday
            </p>
          </div>
          <div className="max-w-[52rem] py-12">
            <p className="hero-rise hero-rise-delay-1 font-display text-2xl italic text-sage">
              Welcome in.
            </p>
            <h1 className="hero-rise hero-rise-delay-2 mt-5 font-display text-[4.25rem] font-medium leading-[.85] tracking-[-.07em] sm:text-[6rem] md:text-[8rem]">
              This is where
              <br />
              <span className="outline-type italic">health lives.</span>
            </h1>
            <p className="hero-rise hero-rise-delay-3 mt-8 max-w-xl text-sm leading-7 text-white/67 md:text-base md:leading-8">
              Not in perfection. Not in complicated rules. In the room you
              return to every day, and the small choices that begin there.
            </p>
          </div>
          <Link
            href="#our-story"
            className="hero-rise hero-rise-delay-3 inline-flex w-fit items-center gap-3 text-[10px] font-bold uppercase tracking-[.17em] text-white/70"
          >
            Discover our story
            <span className="grid size-10 place-items-center rounded-full border border-white/25">
              <ArrowDown size={14} />
            </span>
          </Link>
        </div>
      </section>

      <section id="our-story" className="overflow-hidden py-20 md:py-32">
        <div className="container-wide">
          <div className="grid gap-12 lg:grid-cols-[.55fr_1.45fr]">
            <div>
              <p className="eyebrow text-terracotta">Why we are here</p>
              <MoveDownRight className="mt-8 text-terracotta" size={40} strokeWidth={1} />
            </div>
            <div>
              <h2 className="text-balance font-display text-5xl font-medium leading-[1] tracking-[-.055em] md:text-7xl">
                The kitchen is more than a room.{" "}
                <span className="italic text-terracotta">It is a daily practice.</span>
              </h2>
              <div className="mt-10 grid gap-7 border-t border-line pt-8 md:grid-cols-2">
                <p className="text-sm leading-8 text-stone">
                  Kitchen Made Health began with a simple observation: the way
                  we feel is shaped less by grand transformations and more by
                  the spaces, tools, and decisions we live with every day.
                </p>
                <p className="text-sm leading-8 text-stone">
                  So we look closely at those details. The pan worth keeping.
                  The habit that removes friction. The honest answer that helps
                  you buy less, cook more, and feel at home in your choices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-terracotta text-cream">
        <div className="container-wide grid min-h-[32rem] items-center gap-12 py-16 md:grid-cols-[.8fr_1.2fr] md:py-24">
          <div>
            <Leaf size={29} strokeWidth={1.3} />
            <p className="eyebrow mt-6 text-cream/65">Our point of view</p>
            <h2 className="mt-5 font-display text-5xl font-medium leading-[.95] tracking-[-.05em] md:text-6xl">
              Care, made tangible.
            </h2>
          </div>
          <p className="text-balance font-display text-3xl italic leading-[1.3] text-cream/90 md:text-5xl">
            “When a kitchen works beautifully for your real life, taking care
            of yourself stops feeling like another task.”
          </p>
        </div>
      </section>

      <section className="container-wide py-20 md:py-28">
        <p className="eyebrow text-terracotta">What you can expect</p>
        <div className="mt-8 border-t border-line">
          {promises.map(([title, text], index) => (
            <div
              key={title}
              className="grid gap-5 border-b border-line py-8 md:grid-cols-[5rem_.5fr_1fr] md:items-center"
            >
              <span className="font-display text-2xl italic text-terracotta/60">0{index + 1}</span>
              <h3 className="font-display text-4xl font-medium tracking-[-.04em]">{title}</h3>
              <p className="max-w-xl text-sm leading-7 text-stone">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#0b261c] px-6 py-20 text-center text-white md:py-28">
        <p className="eyebrow text-sage">Now, make yourself at home</p>
        <h2 className="mx-auto mt-6 max-w-4xl text-balance font-display text-5xl font-medium leading-[.98] tracking-[-.055em] md:text-7xl">
          Begin with one story that changes the way you see your kitchen.
        </h2>
        <Link
          href="/blog"
          className="mt-10 inline-flex min-h-13 items-center gap-3 rounded-full bg-cream px-7 text-[10px] font-bold uppercase tracking-[.13em] text-ink transition hover:-translate-y-1 hover:bg-white"
        >
          Enter the journal <ArrowRight size={15} />
        </Link>
      </section>
    </>
  );
}
