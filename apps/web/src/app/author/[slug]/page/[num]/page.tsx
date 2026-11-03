import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { getAuthorBySlug, getPosts } from "@/lib/wp";
import { PostCard } from "@/components/PostCard";
import { Pagination } from "@/components/Pagination";
import { ArchiveHeader } from "@/components/ArchiveHeader";

export const revalidate = 900;

type Props = { params: Promise<{ slug: string; num: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, num } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) return { title: "ไม่พบผู้เขียน" };
  return { title: `${author.name} ผู้เขียน · หน้า ${num}` };
}

export default async function AuthorPaginatedPage({ params }: Props) {
  const { slug, num } = await params;
  const page = Number(num);
  if (!Number.isInteger(page) || page < 1) notFound();
  if (page === 1) permanentRedirect(`/author/${slug}`);

  const author = await getAuthorBySlug(slug);
  if (!author) permanentRedirect("/news");

  const { data: posts, total, totalPages } = await getPosts({ authorId: author.id, perPage: 12, page });
  if (!posts.length) notFound();

  return (
    <>
      <ArchiveHeader title={author.name} total={total} page={page} />
      <section className="mx-auto max-w-[1400px] px-4 md:px-6 py-10 md:py-14">
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} variant="card" />
          ))}
        </div>
        <Pagination currentPage={page} totalPages={totalPages} basePath={`/author/${slug}`} />
      </section>
    </>
  );
}
