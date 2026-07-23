import Link from "next/link";
import { ArrowUpRight, FilePlus2, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PostRowActions } from "@/components/admin/post-row-actions";
import { getDashboardPosts } from "@/lib/posts";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; saved?: string }>;
}) {
  const [posts, query] = await Promise.all([getDashboardPosts(), searchParams]);
  const published = posts.filter((post) => post.status === "published").length;
  const drafts = posts.length - published;

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-7 lg:p-10">
      {!isSupabaseConfigured() && (
        <div className="mb-5 flex flex-col gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <span><strong>Preview mode.</strong> Connect Supabase to persist editorial changes.</span>
          <Link href="/dashboard/setup" className="inline-flex items-center gap-1 font-bold">Setup guide <ArrowUpRight size={14} /></Link>
        </div>
      )}
      {(query.created || query.saved) && (
        <p className="mb-5 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          {query.created ? "Post created successfully." : "Changes saved successfully."}
        </p>
      )}
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-terracotta">Editorial overview</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-[-.045em]">Good morning, editor.</h1>
          <p className="mt-2 text-sm text-stone">Here’s what’s happening in the kitchen.</p>
        </div>
        <Link href="/dashboard/posts/new" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-terracotta px-5 text-sm font-bold text-white shadow-lg shadow-terracotta/15 hover:bg-terracotta-dark">
          <FilePlus2 size={16} /> New post
        </Link>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total posts", value: posts.length, detail: "All editorial work" },
          { label: "Published", value: published, detail: "Live on the site" },
          { label: "Drafts", value: drafts, detail: "Waiting for review" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-line bg-white p-5 shadow-[0_10px_35px_rgba(56,43,35,.035)]">
            <p className="text-xs font-bold text-stone">{stat.label}</p>
            <p className="mt-2 font-display text-4xl font-semibold">{stat.value}</p>
            <p className="mt-1 text-xs text-stone">{stat.detail}</p>
          </div>
        ))}
      </div>

      <section className="mt-7 overflow-hidden rounded-2xl border border-line bg-white shadow-[0_10px_35px_rgba(56,43,35,.035)]">
        <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold">All posts</h2>
            <p className="mt-1 text-xs text-stone">Write, review, and manage every guide.</p>
          </div>
          <span className="rounded-full bg-cream px-3 py-2 text-xs font-bold text-stone">
            {posts.length} {posts.length === 1 ? "post" : "posts"}
          </span>
        </div>
        {posts.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-line bg-[#faf9f7] text-[10px] font-bold uppercase tracking-[.12em] text-stone">
                  <th className="px-5 py-3">Post</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-line/70 last:border-0 hover:bg-[#fcfbf9]">
                    <td className="px-5 py-4">
                      <Link href={`/dashboard/posts/${post.id}/edit`} className="block max-w-sm text-sm font-bold text-ink hover:text-terracotta">
                        {post.title}
                      </Link>
                      <p className="mt-1 max-w-sm truncate text-xs text-stone">/{post.slug}</p>
                    </td>
                    <td className="px-4 py-4 text-xs font-medium text-stone">{post.category?.name ?? "Uncategorized"}</td>
                    <td className="px-4 py-4"><Badge variant={post.status}>{post.status}</Badge></td>
                    <td className="px-4 py-4 text-xs text-stone">{formatDate(post.updated_at, "short")}</td>
                    <td className="px-5 py-4"><PostRowActions post={post} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid place-items-center px-5 py-20 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-cream text-terracotta"><FileText size={21} /></span>
            <h3 className="mt-4 font-display text-2xl font-semibold">The cupboard is empty</h3>
            <p className="mt-2 text-sm text-stone">Create your first guide to get started.</p>
          </div>
        )}
      </section>
    </div>
  );
}
