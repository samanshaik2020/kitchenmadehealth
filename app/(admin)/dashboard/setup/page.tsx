import Link from "next/link";
import { ArrowLeft, CheckCircle2, Database, ImageIcon, KeyRound } from "lucide-react";

const steps = [
  {
    icon: Database,
    title: "Create the database",
    body: "Run supabase/schema.sql in the Supabase SQL Editor. It creates categories, posts, indexes, timestamp triggers, and RLS policies.",
  },
  {
    icon: ImageIcon,
    title: "Create image storage",
    body: "Create a public Storage bucket named post-images. The editor uploads cover files to its covers/ folder.",
  },
  {
    icon: KeyRound,
    title: "Add environment keys",
    body: "Copy .env.example to .env.local and add your project URL and anon key. Restart the development server.",
  },
  {
    icon: CheckCircle2,
    title: "Invite your editor",
    body: "Add an email/password user in Supabase Authentication. That account can sign in at /login.",
  },
];

export default function SetupPage() {
  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-7 lg:p-10">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-stone hover:text-ink">
        <ArrowLeft size={14} /> Back to dashboard
      </Link>
      <p className="eyebrow mt-10 text-terracotta">Project setup</p>
      <h1 className="mt-3 font-display text-5xl font-semibold tracking-[-.05em]">Connect the working kitchen.</h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-stone">
        The interface is ready. These four steps turn the preview into a private,
        persistent editorial workspace.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {steps.map(({ icon: Icon, title, body }, index) => (
          <section key={title} className="rounded-2xl border border-line bg-white p-6">
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-full bg-terracotta/10 text-terracotta"><Icon size={19} /></span>
              <span className="text-xs font-bold text-stone">0{index + 1}</span>
            </div>
            <h2 className="mt-6 font-display text-2xl font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-stone">{body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
