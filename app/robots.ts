import type { MetadataRoute } from "next";
import { absoluteUrl, IS_PREVIEW } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: IS_PREVIEW ? undefined : "/",
        disallow: IS_PREVIEW ? "/" : ["/dashboard", "/login"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
