"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ImagePlus,
  LoaderCircle,
  Package,
  Save,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserCoverImage } from "@/components/ui/user-cover-image";
import { createClient } from "@/lib/supabase/client";
import type { ActionState, Product } from "@/lib/types";

const initialState: ActionState = { success: false, message: "" };

type ProductAction = (
  previousState: ActionState,
  formData: FormData,
) => Promise<ActionState>;

export function ProductForm({
  product,
  action,
  supabaseConfigured,
}: {
  product?: Product;
  action: ProductAction;
  supabaseConfigured: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product?.price ?? "");
  const [details, setDetails] = useState(product?.details ?? "");
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "");
  const [imageAlt, setImageAlt] = useState(product?.image_alt ?? "");
  const [buttonLabel, setButtonLabel] = useState(product?.button_label ?? "View product");
  const [affiliateUrl, setAffiliateUrl] = useState(product?.affiliate_url ?? "");
  const [active, setActive] = useState(product?.active ?? true);
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [sortOrder, setSortOrder] = useState(product?.sort_order ?? 0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const fieldError = (field: string) =>
    state.errors?.[field]?.[0] ? (
      <p className="mt-1.5 text-xs font-medium text-red-700">{state.errors[field][0]}</p>
    ) : null;

  async function uploadImage(file?: File) {
    if (!file) return;
    if (!supabaseConfigured) {
      setUploadError("Connect Supabase before uploading. You can paste a public image URL for now.");
      return;
    }
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setUploadError("Choose a JPG, PNG, or WebP image under 5 MB.");
      return;
    }

    setUploading(true);
    setUploadError("");
    try {
      const supabase = createClient();
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `catalog/${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setImageUrl(data.publicUrl);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={formAction}>
      <div className="sticky top-0 z-30 border-b border-white/10 bg-[#0b241a]/96 text-white shadow-lg backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 sm:px-7 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/dashboard/products"
              className="grid size-9 shrink-0 place-items-center rounded-full border border-white/15 bg-white/5 text-white/65 hover:text-white"
              aria-label="Back to products"
            >
              <ArrowLeft size={15} />
            </Link>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold uppercase tracking-[.1em] text-white/85">
                {product ? "Edit product" : "New product"}
              </p>
              <p className="mt-0.5 truncate text-[10px] text-white/40">
                Public product shelf
              </p>
            </div>
          </div>
          <button
            type="submit"
            disabled={pending || uploading}
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-terracotta px-5 text-[10px] font-bold uppercase tracking-[.1em] text-white transition hover:bg-terracotta-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? <LoaderCircle size={14} className="animate-spin" /> : <Save size={14} />}
            {pending ? "Saving" : product ? "Update product" : "Add product"}
          </button>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1400px] gap-7 p-4 sm:p-7 lg:grid-cols-[minmax(0,1fr)_22rem] lg:p-10 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <main className="space-y-6">
          {state.message && (
            <div
              role="status"
              className={`border px-4 py-3 text-sm ${
                state.success
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {state.message}
            </div>
          )}

          <section className="border border-line bg-white p-5 sm:p-7">
            <div className="flex items-center gap-3 border-b border-line pb-5">
              <span className="grid size-9 place-items-center rounded-full bg-terracotta/10 text-terracotta">
                <Package size={16} />
              </span>
              <div>
                <p className="eyebrow text-terracotta">Essential details</p>
                <h1 className="mt-1 font-display text-3xl font-medium">What readers will see</h1>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="name">Product name</Label>
                <Input
                  id="name"
                  name="name"
                  value={name}
                  maxLength={140}
                  required
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Magic Bullet personal blender"
                />
                {fieldError("name")}
              </div>
              <div>
                <Label htmlFor="price">Displayed price</Label>
                <Input
                  id="price"
                  name="price"
                  value={price}
                  maxLength={40}
                  required
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="$59.99"
                />
                <p className="mt-1.5 text-[10px] leading-5 text-stone">
                  Include the currency symbol exactly as readers should see it.
                </p>
                {fieldError("price")}
              </div>
              <div>
                <Label htmlFor="sort_order">Display order</Label>
                <Input
                  id="sort_order"
                  name="sort_order"
                  type="number"
                  min={0}
                  max={9999}
                  value={sortOrder}
                  onChange={(event) => setSortOrder(Number(event.target.value))}
                />
                <p className="mt-1.5 text-[10px] leading-5 text-stone">
                  Lower numbers appear first after featured products.
                </p>
                {fieldError("sort_order")}
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="details">Short details</Label>
                <Textarea
                  id="details"
                  name="details"
                  value={details}
                  maxLength={800}
                  required
                  onChange={(event) => setDetails(event.target.value)}
                  placeholder="A concise reason this product earns a place in the collection."
                  className="min-h-36"
                />
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-stone">
                  <span>Keep it useful, specific, and easy to scan.</span>
                  <span>{details.length}/800</span>
                </div>
                {fieldError("details")}
              </div>
            </div>
          </section>

          <section className="border border-line bg-white p-5 sm:p-7">
            <div className="border-b border-line pb-5">
              <p className="eyebrow text-terracotta">Product image</p>
              <h2 className="mt-2 font-display text-3xl font-medium">Make the product clear at a glance</h2>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-[15rem_1fr]">
              <div className="relative aspect-square overflow-hidden border border-dashed border-line bg-cream/45">
                {imageUrl ? (
                  <>
                    <UserCoverImage src={imageUrl} alt={imageAlt || name || "Product preview"} />
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      aria-label="Remove product image"
                      className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-ink/80 text-white"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    className="grid size-full place-items-center p-5 text-center text-stone"
                  >
                    <span>
                      {uploading ? (
                        <LoaderCircle size={24} className="mx-auto animate-spin" />
                      ) : (
                        <ImagePlus size={24} className="mx-auto text-terracotta" />
                      )}
                      <span className="mt-2 block text-xs font-bold text-ink">Upload product photo</span>
                      <span className="mt-1 block text-[10px]">JPG, PNG or WebP · 5 MB max</span>
                    </span>
                  </button>
                )}
              </div>
              <div className="space-y-4">
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={(event) => uploadImage(event.target.files?.[0])}
                />
                <div>
                  <Label htmlFor="image_url">Or paste an image URL</Label>
                  <Input
                    id="image_url"
                    name="image_url"
                    type="url"
                    value={imageUrl}
                    required
                    onChange={(event) => setImageUrl(event.target.value)}
                    placeholder="https://example.com/product.jpg"
                  />
                  {fieldError("image_url")}
                </div>
                <div>
                  <Label htmlFor="image_alt">Image description</Label>
                  <Textarea
                    id="image_alt"
                    name="image_alt"
                    value={imageAlt}
                    maxLength={180}
                    onChange={(event) => setImageAlt(event.target.value)}
                    placeholder="Describe the product photo for readers who cannot see it"
                    className="min-h-24"
                  />
                  {fieldError("image_alt")}
                </div>
                {uploadError && <p className="text-xs leading-5 text-red-700">{uploadError}</p>}
              </div>
            </div>
          </section>

          <section className="border border-line bg-white p-5 sm:p-7">
            <div className="border-b border-line pb-5">
              <p className="eyebrow text-terracotta">Affiliate button</p>
              <h2 className="mt-2 font-display text-3xl font-medium">Send readers to the right page</h2>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-[.45fr_1fr]">
              <div>
                <Label htmlFor="button_label">Button text</Label>
                <Input
                  id="button_label"
                  name="button_label"
                  value={buttonLabel}
                  maxLength={60}
                  required
                  onChange={(event) => setButtonLabel(event.target.value)}
                  placeholder="View product"
                />
                {fieldError("button_label")}
              </div>
              <div>
                <Label htmlFor="affiliate_url">Affiliate link</Label>
                <Input
                  id="affiliate_url"
                  name="affiliate_url"
                  type="url"
                  value={affiliateUrl}
                  required
                  onChange={(event) => setAffiliateUrl(event.target.value)}
                  placeholder="https://retailer.example/product"
                />
                {fieldError("affiliate_url")}
              </div>
            </div>
          </section>
        </main>

        <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <section className="border border-line bg-white p-5">
            <p className="eyebrow text-terracotta">Publication</p>
            <div className="mt-5 space-y-3">
              <ToggleField
                name="active"
                checked={active}
                onChange={setActive}
                label="Visible on products page"
                description="Turn this off to save the product without showing it publicly."
              />
              <ToggleField
                name="featured"
                checked={featured}
                onChange={setFeatured}
                label="Feature this product"
                description="Featured products receive the larger lead-card treatment."
              />
            </div>
          </section>

          <section className="overflow-hidden border border-ink/10 bg-white shadow-[0_18px_55px_rgba(16,38,29,.08)]">
            <div className="relative aspect-[4/3] bg-[#e9e1d2]">
              {imageUrl ? (
                <UserCoverImage src={imageUrl} alt={imageAlt || name || "Product preview"} />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-stone">
                  <ImagePlus size={25} />
                </div>
              )}
              <span className="absolute left-3 top-3 rounded-full bg-paper/90 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[.13em] text-ink">
                {featured ? "Editor's pick" : "Product preview"}
              </span>
            </div>
            <div className="p-5">
              <p className="eyebrow text-terracotta">Kitchen selection</p>
              <h2 className="mt-3 font-display text-3xl font-medium leading-[1.05] tracking-[-.04em]">
                {name || "Your product name"}
              </h2>
              <p className="mt-3 line-clamp-4 text-xs leading-6 text-stone">
                {details || "Short product details will appear here as you type."}
              </p>
              <div className="mt-5 flex items-end justify-between gap-3 border-t border-line pt-4">
                <div>
                  <p className="text-[7px] font-bold uppercase tracking-[.15em] text-stone">Price</p>
                  <p className="mt-1 font-display text-2xl font-medium">{price || "—"}</p>
                </div>
                <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-ink px-4 text-[8px] font-bold uppercase tracking-[.1em] text-white">
                  {buttonLabel || "View product"} <ArrowUpRight size={12} />
                </span>
              </div>
            </div>
          </section>

          <div className="flex items-start gap-2 border border-emerald-200 bg-emerald-50 p-4 text-xs leading-5 text-emerald-900">
            <Check className="mt-0.5 shrink-0" size={15} />
            Product clicks are counted through a first-party redirect while the
            destination remains your affiliate URL.
          </div>
        </aside>
      </div>
    </form>
  );
}

function ToggleField({
  name,
  checked,
  onChange,
  label,
  description,
}: {
  name: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 border border-line p-3.5">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded border border-line bg-white text-transparent transition peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-terracotta">
        <Check size={12} />
      </span>
      <span>
        <span className="block text-xs font-bold text-ink">{label}</span>
        <span className="mt-1 block text-[10px] leading-5 text-stone">{description}</span>
      </span>
    </label>
  );
}
