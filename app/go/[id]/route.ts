import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const fallback = new URL("/blog", request.url);
  if (!isSupabaseConfigured()) return NextResponse.redirect(fallback);

  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("track_affiliate_click", {
    target_link_id: id,
  });

  if (error || !data) return NextResponse.redirect(fallback);
  try {
    const destination = new URL(String(data));
    if (!["http:", "https:"].includes(destination.protocol)) {
      return NextResponse.redirect(fallback);
    }
    return NextResponse.redirect(destination);
  } catch {
    return NextResponse.redirect(fallback);
  }
}
