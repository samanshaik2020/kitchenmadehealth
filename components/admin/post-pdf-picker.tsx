"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FileText, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { listPostPdfs, pdfUploadErrorMessage, type LibraryPdf, type PostPdfAttachment } from "@/lib/post-pdfs";

export function PostPdfPicker({ attachment, onChange, disabled, supabaseConfigured }: {
  attachment: PostPdfAttachment | null; onChange: (attachment: PostPdfAttachment | null) => void;
  disabled: boolean; supabaseConfigured: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<LibraryPdf[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    if (!open || !supabaseConfigured) return;
    let cancelled = false;
    listPostPdfs(createClient()).then(items => { if (!cancelled) setFiles(items); }).catch(error => { if (!cancelled) setError(pdfUploadErrorMessage(error)); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, supabaseConfigured, refreshKey]);
  return <>
    {attachment && <div className="mt-4 flex items-start gap-3 border border-line bg-cream/50 p-3"><FileText size={20} className="shrink-0 text-terracotta" /><div className="min-w-0 flex-1"><p className="break-words text-xs font-semibold">{attachment.name}</p><p className="mt-1 text-xs text-stone">{(attachment.size/1_000_000).toFixed(2)} MB · PDF</p></div><button type="button" disabled={disabled} aria-label="Remove PDF attachment" onClick={() => onChange(null)} className="p-1"><X size={16} /></button></div>}
    <button type="button" disabled={disabled || !supabaseConfigured} aria-expanded={open} aria-controls="post-pdf-library" onClick={() => { setOpen(!open); if (!open) { setLoading(true); setError(""); } }} className="mt-4 min-h-11 rounded-full border border-line px-4 text-xs font-semibold disabled:opacity-50">{attachment ? "Change uploaded PDF" : "Choose uploaded PDF"}</button>
    <Link href="/dashboard/media#pdfs" target="_blank" className="mt-3 block text-xs font-semibold underline underline-offset-4">Upload PDFs in Images & PDFs<span className="sr-only"> (opens in a new tab)</span></Link>
    {open && <div id="post-pdf-library" role="region" aria-label="Choose an uploaded PDF" className="mt-4 border-t border-line pt-4">
      <button type="button" disabled={loading} className="mb-3 min-h-9 text-xs font-semibold underline" onClick={() => { setLoading(true); setError(""); setRefreshKey(key => key+1); }}>Refresh uploaded PDFs</button>
      {loading ? <p role="status" className="text-xs text-stone">Loading PDFs…</p> : error ? <p role="alert" className="text-xs text-red-700">{error}</p> : files.length ? <div className="max-h-72 space-y-2 overflow-y-auto">{files.map(pdf => <button key={pdf.path} type="button" disabled={disabled} onClick={() => { onChange({path:pdf.path,name:pdf.name,size:pdf.size}); setOpen(false); }} className="block w-full rounded-lg border border-line p-3 text-left text-xs font-semibold hover:bg-cream"><span className="block break-words">{pdf.name}</span><span className="mt-1 block font-normal text-stone">{(pdf.size/1_000_000).toFixed(2)} MB · Select PDF</span></button>)}</div> : <p className="text-xs leading-6 text-stone">No PDFs in this account yet. Upload one in Images & PDFs, then refresh this list.</p>}
    </div>}
  </>;
}
