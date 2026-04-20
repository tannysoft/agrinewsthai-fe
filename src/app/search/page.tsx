import { getPosts } from "@/lib/wp";
import { PostCard } from "@/components/PostCard";
import { Pagination } from "@/components/Pagination";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ค้นหา",
  description: "ค้นหาข่าวและบทความจากเรื่องเล่าข่าวเกษตร",
};

export const revalidate = 120;

type Props = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, Number(sp.page ?? "1") || 1);

  const { data: posts, total, totalPages } = q
    ? await getPosts({ perPage: 12, page, search: q, orderby: "relevance" })
    : { data: [], total: 0, totalPages: 0 };

  return (
    <>
      <section className="bg-paper border-b-2 border-ink">
        <div className="mx-auto max-w-[1400px] px-6 py-14 md:py-20">
          <div className="font-[var(--font-stamp)] text-[11px] uppercase tracking-[0.3em] text-moss-700">
            § Search · ค้นหาในปูม
          </div>
          <h1 className="mt-3 font-display font-extrabold leading-[1] tracking-[-0.02em] text-[clamp(2.25rem,5vw,4rem)]">
            พิมพ์คำที่คุณสงสัย
          </h1>

          <form className="mt-8 max-w-3xl flex items-end gap-4 border-b-2 border-ink pb-2">
            <span className="font-[var(--font-stamp)] text-ink/50 pb-3 tracking-wider">→</span>
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="ข้าวหอมมะลิ · ปศุสัตว์ · ดินเปรี้ยว …"
              className="flex-1 bg-transparent font-display text-xl md:text-2xl font-bold placeholder:text-ink/30 focus:outline-none py-2"
            />
            <button
              type="submit"
              className="font-[var(--font-stamp)] uppercase tracking-widest text-sm bg-ink text-paper px-6 py-3 hover:bg-moss-700"
            >
              ค้นหา
            </button>
          </form>

          {q && (
            <div className="mt-6 flex items-center gap-4 font-[var(--font-stamp)] text-[11px] uppercase tracking-[0.25em] text-ink-muted">
              <span>ผลลัพธ์ของ “<span className="text-ink font-bold">{q}</span>”</span>
              <span className="h-px w-10 bg-ink/30" />
              <span>{total.toLocaleString("th-TH")} รายการ</span>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-14 md:py-20">
        {!q ? (
          <div className="text-center py-20">
            <p className="font-display text-xl md:text-2xl font-bold max-w-xl mx-auto leading-snug">
              พิมพ์คำค้นด้านบนเพื่อเริ่มต้น
            </p>
            <p className="mt-3 text-ink-muted">
              เช่น “ราคาข้าว” “เกษตรอินทรีย์” “สัตว์เศรษฐกิจ”
            </p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 max-w-xl mx-auto">
            <p className="big-num">0/0</p>
            <p className="mt-4 font-display text-xl md:text-2xl font-bold leading-snug">
              ไม่พบผลลัพธ์ที่ตรงกัน
            </p>
            <p className="mt-3 text-ink-muted">ลองใช้คำที่สั้นลง หรือสะกดใหม่</p>
          </div>
        ) : (
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} variant="card" />
            ))}
          </div>
        )}

        {q && posts.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={Math.min(totalPages, 20)}
            basePath={`/search?q=${encodeURIComponent(q)}`}
          />
        )}
      </section>
    </>
  );
}
