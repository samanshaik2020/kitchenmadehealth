"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Clipboard, FileText, LoaderCircle, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { listPostPdfs, pdfUploadErrorMessage, uploadPostPdf, validatePostPdf, POST_PDF_BUCKET, type LibraryPdf } from "@/lib/post-pdfs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PdfLibrary({ supabaseConfigured }: { supabaseConfigured: boolean }) {
  const [files, setFiles] = useState<LibraryPdf[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(supabaseConfigured);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!supabaseConfigured) return;
    let cancelled = false;
    listPostPdfs(createClient()).then(items => { if (!cancelled) setFiles(items); }).catch(error => { if (!cancelled) setError(pdfUploadErrorMessage(error)); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [supabaseConfigured, refreshKey]);

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || uploading || !supabaseConfigured) return;
    setUploading(true); setError(""); setNotice("");
    try {
      const client = createClient();
      const attachment = await uploadPostPdf(client, file);
      const publicUrl = client.storage.from(POST_PDF_BUCKET).getPublicUrl(attachment.path).data.publicUrl;
      setFiles(current => [{ ...attachment, publicUrl }, ...current].slice(0, 100));
      setFile(null); if (fileInput.current) fileInput.current.value = "";
      setNotice("PDF uploaded. Copy its link or choose it from the article editor.");
    } catch (error) { setError(pdfUploadErrorMessage(error)); } finally { setUploading(false); }
  }

  return <section aria-labelledby="pdf-library-title" className="overflow-hidden border border-line bg-white">
    <div className="flex items-start justify-between gap-4 border-b border-line p-6">
      <div><p className="eyebrow text-terracotta">Reusable PDF links</p><h2 id="pdf-library-title" className="mt-2 font-display text-3xl font-medium">PDF library</h2><p className="mt-2 text-xs leading-6 text-stone">Upload a PDF here, then attach it to a story from the editor. Uploaded files have public links, so use documents intended for your readers.</p></div>
      <button type="button" aria-label="Refresh PDFs" disabled={!supabaseConfigured || loading || uploading} onClick={() => { setLoading(true); setError(""); setRefreshKey(key => key + 1); }} className="grid size-10 shrink-0 place-items-center rounded-full border border-line disabled:opacity-50"><RefreshCw size={15} className={loading ? "animate-spin" : ""} /></button>
    </div>
    <form onSubmit={upload} className="space-y-4 border-b border-line p-6">
      <div><Label htmlFor="library-pdf-file">PDF file</Label><Input ref={fileInput} id="library-pdf-file" type="file" accept=".pdf,application/pdf" disabled={!supabaseConfigured || uploading} aria-describedby="library-pdf-help" onChange={event => { const selected = event.target.files?.[0] ?? null; const issue = selected ? validatePostPdf(selected) : null; setFile(issue ? null : selected); setError(issue || ""); setNotice(""); }} /><p id="library-pdf-help" className="mt-2 text-xs text-stone">PDF only · below 5 MB. Files remain available when detached from an article.</p></div>
      {!supabaseConfigured && <p className="text-xs text-amber-800">Connect Supabase to upload PDFs.</p>}
      <button type="submit" disabled={!supabaseConfigured || !file || loading || uploading} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-terracotta px-5 text-xs font-bold text-white disabled:opacity-50">{uploading ? <LoaderCircle size={16} className="animate-spin" /> : <FileText size={16} />}{uploading ? "Uploading PDF…" : "Upload PDF & get link"}</button>
    </form>
    {error && <p role="alert" className="m-6 bg-red-50 p-3 text-xs text-red-800">{error}</p>}
    {notice && <p role="status" className="m-6 bg-emerald-50 p-3 text-xs text-emerald-800">{notice}</p>}
    {loading ? <p role="status" className="p-6 text-xs text-stone">Loading PDFs…</p> : files.length ? <div className="divide-y divide-line">{files.map(pdf => <article key={pdf.path} className="p-6">
      <p className="break-words text-sm font-semibold">{pdf.name}</p><p className="mt-1 text-xs text-stone">{(pdf.size / 1_000_000).toFixed(2)} MB · PDF</p>
      <Label className="mt-3" htmlFor={`pdf-url-${pdf.path.split('/').pop()}`}>Public PDF URL</Label><Input id={`pdf-url-${pdf.path.split('/').pop()}`} readOnly value={pdf.publicUrl} onFocus={event => event.currentTarget.select()} className="text-xs" />
      <div className="mt-3 flex flex-wrap gap-3"><button type="button" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line px-4 text-xs font-semibold" onClick={async () => { try { await navigator.clipboard.writeText(pdf.publicUrl); setNotice(`Copied the link for ${pdf.name}.`); } catch { setError("Select the public URL and copy it manually."); } }}><Clipboard size={14} />Copy PDF link</button><a href={pdf.publicUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center px-3 text-xs font-semibold underline">Open PDF<span className="sr-only"> (opens in a new tab)</span></a></div>
    </article>)}</div> : <p className="p-6 text-xs text-stone">No PDFs uploaded from this account yet.</p>}
  </section>;
}
