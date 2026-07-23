import { Activity } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { getActivityLog } from "@/lib/admin-data";
import { formatDate } from "@/lib/utils";

export default async function ActivityPage() {
  const activity = await getActivityLog();

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-7 lg:p-10">
      <AdminPageHeader
        eyebrow="Editorial memory"
        title="Activity log"
        description="A durable trail of publishing, editing, taxonomy, moderation, and affiliate changes—even for a solo editorial desk."
        icon={Activity}
      />

      <section className="mt-8 border border-line bg-white p-5 md:p-7">
        {activity.length ? (
          <div className="relative ml-2 border-l border-line pl-7">
            {activity.map((entry, index) => (
              <article key={entry.id} className={index === activity.length - 1 ? "pb-1" : "pb-8"}>
                <span className="absolute -left-[5px] mt-1.5 size-2.5 rounded-full border-2 border-white bg-terracotta shadow" />
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-bold capitalize">{entry.action.replaceAll("_", " ")}</p>
                    <p className="mt-1 text-xs text-stone">
                      {entry.actor_id ? `Editor ${entry.actor_id.slice(0, 8)} · ` : "Preview editor · "}
                      {entry.entity_type}
                      {typeof entry.metadata.title === "string" ? ` · ${entry.metadata.title}` : ""}
                    </p>
                  </div>
                  <time className="text-[10px] font-bold uppercase tracking-[.1em] text-stone">
                    {formatDate(entry.created_at)}
                  </time>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="py-14 text-center">
            <Activity className="mx-auto text-terracotta" size={25} />
            <h2 className="mt-4 font-display text-3xl font-medium">No recorded activity yet</h2>
          </div>
        )}
      </section>
    </div>
  );
}
