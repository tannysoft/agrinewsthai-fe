import Link from "next/link";
import Image from "next/image";
import type { WPCategory } from "@/lib/wp";

const SOCIALS: { name: string; href: string; icon: React.ReactNode }[] = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M13.5 21v-7.5h2.5l.5-3h-3V8.5c0-.85.25-1.5 1.5-1.5H17V4.3c-.3-.05-1.3-.15-2.45-.15-2.45 0-4.05 1.45-4.05 4.1V10.5H8v3h2.5V21h3z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
        <circle cx="12" cy="12" r="3.8" />
        <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: "X / Twitter",
    href: "https://x.com/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M17.5 3h3l-6.8 7.8L22 21h-6.3l-4.9-6.4L5 21H2l7.3-8.4L2 3h6.4l4.4 5.8L17.5 3zm-1 16h1.7L7.6 4.9H5.8L16.5 19z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M22 8.2c-.2-1.5-.9-2.2-2.4-2.4C17.6 5.5 12 5.5 12 5.5s-5.6 0-7.6.3C2.9 6 2.2 6.7 2 8.2 1.7 10.2 1.7 12 1.7 12s0 1.8.3 3.8c.2 1.5.9 2.2 2.4 2.4 2 .3 7.6.3 7.6.3s5.6 0 7.6-.3c1.5-.2 2.2-.9 2.4-2.4.3-2 .3-3.8.3-3.8s0-1.8-.3-3.8zM10 15.5v-7l5.5 3.5-5.5 3.5z" />
      </svg>
    ),
  },
  {
    name: "LINE",
    href: "https://line.me/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 3C6.48 3 2 6.58 2 11c0 3.97 3.5 7.3 8.27 7.92.32.07.76.22.87.5.1.25.06.65.03.9l-.14.86c-.04.25-.2 1 .88.55.66-.28 3.55-2.09 4.85-3.58C18.76 16.52 22 14 22 11c0-4.42-4.48-8-10-8zM8.3 13.2H6.4c-.16 0-.29-.13-.29-.29V9.5c0-.16.13-.29.29-.29.16 0 .29.13.29.29v3.12h1.6c.16 0 .29.13.29.29 0 .16-.13.29-.29.29zm1.13-.29c0 .16-.13.29-.29.29s-.29-.13-.29-.29V9.5c0-.16.13-.29.29-.29s.29.13.29.29v3.41zm4.23 0c0 .13-.08.23-.2.28-.03.01-.07.02-.1.02-.09 0-.18-.04-.23-.12l-1.76-2.4v2.23c0 .16-.13.29-.29.29s-.29-.13-.29-.29V9.5c0-.13.08-.23.2-.28.03-.01.07-.02.1-.02.09 0 .18.04.23.12l1.76 2.4V9.5c0-.16.13-.29.29-.29s.29.13.29.29v3.41zm3.2-1.99c.16 0 .29.13.29.29 0 .16-.13.29-.29.29h-1.6v1.01h1.6c.16 0 .29.13.29.29 0 .16-.13.29-.29.29h-1.9c-.16 0-.29-.13-.29-.29V9.5c0-.16.13-.29.29-.29h1.9c.16 0 .29.13.29.29 0 .16-.13.29-.29.29h-1.6v1.02h1.6z" />
      </svg>
    ),
  },
];

export function Colophon({ categories }: { categories: WPCategory[] }) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-[2] bg-ink text-paper border-t-4 border-ink">
      <div className="border-b border-paper/15">
        <div className="mx-auto max-w-[1400px] px-6 py-14 md:py-18 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="font-[var(--font-stamp)] text-[11px] uppercase tracking-[0.3em] text-lime">
              The Colophon · ท้ายฉบับ
            </div>
            <Image
              src="/logo.svg"
              alt="เรื่องเล่าข่าวเกษตร"
              width={400}
              height={138}
              className="mt-5 h-16 md:h-20 w-auto brightness-0 invert"
            />
            <div className="mt-3 text-[10px] font-[var(--font-stamp)] tracking-[0.3em] uppercase text-paper/60">
              A Thai Agricultural News · Est. 2005
            </div>
            <p className="mt-5 max-w-md text-sm text-paper/70 leading-relaxed">
              ปูมบันทึกข่าวสาร ความรู้ และภูมิปัญญาการเกษตรไทย
              จัดพิมพ์ทุกสัปดาห์ — ทุกเรื่องบนหน้านี้ ผ่านการคัดกรองโดยกองบรรณาธิการ
              เพื่อให้อ่านแล้วนำไปใช้ได้จริง
            </p>
          </div>

          <div className="md:col-span-4">
            <div className="font-[var(--font-stamp)] text-[11px] uppercase tracking-[0.3em] text-lime mb-5">
              § Index — หมวดหมู่
            </div>
            <ul className="grid grid-cols-2 gap-y-2 text-sm text-paper/85">
              {categories.slice(0, 10).map((c, i) => (
                <li key={c.id} className="flex items-baseline gap-2 font-display">
                  <span className="issue-num text-[10px] text-paper/40 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Link
                    href={`/${c.slug}`}
                    className="hover:text-lime transition-colors"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <div className="font-[var(--font-stamp)] text-[11px] uppercase tracking-[0.3em] text-lime mb-5">
              § Office
            </div>
            <ul className="space-y-2.5 text-sm text-paper/85">
              <li>
                <Link href="/about" className="hover:text-lime after-arrow font-display">
                  เกี่ยวกับเรา
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-lime after-arrow font-display">
                  ติดต่อ / ส่งข่าว
                </Link>
              </li>
              <li>
                <Link href="/latest" className="hover:text-lime after-arrow font-display">
                  ข่าวล่าสุด
                </Link>
              </li>
              <li>
                <Link href="/tags" className="hover:text-lime after-arrow font-display">
                  แท็กทั้งหมด
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-lime after-arrow font-display">
                  ค้นหา
                </Link>
              </li>
            </ul>

            <div className="mt-7 font-[var(--font-stamp)] text-[10px] tracking-[0.3em] uppercase text-paper/50 mb-3">
              · Follow ·
            </div>
            <div className="flex gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.name}
                  className="h-10 w-10 grid place-items-center border border-paper/30 hover:bg-lime hover:text-ink hover:border-lime transition-colors"
                >
                  <span className="h-[18px] w-[18px] block">{s.icon}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] issue-num uppercase tracking-wider text-paper/60">
        <span>© {year} AgriNewsThai · All rights reserved</span>
        <span className="hidden md:inline">Field Zine · Printed weekly in Thailand</span>
        <span>🌾 Made with care</span>
      </div>
    </footer>
  );
}
