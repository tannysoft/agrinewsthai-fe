import type { Metadata } from "next";
import { getPosts } from "@/lib/wp";
import { PostCard } from "@/components/PostCard";
import { Pagination } from "@/components/Pagination";

export const metadata: Metadata = {
  title: "ข่าวล่าสุด",
  description: "รวมข่าวและบทความล่าสุดจากเรื่องเล่าข่าวเกษตร",
};

export const revalidate = 180;

export default async function LatestPage() {
  const page = 1;
  const { data: posts, totalPages } = await getPosts({ perPage: 15, page });

  return (
    <>
      <section className="bg-lime border-b-2 border-ink">
        <div className="mx-auto max-w-[1400px] px-6 py-14 md:py-20 grid md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-8">
            <div className="font-[var(--font-stamp)] text-[11px] uppercase tracking-[0.3em] text-moss-900">
              Daily Wire · ประจำวัน
            </div>
            <h1 className="mt-3 font-display font-extrabold leading-[1] tracking-[-0.02em] text-[clamp(2.25rem,5.5vw,4.5rem)] text-ink">
              ข่าวล่าสุด
            </h1>
            <p className="mt-5 max-w-2xl text-ink-soft text-base md:text-lg leading-relaxed">
              ปูมบันทึกข่าวเกษตรเรียงใหม่สุด — ตามติดนโยบาย ราคาพืชผล
              เทคโนโลยี และความเคลื่อนไหวในแปลง
            </p>
          </div>
          <div className="md:col-span-4 md:text-right font-[var(--font-stamp)] text-sm uppercase tracking-[0.2em]">
            Hot off the press
            <div className="mt-1 text-3xl font-bold issue-num">
              {new Date().toLocaleDateString("th-TH", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-14 md:py-20">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <PostCard key={p.id} post={p} variant="card" priority={i < 3} />
          ))}
        </div>

        <Pagination
          currentPage={page}
          totalPages={Math.min(totalPages, 50)}
          basePath="/latest"
        />
      </section>
    </>
  );
}
