"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  databaseUpgradeMessage,
  getAuthenticatedClient,
  logActivity,
} from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { ActionState } from "@/lib/types";

const webUrl = z
  .string()
  .trim()
  .url("Use a complete http or https URL.")
  .refine((value) => ["http:", "https:"].includes(new URL(value).protocol), {
    message: "Only http and https URLs are supported.",
  });

const productSchema = z.object({
  name: z.string().trim().min(2, "Enter the product name.").max(140),
  price: z.string().trim().min(1, "Enter the displayed price.").max(40),
  details: z
    .string()
    .trim()
    .min(10, "Add a short, useful product description.")
    .max(800, "Keep product details under 800 characters."),
  image_url: webUrl,
  image_alt: z.string().trim().max(180, "Alt text must be 180 characters or fewer."),
  affiliate_url: webUrl,
  button_label: z.string().trim().min(2, "Add a button label.").max(60),
  sort_order: z.coerce.number().int().min(0).max(9999),
  active: z.boolean(),
  featured: z.boolean(),
});

function parseProduct(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    details: formData.get("details"),
    image_url: formData.get("image_url"),
    image_alt: formData.get("image_alt"),
    affiliate_url: formData.get("affiliate_url"),
    button_label: formData.get("button_label"),
    sort_order: formData.get("sort_order") || "0",
    active: formData.get("active") === "on",
    featured: formData.get("featured") === "on",
  });
}

function revalidateProducts() {
  revalidatePath("/products");
  revalidatePath("/dashboard/products");
  revalidatePath("/sitemap.xml");
}

export async function createProduct(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseProduct(formData);
  if (!parsed.success) {
    return {
      success: false,
      message: "Check the highlighted product details and try again.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: true,
      message: "Preview mode: the product is valid and ready to save after Supabase is connected.",
    };
  }

  try {
    const { supabase, user } = await getAuthenticatedClient();
    const { data, error } = await supabase
      .from("products")
      .insert({
        ...parsed.data,
        image_alt: parsed.data.image_alt || null,
        created_by: user.id,
      })
      .select("id")
      .single();
    if (error) throw error;

    await logActivity(supabase, user.id, "created", "product", data.id, {
      name: parsed.data.name,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create the product.";
    return { success: false, message: databaseUpgradeMessage(message) };
  }

  revalidateProducts();
  redirect("/dashboard/products?created=1");
}

export async function updateProduct(
  id: string,
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const idResult = z.string().uuid().safeParse(id);
  if (!idResult.success) return { success: false, message: "This product has an invalid ID." };

  const parsed = parseProduct(formData);
  if (!parsed.success) {
    return {
      success: false,
      message: "Check the highlighted product details and try again.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  if (!isSupabaseConfigured()) {
    return { success: true, message: "Preview mode: the product update is valid." };
  }

  try {
    const { supabase, user } = await getAuthenticatedClient();
    const { data, error } = await supabase
      .from("products")
      .update({
        ...parsed.data,
        image_alt: parsed.data.image_alt || null,
      })
      .eq("id", idResult.data)
      .eq("created_by", user.id)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("This product no longer exists or you cannot edit it.");

    await logActivity(supabase, user.id, "updated", "product", idResult.data, {
      name: parsed.data.name,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update the product.";
    return { success: false, message: databaseUpgradeMessage(message) };
  }

  revalidateProducts();
  redirect("/dashboard/products?saved=1");
}

export async function toggleProduct(id: string, active: boolean) {
  const productId = z.string().uuid().parse(id);
  if (!isSupabaseConfigured()) return;

  const { supabase, user } = await getAuthenticatedClient();
  const { error } = await supabase
    .from("products")
    .update({ active })
    .eq("id", productId)
    .eq("created_by", user.id);
  if (error) throw new Error(databaseUpgradeMessage(error.message));

  await logActivity(
    supabase,
    user.id,
    active ? "product_enabled" : "product_hidden",
    "product",
    productId,
  );
  revalidateProducts();
}

export async function deleteProduct(id: string) {
  const productId = z.string().uuid().parse(id);
  if (!isSupabaseConfigured()) return;

  const { supabase, user } = await getAuthenticatedClient();
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("created_by", user.id);
  if (error) throw new Error(databaseUpgradeMessage(error.message));

  await logActivity(supabase, user.id, "deleted", "product", productId);
  revalidateProducts();
}
