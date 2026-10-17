import Link from "next/link";

/**
 * basePath — the resource root (e.g. "/news", "/tag/foo", "/search?q=rice").
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

  const btn = "h-11 min-w-11 px-3 grid place-items-center rounded-full text-[15px] transition-colors";

  return (
    <nav aria-label="เลือกหน้า" className="mt-14 flex items-center justify-center gap-1.5 flex-wrap">
      {currentPage > 1 && (
        <Link href={pageHref(currentPage - 1)} className={`${btn} px-5 border border-line hover:border-leaf hover:text-leaf`}>
          ก่อนหน้า
        </Link>
      )}
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-1 text-ink-3">…</span>
        ) : (
          <Link
            key={p}
            href={pageHref(p)}
            aria-current={p === currentPage ? "page" : undefined}
            className={`${btn} tabular-nums ${
              p === currentPage ? "bg-leaf text-white font-semibold" : "text-ink-2 hover:bg-field hover:text-leaf"
            }`}
          >
            {p}
          </Link>
        )
      )}
      {currentPage < totalPages && (
        <Link href={pageHref(currentPage + 1)} className={`${btn} px-5 border border-line hover:border-leaf hover:text-leaf`}>
          ถัดไป
        </Link>
      )}
    </nav>
  );
}
