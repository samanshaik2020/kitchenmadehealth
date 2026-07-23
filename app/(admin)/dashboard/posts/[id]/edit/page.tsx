import { notFound } from "next/navigation";
import { updatePost } from "@/app/(admin)/dashboard/actions";
import { PostForm } from "@/components/admin/post-form";
import { getPostEditorData } from "@/lib/admin-data";
import { getCategories, getDashboardPost } from "@/lib/posts";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, categories, editorData] = await Promise.all([
    getDashboardPost(id),
    getCategories(),
    getPostEditorData(id),
  ]);
  if (!post) notFound();

  return (
    <PostForm
      post={post}
      categories={categories}
      {...editorData}
      action={updatePost.bind(null, id)}
      supabaseConfigured={isSupabaseConfigured()}
    />
  );
}
