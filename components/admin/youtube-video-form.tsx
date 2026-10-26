"use client";

import { useActionState, useState } from "react";
import { ExternalLink, LoaderCircle, Play, Save, X } from "lucide-react";
import { saveYouTubeVideos } from "@/app/(admin)/dashboard/videos/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCoverImage } from "@/components/ui/user-cover-image";
import { getYouTubeVideoId, YOUTUBE_SLOT_COUNT, youtubeThumbnailUrl, youtubeWatchUrl, type YouTubeVideo } from "@/lib/youtube";
import type { ActionState } from "@/lib/types";

export function YouTubeVideoForm({ videos, loadError }: { videos: YouTubeVideo[]; loadError?: string }) {
  const [state, action, pending] = useActionState(saveYouTubeVideos, { success: false, message: "" } as ActionState);
  const [slots, setSlots] = useState(() => Array.from({ length: YOUTUBE_SLOT_COUNT }, (_, index) => {
    const video = videos.find((item) => item.slot === index + 1);
    return { url: video?.video_id ? youtubeWatchUrl(video.video_id) : "", title: video?.title ?? "" };
  }));

  function updateSlot(index: number, field: "url" | "title", value: string) {
    setSlots((current) => current.map((slot, i) => i === index ? { ...slot, [field]: value } : slot));
  }

  return (
    <form action={action} className="mt-8">
      {loadError && <p role="alert" className="mb-6 border border-red-200 bg-red-50 p-4 text-sm text-red-800">{loadError}</p>}
      {state.message && <p role="status" className={`mb-6 border p-4 text-sm ${state.success ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}>{state.message}</p>}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {slots.map((slot, index) => {
          const videoId = getYouTubeVideoId(slot.url);
          const error = state.errors?.[`url_${index + 1}`]?.[0];
          return (
            <fieldset key={index} disabled={pending || Boolean(loadError)} className="min-w-0 border border-line bg-white p-5">
              <legend className="px-2 text-xs font-bold uppercase tracking-wider text-terracotta">Video {index + 1}</legend>
              <div className="relative aspect-video overflow-hidden bg-cream">
                {videoId ? (
                  <a href={youtubeWatchUrl(videoId)} target="_blank" rel="noopener noreferrer" aria-label={`Preview video ${index + 1} on YouTube`}>
                    <UserCoverImage key={videoId} src={youtubeThumbnailUrl(videoId)} alt={slot.title || `Video ${index + 1} thumbnail`} />
                    <span className="absolute inset-0 grid place-items-center"><Play className="rounded-full bg-ink/80 p-3 text-white" size={48} fill="currentColor" /></span>
                  </a>
                ) : <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-xs text-stone"><Play size={24} />Paste a URL to preview</span>}
              </div>
              <div className="mt-4">
                <Label htmlFor={`url_${index + 1}`}>YouTube URL</Label>
                <Input id={`url_${index + 1}`} name={`url_${index + 1}`} type="url" value={slot.url} onChange={(event) => updateSlot(index, "url", event.target.value)} placeholder="https://www.youtube.com/watch?v=…" aria-invalid={Boolean(error)} aria-describedby={error ? `url_error_${index + 1}` : undefined} />
                {error && <p id={`url_error_${index + 1}`} className="mt-2 text-xs text-red-700">{error}</p>}
              </div>
              <div className="mt-4">
                <Label htmlFor={`title_${index + 1}`}>Title (optional)</Label>
                <Input id={`title_${index + 1}`} name={`title_${index + 1}`} value={slot.title} maxLength={180} onChange={(event) => updateSlot(index, "title", event.target.value)} placeholder="A short title for this video" />
                {state.errors?.[`title_${index + 1}`] && <p className="mt-2 text-xs text-red-700">{state.errors[`title_${index + 1}`][0]}</p>}
              </div>
              {slot.url && <button type="button" onClick={() => { updateSlot(index, "url", ""); updateSlot(index, "title", ""); }} className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-stone"><X size={14} />Clear slot</button>}
            </fieldset>
          );
        })}
      </div>
      <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-xl text-xs leading-6 text-stone">The homepage shows two rows of three videos on desktop. The default picks are from the Kitchen Made Health channel; replace them here whenever you like. Empty slots stay hidden; clear a slot and save to remove a video.</p>
        <div className="flex items-center gap-4">
          <a href="/#youtube" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-semibold">View homepage <ExternalLink size={14} /></a>
          <button disabled={pending || Boolean(loadError)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-xs font-bold text-white disabled:opacity-50">{pending ? <LoaderCircle size={14} className="animate-spin" /> : <Save size={14} />}Save links</button>
        </div>
      </div>
    </form>
  );
}
