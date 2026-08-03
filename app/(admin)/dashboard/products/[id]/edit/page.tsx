import { notFound } from "next/navigation";
import { updateProduct } from "@/app/(admin)/dashboard/products/actions";
import { ProductForm } from "@/components/admin/product-form";
import { getDashboardProduct } from "@/lib/products";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getDashboardProduct(id);
  if (!product) notFound();

  return (
    <ProductForm
      product={product}
      action={updateProduct.bind(null, id)}
      supabaseConfigured={isSupabaseConfigured()}
    />
  );
}
