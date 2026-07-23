import { Check, MessageSquareText, ShieldAlert } from "lucide-react";
import { moderateComment } from "@/app/(admin)/dashboard/actions";
import { AdminPageHeader } from "@/components/admin/page-header";
import { getAdminComments } from "@/lib/admin-data";
import { formatDate } from "@/lib/utils";

export default async function CommentsPage() {
  const comments = await getAdminComments();
  const pending = comments.filter((comment) => comment.status === "pending").length;

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-7 lg:p-10">
      <AdminPageHeader
        eyebrow="Community care"
        title="Comments moderation"
        description="The moderation surface is ready for public comments whenever you enable them. Review first, approve thoughtfully, and keep spam away from the journal."
        icon={MessageSquareText}
        action={
          <span className="rounded-full bg-amber-100 px-4 py-2 text-[10px] font-bold uppercase tracking-[.11em] text-amber-800">
            {pending} pending
          </span>
        }
      />

      <section className="mt-8 overflow-hidden border border-line bg-white">
        {comments.length ? (
          <div className="divide-y divide-line">
            {comments.map((comment) => (
              <article key={comment.id} className="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:p-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold">{comment.author_name}</p>
                    <span className="text-[10px] text-stone">{comment.author_email}</span>
                    <Status status={comment.status} />
                  </div>
                  <blockquote className="mt-4 max-w-3xl font-display text-xl leading-8 text-ink">
                    “{comment.body}”
                  </blockquote>
                  <p className="mt-3 text-[10px] text-stone">
                    {comment.post?.title ?? "Unknown story"} · {formatDate(comment.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2 md:self-center">
                  <form action={moderateComment.bind(null, comment.id, "approved")}>
                    <button className="inline-flex min-h-10 items-center gap-2 rounded-full bg-sage/20 px-4 text-[9px] font-bold uppercase tracking-[.1em] text-sage-dark">
                      <Check size={13} /> Approve
                    </button>
                  </form>
                  <form action={moderateComment.bind(null, comment.id, "spam")}>
                    <button className="inline-flex min-h-10 items-center gap-2 rounded-full bg-red-50 px-4 text-[9px] font-bold uppercase tracking-[.1em] text-red-700">
                      <ShieldAlert size={13} /> Spam
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center">
            <MessageSquareText className="mx-auto text-terracotta" size={25} />
            <h2 className="mt-4 font-display text-3xl font-medium">The conversation is quiet</h2>
            <p className="mt-2 text-sm text-stone">Comments will collect here when enabled.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function Status({ status }: { status: "pending" | "approved" | "spam" }) {
  const styles = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-sage/20 text-sage-dark",
    spam: "bg-red-50 text-red-700",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.1em] ${styles[status]}`}>
      {status}
    </span>
  );
}
