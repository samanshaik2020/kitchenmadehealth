import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CircleDot, Sparkles } from "lucide-react";
import { PostCard } from "@/components/blog/post-card";
import { Newsletter } from "@/components/site/newsletter";
import { getCategories, getPublishedPosts } from "@/lib/posts";

export const revalidate = 300;

export default async function HomePage() {
  const [{ posts }, categories] = await Promise.all([
    getPublishedPosts({ pageSize: 6 }),
    getCategories(),
  ]);
  const [featured, ...latest] = posts;

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0 dot-grid opacity-45" />
        <div className="container-wide relative grid min-h-[37rem] gap-12 py-14 md:grid-cols-[.95fr_1.05fr] md:items-center md:py-20">
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-3 py-2 text-xs font-bold text-brown shadow-sm backdrop-blur">
              <Sparkles size={14} className="text-terracotta" />
              Independent kitchen advice
            </div>
            <h1 className="max-w-2xl font-display text-[3.4rem] font-semibold leading-[.96] tracking-[-.055em] text-ink md:text-[5.3rem]">
              Buy thoughtfully.
              <span className="block italic text-terracotta">Cook beautifully.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-stone md:text-lg">
              We test, compare, and explain the tools that make a kitchen work—
              without the clutter, jargon, or sponsored hype.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/blog"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-black"
              >
                Explore our guides <ArrowRight size={17} />
              </Link>
              <p className="flex items-center gap-2 text-xs font-semibold text-stone">
                <BadgeCheck size={17} className="text-sage" />
                Researched by real home cooks
              </p>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[36rem] md:ml-auto">
            <div className="absolute -left-8 top-10 size-28 rounded-full bg-sage/30 blur-2xl" />
            <div className="relative ml-8 aspect-[4/4.5] overflow-hidden rounded-[2.5rem_2.5rem_7rem_2.5rem] bg-clay shadow-[0_30px_80px_rgba(72,53,42,.18)]">
              <Image
                src="https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=88"
                alt="A warm, organized home kitchen"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 left-0 max-w-[14rem] rounded-2xl border border-white/60 bg-paper/95 p-4 shadow-xl backdrop-blur">
              <div className="flex items-center gap-2 text-xs font-bold text-ink">
                <span className="grid size-7 place-items-center rounded-full bg-terracotta/10 text-terracotta">
                  <CircleDot size={14} />
                </span>
                Our promise
              </div>
              <p className="mt-2 text-xs leading-5 text-stone">
                Every recommendation starts with how a tool feels in a real kitchen.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-wide py-16 md:py-24">
        <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-terracotta">The latest</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-.04em] md:text-5xl">
              Fresh from the kitchen
            </h2>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-bold text-ink hover:text-terracotta"
          >
            Browse every guide <ArrowRight size={16} />
          </Link>
        </div>
        {featured ? (
          <PostCard post={featured} featured />
        ) : (
          <div className="rounded-3xl border border-dashed border-line p-12 text-center text-stone">
            Fresh guides are being prepared.
          </div>
        )}
      </section>

      <section className="border-y border-line bg-cream">
        <div className="container-wide py-16 md:py-20">
          <p className="eyebrow text-terracotta">Browse by shelf</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group rounded-2xl border border-line bg-paper p-5 transition hover:-translate-y-1 hover:border-terracotta/40 hover:shadow-lg"
              >
                <span className="text-xs font-bold text-terracotta">0{index + 1}</span>
                <h3 className="mt-8 font-display text-2xl font-semibold tracking-[-.03em]">
                  {category.name}
                </h3>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-stone">
                  {category.description}
                </p>
                <ArrowRight className="mt-5 text-stone transition group-hover:translate-x-1 group-hover:text-terracotta" size={17} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-wide py-16 md:py-24">
        <div className="mb-9 max-w-2xl">
          <p className="eyebrow text-terracotta">Worth your time</p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-.04em] md:text-5xl">
            Practical reads, lasting lessons
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {latest.slice(0, 3).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
      <Newsletter />
    </>
  );
}
