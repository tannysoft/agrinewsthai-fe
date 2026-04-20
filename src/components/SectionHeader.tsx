import Link from "next/link";

export function SectionHeader({
  eyebrow,
  title,
  href,
  no,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  no?: string;
  align?: "left" | "center";
}) {
  return (
    <header
      className={`flex flex-col md:flex-row md:items-end gap-3 md:gap-6 pb-6 mb-8 border-b-2 border-ink ${
        align === "center" ? "items-center text-center" : ""
      }`}
    >
      <div className={align === "center" ? "flex-1 w-full" : "flex-1"}>
        {(eyebrow || no) && (
          <div className="flex items-center gap-3 mb-2 font-[var(--font-stamp)] text-[11px] tracking-[0.3em] uppercase text-moss-700">
            {no && (
              <span className="issue-num text-ink-muted border border-ink px-2 py-0.5">
                § {no}
              </span>
            )}
            {eyebrow && <span>{eyebrow}</span>}
          </div>
        )}
        <h2 className="font-display font-extrabold text-2xl md:text-4xl leading-[1.05] tracking-[-0.015em] text-ink">
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="group shrink-0 font-[var(--font-stamp)] text-xs uppercase tracking-[0.25em] border-b border-ink pb-1 after-arrow"
        >
          ดูทั้งหมด
        </Link>
      )}
    </header>
  );
}
