import type { Metadata } from "next";
import { absoluteUrl, DEFAULT_SOCIAL_IMAGE, IS_PREVIEW, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site-config";
import "@/app/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Kitchen Made Health — The art of living well",
    template: "%s | Kitchen Made Health",
  },
  description: SITE_DESCRIPTION,
  robots: { index: !IS_PREVIEW, follow: !IS_PREVIEW },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: absoluteUrl(),
    images: [{ url: DEFAULT_SOCIAL_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: { card: "summary_large_image", title: SITE_NAME, description: SITE_DESCRIPTION, images: [DEFAULT_SOCIAL_IMAGE] },
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
