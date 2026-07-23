import Link from "next/link";
import { BookOpen, ExternalLink, FilePlus2, LayoutDashboard, LogOut } from "lucide-react";
import { logout } from "@/app/(admin)/login/actions";
import { Logo } from "@/components/site/logo";

export function AdminSidebar() {
  return (
    <aside className="border-b border-line bg-ink text-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:border-b-0 lg:border-r lg:border-white/10">
      <div className="flex h-full flex-col p-4 lg:p-5">
        <div>
          <Logo inverse small />
        </div>
        <nav className="mt-4 flex gap-1 overflow-x-auto lg:mt-10 lg:block lg:space-y-1" aria-label="Editor navigation">
          <Link href="/dashboard" className="flex shrink-0 items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5 text-sm font-semibold text-white">
            <LayoutDashboard size={17} /> Dashboard
          </Link>
          <Link href="/dashboard/posts/new" className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/8 hover:text-white">
            <FilePlus2 size={17} /> New post
          </Link>
          <Link href="/blog" target="_blank" className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/8 hover:text-white">
            <BookOpen size={17} /> View site <ExternalLink size={12} className="ml-auto" />
          </Link>
        </nav>
        <div className="mt-auto hidden border-t border-white/10 pt-4 lg:block">
          <form action={logout}>
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/8 hover:text-white">
              <LogOut size={16} /> Sign out
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
