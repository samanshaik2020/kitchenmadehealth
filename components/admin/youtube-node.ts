import { Node } from "@tiptap/react";
import { getYouTubeVideoId, youtubeEmbedUrl } from "@/lib/youtube";

export const YouTubeNode = Node.create({
  name: "youtubeVideo",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return { videoId: { default: null }, title: { default: "YouTube video" } };
  },
  parseHTML() {
    return [{ tag: "div[data-youtube-video]", getAttrs: (element) => {
      const frame = element.querySelector("iframe");
      const videoId = getYouTubeVideoId(frame?.getAttribute("src") || "");
      return videoId ? { videoId, title: frame?.getAttribute("title") || "YouTube video" } : false;
    } }];
  },
  renderHTML({ node }) {
    return ["div", { "data-youtube-video": "" }, ["iframe", {
      src: youtubeEmbedUrl(node.attrs.videoId), title: node.attrs.title,
      loading: "lazy", allow: "encrypted-media; picture-in-picture; fullscreen",
      allowfullscreen: "", referrerpolicy: "strict-origin-when-cross-origin",
    }]];
  },
});
