export const SITE_NAME = "Kitchen Made Health";
export const PRODUCTION_SITE_URL = "https://www.kitchenmadehealth.com";
export const SITE_DESCRIPTION =
  "Practical guides to food, everyday wellbeing, and a kitchen that supports healthier habits.";

export function resolveSiteUrl(value: string | undefined, production = false) {
  try {
    const url = new URL(value?.trim() || PRODUCTION_SITE_URL);
    const local = /^(localhost|127(?:\.\d+){3}|0\.0\.0\.0|\[::1\])$|\.(localhost|local)$/i.test(url.hostname);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || (production && (local || url.protocol !== "https:"))) {
      return PRODUCTION_SITE_URL;
    }
    if (["kitchenmadehealth.com", "www.kitchenmadehealth.com"].includes(url.hostname)) {
      return PRODUCTION_SITE_URL;
    }
    return url.origin;
  } catch {
    return PRODUCTION_SITE_URL;
  }
}

export const SITE_URL = resolveSiteUrl(
  process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL,
  process.env.NODE_ENV === "production" || process.env.VERCEL === "1",
);

export const IS_PREVIEW = process.env.VERCEL_ENV === "preview";
export const DEFAULT_SOCIAL_IMAGE = "/opengraph-image";

export function absoluteUrl(path = "/") {
  return new URL(path, `${SITE_URL}/`).href;
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function getInstagramUrl() {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_INSTAGRAM_URL || "");
    return url.protocol === "https:" && /^(www\.)?instagram\.com$/i.test(url.hostname) && url.pathname !== "/"
      ? url.href
      : null;
  } catch {
    return null;
  }
}
