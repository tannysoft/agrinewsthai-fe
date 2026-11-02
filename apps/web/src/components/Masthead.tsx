"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { WPCategory } from "@/lib/wp";

// Same order as the original site's main menu
const PRIMARY_SLUGS = [
  "news",
  "domestic-animal",
  "soil-and-water",
  "large-farm",
  "economic-crops",
  "agriculture-special",
  "did-you-know",
  "agricultural-technology",
  "folk-wisdom",
  "column",
];

export function Masthead({ categories }: { categories: WPCategory[] }) {
  const router = useRouter();
  const pathname = usePathname();
  // Remember which page the overlay was opened on; navigating away closes it.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;
  const setOpen = (v: boolean) => setOpenedOn(v ? pathname : null);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenedOn(null);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const primary = PRIMARY_SLUGS
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter((c): c is WPCategory => Boolean(c));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur border-b border-line">
      <div className="mx-auto max-w-[1400px] px-4 md:px-6">
        <div className="flex items-center gap-4 h-16 md:h-20">
          <Link href="/" className="shrink-0" aria-label="เรื่องเล่าข่าวเกษตร หน้าแรก">
            <Image
              src="/logo.svg"
              alt="เรื่องเล่าข่าวเกษตร"
              width={904}
              height={311}
              priority
              className="h-10 md:h-14 w-auto"
            />
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/prices"
              className="hidden sm:inline-flex items-center gap-2 h-10 px-4 rounded-full bg-field text-leaf text-sm font-semibold hover:bg-sprout/40 transition-colors"
            >
              ราคาสินค้าเกษตรวันนี้
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="h-10 inline-flex items-center gap-2 px-3 md:px-4 rounded-full border border-line text-ink-2 hover:border-leaf hover:text-leaf transition-colors"
              aria-label="ค้นหาและเมนู"
            >
              <SearchIcon className="h-[18px] w-[18px]" />
              <span className="hidden md:inline text-sm">ค้นหา</span>
              <MenuIcon className="h-[18px] w-[18px] md:hidden" />
            </button>
          </div>
        </div>
      </div>

      <nav aria-label="หมวดหมู่หลัก" className="border-t border-line">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6">
          <ul className="scroll-row flex items-center gap-1 overflow-x-auto -mx-1">
            <li className="shrink-0">
              <NavLink href="/" label="หน้าแรก" active={isActive("/")} />
            </li>
            {primary.map((c) => (
              <li key={c.id} className="shrink-0">
                <NavLink href={`/${c.slug}`} label={c.name} active={isActive(`/${c.slug}`)} />
              </li>
            ))}
            <li className="shrink-0 sm:hidden">
              <NavLink href="/prices" label="ราคาสินค้าเกษตร" active={isActive("/prices")} />
            </li>
          </ul>
        </div>
      </nav>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-ink/40"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="ค้นหาและเมนู"
        >
          <div
            className="bg-paper max-h-[100dvh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-6 md:py-10">
              <div className="flex items-center justify-between gap-4">
                <Image src="/logo.svg" alt="" width={904} height={311} className="h-10 md:h-12 w-auto" />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-10 w-10 grid place-items-center rounded-full border border-line hover:border-leaf hover:text-leaf"
                  aria-label="ปิด"
                >
                  <XIcon className="h-[18px] w-[18px]" />
                </button>
              </div>

              <form onSubmit={onSubmit} role="search" className="mt-8">
                <label htmlFor="site-search" className="block font-heading text-2xl md:text-3xl font-semibold text-ink">
                  ค้นหาข่าวและบทความ
                </label>
                <div className="mt-4 flex items-center gap-2 rounded-full border-2 border-line focus-within:border-leaf pl-5 pr-1.5 py-1.5 transition-colors">
                  <SearchIcon className="h-5 w-5 text-ink-3 shrink-0" />
                  <input
                    id="site-search"
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    type="search"
                    placeholder="เช่น ราคาข้าว ทุเรียน ปุ๋ยอินทรีย์"
                    className="flex-1 min-w-0 bg-transparent text-lg py-2 placeholder:text-ink-3 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="shrink-0 h-11 px-6 rounded-full bg-leaf text-white font-semibold hover:bg-leaf-deep"
                  >
                    ค้นหา
                  </button>
                </div>
              </form>

              <div className="mt-10 grid gap-8 md:grid-cols-[1fr_2fr]">
                <div>
                  <h2 className="text-sm font-semibold text-ink-3">เมนู</h2>
                  <ul className="mt-3 space-y-2.5 text-lg">
                    <li><Link href="/prices" className="hover:text-leaf">ราคาสินค้าเกษตร</Link></li>
                    <li><Link href="/tags" className="hover:text-leaf">แท็กทั้งหมด</Link></li>
                    <li><Link href="/about" className="hover:text-leaf">เกี่ยวกับเรา</Link></li>
                    <li><Link href="/contact" className="hover:text-leaf">ติดต่อเรา</Link></li>
                  </ul>
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-ink-3">หมวดหมู่</h2>
                  <ul className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2.5 text-lg">
                    {categories.slice(0, 15).map((c) => (
                      <li key={c.id}>
                        <Link href={`/${c.slug}`} className="hover:text-leaf">
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

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`relative block px-3 py-3 text-[15px] whitespace-nowrap transition-colors ${
        active ? "text-leaf font-semibold" : "text-ink-2 hover:text-leaf"
      }`}
    >
      {label}
      {active && <span className="absolute left-3 right-3 bottom-0 h-[3px] rounded-t bg-shoot" aria-hidden />}
    </Link>
  );
}

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
function MenuIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
function XIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
