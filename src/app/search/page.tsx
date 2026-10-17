import { getPosts } from "@/lib/wp";
import { PostCard } from "@/components/PostCard";
import { Pagination } from "@/components/Pagination";
import { ArchiveHeader } from "@/components/ArchiveHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
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
      <ArchiveHeader title={q ? `ผลการค้นหา “${q}”` : "ค้นหาข่าวและบทความ"} total={q ? total : undefined}>
        <form role="search" className="mt-6 max-w-2xl flex items-center gap-2 rounded-full border-2 border-line bg-paper focus-within:border-leaf pl-5 pr-1.5 py-1.5 transition-colors">
          <label htmlFor="q" className="sr-only">คำค้น</label>
          <input
            id="q"
            type="search"
            name="q"
            defaultValue={q}
            placeholder="เช่น ราคาข้าว ทุเรียน ปุ๋ยอินทรีย์"
            className="flex-1 min-w-0 bg-transparent text-lg py-2 placeholder:text-ink-3 focus:outline-none"
          />
          <button type="submit" className="shrink-0 h-11 px-6 rounded-full bg-leaf text-white font-semibold hover:bg-leaf-deep">
            ค้นหา
          </button>
        </form>
      </ArchiveHeader>

      <section className="mx-auto max-w-[960px] px-4 md:px-6 py-10 md:py-14">
        {!q ? (
          <p className="py-16 text-center text-ink-2">พิมพ์คำที่อยากรู้ในช่องด้านบน เช่น ชื่อพืช ชื่อสัตว์ หรือชื่อโครงการ</p>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-heading font-bold text-2xl text-ink">ไม่พบเรื่องที่ตรงกับ “{q}”</p>
            <p className="mt-3 text-ink-2">ลองใช้คำที่สั้นลง ตรวจตัวสะกด หรือค้นด้วยชื่อพืชหรือสัตว์โดยตรง</p>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {posts.map((p) => (
              <li key={p.id} className="py-5 first:pt-0">
                <PostCard post={p} variant="row" />
              </li>
            ))}
          </ul>
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
