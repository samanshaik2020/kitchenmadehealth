export const YOUTUBE_SLOT_COUNT = 6;
export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@kitchenmadehealth/videos";

export type YouTubeVideo = {
  slot: number;
  video_id: string | null;
  title: string;
};

// Selected from the Kitchen Made Health channel. Saved dashboard slots,
// including cleared slots, take precedence.
export const DEFAULT_YOUTUBE_VIDEOS: YouTubeVideo[] = [
  { slot: 1, video_id: "FTJk66U_dtA", title: "6 nutrient-dense foods for everyday meals" },
  { slot: 2, video_id: "n9Hcpyg3FK0", title: "Fibermaxxing: understanding fibre and gut health" },
  { slot: 3, video_id: "MRqHIsLbE_Q", title: "Food choices and blood sugar: what to watch for" },
  { slot: 4, video_id: "mLRV2etjqEw", title: "A calmer 30-minute bedtime routine" },
  { slot: 5, video_id: "cNFjjCyxNNc", title: "5 yoga poses for stress relief" },
  { slot: 6, video_id: "Vb8wMsUmI3A", title: "A guide to herbal teas: chamomile, ginger, and more" },
];

export function getYouTubeVideoId(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.port) return null;
    const host = url.hostname.toLowerCase();
    let id: string | null = null;
    if (host === "youtu.be" || host === "www.youtu.be") {
      if (!/^\/[^/]+\/?$/.test(url.pathname)) return null;
      id = url.pathname.split("/")[1];
    } else if (["youtube-nocookie.com", "www.youtube-nocookie.com"].includes(host)) {
      id = url.pathname.match(/^\/embed\/([^/]+)\/?$/)?.[1] ?? null;
    } else if (["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com"].includes(host)) {
      if (url.pathname === "/watch") id = url.searchParams.get("v");
      else id = url.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)\/?$/)?.[1] ?? null;
    }
    return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function youtubeWatchUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function youtubeEmbedUrl(videoId: string) {
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}

export function youtubeThumbnailUrl(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}
