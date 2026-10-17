import Link from "next/link";
import Image from "next/image";
import type { WPCategory } from "@/lib/wp";
import { CROPS } from "@/lib/crops";
import { TOPICS } from "@/lib/topics";

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
    <footer className="bg-leaf-deep text-white/85">
      <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-14 md:py-16 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <Image
            src="/logo.svg"
            alt="เรื่องเล่าข่าวเกษตร"
            width={904}
            height={311}
            className="h-14 w-auto brightness-0 invert"
          />
          <p className="mt-5 max-w-sm leading-relaxed text-white/70">
            ข่าวสาร ความรู้ และภูมิปัญญาการเกษตรไทย
            เรียบเรียงให้อ่านง่ายและนำไปใช้ได้จริง
          </p>
          <div className="mt-6 flex gap-2">
            {SOCIALS.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.name}
                className="h-10 w-10 grid place-items-center rounded-full bg-white/10 hover:bg-sprout hover:text-leaf-deep transition-colors"
              >
                <span className="h-[18px] w-[18px] block">{s.icon}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="md:col-span-5">
          <h2 className="font-semibold text-white">หมวดหมู่</h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5">
            {categories.slice(0, 12).map((c) => (
              <li key={c.id}>
                <Link href={`/${c.slug}`} className="hover:text-sprout transition-colors">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <h2 className="font-semibold text-white">เรื่องเล่าข่าวเกษตร</h2>
          <ul className="mt-4 space-y-2.5">
            <li><Link href="/news" className="hover:text-sprout transition-colors">ข่าวเกษตร</Link></li>
            <li><Link href="/prices" className="hover:text-sprout transition-colors">ราคาสินค้าเกษตร</Link></li>
            <li><Link href="/tags" className="hover:text-sprout transition-colors">แท็กทั้งหมด</Link></li>
            <li><Link href="/about" className="hover:text-sprout transition-colors">เกี่ยวกับเรา</Link></li>
            <li><Link href="/contact" className="hover:text-sprout transition-colors">ติดต่อเรา</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-6 grid gap-4 md:grid-cols-2 text-sm">
          <FooterLinks title="ราคาพืชผลวันนี้" links={CROPS.map((c) => ({ href: `/prices/${c.slug}`, label: c.name }))} />
          <FooterLinks title="หัวข้อเด่น" links={TOPICS.map((t) => ({ href: `/topic/${t.slug}`, label: t.name }))} />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-5 text-sm text-white/55">
          © {year} เรื่องเล่าข่าวเกษตร (AgriNewsThai) สงวนลิขสิทธิ์
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <p className="leading-loose">
      <span className="mr-3 font-semibold text-white">{title}</span>
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="mr-4 whitespace-nowrap text-white/70 hover:text-sprout transition-colors">
          {l.label}
        </Link>
      ))}
    </p>
  );
}
