import { createProduct } from "@/app/(admin)/dashboard/products/actions";
import { ProductForm } from "@/components/admin/product-form";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function NewProductPage() {
  return (
    <ProductForm
      action={createProduct}
      supabaseConfigured={isSupabaseConfigured()}
    />
  );
}
