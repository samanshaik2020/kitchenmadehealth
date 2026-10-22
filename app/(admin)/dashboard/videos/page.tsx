import { Youtube } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { YouTubeVideoForm } from "@/components/admin/youtube-video-form";
import { databaseUpgradeMessage, getAuthenticatedClient } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { YouTubeVideo } from "@/lib/youtube";

export default async function VideosDashboardPage() {
  let videos: YouTubeVideo[] = [];
  let loadError: string | undefined;
  if (isSupabaseConfigured()) {
    const { supabase } = await getAuthenticatedClient();
    const { data, error } = await supabase.from("youtube_videos").select("slot,video_id,title").order("slot");
    if (error) loadError = databaseUpgradeMessage(error.message);
    else videos = data as YouTubeVideo[];
  }
  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-7 lg:p-10">
      <AdminPageHeader eyebrow="Watch & learn" title="YouTube links" description="Add up to six YouTube video URLs. The homepage displays linked thumbnails in two rows of three. Readers open each video on YouTube." icon={Youtube} />
      <YouTubeVideoForm videos={videos} loadError={loadError} />
    </div>
  );
}
