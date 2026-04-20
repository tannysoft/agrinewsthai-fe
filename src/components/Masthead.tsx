"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { WPCategory } from "@/lib/wp";

const PRIMARY_SLUGS = [
  "news",
  "economic-crops",
  "domestic-animal",
  "soil-and-water",
  "agricultural-technology",
  "did-you-know",
  "folk-wisdom",
  "column",
];

function formatIssueDate() {
  const d = new Date();
  const day = d.toLocaleDateString("th-TH", { weekday: "long" });
  const date = d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return { day, date };
}

function issueNumber() {
  const start = new Date(2005, 0, 1).getTime();
  const now = Date.now();
  const weeks = Math.floor((now - start) / (1000 * 60 * 60 * 24 * 7));
  return weeks.toString().padStart(4, "0");
}

export function Masthead({ categories }: { categories: WPCategory[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [meta, setMeta] = useState<{ day: string; date: string; issue: string }>({
    day: "",
    date: "",
    issue: "",
  });
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMeta({ ...formatIssueDate(), issue: issueNumber() });
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const primary = PRIMARY_SLUGS
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter((c): c is WPCategory => Boolean(c));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="relative z-30 bg-paper border-b border-ink">
      {/* Top metadata bar */}
      <div className="border-b border-ink/20 text-[11px] issue-num">
        <div className="mx-auto max-w-[1400px] px-6 py-2 flex items-center justify-between gap-4">
          <span className="hidden sm:inline uppercase tracking-wider text-ink">
            {meta.day ? <>{meta.day} · {meta.date}</> : "\u00A0"}
          </span>
          <span className="uppercase tracking-[0.2em] text-ink/70">
            ISSUE N° {meta.issue || "—"}
          </span>
          <span className="hidden sm:flex items-center gap-4">
            <Link href="/about" className="hover:text-moss-700 after-arrow">เกี่ยวกับ</Link>
            <Link href="/contact" className="hover:text-moss-700 after-arrow">ติดต่อ</Link>
          </span>
        </div>
      </div>

      {/* Wordmark — symmetric flex so the logo stays centered regardless of
          the button-group width on the right. */}
      <div className="mx-auto max-w-[1400px] px-6 pt-5 pb-4 md:pt-8 md:pb-6">
        <div className="flex items-center gap-4 md:gap-6">
          {/* LEFT — slogan on desktop, empty spacer on mobile */}
          <div className="flex-1 min-w-0 flex items-center">
            <div className="hidden md:flex flex-col gap-0.5 text-[10px] uppercase tracking-[0.25em] text-ink/60 font-[var(--font-stamp)]">
              <span>A Thai</span>
              <span>Agricultural</span>
              <span className="text-moss-700">· NEWS ·</span>
            </div>
          </div>

          {/* CENTER — logo (shrink-0 so flex-1 sides balance around it) */}
          <Link href="/" className="block group shrink-0 text-center">
            <Image
              src="/logo.svg"
              alt="เรื่องเล่าข่าวเกษตร"
              width={480}
              height={166}
              priority
              className="h-16 md:h-24 w-auto mx-auto"
            />
            <div className="mt-2 text-[10px] md:text-[11px] font-[var(--font-stamp)] tracking-[0.3em] uppercase text-ink/60">
              · Est. 2005 · Field Zine ·
            </div>
          </Link>

          {/* RIGHT — desktop button group + mobile hamburger */}
          <div className="flex-1 min-w-0 flex items-center justify-end gap-2">
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/prices"
                className="group inline-flex items-center gap-2 px-4 h-11 rounded-full text-sm font-medium border border-ink hover:bg-lime transition-colors whitespace-nowrap"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-moss-500 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-moss-700" />
                </span>
                ราคาสินค้าเกษตรวันนี้
              </Link>
              <Link
                href="/latest"
                className="inline-flex items-center gap-2 bg-ink text-paper px-4 h-11 rounded-full text-sm font-medium hover:bg-moss-700 transition-colors whitespace-nowrap"
              >
                อ่านล่าสุด
                <span aria-hidden>→</span>
              </Link>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="h-11 w-11 shrink-0 grid place-items-center border border-ink rounded-full hover:bg-lime transition-colors"
                aria-label="ค้นหา"
              >
                <SearchIcon className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="md:hidden h-10 w-10 grid place-items-center border border-ink rounded-full"
              aria-label="เปิดเมนู"
            >
              <MenuIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop category nav */}
      <nav className="hidden md:block border-t border-ink">
        <div className="mx-auto max-w-[1400px] px-6">
          <ul className="flex items-stretch justify-between divide-x divide-ink/15 overflow-x-auto">
            <li className="flex-1 min-w-max">
              <NavLink href="/" label="หน้าแรก" active={pathname === "/"} index="00" />
            </li>
            {primary.map((c, i) => (
              <li key={c.id} className="flex-1 min-w-max">
                <NavLink
                  href={`/${c.slug}`}
                  label={c.name}
                  active={pathname === `/${c.slug}`}
                  index={String(i + 1).padStart(2, "0")}
                />
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Slide-down search/menu overlay */}
      {open && (
        <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="bg-paper border-b-4 border-ink relative rise"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto max-w-[1400px] px-6 py-10 md:py-14">
              <div className="flex items-start justify-between gap-6 mb-10">
                <div>
                  <div className="font-[var(--font-stamp)] text-xs tracking-[0.3em] uppercase text-ink/60">
                    ค้นหาในปูม
                  </div>
                  <h2 className="mt-2 font-display text-3xl md:text-5xl font-black leading-none">
                    อยากอ่านเรื่องอะไร?
                  </h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="h-11 w-11 grid place-items-center border border-ink rounded-full hover:bg-lime"
                  aria-label="ปิด"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={onSubmit} className="flex items-end gap-2 md:gap-3 border-b-2 border-ink pb-2 w-full min-w-0">
                <span className="hidden sm:inline font-[var(--font-stamp)] text-ink/50 pb-2 tracking-wider shrink-0">→</span>
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  type="search"
                  placeholder="ค้นหา…"
                  className="flex-1 min-w-0 bg-transparent font-display text-lg md:text-4xl font-bold placeholder:text-ink/30 focus:outline-none py-2"
                />
                <button
                  type="submit"
                  className="shrink-0 font-[var(--font-stamp)] uppercase tracking-widest text-xs md:text-sm bg-ink text-paper px-4 md:px-5 py-2.5 hover:bg-moss-700"
                >
                  ค้นหา
                </button>
              </form>

              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="font-[var(--font-stamp)] text-xs tracking-[0.3em] uppercase text-ink/50 mb-3">
                    เมนูหลัก
                  </div>
                  <ul className="space-y-2 text-lg font-display font-semibold">
                    <li><Link href="/" className="hover:text-moss-700">หน้าแรก</Link></li>
                    <li><Link href="/latest" className="hover:text-moss-700">ข่าวล่าสุด</Link></li>
                    <li><Link href="/prices" className="hover:text-moss-700">ราคาสินค้าเกษตร</Link></li>
                    <li><Link href="/tags" className="hover:text-moss-700">แท็กทั้งหมด</Link></li>
                    <li><Link href="/about" className="hover:text-moss-700">เกี่ยวกับเรา</Link></li>
                    <li><Link href="/contact" className="hover:text-moss-700">ติดต่อ</Link></li>
                  </ul>
                </div>
                <div className="col-span-2 md:col-span-3">
                  <div className="font-[var(--font-stamp)] text-xs tracking-[0.3em] uppercase text-ink/50 mb-3">
                    หมวดหมู่
                  </div>
                  <ul className="grid grid-cols-2 md:grid-cols-3 gap-y-2.5 gap-x-4 text-base font-display font-semibold">
                    {categories.slice(0, 12).map((c, i) => (
                      <li key={c.id} className="flex items-baseline gap-2">
                        <span className="issue-num text-[10px] text-ink/40">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <Link href={`/${c.slug}`} className="hover:text-moss-700 marker">
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({
  href,
  label,
  active,
  index,
}: {
  href: string;
  label: string;
  active: boolean;
  index: string;
}) {
  return (
    <Link
      href={href}
      className={`block px-4 py-3 text-center group transition ${
        active ? "bg-ink text-paper" : "hover:bg-lime"
      }`}
    >
      <span
        className={`issue-num text-[10px] block ${
          active ? "text-lime" : "text-ink/50"
        }`}
      >
        No. {index}
      </span>
      <span className="font-display font-bold text-sm leading-tight whitespace-nowrap">
        {label}
      </span>
    </Link>
  );
}

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
function MenuIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
function XIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
