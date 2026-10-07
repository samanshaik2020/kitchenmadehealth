import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/supabase/env";

// Published content is shared by all visitors; never attach an editor's cookies.
export function createPublicClient(cacheTag: string) {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return createClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch(input, init) {
        if (init?.method && init.method.toUpperCase() !== "GET") {
          return fetch(input, { ...init, cache: "no-store" });
        }
        return fetch(input, {
          ...init,
          cache: "force-cache",
          next: { revalidate: 300, tags: [cacheTag] },
        });
      },
    },
  });
}
