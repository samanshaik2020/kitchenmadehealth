import { FileCode2 } from "lucide-react";
import { HtmlPageManager } from "@/components/admin/html-page-manager";
import { AdminPageHeader } from "@/components/admin/page-header";
import { getDashboardHtmlPages } from "@/lib/html-pages";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function HtmlPagesDashboardPage() {
  const pages = await getDashboardHtmlPages();

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-7 lg:p-10">
      <AdminPageHeader
        eyebrow="Standalone publishing"
        title="HTML pages"
        description="Upload a complete, self-contained HTML document and publish it at a stable Kitchen Made Health URL. Existing slugs can be replaced without breaking their links."
        icon={FileCode2}
      />
      <HtmlPageManager pages={pages} supabaseConfigured={isSupabaseConfigured()} />
    </div>
  );
}
