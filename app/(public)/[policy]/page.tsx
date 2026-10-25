import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { policyPages } from "@/lib/policy-pages";
import { DEFAULT_SOCIAL_IMAGE } from "@/lib/site-config";

type Props = { params: Promise<{ policy: string }> };
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(policyPages).map((policy) => ({ policy }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { policy } = await params;
  const page = policyPages[policy];
  if (!page) return {};
  return { title: page.title, description: page.description, alternates: { canonical: `/${policy}` }, openGraph: { title: page.title, description: page.description, url: `/${policy}`, images: [DEFAULT_SOCIAL_IMAGE] } };
}

function LinkedParagraph({ text }: { text: string }) {
  return text.split(/(https:\/\/[^\s]+|hello@kitchenmadehealth\.com)/g).map((part, index) => {
    if (part === "hello@kitchenmadehealth.com") return <a key={index} href={`mailto:${part}`}>{part}</a>;
    if (part.startsWith("https://")) {
      const url = part.replace(/[.,]$/, "");
      return <a key={index} href={url} rel="noreferrer">{url}</a>;
    }
    return part;
  });
}

export default async function PolicyPage({ params }: Props) {
  const { policy } = await params;
  const page = policyPages[policy];
  if (!page) notFound();
  return (
    <article className="container-reading py-14 md:py-20">
      <p className="eyebrow text-terracotta">Kitchen Made Health</p>
      <h1 className="mt-5 font-display text-5xl font-medium tracking-[-.045em] md:text-6xl">{page.title}</h1>
      <p className="mt-6 text-base leading-8 text-stone">{page.description}</p>
      <p className="mt-4 text-sm text-stone">Updated 25 October 2026</p>
      <div className="article-content mt-10 border-t border-line pt-3">
        {page.sections.map((section) => (
          <section key={section.heading} id={section.id} className="scroll-mt-28">
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph} className="mt-5"><LinkedParagraph text={paragraph} /></p>)}
          </section>
        ))}
      </div>
      <nav className="mt-12 flex flex-wrap gap-x-5 gap-y-3 border-t border-line pt-7 text-sm font-semibold" aria-label="Site policies">
        {Object.entries(policyPages).filter(([slug]) => slug !== policy).map(([slug, item]) => <Link key={slug} className="underline underline-offset-4" href={`/${slug}`}>{item.title}</Link>)}
      </nav>
    </article>
  );
}
