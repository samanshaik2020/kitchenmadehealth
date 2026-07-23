import { PostForm } from "@/components/admin/post-form";
import { createPost } from "@/app/(admin)/dashboard/actions";
import { getPostEditorData } from "@/lib/admin-data";
import { getCategories } from "@/lib/posts";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function NewPostPage() {
  const [categories, editorData] = await Promise.all([
    getCategories(),
    getPostEditorData(),
  ]);
  return (
    <PostForm
      categories={categories}
      {...editorData}
      action={createPost}
      supabaseConfigured={isSupabaseConfigured()}
    />
  );
}
