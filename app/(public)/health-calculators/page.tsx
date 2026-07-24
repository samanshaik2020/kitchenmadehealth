import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  HeartPulse,
  Leaf,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { HealthCalculatorSuite } from "@/components/health/health-calculator-suite";

export const metadata: Metadata = {
  title: "Free Health Calculators",
  description:
    "Private, browser-based calculators for adult BMI, calorie and macro planning, body-fat estimates, daily water, and healthy weight ranges.",
  alternates: {
    canonical: "/health-calculators",
  },
  openGraph: {
    title: "Free Health Calculator Suite | Kitchen Made Health",
    description:
      "Five practical health calculators. No account, no saved data, and nothing sent to a server.",
    url: "/health-calculators",
    type: "website",
  },
};

const methodology = [
  {
    title: "BMI & weight range",
    text: "BMI is weight divided by height squared. Adult categories and the 18.5–24.9 reference range follow CDC guidance; BMI remains a screening measure, not a diagnosis.",
    href: "https://www.cdc.gov/bmi/adult-calculator/index.html",
    source: "CDC adult BMI guidance",
  },
  {
    title: "Calories & macros",
    text: "Resting energy uses the Mifflin–St Jeor equation, then a selected activity factor estimates maintenance. Macro values are planning estimates and can flex around individual preferences.",
    href: "https://pubmed.ncbi.nlm.nih.gov/2305711/",
    source: "Mifflin–St Jeor study",
  },
  {
    title: "Body composition",
    text: "The body-fat tool adapts the circumference method used in U.S. military body-composition screening. Tape measurements are sensitive to placement and are best used to follow a trend.",
    href: "https://www.netc.navy.mil/Portals/46/NSTC/NROTC/docs/Guide%204-Body%20Composition%20Assessment%20%28BCA%29%20%28MAR%202021%29.pdf",
    source: "U.S. Navy body-composition guide",
  },
  {
    title: "Daily water",
    text: "The water tool offers a starting guide and adds simple allowances for exercise and heat. Total water includes beverages and food, and individual needs can vary substantially.",
    href: "https://pubmed.ncbi.nlm.nih.gov/16028570/",
    source: "Human water-needs review",
  },
];

const faqs = [
  {
    question: "Who are these calculators for?",
    answer:
      "They are designed as general screening and planning tools for adults aged 20 and over. They are not suitable for children, teenagers, pregnancy, or anyone who has been given individual clinical nutrition or fluid advice.",
  },
  {
    question: "Does Kitchen Made Health store my measurements?",
    answer:
      "No. Every calculation runs locally in your browser. The optional calorie-plan code is also created and decoded on your device; the inputs are not submitted to our server.",
  },
  {
    question: "Why might a clinician or wearable give me a different number?",
    answer:
      "These tools use population equations and broad activity categories. Lab measurements, wearables, and clinical assessments use different inputs and assumptions, while real needs also change with health, training, body composition, medication, and environment.",
  },
  {
    question: "How should I use the results?",
    answer:
      "Treat them as a starting point or a way to observe a trend. Avoid making a major diet, training, or hydration change from one estimate alone, especially if you have a medical condition or a history of disordered eating.",
  },
];

