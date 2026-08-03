"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  BookOpen,
  ExternalLink,
  FilePlus2,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Package,
  ShoppingBag,
  Tags,
} from "lucide-react";
import { logout } from "@/app/(admin)/login/actions";
import { Logo } from "@/components/site/logo";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/posts/new", label: "New story", icon: FilePlus2 },
  { href: "/dashboard/taxonomy", label: "Categories & tags", icon: Tags },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/affiliates", label: "Affiliate links", icon: ShoppingBag },
  { href: "/dashboard/comments", label: "Comments", icon: MessageSquareText },
  { href: "/dashboard/activity", label: "Activity", icon: Activity },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-white/10 bg-[#0b241a] text-white lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-72 lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col px-4 py-4 lg:px-5 lg:py-6">
        <div className="flex items-center justify-between">
          <Logo inverse small />
          <span className="hidden rounded-full border border-white/15 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[.16em] text-sage lg:inline-flex">
            Editorial OS
          </span>
        </div>

        <div className="mt-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mt-10 lg:overflow-visible">
          <p className="mb-3 hidden px-3 text-[9px] font-bold uppercase tracking-[.2em] text-white/30 lg:block">
            Workspace
          </p>
          <nav className="flex min-w-max gap-1 lg:block lg:min-w-0 lg:space-y-1" aria-label="Editor navigation">
            {navigation.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition lg:w-full",
                    active
                      ? "bg-cream text-ink shadow-[0_8px_28px_rgba(0,0,0,.15)]"
                      : "text-white/55 hover:bg-white/8 hover:text-white",
                  )}
                >
                  <Icon size={16} strokeWidth={1.7} />
                  {label}
                  {active && <span className="ml-auto hidden size-1.5 rounded-full bg-terracotta lg:block" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto hidden border-t border-white/10 pt-4 lg:block">
          <Link
            href="/blog"
            target="_blank"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-white/55 transition hover:bg-white/8 hover:text-white"
          >
            <BookOpen size={16} /> View live site <ExternalLink size={11} className="ml-auto" />
          </Link>
          <form action={logout}>
            <button className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-white/55 hover:bg-white/8 hover:text-white">
              <LogOut size={16} /> Sign out
            </button>
          </form>
          <p className="mt-5 px-3 text-[9px] leading-5 text-white/25">
            Kitchen Made Health
            <br />
            Editorial workspace · v2
          </p>
        </div>
      </div>
    </aside>
  );
}
