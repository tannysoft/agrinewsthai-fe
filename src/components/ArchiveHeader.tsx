import Link from "next/link";
import type { ReactNode } from "react";

export function ArchiveHeader({
  title,
  description,
  total,
  page,
  parent,
  children,
}: {
  title: string;
  description?: string;
  /** Number of stories in this archive. */
  total?: number;
  page?: number;
  parent?: { label: string; href: string };
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-line bg-field">
      <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-10 md:py-14">
        <nav aria-label="breadcrumb" className="text-sm text-ink-3">
          <Link href="/" className="hover:text-leaf">หน้าแรก</Link>
          {parent && (
            <>
              <span className="mx-2" aria-hidden>/</span>
              <Link href={parent.href} className="hover:text-leaf">{parent.label}</Link>
            </>
          )}
        </nav>
        <h1 className="mt-3 font-heading font-bold text-3xl md:text-[2.75rem] leading-[1.35] text-leaf">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-2">{description}</p>
        )}
        {(typeof total === "number" || (page && page > 1)) && (
          <p className="mt-4 text-sm text-ink-3">
            {typeof total === "number" && total > 0 && <>ทั้งหมด {total.toLocaleString("th-TH")} เรื่อง</>}
            {page && page > 1 && <span className="ml-3">หน้า {page}</span>}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
