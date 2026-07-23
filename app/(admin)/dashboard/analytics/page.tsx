import { BarChart3, Eye, Mail, MessageSquareText, MousePointerClick } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { getAnalyticsData } from "@/lib/admin-data";
import { formatDate } from "@/lib/utils";

export default async function AnalyticsPage() {
  const analytics = await getAnalyticsData();
  const cards = [
    { label: "All-time views", value: analytics.totalViews, icon: Eye },
    { label: "Views this week", value: analytics.weeklyViews, icon: BarChart3 },
    { label: "Subscribers", value: analytics.subscriberCount, icon: Mail },
    { label: "Affiliate clicks", value: analytics.affiliateClicks, icon: MousePointerClick },
    { label: "Pending comments", value: analytics.pendingComments, icon: MessageSquareText },
  ];

  const maxViews = Math.max(1, ...analytics.topPosts.map((post) => post.weekly_views));

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-7 lg:p-10">
      <AdminPageHeader
        eyebrow="Audience intelligence"
        title="Analytics"
        description="A calm, useful view of what readers return to, what earns clicks, and how the Kitchen Made Health audience is growing."
        icon={BarChart3}
      />

      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(({ label, value, icon: Icon }) => (
          <article key={label} className="border border-line bg-white p-5">
            <Icon size={16} className="text-terracotta" />
            <p className="mt-6 font-display text-4xl font-medium">{value.toLocaleString()}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[.12em] text-stone">{label}</p>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <section className="border border-line bg-white p-6">
          <p className="eyebrow text-terracotta">Last seven days</p>
          <h2 className="mt-2 font-display text-3xl font-medium">Stories earning attention</h2>
          <div className="mt-7 space-y-5">
            {analytics.topPosts.map((post, index) => (
              <div key={post.id}>
                <div className="mb-2 flex items-end justify-between gap-4">
                  <p className="truncate text-xs font-semibold">
                    <span className="mr-3 font-display text-lg italic text-terracotta/60">0{index + 1}</span>
                    {post.title}
                  </p>
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-[.1em] text-stone">
                    {post.weekly_views} views
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-cream">
                  <div
                    className="h-full rounded-full bg-terracotta"
                    style={{ width: `${Math.max(4, (post.weekly_views / maxViews) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-line bg-[#0d281e] p-6 text-white">
          <p className="eyebrow text-sage">Latest readers</p>
          <h2 className="mt-2 font-display text-3xl font-medium">Newsletter growth</h2>
          <div className="mt-7 divide-y divide-white/10 border-y border-white/10">
            {analytics.subscribers.length ? (
              analytics.subscribers.map((subscriber) => (
                <div key={subscriber.id} className="flex items-center justify-between gap-4 py-3">
                  <p className="truncate text-xs text-white/75">{subscriber.email}</p>
                  <span className="shrink-0 text-[9px] uppercase tracking-[.12em] text-white/35">
                    {formatDate(subscriber.subscribed_at, "short")}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-10 text-sm text-white/45">New subscribers will appear here.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
