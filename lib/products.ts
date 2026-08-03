import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

const PRODUCT_SELECT =
  "id,created_by,name,details,price,image_url,image_alt,affiliate_url,button_label,active,featured,sort_order,click_count,created_at,updated_at";

export async function getPublishedProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("active", true)
    .order("featured", { ascending: false })
    .order("sort_order")
    .order("created_at", { ascending: false });

  return error ? [] : ((data ?? []) as Product[]);
}

export async function getDashboardProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("featured", { ascending: false })
    .order("sort_order")
    .order("updated_at", { ascending: false });

  return error ? [] : ((data ?? []) as Product[]);
}

export async function getDashboardProduct(id: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle();

  return error ? null : (data as Product | null);
}
