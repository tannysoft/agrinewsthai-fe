import Link from "next/link";
import type { Metadata } from "next";
import { getTags } from "@/lib/wp";

export const metadata: Metadata = {
  title: "แท็กทั้งหมด",
  description: "รวมแท็กและคำสำคัญจากเรื่องเล่าข่าวเกษตร — สำรวจบทความตามหัวข้อที่คุณสนใจ",
};

export const revalidate = 1800;

function sizeFor(count: number, max: number) {
  const ratio = Math.max(0.2, Math.min(1, count / Math.max(max, 1)));
  return Math.round(0.85 + ratio * 1.5); // 1..2.35rem
}

export default async function TagsIndexPage() {
  const { data: tags } = await getTags({ perPage: 100, orderby: "count", order: "desc" });
  const maxCount = Math.max(...tags.map((t) => t.count), 1);

  const groups: Record<string, typeof tags> = {};
  for (const t of tags) {
    const first = (t.name || "#").charAt(0).toUpperCase();
    (groups[first] ??= []).push(t);
  }
  const letters = Object.keys(groups).sort((a, b) =>
    a.localeCompare(b, "th")
  );

  return (
    <>
      <section className="bg-paper border-b-2 border-ink">
        <div className="mx-auto max-w-[1400px] px-6 py-14 md:py-20 grid md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-8">
            <div className="font-[var(--font-stamp)] text-[11px] uppercase tracking-[0.3em] text-moss-700">
              § Tags · ดัชนีแท็ก
            </div>
            <h1 className="mt-3 font-display font-extrabold leading-[1] tracking-[-0.02em] text-[clamp(2.25rem,5.5vw,4.5rem)] text-ink">
              คลังแท็กทั้งหมด
            </h1>
            <p className="mt-5 max-w-2xl text-ink-soft text-base md:text-lg leading-relaxed">
              เลือกเรื่องที่สนใจจากแท็กด้านล่าง
              ตัวเลขหลังแท็กคือจำนวนบทความภายใต้แท็กนั้น ๆ
            </p>
          </div>
          <div className="md:col-span-4 md:text-right">
            <div className="inline-block text-left border-2 border-ink p-5">
              <div className="font-[var(--font-stamp)] text-[10px] uppercase tracking-widest text-moss-700">
                Total
              </div>
              <div className="mt-1 issue-num text-3xl font-bold">
                {tags.length.toLocaleString("th-TH")}
              </div>
              <div className="issue-num text-[11px] uppercase tracking-widest text-ink-muted">
                Tags in catalog
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CLOUD */}
      <section className="bg-paper-alt border-b-2 border-ink">
        <div className="mx-auto max-w-[1400px] px-6 py-12 md:py-16">
          <div className="font-[var(--font-stamp)] text-[11px] uppercase tracking-[0.3em] text-moss-700 mb-4">
            § Popular · ยอดฮิต
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-3 items-baseline leading-none">
            {tags.slice(0, 40).map((t) => (
              <Link
                key={t.id}
                href={`/tag/${t.slug}`}
                className="font-display font-bold text-ink hover:text-moss-700 transition-colors"
                style={{ fontSize: `${sizeFor(t.count, maxCount)}rem` }}
              >
                #{t.name}
                <span className="issue-num text-[10px] font-normal ml-1 text-ink-muted align-super">
                  {t.count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* A–Z Index */}
      <section className="bg-paper">
        <div className="mx-auto max-w-[1400px] px-6 py-14 md:py-20">
          <div className="font-[var(--font-stamp)] text-[11px] uppercase tracking-[0.3em] text-moss-700 mb-6">
            § A–Z · ตามอักษร
          </div>

          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {letters.map((letter) => (
              <div key={letter} className="border-t-2 border-ink pt-4">
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="big-num text-3xl md:text-4xl">{letter}</span>
                  <span className="issue-num text-[10px] uppercase tracking-widest text-ink-muted">
                    {groups[letter].length} แท็ก
                  </span>
                </div>
                <ul className="space-y-1.5 font-display">
                  {groups[letter].map((t) => (
                    <li key={t.id} className="flex items-baseline gap-2">
                      <Link
                        href={`/tag/${t.slug}`}
                        className="text-ink hover:text-moss-700 marker"
                      >
                        #{t.name}
                      </Link>
                      <span className="flex-1 hairline h-px" />
                      <span className="issue-num text-[10px] text-ink-muted">
                        {t.count}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {tags.length === 0 && (
            <p className="text-center py-16 text-ink-muted">ยังไม่มีแท็กในระบบ</p>
          )}
        </div>
      </section>
    </>
  );
}

