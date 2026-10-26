import { Youtube } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { YouTubeVideoForm } from "@/components/admin/youtube-video-form";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { databaseUpgradeMessage } from "@/lib/admin-auth";
import { DEFAULT_YOUTUBE_VIDEOS, type YouTubeVideo } from "@/lib/youtube";

export default async function VideosDashboardPage() {
  let videos: YouTubeVideo[] = DEFAULT_YOUTUBE_VIDEOS;
  let loadError: string | undefined;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("youtube_videos").select("slot,video_id,title").order("slot");
    if (error) loadError = databaseUpgradeMessage(error.message);
    else if (data?.length) videos = data as YouTubeVideo[];
  }
  return (
    <div className="mx-auto max-w-[1500px] p-5 sm:p-8 lg:p-10">
      <AdminPageHeader eyebrow="Homepage watchlist" title="Watch & learn" description="Choose the six YouTube thumbnails above the homepage footer. They appear in two rows of three on desktop. These links are separate from optional videos inside your articles." icon={Youtube} />
      <YouTubeVideoForm videos={videos} loadError={loadError} />
    </div>
  );
}
