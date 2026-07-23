import { clsx, type ClassValue } from "clsx";
import slugifyPackage from "slugify";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string) {
  return slugifyPackage(value, { lower: true, strict: true, trim: true });
}

export function formatDate(value: string | null, style: "short" | "long" = "long") {
  if (!value) return "Not published";
  return new Intl.DateTimeFormat("en-US", {
    month: style === "short" ? "short" : "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function readingTime(html: string) {
  const words = html.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 220));
}
