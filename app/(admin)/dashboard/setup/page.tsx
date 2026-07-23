import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Database,
  ImageIcon,
  KeyRound,
  Workflow,
} from "lucide-react";

const steps = [
  {
    icon: Database,
    title: "Create the core database",
    body: "Run supabase/schema.sql in the Supabase SQL Editor. It creates the base post and category model, indexes, storage policies, and RLS.",
    code: "supabase/schema.sql",
  },
  {
    icon: Workflow,
    title: "Apply the editorial upgrade",
    body: "Run the additive migration for scheduling, tags, revisions, affiliates, views, subscribers, comments, and activity.",
    code: "supabase/migrations/20260723_editorial_workspace.sql",
  },
  {
    icon: ImageIcon,
    title: "Confirm image storage",
    body: "Keep the public Storage bucket named post-images. Cover uploads are written to its covers/ folder.",
    code: "post-images/covers/",
  },
  {
    icon: KeyRound,
    title: "Add private environment keys",
    body: "Alongside the public URL and anon key, set SUPABASE_SERVICE_ROLE_KEY and a long CRON_SECRET. Never expose the service key in client code.",
    code: "SUPABASE_SERVICE_ROLE_KEY + CRON_SECRET",
  },
  {
    icon: CalendarClock,
    title: "Turn on scheduled publishing",
    body: "Enable pg_cron and uncomment the schedule at the bottom of the migration, or call /api/cron/publish every minute with Authorization: Bearer <CRON_SECRET>.",
    code: "select public.publish_scheduled_posts();",
  },
  {
    icon: CheckCircle2,
    title: "Invite the editor",
    body: "Add an email/password user in Supabase Authentication. Authenticated editors can write and manage the private workspace.",
    code: "/login",
  },
];

export default function SetupPage() {
  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-7 lg:p-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] text-stone hover:text-ink"
      >
        <ArrowLeft size={13} /> Back to dashboard
      </Link>
      <p className="eyebrow mt-10 text-terracotta">Project setup</p>
      <h1 className="mt-3 max-w-4xl font-display text-5xl font-medium tracking-[-.055em] md:text-6xl">
        Connect the complete editorial kitchen.
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-stone">
        The interface works in preview mode. These steps turn on persistence,
        scheduled publishing, analytics, revisions, and the full editorial trail.
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {steps.map(({ icon: Icon, title, body, code }, index) => (
          <section key={title} className="border border-line bg-white p-6">
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-full bg-terracotta/10 text-terracotta">
                <Icon size={18} />
              </span>
              <span className="font-display text-xl italic text-terracotta/55">0{index + 1}</span>
            </div>
            <h2 className="mt-6 font-display text-2xl font-medium">{title}</h2>
            <p className="mt-3 text-xs leading-6 text-stone">{body}</p>
            <code className="mt-5 block overflow-x-auto border border-line bg-cream/50 p-3 text-[9px] leading-5 text-ink">
              {code}
            </code>
          </section>
        ))}
      </div>
    </div>
  );
}
