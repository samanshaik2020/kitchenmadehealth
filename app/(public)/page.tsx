import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Calculator,
  Leaf,
  Quote,
  Sparkles,
} from "lucide-react";
import { PostCard } from "@/components/blog/post-card";
import { Newsletter } from "@/components/site/newsletter";
import { UserCoverImage } from "@/components/ui/user-cover-image";
import { getCategories, getPublishedPosts } from "@/lib/posts";
import { formatDate, readingTime } from "@/lib/utils";

export const revalidate = 300;

const categoryImages: Record<string, string> = {
  "diabetes-blood-sugar":
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1000&q=86",
  knives:
    "https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=1000&q=86",
  appliances:
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1000&q=86",
  "home-remedies":
    "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=1000&q=86",
};

const rituals = [
  {
    number: "01",
    title: "Choose with intention",
    text: "Fewer, better tools. Ingredients with a story. Advice that respects your kitchen, budget, and time.",
  },
  {
    number: "02",
    title: "Cook with your senses",
    text: "Learn the cues that recipes leave out—the sound of a hot pan, the scent of toasted spice, the feel of a sharp knife.",
  },
  {
    number: "03",
    title: "Make health feel at home",
    text: "Shape simple surroundings and repeatable rituals so nourishing choices become the natural ones.",
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
      <section className="grain relative min-h-[calc(100svh-4.75rem)] overflow-hidden bg-ink text-white">
        <Image
          src="/images/kitchen-made-health-hero.webp"
          alt="Heirloom tomatoes, fresh herbs, citrus, and kitchenware in warm garden light"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[66%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,20,14,.94)_0%,rgba(7,24,17,.76)_36%,rgba(7,24,17,.14)_71%,rgba(7,24,17,.18)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[#081e16]/80 to-transparent" />

        <div className="container-wide relative z-10 flex min-h-[calc(100svh-4.75rem)] flex-col justify-between py-9 md:py-12">
          <div className="hero-rise flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.23em] text-white/65">
            <span className="h-px w-10 bg-terracotta" />
            An introduction to Kitchen Made Health
          </div>

          <div className="max-w-[47rem] py-16">
            <p className="hero-rise hero-rise-delay-1 mb-6 font-display text-xl italic text-sage md:text-2xl">
              From garden, to kitchen, to you.
            </p>
            <h1 className="hero-rise hero-rise-delay-2 text-balance font-display text-[3.7rem] font-medium leading-[.9] tracking-[-.065em] sm:text-[5rem] md:text-[6.8rem]">
              Where living well{" "}
              <span className="outline-type italic">takes root.</span>
            </h1>
            <p className="hero-rise hero-rise-delay-3 mt-7 max-w-xl text-sm leading-7 text-white/67 md:text-base md:leading-8">
              A soulful guide to the tools, ingredients, and everyday rituals
              that turn the heart of your home into a source of lasting health.
            </p>
            <div className="hero-rise hero-rise-delay-3 mt-9 flex flex-wrap gap-3">
              <Link
                href="#philosophy"
                className="inline-flex min-h-13 items-center gap-3 rounded-full bg-cream px-6 text-xs font-bold uppercase tracking-[.08em] text-ink transition hover:-translate-y-1 hover:bg-white"
              >
                Enter the kitchen <ArrowDown size={15} />
              </Link>
              <Link
                href="/blog"
                className="inline-flex min-h-13 items-center gap-3 rounded-full border border-white/30 bg-white/8 px-6 text-xs font-bold uppercase tracking-[.08em] text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                Read the journal <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>

          <div className="hero-rise hero-rise-delay-3 flex items-end justify-between border-t border-white/20 pt-6">
            <p className="max-w-xs text-[10px] font-semibold uppercase leading-5 tracking-[.15em] text-white/48">
              Independent guidance · thoughtful choices · real kitchens
            </p>
            <p className="hidden text-right font-display text-base italic text-white/52 sm:block">
              Edition No. 01
              <br />
              The nourishing home
            </p>
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-b border-ink/10 bg-terracotta py-3.5 text-cream">
        <div className="marquee-track gap-10 text-[10px] font-bold uppercase tracking-[.2em]">
          {Array.from({ length: 2 }).map((_, set) => (
            <div key={set} className="flex shrink-0 items-center gap-10" aria-hidden={set === 1}>
              {["Cook with care", "Live with energy", "Choose with intention", "Feel at home"].map((item) => (
                <span key={item} className="flex items-center gap-10">
                  {item} <Leaf size={12} />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <section id="philosophy" className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute -right-24 top-8 select-none font-display text-[18rem] italic leading-none text-ink/[.035] md:text-[28rem]">
          well
        </div>
        <div className="container-wide relative">
          <div className="grid gap-12 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
            <div>
              <p className="eyebrow text-terracotta">Our philosophy</p>
              <div className="mt-9 hidden h-44 w-px bg-line lg:block" />
              <p className="mt-6 max-w-xs text-xs leading-6 text-stone lg:mt-8">
                Not a prescription for perfection. A more beautiful, practical
                way to care for yourself every day.
              </p>
            </div>
            <div>
              <h2 className="text-balance font-display text-5xl font-medium leading-[.98] tracking-[-.055em] md:text-7xl">
                Health is not made in a lab.{" "}
                <span className="italic text-terracotta">It is made here.</span>
              </h2>
              <p className="mt-8 max-w-2xl text-base leading-8 text-stone">
                In the meals you return to. The pan that fits your hand. The
                shelf that makes the better choice easier. We explore the
                ordinary decisions that quietly shape how you feel.
              </p>
            </div>
          </div>

          <div className="mt-16 grid border-y border-line md:mt-24 md:grid-cols-3">
            {rituals.map((ritual) => (
              <article
                key={ritual.number}
                className="group border-b border-line py-8 last:border-b-0 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl italic text-terracotta">{ritual.number}</span>
                  <span className="h-px w-12 bg-line transition-all group-hover:w-20 group-hover:bg-terracotta" />
                </div>
                <h3 className="mt-12 font-display text-3xl font-medium tracking-[-.035em]">{ritual.title}</h3>
                <p className="mt-4 max-w-sm text-sm leading-7 text-stone">{ritual.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-[#ede4d5] py-12 md:py-16">
        <div className="container-wide">
          <div className="grid overflow-hidden rounded-[2rem] bg-ink text-white shadow-[0_24px_70px_rgba(12,38,29,.16)] md:grid-cols-[1.25fr_.75fr]">
            <div className="p-7 sm:p-10 md:p-12">
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.19em] text-sage">
                <Calculator size={15} />
                New · private health tools
              </div>
              <h2 className="mt-5 max-w-2xl font-display text-4xl font-medium tracking-[-.05em] sm:text-5xl">
                Start with a useful estimate.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/55">
                Check BMI, plan calories and macros, estimate body fat, explore
                daily water needs, or find an adult weight reference range. Every
                calculation stays in your browser.
              </p>
              <Link
                href="/health-calculators"
                className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-full bg-cream px-6 text-xs font-bold uppercase tracking-[.09em] text-ink transition hover:-translate-y-0.5 hover:bg-white"
              >
                Open the free tools <ArrowUpRight size={15} />
              </Link>
            </div>
            <div className="dot-grid grid grid-cols-2 border-t border-white/10 bg-white/5 p-7 md:border-l md:border-t-0 md:p-10">
              {[
                "BMI",
                "Calories + macros",
                "Body fat",
                "Daily water",
                "Weight range",
              ].map((tool, index) => (
                <div
                  key={tool}
                  className={`flex min-h-24 flex-col justify-between border-white/12 p-4 ${
                    index === 4
                      ? "col-span-2 items-center"
                      : `${index % 2 === 0 ? "border-r" : ""} ${
                          index < 4 ? "border-b" : ""
                        }`
                  }`}
                >
                  <span className="font-display text-xl italic text-terracotta">
                    0{index + 1}
                  </span>
                  <span className="mt-5 text-[10px] font-bold uppercase tracking-[.12em] text-white/60">
                    {tool}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0d281e] py-20 text-white md:py-28">
        <div className="container-wide">
          <div className="mb-12 grid gap-5 md:grid-cols-[1fr_.65fr] md:items-end">
            <div>
              <p className="eyebrow text-sage">Find your starting place</p>
              <h2 className="mt-4 max-w-3xl font-display text-5xl font-medium tracking-[-.055em] md:text-7xl">
                Explore the kitchen.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-white/55 md:pb-2">
              Go deeper into the objects and rituals that make everyday
              cooking calmer, healthier, and more your own.
            </p>
          </div>

          <div className="grid auto-rows-[21rem] gap-3 md:grid-cols-2 lg:grid-cols-4">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className={`group relative overflow-hidden ${
                  index === 0 || index === 3 ? "lg:row-span-2" : ""
                }`}
              >
                <Image
                  src={categoryImages[category.slug] ?? "/images/kitchen-made-health-hero.webp"}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/5" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[.18em] text-sage">
                    Chapter 0{index + 1}
                  </p>
                  <div className="mt-2 flex items-end justify-between gap-4">
                    <h3 className="font-display text-3xl font-medium tracking-[-.04em]">{category.name}</h3>
                    <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/30 bg-white/10 backdrop-blur transition group-hover:bg-cream group-hover:text-ink">
                      <ArrowUpRight size={16} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {featured && (
        <section className="overflow-hidden bg-clay">
          <div className="grid min-h-[46rem] lg:grid-cols-[1.08fr_.92fr]">
            <Link href={`/blog/${featured.slug}`} className="group relative min-h-[30rem] overflow-hidden">
              {featured.cover_image_url && (
                <UserCoverImage
                  src={featured.cover_image_url}
                  alt={featured.cover_image_alt ?? ""}
                  className="object-cover transition duration-700 group-hover:scale-[1.025]"
                />
              )}
              <div className="absolute left-6 top-6 grid size-24 place-items-center rounded-full border border-white/50 bg-white/80 text-center text-[9px] font-bold uppercase tracking-[.15em] text-ink shadow-xl backdrop-blur md:left-10 md:top-10">
                Editor’s
                <br />
                choice
              </div>
            </Link>
            <div className="flex items-center px-6 py-14 md:px-12 lg:px-16">
              <div className="max-w-xl">
                <p className="eyebrow text-terracotta">The essential read</p>
                <h2 className="mt-5 font-display text-5xl font-medium leading-[.98] tracking-[-.055em] md:text-6xl">
                  {featured.title}
                </h2>
                <p className="mt-6 text-base leading-8 text-stone">{featured.excerpt}</p>
                <div className="mt-7 flex items-center gap-4 text-[10px] font-bold uppercase tracking-[.15em] text-stone">
                  <span>{formatDate(featured.published_at, "short")}</span>
                  <span className="h-px w-8 bg-stone/35" />
                  <span>{readingTime(featured.content)} min read</span>
                </div>
                <Link
                  href={`/blog/${featured.slug}`}
                  className="mt-10 inline-flex items-center gap-3 border-b border-ink pb-2 text-xs font-bold uppercase tracking-[.12em] text-ink"
                >
                  Read the story <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="container-wide py-20 md:py-28">
        <div className="mb-12 flex flex-col gap-6 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-terracotta">Fresh from the journal</p>
            <h2 className="mt-4 font-display text-5xl font-medium tracking-[-.055em] md:text-6xl">
              Read. Cook. Live.
            </h2>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em]"
          >
            See all stories <ArrowUpRight size={15} />
          </Link>
        </div>
        {latest.length > 0 ? (
          <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-6">
            {latest.map((post, index) => (
              <div
                key={post.id}
                className={index < 3 ? "lg:col-span-2" : "lg:col-span-3"}
              >
                <PostCard post={post} index={index + 2} />
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-line p-12 text-center">
            <Sparkles className="mx-auto text-terracotta" size={24} />
            <p className="mt-4 font-display text-2xl">New stories are taking root.</p>
          </div>
        )}
      </section>

      <section className="bg-terracotta px-6 py-20 text-cream md:py-28">
        <div className="mx-auto max-w-5xl text-center">
          <Quote className="mx-auto text-cream/50" size={28} strokeWidth={1.4} />
          <blockquote className="mt-7 text-balance font-display text-4xl font-medium italic leading-[1.12] tracking-[-.04em] md:text-6xl">
            “A kitchen should do more than feed you. It should make taking care
            of yourself feel like coming home.”
          </blockquote>
          <p className="mt-8 text-[10px] font-bold uppercase tracking-[.2em] text-cream/70">
            The Kitchen Made Health belief
          </p>
        </div>
      </section>

      <Newsletter />
    </>
  );
}
