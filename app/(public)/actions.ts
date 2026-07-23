"use server";

import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

export async function subscribeNewsletter(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = z.string().trim().email("Enter a valid email address.").safeParse(formData.get("email"));
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }
  if (!isSupabaseConfigured()) {
    return { success: true, message: "You’re on the preview list. Welcome to the kitchen." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("newsletter_subscribers").insert({
    email: parsed.data.toLowerCase(),
    status: "active",
    source: "website",
  });
  if (error) {
    if (error.code === "23505") {
      return { success: true, message: "You’re already on the list. Welcome back." };
    }
    const message =
      error.message.includes("does not exist") || error.message.includes("schema cache")
        ? "Subscriptions will open after the editorial database migration is applied."
        : "We couldn’t add you just now. Please try again.";
    return { success: false, message };
  }
  return { success: true, message: "You’re on the list. Welcome to the kitchen." };
}
