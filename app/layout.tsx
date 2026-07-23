import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://kitchenwarehelp.com",
  ),
  title: {
    default: "KitchenWareHelp — Buy thoughtfully. Cook beautifully.",
    template: "%s | KitchenWareHelp",
  },
  description:
    "Thoughtful kitchenware guides, honest reviews, and practical advice for a better working kitchen.",
  openGraph: {
    type: "website",
    siteName: "KitchenWareHelp",
    title: "KitchenWareHelp",
    description:
      "Thoughtful kitchenware guides, honest reviews, and practical advice.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
