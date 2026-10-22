import { ArrowUpRight, Play, Youtube } from "lucide-react";
import { UserCoverImage } from "@/components/ui/user-cover-image";
import { youtubeThumbnailUrl, youtubeWatchUrl, type YouTubeVideo } from "@/lib/youtube";

export function YouTubeSection({ videos }: { videos: YouTubeVideo[] }) {
  const visible = videos.filter((video) => video.video_id).slice(0, 6);
  if (!visible.length) return null;
  return (
    <section id="youtube" aria-labelledby="youtube-heading" className="border-t border-line bg-cream py-20 md:py-28">
      <div className="container-wide">
        <div className="mb-10 flex flex-col gap-5 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow flex items-center gap-2 text-terracotta"><Youtube size={16} />Watch & learn</p>
            <h2 id="youtube-heading" className="mt-4 font-display text-5xl font-medium tracking-[-.055em] md:text-6xl">A little inspiration.</h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-stone">Fresh perspectives for everyday living. Choose a video to watch on YouTube.</p>
        </div>
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((video) => (
            <a key={video.slot} href={youtubeWatchUrl(video.video_id!)} target="_blank" rel="noopener noreferrer" className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracotta">
              <div className="relative aspect-video overflow-hidden bg-clay">
                <UserCoverImage src={youtubeThumbnailUrl(video.video_id!)} alt={video.title || `YouTube video ${video.slot}`} className="transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 grid place-items-center bg-black/10 transition group-hover:bg-black/20"><span className="grid size-14 place-items-center rounded-full bg-cream/95 text-ink shadow-lg transition group-hover:scale-110 group-hover:bg-terracotta group-hover:text-white"><Play size={22} fill="currentColor" /></span></div>
                <span className="absolute bottom-3 right-3 rounded-full bg-ink/85 px-3 py-1.5 text-[10px] font-bold text-white">YouTube <ArrowUpRight className="ml-1 inline" size={12} /></span>
              </div>
              <h3 className="mt-4 font-display text-2xl font-medium tracking-[-.03em]">{video.title || `Watch video ${video.slot}`}</h3>
              <p className="mt-1 text-xs text-stone">Watch on YouTube <span className="sr-only">(opens in a new tab)</span></p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
