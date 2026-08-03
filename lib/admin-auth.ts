import { createClient } from "@/lib/supabase/server";

export async function getAuthenticatedClient() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  return { supabase, user };
}

export async function logActivity(
  supabase: Awaited<ReturnType<typeof createClient>>,
  actorId: string,
  action: string,
  entityType: string,
  entityId?: string | null,
  metadata: Record<string, unknown> = {},
) {
  await supabase.from("activity_log").insert({
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId ?? null,
    metadata,
  });
}

export function databaseUpgradeMessage(message: string) {
  if (
    message.includes("does not exist") ||
    message.includes("schema cache") ||
    message.includes("column")
  ) {
    return "Run the pending SQL files in supabase/migrations, then try again.";
  }
  return message;
}
