import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCategoryBySlug, getPosts } from "@/lib/wp";
import { categoryMetadata } from "@/lib/category-meta";
import { PostCard } from "@/components/PostCard";
import { Pagination } from "@/components/Pagination";
import { ArchiveHeader } from "@/components/ArchiveHeader";

export const revalidate = 300;

type Props = {
  params: Promise<{ category: string; num: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, num } = await params;
  const cat = await getCategoryBySlug(category);
  if (!cat) return { title: "ไม่พบหมวดหมู่" };
  return categoryMetadata(cat, Number(num) || 1);
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
      <ArchiveHeader title={cat.name} total={total} page={page} />

      <section className="mx-auto max-w-[1400px] px-4 md:px-6 py-10 md:py-14">
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} variant="card" showCategory={false} />
          ))}
        </div>

        <Pagination currentPage={page} totalPages={Math.min(totalPages, 50)} basePath={`/${category}`} />
      </section>
    </>
  );
}
