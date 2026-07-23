import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseConfigured()) return new NextResponse(null, { status: 204 });
  const { id } = await params;
  const supabase = await createClient();
  const { error } = await supabase.rpc("track_post_view", { target_post_id: id });
  if (error) return NextResponse.json({ error: "View was not recorded." }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
