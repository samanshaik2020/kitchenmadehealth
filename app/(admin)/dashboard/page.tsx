import Link from "next/link";
import {
  ArrowUpRight,
  CalendarClock,
  Eye,
  FilePlus2,
  FileText,
  Mail,
  MousePointerClick,
  TrendingUp,
} from "lucide-react";
import { PostsTable } from "@/components/admin/posts-table";
import { getActivityLog, getAnalyticsData } from "@/lib/admin-data";
import { getCategories, getDashboardPosts } from "@/lib/posts";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; saved?: string }>;
}) {
  const [posts, categories, analytics, activity, query] = await Promise.all([
    getDashboardPosts(),
    getCategories(),
    getAnalyticsData(),
    getActivityLog(),
    searchParams,
  ]);
  const published = posts.filter((post) => post.status === "published").length;
  const drafts = posts.filter((post) => post.status === "draft").length;
  const scheduled = posts.filter((post) => post.status === "scheduled").length;

  const stats = [
    {
      label: "Published",
      value: published,
      detail: `${drafts} drafts · ${scheduled} scheduled`,
      icon: FileText,
      tone: "bg-sage/20 text-sage-dark",
    },
    {
      label: "Views this week",
      value: analytics.weeklyViews,
      detail: `${analytics.totalViews.toLocaleString()} all-time views`,
      icon: Eye,
      tone: "bg-blue-100 text-blue-700",
    },
    {
      label: "Subscribers",
      value: analytics.subscriberCount,
      detail: "Active newsletter readers",
      icon: Mail,
      tone: "bg-amber-100 text-amber-800",
    },
    {
      label: "Affiliate clicks",
      value: analytics.affiliateClicks,
      detail: "Tracked product interest",
      icon: MousePointerClick,
      tone: "bg-terracotta/10 text-terracotta",
    },
  ];

  return (
    <div className="mx-auto max-w-[1500px] p-4 sm:p-7 lg:p-10">
      {!isSupabaseConfigured() && (
        <div className="mb-5 flex flex-col gap-2 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <span>
            <strong>Preview workspace.</strong> Connect Supabase to persist editorial changes.
          </span>
          <Link href="/dashboard/setup" className="inline-flex items-center gap-1 font-bold">
            Setup guide <ArrowUpRight size={14} />
          </Link>
        </div>
      )}
      {(query.created || query.saved) && (
        <p className="mb-5 border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          {query.created ? "Story created successfully." : "Editorial changes saved successfully."}
        </p>
      )}

      <header className="grid gap-7 border-b border-line pb-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="eyebrow text-terracotta">Editorial command center</p>
          <h1 className="mt-3 font-display text-5xl font-medium tracking-[-.055em] md:text-6xl">
            Good morning, editor.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone">
            Shape the next edition, follow what readers value, and keep every
            publishing detail moving from one calm workspace.
          </p>
        </div>
        <Link
          href="/dashboard/posts/new"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-terracotta px-6 text-xs font-bold uppercase tracking-[.1em] text-white shadow-lg shadow-terracotta/15 hover:bg-terracotta-dark"
        >
          <FilePlus2 size={15} /> New story
        </Link>
      </header>

      <section className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, detail, icon: Icon, tone }) => (
          <article key={label} className="border border-line bg-white p-5 shadow-[0_12px_38px_rgba(16,38,29,.04)]">
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[.14em] text-stone">{label}</p>
              <span className={`grid size-9 place-items-center rounded-full ${tone}`}>
                <Icon size={15} />
              </span>
            </div>
            <p className="mt-5 font-display text-5xl font-medium tracking-[-.05em]">{value.toLocaleString()}</p>
            <p className="mt-2 text-xs text-stone">{detail}</p>
          </article>
        ))}
      </section>

      <section className="mt-7 grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
        <article className="border border-line bg-[#0d281e] p-6 text-white shadow-[0_18px_60px_rgba(16,38,29,.08)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow text-sage">Reader momentum</p>
              <h2 className="mt-2 font-display text-3xl font-medium">Top stories this week</h2>
            </div>
            <TrendingUp className="text-terracotta" size={21} />
          </div>
          <div className="mt-6 divide-y divide-white/10 border-y border-white/10">
            {analytics.topPosts.length ? (
              analytics.topPosts.map((post, index) => (
                <div key={post.id} className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 py-3.5">
                  <span className="font-display text-xl italic text-sage/70">0{index + 1}</span>
                  <Link
                    href={`/dashboard/posts/${post.id}/edit`}
                    className="truncate text-xs font-semibold text-white/80 hover:text-white"
                  >
                    {post.title}
                  </Link>
                  <span className="text-[10px] font-bold uppercase tracking-[.12em] text-white/40">
                    {post.weekly_views} views
                  </span>
                </div>
              ))
            ) : (
              <p className="py-10 text-sm text-white/45">Weekly reading data will appear here.</p>
            )}
          </div>
        </article>

        <article className="border border-line bg-white p-6 shadow-[0_18px_60px_rgba(16,38,29,.04)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow text-terracotta">Editorial trail</p>
              <h2 className="mt-2 font-display text-3xl font-medium">Recent activity</h2>
            </div>
            <Link href="/dashboard/activity" className="text-[10px] font-bold uppercase tracking-[.11em] text-stone">
              View all
            </Link>
          </div>
          <div className="mt-6 space-y-5">
            {activity.slice(0, 4).map((entry) => (
              <div key={entry.id} className="flex gap-3">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-terracotta" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-ink">
                    {humanizeAction(entry.action)}
                    {typeof entry.metadata.title === "string" && (
                      <span className="font-normal text-stone"> · {entry.metadata.title}</span>
                    )}
                  </p>
                  <p className="mt-1 text-[10px] text-stone">{formatDate(entry.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
          {scheduled > 0 && (
            <div className="mt-6 flex items-center gap-3 border-t border-line pt-5 text-xs text-stone">
              <CalendarClock size={16} className="text-terracotta" />
              {scheduled} {scheduled === 1 ? "story is" : "stories are"} waiting in the publishing queue.
            </div>
          )}
        </article>
      </section>

      <PostsTable posts={posts} categories={categories} now={new Date().toISOString()} />
    </div>
  );
}

function humanizeAction(action: string) {
  return action
    .replaceAll("_", " ")
    .replace(/^\w/, (letter) => letter.toUpperCase());
}
