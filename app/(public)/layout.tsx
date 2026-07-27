import { SiteFooter } from "@/components/site/footer";
import { FloatingSuggestions } from "@/components/site/floating-suggestions";
import { SiteHeader } from "@/components/site/header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <FloatingSuggestions />
      <SiteFooter />
    </>
  );
}