export default function HealthCalculatorsPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Kitchen Made Health Calculator Suite",
    applicationCategory: "HealthApplication",
    operatingSystem: "Any",
    url: "https://kitchenmadehealth.com/health-calculators",
    description:
      "Browser-based adult BMI, calorie, macro, body-fat, water, and healthy-weight calculators.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <section className="grain relative overflow-hidden bg-[#0d281e] text-white">
        <div className="pointer-events-none absolute -right-28 top-2 size-[34rem] rounded-full border border-white/[.045]" />
        <div className="pointer-events-none absolute -right-8 top-24 size-[22rem] rounded-full border border-white/[.045]" />
        <div className="container-wide relative z-10 py-14 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
            <div>
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.22em] text-sage">
                <span className="h-px w-9 bg-terracotta" />
                Free tools · private by design
              </div>
              <h1 className="mt-6 max-w-4xl text-balance font-display text-[3.5rem] font-medium leading-[.92] tracking-[-.06em] sm:text-6xl md:text-[5.3rem]">
                Useful numbers,{" "}
                <span className="italic text-sage">held lightly.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-white/62 md:text-base md:leading-8">
                Five thoughtful calculators for everyday health planning. Enter
                your details, see the estimate instantly, and keep your data on
                your own device.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                {
                  icon: LockKeyhole,
                  title: "Nothing uploaded",
                  text: "Your inputs stay in this browser.",
                },
                {
                  icon: ShieldCheck,
                  title: "Limits explained",
                  text: "Every result includes context and cautions.",
                },
                {
                  icon: HeartPulse,
                  title: "Adult estimates",
                  text: "Built for general use from age 20 onward.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex gap-3 border-t border-white/12 pt-4"
                  >
                    <Icon className="mt-0.5 shrink-0 text-terracotta" size={17} />
                    <div>
                      <p className="text-xs font-bold text-white">{item.title}</p>
                      <p className="mt-1 text-xs leading-5 text-white/45">
                        {item.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-12 md:mt-16">
            <HealthCalculatorSuite />
          </div>

          <p className="mx-auto mt-7 max-w-4xl text-center text-[11px] leading-6 text-white/40">
            These calculators provide general estimates for informational and
            educational use. They do not provide medical advice, diagnosis, or
            treatment. Speak with a qualified healthcare professional before
            making a significant change to your diet, activity, weight, or fluid
            intake.
          </p>
        </div>
      </section>

      <section className="container-wide py-20 md:py-28">
        <div className="grid gap-12 lg:grid-cols-[.62fr_1.38fr] lg:gap-20">
          <div>
            <p className="eyebrow text-terracotta">Transparent by design</p>
            <h2 className="mt-5 text-balance font-display text-5xl font-medium leading-[.98] tracking-[-.055em] md:text-6xl">
              Know what sits{" "}
              <span className="italic text-terracotta">behind the number.</span>
            </h2>
            <p className="mt-6 max-w-md text-sm leading-7 text-stone">
              A calculator is most useful when its assumptions are visible. These
              tools use established screening equations, keep the language
              intentionally modest, and link to the underlying guidance.
            </p>
          </div>

          <div className="grid border-t border-line md:grid-cols-2">
            {methodology.map((item, index) => (
              <article
                key={item.title}
                className={cnMethodCard(index)}
              >
                <p className="font-display text-xl italic text-terracotta">
                  0{index + 1}
                </p>
                <h3 className="mt-8 font-display text-3xl font-medium tracking-[-.04em]">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-stone">{item.text}</p>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.13em] text-ink underline decoration-line underline-offset-4 transition hover:text-terracotta"
                >
                  {item.source} <ArrowUpRight size={13} />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-[#eee6d8]">
        <div className="container-wide grid gap-12 py-20 lg:grid-cols-[.72fr_1.28fr] lg:gap-20 md:py-24">
          <div>
            <div className="grid size-12 place-items-center rounded-full bg-ink text-cream">
              <BookOpen size={19} strokeWidth={1.6} />
            </div>
            <p className="eyebrow mt-7 text-terracotta">Good to know</p>
            <h2 className="mt-4 font-display text-5xl font-medium tracking-[-.055em]">
              A few honest answers.
            </h2>
          </div>
          <div className="divide-y divide-line border-y border-line">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-display text-2xl font-medium tracking-[-.025em] marker:hidden">
                  {faq.question}
                  <span className="grid size-8 shrink-0 place-items-center rounded-full border border-ink/15 text-lg font-sans font-normal transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="max-w-2xl pt-4 text-sm leading-7 text-stone">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-terracotta text-cream">
        <div className="container-wide flex flex-col gap-8 py-14 md:flex-row md:items-center md:justify-between md:py-16">
          <div className="flex items-start gap-4">
            <Leaf className="mt-1 shrink-0 text-cream/55" size={21} />
            <div>
              <p className="eyebrow text-cream/60">Numbers are only a beginning</p>
              <h2 className="mt-3 max-w-2xl font-display text-4xl font-medium tracking-[-.045em]">
                Turn the estimate into a gentler everyday practice.
              </h2>
            </div>
          </div>
          <Link
            href="/blog"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-cream px-6 text-xs font-bold uppercase tracking-[.1em] text-ink transition hover:-translate-y-0.5 hover:bg-white"
          >
            Explore the journal <ArrowUpRight size={14} />
          </Link>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}

function cnMethodCard(index: number) {
  return [
    "border-b border-line py-8 md:p-8",
    index % 2 === 0 ? "md:border-r md:pl-0" : "md:pr-0",
  ].join(" ");
}
