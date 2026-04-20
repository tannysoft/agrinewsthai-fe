import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategoryBySlug, getPosts, stripHtml } from "@/lib/wp";
import { PostCard } from "@/components/PostCard";
import { Pagination } from "@/components/Pagination";

export const revalidate = 300;

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = await getCategoryBySlug(category);
  if (!cat) return { title: "ไม่พบหมวดหมู่" };
  return {
    title: cat.name,
    description:
      stripHtml(cat.description) ||
      `ข่าวและบทความในหมวด ${cat.name} จากเรื่องเล่าข่าวเกษตร`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params;
  const page = 1;

  const cat = await getCategoryBySlug(slug);
  if (!cat) notFound();

  const { data: posts, total } = await getPosts({
    perPage: 13,
    page,
    categories: cat.id,
  });

  const page1Count = 13;
  const totalPages = total <= page1Count
    ? 1
    : 1 + Math.ceil((total - page1Count) / 12);

  const [lead, second, ...rest] = posts;

  return (
    <>
      {/* HEADER */}
      <section className="bg-ink text-paper border-b-4 border-lime">
        <div className="mx-auto max-w-[1400px] px-6 py-14 md:py-20 grid md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-8">
            <div className="flex items-center gap-3">
              <span className="font-[var(--font-stamp)] text-[11px] uppercase tracking-[0.3em] text-lime">
                Category · หมวดหมู่
              </span>
              <span className="issue-num text-xs text-paper/60">
                § {String(cat.id).padStart(3, "0")}
              </span>
            </div>
            <h1 className="mt-4 font-display font-extrabold leading-[1] tracking-[-0.02em] text-[clamp(2.25rem,5.5vw,4.5rem)]">
              <span className="text-lime">/</span>
              {cat.name}
            </h1>
            {cat.description && (
              <p className="mt-6 max-w-2xl text-paper/75 text-base md:text-lg leading-relaxed">
                {stripHtml(cat.description)}
              </p>
            )}
          </div>
          <div className="md:col-span-4 md:text-right">
            <div className="inline-block text-left border border-lime p-5">
              <div className="font-[var(--font-stamp)] text-[10px] uppercase tracking-widest text-lime">
                Archive
              </div>
              <div className="mt-2 issue-num text-4xl font-bold">
                {total.toLocaleString("th-TH")}
              </div>
              <div className="issue-num text-[11px] uppercase tracking-widest text-paper/70">
                Stories · Page {page} / {Math.max(totalPages, 1)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-[1400px] px-6 py-14 md:py-20">
        {posts.length === 0 ? (
          <p className="text-ink-muted text-center py-20">ยังไม่มีเนื้อหาในหมวดนี้</p>
        ) : (
          <>
            {lead && (
              <div className="mb-14">
                <PostCard post={lead} variant="headline" priority />
              </div>
            )}

            <div className="grid gap-10 md:gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {[second, ...rest].filter(Boolean).map((p) => (
                <PostCard key={p!.id} post={p!} variant="card" />
              ))}
            </div>
          </>
        )}

        <Pagination
          currentPage={page}
          totalPages={Math.min(totalPages, 50)}
          basePath={`/${slug}`}
        />
      </section>
    </>
  );
}
