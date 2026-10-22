import { PUBLIC_YOUTUBE_CACHE_TAG } from "@/lib/public-cache";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import type { YouTubeVideo } from "@/lib/youtube";

export async function getYouTubeVideos(): Promise<YouTubeVideo[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await createPublicClient(PUBLIC_YOUTUBE_CACHE_TAG)
    .from("youtube_videos").select("slot,video_id,title").order("slot");
  if (error) return [];
  return data as YouTubeVideo[];
}
