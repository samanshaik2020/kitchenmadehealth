import { SiteFooter } from "@/components/site/footer";
import { FloatingSuggestions } from "@/components/site/floating-suggestions";
import { SiteHeader } from "@/components/site/header";
import { getPublishedProducts } from "@/lib/products";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const showProducts = (await getPublishedProducts()).length > 0;
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <SiteHeader showProducts={showProducts} />
      <main id="main-content" tabIndex={-1}>{children}</main>
      <FloatingSuggestions />
      <SiteFooter showProducts={showProducts} />
    </>
  );
}
