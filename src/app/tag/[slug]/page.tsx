import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getTagBySlug, getPostsByTag, getTags, stripHtml } from "@/lib/wp";
import { PostCard } from "@/components/PostCard";
import { Pagination } from "@/components/Pagination";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) return { title: "ไม่พบแท็ก" };
  return {
    title: `#${tag.name}`,
    description:
      stripHtml(tag.description) ||
      `บทความที่แท็กด้วย #${tag.name} จากเรื่องเล่าข่าวเกษตร`,
  };
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params;
  const page = 1;

  const tag = await getTagBySlug(slug);
  if (!tag) notFound();

  const [{ data: posts, totalPages, total }, relatedTagsRes] = await Promise.all([
    getPostsByTag({ tagId: tag.id, page, perPage: 12 }),
    getTags({ perPage: 12 }),
  ]);

  const relatedTags = relatedTagsRes.data.filter((t) => t.id !== tag.id).slice(0, 10);

  return (
    <>
      <section className="bg-moss-900 text-paper border-b-4 border-lime">
        <div className="mx-auto max-w-[1400px] px-6 py-14 md:py-20 grid md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-8">
            <div className="flex items-center gap-3">
              <span className="font-[var(--font-stamp)] text-[11px] uppercase tracking-[0.3em] text-lime">
                Tag · แท็ก
              </span>
              <span className="issue-num text-xs text-paper/60">
                # {String(tag.id).padStart(4, "0")}
              </span>
            </div>
            <h1 className="mt-4 font-display font-extrabold leading-[1] tracking-[-0.02em] text-[clamp(2.25rem,5.5vw,4.5rem)]">
              <span className="text-lime">#</span>
              {tag.name}
            </h1>
            {tag.description && (
              <p className="mt-6 max-w-2xl text-paper/80 text-base md:text-lg leading-relaxed">
                {stripHtml(tag.description)}
              </p>
            )}
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
        {posts.length === 0 ? (
          <p className="text-ink-muted text-center py-20">
            ยังไม่มีบทความภายใต้แท็กนี้
          </p>
        ) : (
          <div className="grid gap-10 md:gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p, i) => (
              <PostCard key={p.id} post={p} variant="card" priority={i < 3} />
            ))}
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={Math.min(totalPages, 50)}
          basePath={`/tag/${slug}`}
        />
      </section>

      {relatedTags.length > 0 && (
        <section className="bg-paper-alt border-t-2 border-ink">
          <div className="mx-auto max-w-[1400px] px-6 py-12 md:py-14">
            <div className="font-[var(--font-stamp)] text-[11px] uppercase tracking-[0.3em] text-moss-700 mb-5">
              § Related Tags · แท็กที่ใกล้เคียง
            </div>
            <div className="flex flex-wrap gap-2">
              {relatedTags.map((t) => (
                <Link
                  key={t.id}
                  href={`/tag/${t.slug}`}
                  className="font-display text-sm font-semibold bg-paper border border-ink px-3 py-1.5 hover:bg-lime transition-colors"
                >
                  #{t.name}
                  <span className="issue-num text-[10px] ml-2 text-ink-muted">
                    {t.count}
                  </span>
                </Link>
              ))}
              <Link
                href="/tags"
                className="font-[var(--font-stamp)] uppercase tracking-[0.25em] text-xs px-3 py-2 after-arrow ml-1"
              >
                ดูแท็กทั้งหมด
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
