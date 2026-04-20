import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCategoryBySlug, getPosts, stripHtml } from "@/lib/wp";
import { PostCard } from "@/components/PostCard";
import { Pagination } from "@/components/Pagination";

export const revalidate = 300;

type Props = {
  params: Promise<{ category: string; num: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, num } = await params;
  const cat = await getCategoryBySlug(category);
  if (!cat) return { title: "ไม่พบหมวดหมู่" };
  return {
    title: `${cat.name} · หน้า ${num}`,
    description:
      stripHtml(cat.description) ||
      `ข่าวและบทความในหมวด ${cat.name} จากเรื่องเล่าข่าวเกษตร`,
  };
}

export default async function CategoryPaginatedPage({ params }: Props) {
  const { category, num } = await params;
  const page = Number(num);

  if (!Number.isFinite(page) || page < 1) notFound();
  if (page === 1) redirect(`/${category}`);

  const cat = await getCategoryBySlug(category);
  if (!cat) notFound();

  // Page 1 shows 1 hero + 12 cards = 13 items. Paginated pages start at item 14
  // so the 13th post isn't repeated. WP REST's `offset` param is independent of
  // `page`, so we drive pagination purely with offset when N >= 2.
  const page1Count = 13;
  const pagedPerPage = 12;
  const offset = page1Count + pagedPerPage * (page - 2); // page=2 → 13, page=3 → 25

  const { data: posts, total } = await getPosts({
    perPage: pagedPerPage,
    page: 1,
    offset,
    categories: cat.id,
  });

  if (!posts.length) notFound();

  const totalPages = total <= page1Count
    ? 1
    : 1 + Math.ceil((total - page1Count) / pagedPerPage);

  return (
    <>
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

      <section className="mx-auto max-w-[1400px] px-6 py-14 md:py-20">
        <div className="grid gap-10 md:gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} variant="card" />
          ))}
        </div>

        <Pagination
          currentPage={page}
          totalPages={Math.min(totalPages, 50)}
          basePath={`/${category}`}
        />
      </section>
    </>
  );
}
