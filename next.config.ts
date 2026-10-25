import type { NextConfig } from "next";

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""} https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com https://*.gstatic.com https://*.googleadservices.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' https://*.supabase.co https://*.supabase.in https://*.google.com https://*.gstatic.com https://*.googlesyndication.com https://*.googleadservices.com https://*.doubleclick.net${process.env.NODE_ENV === "development" ? " ws: wss:" : ""}`,
  "frame-src https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com https://www.youtube.com https://www.youtube-nocookie.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(process.env.VERCEL === "1" ? ["upgrade-insecure-requests"] : []),
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/:path*", headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
      ] },
      // Standalone HTML has its own sandbox policy in its route handler.
      { source: "/((?!pages/).*)", headers: [{ key: "Content-Security-Policy", value: contentSecurityPolicy }] },
    ];
  },
  async redirects() {
    return [
      { source: "/privacy", destination: "/privacy-policy", permanent: true },
      { source: "/disclaimer", destination: "/medical-disclaimer", permanent: true },
      { source: "/pages/glucotrust-german-version", destination: "/pages/why-do-cravings-hit-at-3-pm", permanent: true },
    ];
  },
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
