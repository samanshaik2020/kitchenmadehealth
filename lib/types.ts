export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
};

export type PostStatus = "draft" | "published";

export type Post = {
  id: string;
  author_id: string;
  category_id: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  status: PostStatus;
  seo_title: string | null;
  seo_description: string | null;
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category: Category | null;
};

export type PostInput = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  category_id: string;
  status: PostStatus;
  seo_title: string;
  seo_description: string;
};

export type ActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};
