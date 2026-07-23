export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key || key === "your-anon-key") return null;

  try {
    const parsed = new URL(url);
    const hasValidProtocol = parsed.protocol === "https:" || parsed.protocol === "http:";
    const hasProjectRootPath = parsed.pathname === "/" || parsed.pathname === "";

    if (!hasValidProtocol || !hasProjectRootPath) return null;
    return { url: parsed.origin, key };
  } catch {
    return null;
  }
}

export function isSupabaseConfigured() {
  return getSupabaseConfig() !== null;
}
