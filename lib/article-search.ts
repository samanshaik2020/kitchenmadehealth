export function normalizeSearchQuery(value: string | string[] | undefined) {
  const text = Array.isArray(value) ? value[0] : value;
  return (text || "").trim().replace(/\s+/g, " ").slice(0, 100);
}

// PostgREST's OR filter has its own punctuation syntax. Only put words into it.
export function searchFilterWords(value: string) {
  return value.replace(/[^\p{L}\p{N}\s-]/gu, " ").replace(/\s+/g, " ").trim();
}

export function parsePage(raw: string | string[] | undefined) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || !/^\d+$/.test(value)) return 1;
  return Math.min(10_000, Math.max(1, Number(value)));
}

export function journalHref(options: { category?: string; q?: string; page?: number }) {
  const params = new URLSearchParams();
  if (options.category) params.set("category", options.category);
  if (options.q) params.set("q", options.q);
  if (options.page && options.page > 1) params.set("page", String(options.page));
  return `/blog${params.size ? `?${params}` : ""}`;
}
