"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  CalendarClock,
  ChevronDown,
  FileText,
  FolderInput,
  Search,
  Trash2,
} from "lucide-react";
import { bulkUpdatePosts } from "@/app/(admin)/dashboard/actions";
import { PostRowActions } from "@/components/admin/post-row-actions";
import { Badge } from "@/components/ui/badge";
import type { Category, Post, PostStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type StatusFilter = "all" | PostStatus;
type DateFilter = "all" | "7" | "30";

export function PostsTable({
  posts,
  categories,
  now,
}: {
  posts: Post[];
  categories: Category[];
  now: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [category, setCategory] = useState("all");
  const [date, setDate] = useState<DateFilter>("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkCategory, setBulkCategory] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const cutoff =
      date === "all" ? null : Date.parse(now) - Number(date) * 24 * 60 * 60 * 1000;
    return posts.filter((post) => {
      const matchesQuery =
        !normalized ||
        post.title.toLowerCase().includes(normalized) ||
        post.slug.toLowerCase().includes(normalized);
      const matchesStatus = status === "all" || post.status === status;
      const matchesCategory = category === "all" || post.category_id === category;
      const matchesDate = !cutoff || new Date(post.updated_at).getTime() >= cutoff;
      return matchesQuery && matchesStatus && matchesCategory && matchesDate;
    });
  }, [posts, query, status, category, date, now]);

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((post) => selected.includes(post.id));

  function runBulk(
    operation: "delete" | "publish" | "draft" | "category",
    categoryId?: string,
  ) {
    if (!selected.length) return;
    if (
      operation === "delete" &&
      !window.confirm(`Delete ${selected.length} selected ${selected.length === 1 ? "post" : "posts"}?`)
    ) {
      return;
    }
    setMessage("");
    startTransition(async () => {
      try {
        await bulkUpdatePosts(selected, operation, categoryId);
        setMessage(`${selected.length} ${selected.length === 1 ? "post" : "posts"} updated.`);
        setSelected([]);
        setBulkCategory("");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Bulk update failed.");
      }
    });
  }

  return (
    <section className="mt-7 overflow-hidden border border-line bg-white shadow-[0_18px_60px_rgba(16,38,29,.05)]">
      <div className="border-b border-line p-5 md:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="eyebrow text-terracotta">Content library</p>
            <h2 className="mt-2 font-display text-3xl font-medium tracking-[-.04em]">All stories</h2>
            <p className="mt-1 text-xs text-stone">
              Search, filter, schedule, and manage every editorial piece.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[14rem_9rem_11rem_8rem]">
            <label className="relative">
              <span className="sr-only">Search posts</span>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone" size={14} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search title or slug"
                className="min-h-10 w-full rounded-lg border border-line bg-paper pl-9 pr-3 text-xs outline-none focus:border-terracotta"
              />
            </label>
            <FilterSelect value={status} onChange={(value) => setStatus(value as StatusFilter)} label="Status">
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </FilterSelect>
            <FilterSelect value={category} onChange={setCategory} label="Category">
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </FilterSelect>
            <FilterSelect value={date} onChange={(value) => setDate(value as DateFilter)} label="Date">
              <option value="all">Any date</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
            </FilterSelect>
          </div>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-col gap-3 border-b border-line bg-cream/65 px-5 py-3 sm:flex-row sm:items-center">
          <p className="mr-auto text-xs font-bold text-ink">
            {selected.length} selected
          </p>
          <button
            disabled={pending}
            onClick={() => runBulk("publish")}
            className="rounded-full border border-line bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[.1em]"
          >
            Publish
          </button>
          <button
            disabled={pending}
            onClick={() => runBulk("draft")}
            className="rounded-full border border-line bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[.1em]"
          >
            Move to drafts
          </button>
          <div className="flex items-center rounded-full border border-line bg-white pl-3">
            <FolderInput size={13} className="text-stone" />
            <select
              aria-label="Bulk category"
              value={bulkCategory}
              onChange={(event) => {
                const value = event.target.value;
                setBulkCategory(value);
                if (value) runBulk("category", value);
              }}
              className="min-h-9 bg-transparent px-2 pr-4 text-[10px] font-bold uppercase tracking-[.08em] outline-none"
            >
              <option value="">Change category</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>
          <button
            disabled={pending}
            onClick={() => runBulk("delete")}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-red-50 px-4 py-2 text-[10px] font-bold uppercase tracking-[.1em] text-red-700"
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      )}

      {message && (
        <p className="border-b border-line bg-paper px-5 py-3 text-xs text-stone" role="status">
          {message}
        </p>
      )}

      {filtered.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b border-line bg-[#faf8f2] text-[9px] font-bold uppercase tracking-[.15em] text-stone">
                <th className="w-12 px-5 py-3">
                  <input
                    type="checkbox"
                    aria-label="Select all visible posts"
                    checked={allVisibleSelected}
                    onChange={(event) => {
                      const visibleIds = filtered.map((post) => post.id);
                      setSelected((current) =>
                        event.target.checked
                          ? Array.from(new Set([...current, ...visibleIds]))
                          : current.filter((id) => !visibleIds.includes(id)),
                      );
                    }}
                    className="accent-terracotta"
                  />
                </th>
                <th className="px-3 py-3">Story</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((post) => (
                <tr key={post.id} className="border-b border-line/70 last:border-0 hover:bg-[#fcfaf5]">
                  <td className="px-5 py-4">
                    <input
                      type="checkbox"
                      aria-label={`Select ${post.title}`}
                      checked={selected.includes(post.id)}
                      onChange={(event) =>
                        setSelected((current) =>
                          event.target.checked
                            ? [...current, post.id]
                            : current.filter((id) => id !== post.id),
                        )
                      }
                      className="accent-terracotta"
                    />
                  </td>
                  <td className="px-3 py-4">
                    <Link
                      href={`/dashboard/posts/${post.id}/edit`}
                      className="block max-w-sm text-sm font-bold text-ink hover:text-terracotta"
                    >
                      {post.title}
                    </Link>
                    <p className="mt-1 max-w-sm truncate text-[10px] text-stone">/{post.slug}</p>
                  </td>
                  <td className="px-4 py-4 text-xs font-medium text-stone">
                    {post.category?.name ?? "Uncategorized"}
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={post.status}>{post.status}</Badge>
                    {post.status === "scheduled" && post.published_at && (
                      <p className="mt-1.5 flex items-center gap-1 text-[9px] text-stone">
                        <CalendarClock size={10} /> {formatDate(post.published_at, "short")}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4 font-display text-lg text-ink">{post.view_count}</td>
                  <td className="px-4 py-4 text-xs text-stone">{formatDate(post.updated_at, "short")}</td>
                  <td className="px-5 py-4"><PostRowActions post={post} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid place-items-center px-5 py-20 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-cream text-terracotta">
            <FileText size={21} />
          </span>
          <h3 className="mt-4 font-display text-2xl font-medium">No stories match</h3>
          <p className="mt-2 text-sm text-stone">Adjust the filters or start a new story.</p>
        </div>
      )}
    </section>
  );
}

function FilterSelect({
  value,
  onChange,
  label,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-10 w-full appearance-none rounded-lg border border-line bg-paper px-3 pr-8 text-xs font-semibold text-stone outline-none focus:border-terracotta"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone" size={13} />
    </label>
  );
}
