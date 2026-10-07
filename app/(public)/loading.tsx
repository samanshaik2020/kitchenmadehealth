export default function PublicLoading() {
  return (
    <section
      className="container-wide min-h-[65svh] py-16 md:py-24"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <p className="eyebrow text-terracotta">Loading your next page…</p>
      <div className="mt-8 space-y-5 motion-safe:animate-pulse" aria-hidden="true">
        <div className="h-12 w-3/4 rounded bg-cream" />
        <div className="h-5 w-1/2 rounded bg-cream" />
        <div className="grid gap-6 pt-8 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-64 rounded bg-cream" />
          ))}
        </div>
      </div>
    </section>
  );
}
