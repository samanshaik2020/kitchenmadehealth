import { createClient } from "@supabase/supabase-js";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { PUBLIC_POSTS_CACHE_TAG } from "@/lib/public-cache";

export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!expected || authorization !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json(
      { error: "Scheduling service is not configured." },
      { status: 503 },
    );
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.rpc("publish_scheduled_posts");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidateTag(PUBLIC_POSTS_CACHE_TAG, { expire: 0 });
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/dashboard");
  return NextResponse.json({ published: data ?? 0, checked_at: new Date().toISOString() });
}
