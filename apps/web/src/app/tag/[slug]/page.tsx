import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getTagBySlug, getPostsByTag, getTags, stripHtml } from "@/lib/wp";
import { PostCard } from "@/components/PostCard";
import { Pagination } from "@/components/Pagination";
import { ArchiveHeader } from "@/components/ArchiveHeader";
import { TopicChip } from "@/components/TopicLink";
import { topicForTags } from "@/lib/topics";
import { JsonLd } from "@/components/JsonLd";
import {
  SITE_URL,
  breadcrumbSchema,
  tagCategoryToCollection,
} from "@/lib/schema";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) return { title: "ไม่พบแท็ก" };
  const description =
    stripHtml(tag.description) ||
    `บทความที่แท็กด้วย #${tag.name} จากเรื่องเล่าข่าวเกษตร`;
  const url = `${SITE_URL}/tag/${slug}`;
  return {
    title: `#${tag.name}`,
    description,
    alternates: { canonical: url },
    // Tags with only a couple of stories are thin pages; keep them out of the index.
    robots: tag.count < 3 ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      url,
      title: `#${tag.name}`,
      description,
      locale: "th_TH",
    },
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

  const hub = topicForTags([tag.name]);
  const relatedTags = relatedTagsRes.data.filter((t) => t.id !== tag.id).slice(0, 10);

  const url = `${SITE_URL}/tag/${slug}`;
  const schemas = [
    tagCategoryToCollection(tag, url),
    breadcrumbSchema([
      { name: "หน้าแรก", url: SITE_URL },
      { name: "แท็กทั้งหมด", url: `${SITE_URL}/tags` },
      { name: `#${tag.name}`, url },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <ArchiveHeader
        title={`#${tag.name}`}
        description={stripHtml(tag.description) || undefined}
        total={total}
        parent={{ label: "แท็กทั้งหมด", href: "/tags" }}
      >
        {hub && <TopicChip topic={hub} />}
      </ArchiveHeader>

      <section className="mx-auto max-w-[1400px] px-4 md:px-6 py-10 md:py-14">
        {posts.length === 0 ? (
          <p className="py-20 text-center text-ink-2">ยังไม่มีเรื่องในแท็กนี้</p>
        ) : (
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p, i) => (
              <PostCard key={p.id} post={p} variant="card" priority={i < 3} />
            ))}
          </div>
        )}

        <Pagination currentPage={page} totalPages={Math.min(totalPages, 50)} basePath={`/tag/${slug}`} />
      </section>

      {relatedTags.length > 0 && (
        <section className="border-t border-line">
          <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-10 md:py-12">
            <h2 className="font-heading font-bold text-xl text-ink">แท็กยอดนิยมอื่น</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {relatedTags.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/tag/${t.slug}`}
                    className="inline-block rounded-full bg-field px-3.5 py-1.5 text-sm text-ink-2 hover:bg-leaf hover:text-white transition-colors"
                  >
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
