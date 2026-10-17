import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TOPICS, getTopic } from "@/lib/topics";
import { getCrop } from "@/lib/crops";
import { formatPrice, getDITSeries } from "@/lib/dit";
import { getCategories, getPosts, getPostsByTag, getTags, type WPPost } from "@/lib/wp";
import { ArchiveHeader } from "@/components/ArchiveHeader";
import { SectionHeader } from "@/components/SectionHeader";
import { PostCard } from "@/components/PostCard";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL, breadcrumbSchema, collectionSchema } from "@/lib/schema";

export const revalidate = 600;
export const dynamicParams = false;

export function generateStaticParams() {
  return TOPICS.map((t) => ({ slug: t.slug }));
}

type Props = { params: Promise<{ slug: string }> };

// Evergreen desks: how-to and explainer stories that stay useful past the news cycle.
const KNOWLEDGE_SLUGS = ["did-you-know", "folk-wisdom", "agricultural-technology", "column"];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) return {};
  const url = `${SITE_URL}/topic/${topic.slug}`;
  return {
    title: topic.title,
    description: topic.description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title: topic.title, description: topic.description, locale: "th_TH" },
  };
}

/**
 * Posts for each term, merged newest-first without duplicates. A term with an
 * exact-name tag uses that tag (precise); otherwise full-text search, which
 * also matches stories that only mention the word in passing.
 */
async function searchMerged(queries: string[], opts: { perPage: number; categories?: number[]; preferTags?: boolean }) {
  const results = await Promise.all(
    queries.map(async (q) => {
      if (opts.preferTags) {
        const { data: tags } = await getTags({ perPage: 10, search: q });
        const exact = tags.find((t) => t.name === q && t.count >= 5);
        if (exact) return (await getPostsByTag({ tagId: exact.id, perPage: opts.perPage })).data;
      }
      return (await getPosts({ perPage: opts.perPage, search: q, orderby: "date", categories: opts.categories })).data;
    })
  );
  const seen = new Set<number>();
  return results
    .flat()
    .filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export default async function TopicPage({ params }: Props) {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) notFound();

  const crop = topic.crop ? getCrop(topic.crop) : null;
  const categories = await getCategories({ exclude: [13] });
  const knowledgeIds = categories.filter((c) => KNOWLEDGE_SLUGS.includes(c.slug)).map((c) => c.id);

  const [news, knowledge, tagLists, cropSeries] = await Promise.all([
    searchMerged(topic.queries, { perPage: 12, preferTags: true }),
    knowledgeIds.length ? searchMerged(topic.queries, { perPage: 6, categories: knowledgeIds }) : Promise.resolve([] as WPPost[]),
    Promise.all(topic.queries.map((q) => getTags({ perPage: 12, search: q }).then((r) => r.data))),
    crop ? getDITSeries(crop.chart, 30) : Promise.resolve(null),
  ]);

  const knowledgeIdsShown = new Set(knowledge.slice(0, 3).map((p) => p.id));
  const latest = news.filter((p) => !knowledgeIdsShown.has(p.id)).slice(0, 9);
  const tagSeen = new Set<number>();
  const tags = tagLists
    .flat()
    .filter((t) => t.count > 0 && (tagSeen.has(t.id) ? false : (tagSeen.add(t.id), true)))
    .sort((a, b) => b.count - a.count)
    .slice(0, 16);

  const url = `${SITE_URL}/topic/${topic.slug}`;
  const headSeries = crop?.series.find((s) => s.id === crop.chart);

  return (
    <>
      <JsonLd
        data={[
          collectionSchema({ url, name: topic.title, description: topic.description }),
          breadcrumbSchema([
            { name: "หน้าแรก", url: SITE_URL },
            { name: topic.name, url },
          ]),
        ]}
      />

      <ArchiveHeader title={topic.title} description={topic.description}>
        {crop && cropSeries?.latest && headSeries && (
          <Link
            href={`/prices/${crop.slug}`}
            className="mt-6 inline-flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg bg-paper px-5 py-4 ring-1 ring-line hover:ring-leaf"
          >
            <span className="text-sm font-semibold text-leaf">{crop.title}</span>
            <span className="font-heading font-bold text-2xl text-ink tabular-nums">{formatPrice(cropSeries.latest)}</span>
            <span className="text-sm text-ink-3">
              {cropSeries.latest.unit} {headSeries.label}
            </span>
          </Link>
        )}
      </ArchiveHeader>

      {knowledge.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-4 md:px-6 py-12 md:py-14">
          <SectionHeader title={`ความรู้เรื่อง${topic.name}`} />
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {knowledge.slice(0, 3).map((p) => (
              <PostCard key={p.id} post={p} variant="card" />
            ))}
          </div>
        </section>
      )}

      {latest.length > 0 && (
        <section className={knowledge.length > 0 ? "border-t border-line" : undefined}>
          <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-12 md:py-14">
            <SectionHeader
              title={`ข่าว${topic.name}ล่าสุด`}
              href={`/search?q=${encodeURIComponent(topic.queries[0])}`}
              linkLabel="ดูข่าวทั้งหมด"
            />
            <ul className="grid gap-x-10 md:grid-cols-2 divide-y divide-line md:divide-y-0">
              {latest.map((p) => (
                <li key={p.id} className="py-5 md:border-b md:border-line">
                  <PostCard post={p} variant="row" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="bg-field">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-10 md:py-12 grid gap-10 md:grid-cols-2">
          {tags.length > 0 && (
            <div>
              <h2 className="font-heading font-bold text-lg text-ink">แท็กที่เกี่ยวข้อง</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/tag/${t.slug}`}
                      className="inline-block rounded-full bg-paper px-3.5 py-1.5 text-sm text-ink-2 ring-1 ring-line hover:bg-leaf hover:text-white hover:ring-leaf transition-colors"
                    >
                      {t.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <h2 className="font-heading font-bold text-lg text-ink">หัวข้ออื่นที่น่าสนใจ</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {TOPICS.filter((t) => t.slug !== topic.slug).map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/topic/${t.slug}`}
                    className="inline-block rounded-full bg-paper px-4 py-2 text-sm font-semibold text-leaf ring-1 ring-line hover:ring-leaf"
                  >
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
