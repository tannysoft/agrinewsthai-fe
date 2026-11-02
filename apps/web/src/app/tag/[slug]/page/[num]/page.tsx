import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getTagBySlug, getPostsByTag, stripHtml } from "@/lib/wp";
import { PostCard } from "@/components/PostCard";
import { Pagination } from "@/components/Pagination";
import { ArchiveHeader } from "@/components/ArchiveHeader";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string; num: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, num } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) return { title: "ไม่พบแท็ก" };
  return {
    title: `#${tag.name} · หน้า ${num}`,
    description:
      stripHtml(tag.description) ||
      `บทความที่แท็กด้วย #${tag.name} จากเรื่องเล่าข่าวเกษตร`,
  };
}

export default async function TagPaginatedPage({ params }: Props) {
  const { slug, num } = await params;
  const page = Number(num);
  if (!Number.isFinite(page) || page < 1) notFound();
  if (page === 1) redirect(`/tag/${slug}`);

  const tag = await getTagBySlug(slug);
  if (!tag) notFound();

  const { data: posts, totalPages, total } = await getPostsByTag({
    tagId: tag.id,
    page,
    perPage: 12,
  });
  if (!posts.length) notFound();

  return (
    <>
      <ArchiveHeader
        title={`#${tag.name}`}
        total={total}
        page={page}
        parent={{ label: "แท็กทั้งหมด", href: "/tags" }}
      />

      <section className="mx-auto max-w-[1400px] px-4 md:px-6 py-10 md:py-14">
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} variant="card" />
          ))}
        </div>

        <Pagination currentPage={page} totalPages={Math.min(totalPages, 50)} basePath={`/tag/${slug}`} />
      </section>
    </>
  );
}
