import Link from "next/link";

/**
 * basePath — the resource root (e.g. "/news", "/tag/foo", "/latest", "/search?q=rice").
 * - If the path already contains a query string, pagination uses "&page=N" (needed for /search).
 * - Otherwise, pagination follows the WordPress-style "/base/page/N" pattern.
 */
export function Pagination({
  currentPage,
  totalPages,
  basePath,
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
}) {
  if (totalPages <= 1) return null;

  const hasQuery = basePath.includes("?");
  const pageHref = (p: number) => {
    if (p <= 1) {
      // page 1 is the clean base
      return basePath.replace(/[&?]page=\d+/, "").replace(/[?&]$/, "");
    }
    if (hasQuery) {
      // query-string pagination: /search?q=foo&page=2
      const cleaned = basePath.replace(/([?&])page=\d+/, "$1").replace(/[?&]$/, "");
      const sep = cleaned.includes("?") ? "&" : "?";
      return `${cleaned}${sep}page=${p}`;
    }
    // path-style pagination: /base/page/2 — like WordPress
    const trimmed = basePath.replace(/\/+$/, "");
    return `${trimmed}/page/${p}`;
  };

  const window = 2;
  const start = Math.max(1, currentPage - window);
  const end = Math.min(totalPages, currentPage + window);
  const pages: (number | "…")[] = [];
  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push("…");
  }
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < totalPages) {
    if (end < totalPages - 1) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <nav className="mt-16 pt-8 border-t-2 border-ink">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="font-[var(--font-stamp)] text-[11px] uppercase tracking-[0.3em] text-ink-muted">
          Page {String(currentPage).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
        </div>
        <div className="flex items-center gap-1 flex-wrap issue-num">
          {currentPage > 1 && (
            <Link
              href={pageHref(currentPage - 1)}
              className="px-4 h-10 grid place-items-center border border-ink text-xs uppercase tracking-widest hover:bg-lime"
            >
              ← Prev
            </Link>
          )}
          {pages.map((p, i) =>
            p === "…" ? (
              <span key={`e${i}`} className="px-2 text-ink-muted">…</span>
            ) : (
              <Link
                key={p}
                href={pageHref(p)}
                className={`min-w-10 h-10 grid place-items-center text-sm border transition ${
                  p === currentPage
                    ? "bg-ink text-paper border-ink"
                    : "border-ink/20 hover:bg-lime hover:border-ink"
                }`}
              >
                {String(p).padStart(2, "0")}
              </Link>
            )
          )}
          {currentPage < totalPages && (
            <Link
              href={pageHref(currentPage + 1)}
              className="px-4 h-10 grid place-items-center border border-ink text-xs uppercase tracking-widest hover:bg-lime"
            >
              Next →
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
