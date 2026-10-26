import { PUBLIC_YOUTUBE_CACHE_TAG } from "@/lib/public-cache";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import { DEFAULT_YOUTUBE_VIDEOS, type YouTubeVideo } from "@/lib/youtube";

export async function getYouTubeVideos(): Promise<YouTubeVideo[]> {
  if (!isSupabaseConfigured()) return DEFAULT_YOUTUBE_VIDEOS;
  const { data, error } = await createPublicClient(PUBLIC_YOUTUBE_CACHE_TAG)
    .from("youtube_videos").select("slot,video_id,title").order("slot");
  if (error || !data?.length) return DEFAULT_YOUTUBE_VIDEOS;
  return data as YouTubeVideo[];
}
