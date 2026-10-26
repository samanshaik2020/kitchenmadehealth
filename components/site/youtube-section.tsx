import { ArrowUpRight, Play, Youtube } from "lucide-react";
import { UserCoverImage } from "@/components/ui/user-cover-image";
import { YOUTUBE_CHANNEL_URL, youtubeThumbnailUrl, youtubeWatchUrl, type YouTubeVideo } from "@/lib/youtube";

export function YouTubeSection({ videos }: { videos: YouTubeVideo[] }) {
  const visible = videos.filter((video) => video.video_id).slice(0, 6);
  if (!visible.length) return null;
  return (
    <section id="youtube" aria-labelledby="youtube-heading" className="watch-section border-t border-line bg-cream py-20 md:py-24">
      <div className="container-wide">
        <div className="mb-10 flex flex-col gap-5 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow flex items-center gap-2 text-terracotta"><Youtube size={16} />Watch & learn</p>
            <h2 id="youtube-heading" className="mt-4 font-display text-5xl font-medium tracking-[-.045em] md:text-6xl">Good things to <span className="italic text-terracotta">take in.</span></h2>
          </div>
          <div className="max-w-sm">
            <p className="text-sm leading-7 text-stone">From the Kitchen Made Health channel: food ideas, everyday wellbeing, and small rituals to explore at home.</p>
            <a href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 border-b border-ink/40 pb-1.5 text-[10px] font-bold uppercase tracking-[.13em] text-ink transition hover:border-terracotta hover:text-terracotta">
              Browse all videos <ArrowUpRight size={14} /><span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
        <div className="grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((video) => (
            <a key={video.slot} href={youtubeWatchUrl(video.video_id!)} target="_blank" rel="noopener noreferrer" className="video-card group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracotta">
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-clay shadow-sm">
                <UserCoverImage src={youtubeThumbnailUrl(video.video_id!)} alt={video.title || `YouTube video ${video.slot}`} className="transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 grid place-items-center bg-black/10 transition group-hover:bg-black/20"><span className="grid size-14 place-items-center rounded-full bg-cream/95 text-ink shadow-lg transition group-hover:scale-110 group-hover:bg-terracotta group-hover:text-white"><Play size={22} fill="currentColor" /></span></div>
                <span className="absolute bottom-3 right-3 rounded-full bg-ink/85 px-3 py-1.5 text-[10px] font-bold text-white">YouTube <ArrowUpRight className="ml-1 inline" size={12} /></span>
              </div>
              <h3 className="mt-4 font-display text-[1.65rem] font-medium leading-tight tracking-[-.025em] transition-colors group-hover:text-terracotta">{video.title || `Watch video ${video.slot}`}</h3>
              <p className="mt-1 text-xs text-stone">Watch on YouTube <span className="sr-only">(opens in a new tab)</span></p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
