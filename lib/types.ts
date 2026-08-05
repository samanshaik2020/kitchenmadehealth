export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
  created_at?: string;
};

export type PostStatus = "draft" | "scheduled" | "published";

export type AffiliateLink = {
  id: string;
  post_id: string;
  product_name: string;
  merchant: string;
  destination_url: string;
  button_label: string;
  disclosure: string | null;
  click_count: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  created_by: string;
  name: string;
  details: string;
  price: string;
  image_url: string;
  image_alt: string | null;
  affiliate_url: string;
  button_label: string;
  active: boolean;
  featured: boolean;
  sort_order: number;
  click_count: number;
  created_at: string;
  updated_at: string;
};

export type HtmlPageStatus = "draft" | "published";

export type HtmlPage = {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  description: string | null;
  html_content?: string;
  original_filename: string;
  status: HtmlPageStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PostRevision = {
  id: string;
  post_id: string;
  author_id: string;
  snapshot: Record<string, unknown>;
  source: "autosave" | "manual" | "restore" | "publish";
  created_at: string;
};

export type CommentStatus = "pending" | "approved" | "spam";

export type Comment = {
  id: string;
  post_id: string;
  author_name: string;
  author_email: string;
  body: string;
  status: CommentStatus;
  created_at: string;
  moderated_at: string | null;
  post?: Pick<Post, "id" | "title" | "slug"> | null;
};

export type ActivityEntry = {
  id: number | string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type NewsletterSubscriber = {
  id: string;
  email: string;
  status: "active" | "unsubscribed";
  source: string;
  subscribed_at: string;
};

export type Post = {
  id: string;
  author_id: string;
  category_id: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  supporting_image_1_url?: string | null;
  supporting_image_1_alt?: string | null;
  supporting_image_2_url?: string | null;
  supporting_image_2_alt?: string | null;
  status: PostStatus;
  seo_title: string | null;
  seo_description: string | null;
  primary_keyword?: string | null;
  cover_image_alt?: string | null;
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category: Category | null;
  tags?: Tag[];
  affiliate_links?: AffiliateLink[];
};

export type PostInput = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  supporting_image_1_url: string;
  supporting_image_1_alt: string;
  supporting_image_2_url: string;
  supporting_image_2_alt: string;
  category_id: string;
  status: PostStatus;
  seo_title: string;
  seo_description: string;
  primary_keyword: string;
  cover_image_alt: string;
  published_at: string;
};

export type ActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};
