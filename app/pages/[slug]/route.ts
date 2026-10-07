import { getPublishedHtmlPageBySlug } from "@/lib/html-pages";

export const revalidate = 300;

export function generateStaticParams() {
  return [];
}

const HTML_SANDBOX_POLICY = [
  "sandbox allow-downloads allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-scripts",
  "default-src 'none'",
  "img-src data: blob: https: http:",
  "media-src data: blob: https: http:",
  "font-src data: https: http:",
  "style-src 'unsafe-inline' https: http:",
  "script-src 'unsafe-inline' 'unsafe-eval' blob: https: http:",
  "connect-src https: http:",
  "frame-src https: http:",
  "worker-src blob:",
  "form-action https: http:",
  "object-src 'none'",
  "base-uri 'none'",
].join("; ");

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const page = await getPublishedHtmlPageBySlug(slug);

  if (!page?.html_content) {
    return new Response("<!doctype html><title>Page not found</title><h1>Page not found</h1>", {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  return new Response(page.html_content, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": HTML_SANDBOX_POLICY,
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=86400",
    },
  });
}
