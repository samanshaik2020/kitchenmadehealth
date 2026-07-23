import { PostForm } from "@/components/admin/post-form";
import { createPost } from "@/app/(admin)/dashboard/actions";
import { getCategories } from "@/lib/posts";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function NewPostPage() {
  const categories = await getCategories();
  return (
    <PostForm
      categories={categories}
      action={createPost}
      supabaseConfigured={isSupabaseConfigured()}
    />
  );
}
