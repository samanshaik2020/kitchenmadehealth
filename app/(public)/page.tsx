import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  HeartPulse,
  Leaf,
  ShieldCheck,
  Sparkles,
  Sprout,
  UtensilsCrossed,
} from "lucide-react";
import { PostCard } from "@/components/blog/post-card";
import { Newsletter } from "@/components/site/newsletter";
import { getCategories, getPublishedPosts } from "@/lib/posts";

export const revalidate = 300;

const principles = [
  {
    icon: Sprout,
    title: "Feel-good choices",
    text: "Tools and routines that make nourishing meals easier to return to.",
  },
  {
    icon: ShieldCheck,
    title: "Clear, honest guidance",
    text: "Practical tradeoffs and plain-language advice—never empty hype.",
  },
  {
    icon: HeartPulse,
    title: "Made for real life",
    text: "Ideas that work on busy weekdays, in small kitchens, and on real budgets.",
  },
];

export default async function HomePage() {
  const [{ posts }, categories] = await Promise.all([
    getPublishedPosts({ pageSize: 6 }),
    getCategories(),
  ]);
  const [featured, ...latest] = posts;

  return (
    <>
      <section className="relative overflow-hidden bg-cream">
        <div className="absolute inset-0 dot-grid opacity-35" />
        <div className="absolute -left-32 top-40 size-80 rounded-full bg-sage/20 blur-3xl" />
        <div className="container-wide relative grid min-h-[43rem] gap-12 py-14 lg:grid-cols-[1.02fr_.98fr] lg:items-center lg:py-18">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sage/35 bg-white/75 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[.15em] text-sage-dark shadow-sm backdrop-blur">
              <Sparkles size={14} className="text-terracotta" />
              Welcome to Kitchen Made Health
            </div>
            <h1 className="font-display text-[3.45rem] font-semibold leading-[.96] tracking-[-.055em] text-ink sm:text-[4.4rem] lg:text-[5.15rem]">
              Make your kitchen a place that{" "}
              <span className="relative ml-3 inline-block italic text-terracotta lg:ml-0 lg:block">
                helps you thrive.
                <svg
                  className="absolute -bottom-3 left-0 h-3 w-full text-sage/55"
                  viewBox="0 0 300 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="M2 8C79 1 187 2 298 7" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="mt-8 max-w-xl text-base leading-8 text-stone sm:text-lg">
              Thoughtful kitchen guides for healthier cooking, smarter tools,
              and everyday habits that feel good enough to keep.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/blog"
                className="inline-flex min-h-13 items-center gap-2 rounded-full bg-ink px-7 text-sm font-bold text-white shadow-[0_12px_30px_rgba(23,59,46,.18)] transition hover:-translate-y-1 hover:bg-sage-dark"
              >
                Begin your journey <ArrowRight size={17} />
              </Link>
              <Link
                href="/category/kitchen-guides"
                className="inline-flex min-h-13 items-center gap-2 rounded-full border border-sage/50 bg-white/70 px-6 text-sm font-bold text-ink transition hover:bg-white"
              >
                Explore simple guides
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-stone">
              {["Independent advice", "Practical routines", "Healthier choices"].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <span className="grid size-5 place-items-center rounded-full bg-sage/25 text-sage-dark">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[36rem] lg:ml-auto">
            <div className="absolute -right-10 -top-10 size-44 rounded-full border-[1.5rem] border-white/55" />
            <div className="relative mr-4 aspect-[5/5.6] overflow-hidden rounded-[8rem_2.25rem_8rem_2.25rem] bg-clay shadow-[0_35px_90px_rgba(23,59,46,.18)] sm:mr-10">
              <Image
                src="https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=88"
                alt="A bright and welcoming healthy home kitchen"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-7 left-0 max-w-[15rem] rounded-[1.5rem] border border-white/70 bg-white/92 p-5 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-terracotta/12 text-terracotta">
                  <Leaf size={19} />
                </span>
                <div>
                  <p className="text-xs font-extrabold text-ink">Start small</p>
                  <p className="mt-1 text-[11px] leading-4 text-stone">One better choice can change the rhythm of a whole week.</p>
                </div>
              </div>
            </div>
            <div className="absolute right-0 top-16 rounded-full bg-sage-dark px-4 py-3 text-[10px] font-extrabold uppercase tracking-[.12em] text-white shadow-xl">
              Cook well · live well
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-white">
        <div className="container-wide grid divide-y divide-line py-3 md:grid-cols-3 md:divide-x md:divide-y-0">
          {principles.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-4 px-3 py-7 md:px-7">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-cream text-sage-dark">
                <Icon size={20} />
              </span>
              <div>
                <h2 className="text-sm font-extrabold text-ink">{title}</h2>
                <p className="mt-1.5 text-xs leading-5 text-stone">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-wide py-18 md:py-24">
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow text-terracotta">Your first step</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-.045em] sm:text-5xl">
              Start where your kitchen needs you.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-stone">
            No complete overhaul required. Choose a shelf, learn one useful
            thing, and build a kitchen that works better for your health.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => {
            const Icon = [UtensilsCrossed, ShieldCheck, HeartPulse, Sprout][index % 4];
            return (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group relative min-h-64 overflow-hidden rounded-[2rem] border border-line bg-cream p-6 transition duration-300 hover:-translate-y-1 hover:border-sage hover:bg-clay"
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-white text-sage-dark shadow-sm">
                  <Icon size={20} />
                </span>
                <p className="mt-10 text-[10px] font-extrabold uppercase tracking-[.14em] text-terracotta">Path 0{index + 1}</p>
                <h3 className="mt-2 font-display text-2xl font-semibold tracking-[-.035em]">{category.name}</h3>
                <p className="mt-3 line-clamp-2 text-xs leading-5 text-stone">{category.description}</p>
                <ArrowRight className="absolute bottom-6 right-6 text-sage-dark transition-transform group-hover:translate-x-1" size={18} />
              </Link>
            );
          })}
        </div>
      </section>

      {featured && (
        <section className="bg-[#15372a] text-white">
          <div className="container-wide py-18 md:py-24">
            <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow text-sage">Featured guide</p>
                <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-.04em] sm:text-5xl">
                  Read this first.
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-7 text-white/60">
                A practical place to begin making calmer, more confident choices.
              </p>
            </div>
            <PostCard post={featured} featured />
          </div>
        </section>
      )}

      <section className="container-wide py-18 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[.82fr_1.18fr] lg:items-center">
          <div className="relative min-h-[33rem] overflow-hidden rounded-[2.5rem] bg-clay">
            <Image
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=85"
              alt="Fresh ingredients being prepared in a home kitchen"
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover"
            />
          </div>
          <div className="lg:pl-8">
            <p className="eyebrow text-terracotta">The Kitchen Made Health approach</p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-[-.045em] sm:text-5xl">
              Health is built in the ordinary moments.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-stone">
              We focus on the tools, spaces, and repeatable choices behind
              everyday meals—not perfection. Because a kitchen that feels easy
              to use makes it easier to care for yourself.
            </p>
            <div className="mt-8 space-y-5">
              {[
                ["Choose with purpose", "Buy fewer tools, understand them better, and use them for longer."],
                ["Design for your real routine", "Create a space that supports the meals you actually make."],
                ["Make healthy feel natural", "Reduce friction so better choices become the easy choices."],
              ].map(([title, text], index) => (
                <div key={title} className="flex gap-4 border-t border-line pt-5">
                  <span className="font-display text-xl font-semibold italic text-terracotta">0{index + 1}</span>
                  <div>
                    <h3 className="text-sm font-extrabold">{title}</h3>
                    <p className="mt-1 text-xs leading-5 text-stone">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {latest.length > 0 && (
        <section className="border-y border-line bg-cream">
          <div className="container-wide py-18 md:py-24">
            <div className="mb-9 flex items-end justify-between">
              <div>
                <p className="eyebrow text-terracotta">Fresh ideas</p>
                <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-.04em] sm:text-5xl">
                  For your healthier kitchen
                </h2>
              </div>
              <Link href="/blog" className="hidden items-center gap-2 text-sm font-bold text-sage-dark sm:inline-flex">
                View all guides <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {latest.slice(0, 3).map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Newsletter />
    </>
  );
}
