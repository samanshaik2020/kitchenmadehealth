import { Images } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { HtmlImageLibrary } from "@/components/admin/html-image-library";
import { PdfLibrary } from "@/components/admin/pdf-library";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function MediaPage() {
  const configured = isSupabaseConfigured();
  return <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-7 lg:p-10">
    <AdminPageHeader eyebrow="Media uploads" title="Images & PDFs" description="Upload images and PDFs, copy their public links, and reuse them in your articles and HTML pages." icon={Images} />
    <nav aria-label="Media sections" className="flex gap-3"><a href="#images" className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">Images</a><a href="#pdfs" className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold">PDFs</a></nav>
    <div id="images" className="scroll-mt-6"><HtmlImageLibrary supabaseConfigured={configured} /></div>
    <div id="pdfs" className="scroll-mt-6"><PdfLibrary supabaseConfigured={configured} /></div>
  </div>;
}
