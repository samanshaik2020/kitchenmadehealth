import { NextResponse } from "next/server";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const fallback = new URL("/products", request.url);
  if (!isSupabaseConfigured()) return NextResponse.redirect(fallback);

  const { id } = await params;
  const parsedId = z.string().uuid().safeParse(id);
  if (!parsedId.success) return NextResponse.redirect(fallback);

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("track_product_click", {
    target_product_id: parsedId.data,
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
