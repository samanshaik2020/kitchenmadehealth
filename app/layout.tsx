import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://kitchenmadehealth.com",
  ),
  title: {
    default: "Kitchen Made Health — The art of living well",
    template: "%s | Kitchen Made Health",
  },
  description:
    "Thoughtful guides for healthier cooking, smarter kitchen tools, and everyday habits that feel good enough to keep.",
  openGraph: {
    type: "website",
    siteName: "KitchenMadeHealth",
    title: "KitchenMadeHealth",
    description:
      "Healthier cooking, smarter tools, and practical kitchen habits for real life.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7139265156534550"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
