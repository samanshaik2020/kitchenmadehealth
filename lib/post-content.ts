import sanitizeHtml from "sanitize-html";
import { getYouTubeVideoId, youtubeEmbedUrl } from "@/lib/youtube";

export function sanitizePostContent(content: string) {
  return sanitizeHtml(content, {
    allowedTags: ["p", "h2", "h3", "h4", "strong", "em", "s", "blockquote", "ul", "ol", "li", "br", "a", "img", "code", "pre", "div", "iframe"],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      div: ["data-youtube-video"],
      iframe: ["src", "title", "loading", "allow", "allowfullscreen", "referrerpolicy"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedIframeHostnames: ["www.youtube-nocookie.com"],
    allowIframeRelativeUrls: false,
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
      iframe: (_tagName, attributes): sanitizeHtml.Tag => {
        const id = getYouTubeVideoId(attributes.src || "");
        if (!id) return { tagName: "span", attribs: {} };
        return { tagName: "iframe", attribs: {
          src: youtubeEmbedUrl(id), title: attributes.title?.slice(0, 180) || "YouTube video",
          loading: "lazy", allow: "encrypted-media; picture-in-picture; fullscreen",
          allowfullscreen: "", referrerpolicy: "strict-origin-when-cross-origin",
        } };
      },
    },
    exclusiveFilter: (frame) => frame.tag === "iframe" && !frame.attribs.src,
  });
}
