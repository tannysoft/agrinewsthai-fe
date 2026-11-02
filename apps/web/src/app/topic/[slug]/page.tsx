import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TOPICS, getTopic } from "@/lib/topics";
import { getCrop } from "@/lib/crops";
import { formatPrice, getDITSeries } from "@/lib/dit";
import {
  getCategories,
  getPageBySlug,
  getPostHref,
  getPosts,
  getPostsByTag,
  getTagByName,
  getTags,
  prepareContentHtml,
  stripHtml,
  type WPPost,
  type WPTag,
} from "@/lib/wp";
import { extractFaq } from "@/lib/faq";
import { ArchiveHeader } from "@/components/ArchiveHeader";
import { SectionHeader } from "@/components/SectionHeader";
import { PostCard } from "@/components/PostCard";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL, breadcrumbSchema } from "@/lib/schema";

export const revalidate = 600;
export const dynamicParams = false;

export function generateStaticParams() {
  return TOPICS.map((t) => ({ slug: t.slug }));
}

type Props = { params: Promise<{ slug: string }> };

// Evergreen desks: how-to and explainer stories that stay useful past the news cycle.
const KNOWLEDGE_SLUGS = ["did-you-know", "folk-wisdom", "agricultural-technology", "column"];
// A sub-topic gets its own section only when it has enough stories to fill it.
const SUBTOPIC_MIN_POSTS = 3;

const thDate = (iso: string) =>
  new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Bangkok" });

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

