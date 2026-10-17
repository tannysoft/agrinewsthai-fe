import Link from "next/link";
import type { Metadata } from "next";
import { getTags } from "@/lib/wp";
import { ArchiveHeader } from "@/components/ArchiveHeader";
import { SectionHeader } from "@/components/SectionHeader";

export const metadata: Metadata = {
  alternates: { canonical: "/tags" },
  title: "แท็กทั้งหมด",
  description: "รวมแท็กและคำสำคัญจากเรื่องเล่าข่าวเกษตร — สำรวจบทความตามหัวข้อที่คุณสนใจ",
};

export const revalidate = 1800;

export default async function TagsIndexPage() {
  const { data: tags } = await getTags({ perPage: 100, orderby: "count", order: "desc" });
  const alphabetical = [...tags].sort((a, b) => a.name.localeCompare(b.name, "th"));

  return (
    <>
      <ArchiveHeader
        title="แท็กทั้งหมด"
        description="เลือกหัวข้อที่สนใจ ตัวเลขคือจำนวนเรื่องในแท็กนั้น"
      />

      <section className="mx-auto max-w-[1400px] px-4 md:px-6 py-10 md:py-14">
        <SectionHeader title="แท็กยอดนิยม" />
        <ul className="flex flex-wrap gap-2">
          {tags.slice(0, 30).map((t) => (
            <li key={t.id}>
              <Link
                href={`/tag/${t.slug}`}
                className="inline-flex items-baseline gap-2 rounded-full bg-field px-4 py-2 text-ink hover:bg-leaf hover:text-white transition-colors"
              >
                {t.name}
                <span className="text-xs opacity-60 tabular-nums">{t.count.toLocaleString("th-TH")}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-10 md:py-14">
          <SectionHeader title="เรียงตามตัวอักษร" />
          {alphabetical.length === 0 ? (
            <p className="py-16 text-center text-ink-2">ยังไม่มีแท็ก</p>
          ) : (
            <ul className="columns-2 md:columns-3 lg:columns-4 gap-8">
              {alphabetical.map((t) => (
                <li key={t.id} className="break-inside-avoid py-1.5 flex items-baseline justify-between gap-3">
                  <Link href={`/tag/${t.slug}`} className="text-ink hover:text-leaf hover:underline underline-offset-4">
                    {t.name}
                  </Link>
                  <span className="text-xs text-ink-3 tabular-nums">{t.count.toLocaleString("th-TH")}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
