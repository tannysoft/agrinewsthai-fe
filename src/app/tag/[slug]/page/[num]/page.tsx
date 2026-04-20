import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getTagBySlug, getPostsByTag, stripHtml } from "@/lib/wp";
import { PostCard } from "@/components/PostCard";
import { Pagination } from "@/components/Pagination";

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
      <section className="bg-moss-900 text-paper border-b-4 border-lime">
        <div className="mx-auto max-w-[1400px] px-6 py-14 md:py-20 grid md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-8">
            <div className="font-[var(--font-stamp)] text-[11px] uppercase tracking-[0.3em] text-lime">
              Tag · แท็ก
            </div>
            <h1 className="mt-4 font-display font-extrabold leading-[1] tracking-[-0.02em] text-[clamp(2.25rem,5.5vw,4.5rem)]">
              <span className="text-lime">#</span>
              {tag.name}
            </h1>
          </div>
          <div className="md:col-span-4 md:text-right">
            <div className="inline-block text-left border border-lime p-5">
              <div className="font-[var(--font-stamp)] text-[10px] uppercase tracking-widest text-lime">
                Archive
              </div>
              <div className="mt-2 issue-num text-3xl font-bold">
                {total.toLocaleString("th-TH")}
              </div>
              <div className="issue-num text-[11px] uppercase tracking-widest text-paper/70">
                Stories · Page {page} / {Math.max(totalPages, 1)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-12 md:py-16">
        <div className="grid gap-10 md:gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} variant="card" />
          ))}
        </div>

        <Pagination
          currentPage={page}
          totalPages={Math.min(totalPages, 50)}
          basePath={`/tag/${slug}`}
        />
      </section>
    </>
  );
}
