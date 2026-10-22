"use server";

import { revalidatePath, updateTag } from "next/cache";
import { databaseUpgradeMessage, getAuthenticatedClient } from "@/lib/admin-auth";
import { PUBLIC_YOUTUBE_CACHE_TAG } from "@/lib/public-cache";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { ActionState } from "@/lib/types";
import { getYouTubeVideoId, YOUTUBE_SLOT_COUNT } from "@/lib/youtube";

export async function saveYouTubeVideos(_state: ActionState, formData: FormData): Promise<ActionState> {
  const errors: Record<string, string[]> = {};
  const rows = Array.from({ length: YOUTUBE_SLOT_COUNT }, (_, index) => {
    const slot = index + 1;
    const url = String(formData.get(`url_${slot}`) ?? "").trim();
    const title = String(formData.get(`title_${slot}`) ?? "").trim();
    const video_id = url ? getYouTubeVideoId(url) : null;
    if (url && !video_id) errors[`url_${slot}`] = ["Paste a valid YouTube video URL."];
    if (title.length > 180) errors[`title_${slot}`] = ["Use 180 characters or fewer."];
    return { slot, video_id, title: video_id ? title : "" };
  });
  if (Object.keys(errors).length) return { success: false, message: "Check the highlighted fields.", errors };
  if (!isSupabaseConfigured()) return { success: false, message: "Connect Supabase to save your YouTube links." };
  try {
    const { supabase, user } = await getAuthenticatedClient();
    const { error } = await supabase.from("youtube_videos").upsert(rows.map((row) => ({
      ...row, updated_by: user.id, updated_at: new Date().toISOString(),
    })), { onConflict: "slot" });
    if (error) return { success: false, message: databaseUpgradeMessage(error.message) };
    updateTag(PUBLIC_YOUTUBE_CACHE_TAG);
    revalidatePath("/");
    revalidatePath("/dashboard/videos");
    return { success: true, message: "YouTube links saved. Your homepage thumbnails are updated." };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Unable to save YouTube links. Please try again." };
  }
}