/** Know-how: full-text search inside the evergreen desks, merged newest-first. */
async function knowledgePosts(queries: string[], categoryIds: number[]) {
  if (!categoryIds.length) return [] as WPPost[];
  const lists = await Promise.all(
    queries.map((q) => getPosts({ perPage: 6, search: q, orderby: "date", categories: categoryIds }).then((r) => r.data))
  );
  const seen = new Set<number>();
  return lists
    .flat()
    .filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export default async function TopicPage({ params }: Props) {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) notFound();

  const crop = topic.crop ? getCrop(topic.crop) : null;
  const [categories, mainTag, guide, relatedTagLists, subTags, cropSeries] = await Promise.all([
    getCategories({ exclude: [13] }),
    getTagByName(topic.tag),
    getPageBySlug(`topic-${topic.slug}`),
    Promise.all([topic.tag, ...topic.queries].map((q) => getTags({ perPage: 12, search: q }).then((r) => r.data))),
    Promise.all(topic.subTags.map((name) => getTagByName(name))),
    crop ? getDITSeries(crop.chart, 30) : Promise.resolve(null),
  ]);

  const knowledgeIds = categories.filter((c) => KNOWLEDGE_SLUGS.includes(c.slug)).map((c) => c.id);
  const [newsRes, knowledge, subPosts] = await Promise.all([
    mainTag
      ? getPostsByTag({ tagId: mainTag.id, perPage: 14 })
      : getPosts({ perPage: 14, search: topic.tag, orderby: "date" }),
    knowledgePosts(topic.queries, knowledgeIds),
    Promise.all(
      subTags.map((t) =>
        t && t.count >= SUBTOPIC_MIN_POSTS ? getPostsByTag({ tagId: t.id, perPage: 8 }).then((r) => r.data) : Promise.resolve([] as WPPost[])
      )
    ),
  ]);

  // Each story appears once on the page: know-how first, then latest, then sub-topics.
  const shown = new Set<number>();
  const take = (posts: WPPost[], n: number) => {
    const out = posts.filter((p) => !shown.has(p.id)).slice(0, n);
    out.forEach((p) => shown.add(p.id));
    return out;
  };
  const knowHow = take(knowledge, 3);
  const latest = take(newsRes.data, 8);
  const clusters = subTags
    .map((tag, i) => ({ tag, posts: take(subPosts[i], 3) }))
    .filter((c): c is { tag: WPTag; posts: WPPost[] } => Boolean(c.tag) && c.posts.length >= SUBTOPIC_MIN_POSTS);

  const tagSeen = new Set<number>([...(mainTag ? [mainTag.id] : [])]);
  const relatedTags = relatedTagLists
    .flat()
    .filter((t) => t.count > 0 && (tagSeen.has(t.id) ? false : (tagSeen.add(t.id), true)))
    .sort((a, b) => b.count - a.count)
    .slice(0, 16);

  const allPosts = [...knowHow, ...latest, ...clusters.flatMap((c) => c.posts)];
  const updated = allPosts.map((p) => p.modified).sort().at(-1);
  const faqs = guide ? extractFaq(guide.content.rendered) : [];
  const archiveHref = mainTag ? `/tag/${mainTag.slug}` : `/search?q=${encodeURIComponent(topic.tag)}`;

  const url = `${SITE_URL}/topic/${topic.slug}`;
  const headSeries = crop?.series.find((s) => s.id === crop.chart);

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "@id": `${url}#collection`,
            url,
            name: topic.title,
            description: topic.description,
            inLanguage: "th-TH",
            about: { "@type": "Thing", name: topic.name },
            dateModified: updated ? new Date(updated).toISOString() : undefined,
            isPartOf: { "@id": `${SITE_URL}/#website` },
            publisher: { "@id": `${SITE_URL}/#organization` },
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: latest.length,
              itemListElement: latest.map((p, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: `${SITE_URL}${getPostHref(p)}`,
                name: stripHtml(p.title.rendered),
              })),
            },
          },
          breadcrumbSchema([
            { name: "หน้าแรก", url: SITE_URL },
            { name: topic.name, url },
          ]),
          ...(faqs.length
            ? [
                {
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: faqs.map((f) => ({
                    "@type": "Question",
                    name: f.question,
                    acceptedAnswer: { "@type": "Answer", text: f.answer },
                  })),
                },
              ]
            : []),
        ]}
      />

      <ArchiveHeader title={topic.title} description={topic.description}>
        {updated && <p className="mt-3 text-sm text-ink-3">อัปเดตล่าสุด {thDate(updated)}</p>}
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

      {/* Editor-written guide (WordPress Page `topic-{slug}`), when published */}
      {guide && (
        <section className="border-b border-line">
          <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-12 md:py-14">
            <div className="mx-auto max-w-[760px]">
              <div
                className="wp-content"
                dangerouslySetInnerHTML={{ __html: prepareContentHtml(guide.content.rendered, topic.title) }}
              />
              <p className="mt-8 text-sm text-ink-3">ปรับปรุงเนื้อหาล่าสุด {thDate(guide.modified)} โดยกองบรรณาธิการ</p>
            </div>
          </div>
        </section>
      )}

      {knowHow.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-4 md:px-6 py-12 md:py-14">
          <SectionHeader title={`ความรู้เรื่อง${topic.name}`} />
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {knowHow.map((p) => (
              <PostCard key={p.id} post={p} variant="card" />
            ))}
          </div>
        </section>
      )}

      {latest.length > 0 && (
        <section className={knowHow.length > 0 ? "border-t border-line" : undefined}>
          <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-12 md:py-14">
            <SectionHeader title={`ข่าว${topic.name}ล่าสุด`} href={archiveHref} linkLabel="ดูข่าวทั้งหมด" />
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

      {clusters.map(({ tag, posts }) => (
        <section key={tag.id} className="border-t border-line">
          <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-12 md:py-14">
            <SectionHeader title={tag.name} href={`/tag/${tag.slug}`} />
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <PostCard key={p.id} post={p} variant="card" />
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="bg-field">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-10 md:py-12 grid gap-10 md:grid-cols-2">
          {relatedTags.length > 0 && (
            <div>
              <h2 className="font-heading font-bold text-lg text-ink">แท็กที่เกี่ยวข้อง</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {relatedTags.map((t) => (
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
