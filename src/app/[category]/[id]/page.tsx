import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  formatRelative,
  formatThaiDateTime,
  getBylineName,
  getExcerpt,
  getFeaturedImage,
  getPostById,
  getPostHref,
  getPosts,
  getPrimaryCategory,
  prepareContentHtml,
  stripHtml,
  WPTerm,
} from "@/lib/wp";
import { PostCard } from "@/components/PostCard";
import { SectionHeader, SproutIcon } from "@/components/SectionHeader";
import { FacebookIcon, LineIcon, XIcon } from "@/components/icons";
import { PriceWidgetMini } from "@/components/PriceWidgetMini";
import { PreferredSourceButton, PreferredSourceCard } from "@/components/PreferredSource";
import { JsonLd } from "@/components/JsonLd";
import { getRankMathHead } from "@/lib/rankmath";
import {
  SITE_NAME,
  SITE_URL,
  breadcrumbSchema,
  newsArticleSchema,
} from "@/lib/schema";

export const revalidate = 300;

type Props = { params: Promise<{ category: string; id: string }> };

/** Collapse &nbsp; and stray whitespace that editors paste into Rank Math fields. */
const tidy = (s: string) => s.replace(/ /g, " ").replace(/\s+/g, " ").trim();

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isFinite(postId) || postId <= 0) return { title: "ไม่พบบทความ" };
  const post = await getPostById(postId);
  if (!post) return { title: "ไม่พบบทความ" };

  // Pull Rank Math metadata (OG image, description) from the rendered WP page
  // so we stay in sync with what editors set in the SEO plugin.
  const rankMath = await getRankMathHead(post.link);

  const stripSuffix = (s?: string) =>
    s?.replace(/\s+[»&].*$/, "").trim() ?? undefined;
  const title = tidy(
    stripSuffix(rankMath?.ogTitle) ||
      stripSuffix(rankMath?.title) ||
      stripHtml(post.title.rendered)
  );
  const description = tidy(
    rankMath?.ogDescription || rankMath?.description || getExcerpt(post, 160)
  );
  const fallbackImg = getFeaturedImage(post, "large");
  const imgUrl = rankMath?.ogImage || fallbackImg?.src;
  const imgW = rankMath?.ogImageWidth ?? fallbackImg?.width ?? 1200;
  const imgH = rankMath?.ogImageHeight ?? fallbackImg?.height ?? 675;
  const canonical = `${SITE_URL}${getPostHref(post)}`;

  const tags = (post._embedded?.["wp:term"]?.flat() ?? [])
    .filter((t) => t.taxonomy === "post_tag")
    .map((t) => t.name);
  const category = getPrimaryCategory(post);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonical,
      siteName: SITE_NAME,
      locale: "th_TH",
      publishedTime: rankMath?.articlePublishedTime || post.date_gmt + "Z",
      modifiedTime: rankMath?.articleModifiedTime || post.modified,
      authors: [getBylineName(post)],
      section: category?.name,
      tags,
      images: imgUrl
        ? [
            {
              url: imgUrl,
              width: imgW,
              height: imgH,
              alt: rankMath?.ogImageAlt || stripHtml(post.title.rendered),
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imgUrl ? [imgUrl] : [],
    },
  };
}

function readingTime(html: string) {
  // Thai doesn't separate words with spaces, so estimate from characters
  // (~500 Thai characters per minute for an average reader).
  const chars = stripHtml(html).replace(/\s+/g, "").length;
  return Math.max(1, Math.round(chars / 500));
}

export default async function PostPage({ params }: Props) {
  const { category: categorySlug, id } = await params;
  const postId = Number(id);
  if (!Number.isFinite(postId) || postId <= 0) notFound();

  const post = await getPostById(postId);
  if (!post) notFound();

  // Canonicalise: if the URL's category isn't the post's primary category
  // (e.g. old /slide/{id} links), 308 to the canonical URL so search engines move over.
  const canonical = getPostHref(post);
  if (canonical !== `/${categorySlug}/${post.id}`) permanentRedirect(canonical);

  const title = stripHtml(post.title.rendered);
  const img = getFeaturedImage(post, "large");
  const category = getPrimaryCategory(post);
  const terms: WPTerm[] = post._embedded?.["wp:term"]?.flat() ?? [];
  const tags = terms.filter((t) => t.taxonomy === "post_tag");
  const mins = readingTime(post.content.rendered);
  const published = post.date_gmt + "Z";
  const modified = post.modified_gmt ? post.modified_gmt + "Z" : post.modified;
  // Only show "updated" when the edit came well after publishing.
  const wasUpdated = new Date(modified).getTime() - new Date(published).getTime() > 60 * 60 * 1000;

  const [{ data: related }, { data: latest }, rankMath] = await Promise.all([
    category
      ? getPosts({ perPage: 6, categories: category.id, exclude: post.id })
      : Promise.resolve({ data: [] }),
    getPosts({ perPage: 10, exclude: post.id }),
    getRankMathHead(post.link),
  ]);
  const relatedIds = new Set(related.map((p) => p.id));
  const latestList = latest.filter((p) => !relatedIds.has(p.id)).slice(0, 5);

  const shareUrl = `${SITE_URL}${canonical}`;

  const schemas = [
    newsArticleSchema(post, rankMath),
    breadcrumbSchema([
      { name: "หน้าแรก", url: SITE_URL },
      ...(category
        ? [{ name: category.name, url: `${SITE_URL}/${category.slug}` }]
        : []),
      { name: title, url: `${SITE_URL}${canonical}` },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />

      <div className="mx-auto max-w-[1400px] px-4 md:px-6 pt-6 md:pt-8 pb-14 grid gap-x-12 gap-y-12 lg:grid-cols-12">
        <article className="lg:col-span-8 min-w-0">
          <nav aria-label="breadcrumb" className="text-sm">
            <ol className="flex items-center gap-2 text-ink-3">
              <li>
                <Link href="/" className="hover:text-leaf">หน้าแรก</Link>
              </li>
              {category && (
                <>
                  <li aria-hidden>›</li>
                  <li>
                    <Link href={`/${category.slug}`} className="hover:text-leaf">
                      {category.name}
                    </Link>
                  </li>
                </>
              )}
            </ol>
          </nav>

          {category && (
            <Link
              href={`/${category.slug}`}
              className="mt-5 inline-block rounded bg-leaf px-2.5 py-1 text-[13px] font-semibold text-white hover:bg-leaf-deep"
            >
              {category.name}
            </Link>
          )}

          <h1 className="mt-3 font-heading font-bold text-[1.75rem] md:text-[2.35rem] leading-[1.4] text-ink">
            {title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-y border-line py-3.5">
            <div className="flex items-center gap-3 text-sm">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-field">
                <Image src="/icon.png" alt="" width={28} height={28} className="h-7 w-7" />
              </span>
              <div className="leading-relaxed">
                <p className="font-semibold text-ink">{getBylineName(post)}</p>
                <p className="text-ink-3">
                  <time dateTime={published}>{formatThaiDateTime(published)}</time>
                  {wasUpdated && (
                    <span className="ml-3">
                      อัปเดต <time dateTime={modified}>{formatThaiDateTime(modified)}</time>
                    </span>
                  )}
                  <span className="ml-3">อ่าน {mins} นาที</span>
                </p>
              </div>
            </div>
            <ShareButtons url={shareUrl} title={title} />
          </div>

          {img && (
            <figure className="mt-6">
              <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-field">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  priority
                  sizes="(min-width: 1400px) 880px, (min-width: 1024px) 66vw, 100vw"
                  className="object-cover"
                />
              </div>
            </figure>
          )}

          <div
            className="wp-content mt-8"
            dangerouslySetInnerHTML={{ __html: prepareContentHtml(post.content.rendered, title) }}
          />

          {tags.length > 0 && (
            <div className="mt-10 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-sm font-semibold text-ink-3">แท็ก</span>
              {tags.slice(0, 12).map((t) => (
                <Link
                  key={t.id}
                  href={`/tag/${t.slug}`}
                  className="inline-block rounded-full bg-field px-3.5 py-1.5 text-sm text-ink-2 hover:bg-leaf hover:text-white transition-colors"
                >
                  {t.name}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-4 rounded-lg border border-line p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-ink">แชร์ข่าวนี้ให้เพื่อนเกษตรกร</p>
              <div className="mt-3">
                <ShareButtons url={shareUrl} title={title} />
              </div>
            </div>
            <PreferredSourceButton />
          </div>

          {related.length > 0 && (
            <section className="mt-14">
              <SectionHeader
                title="ข่าวที่เกี่ยวข้อง"
                href={category ? `/${category.slug}` : undefined}
                linkLabel={category ? `ดูทั้งหมดใน${category.name}` : undefined}
              />
              <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 md:grid-cols-3">
                {related.map((p) => (
                  <PostCard key={p.id} post={p} variant="card" showCategory={false} />
                ))}
              </div>
            </section>
          )}
        </article>

        <aside className="lg:col-span-4 flex flex-col gap-8">
            {latestList.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2.5 font-heading font-bold text-lg text-ink">
                  <SproutIcon className="h-5 w-5" />
                  ข่าวล่าสุด
                </h2>
                <ul className="mt-4 divide-y divide-line">
                  {latestList.map((p) => (
                    <li key={p.id} className="py-3 first:pt-0">
                      <Link href={getPostHref(p)} className="group grid grid-cols-[6rem_1fr] gap-3 items-start">
                        <div className="relative aspect-[16/9] overflow-hidden rounded bg-field">
                          {(() => {
                            const t = getFeaturedImage(p, "medium");
                            return t ? <Image src={t.src} alt={t.alt} fill sizes="96px" className="object-cover" /> : null;
                          })()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-[14px] leading-[1.55] text-ink line-clamp-3">
                            <span className="headline-link">{stripHtml(p.title.rendered)}</span>
                          </h3>
                          <time dateTime={p.date} className="mt-0.5 block text-xs text-ink-3">
                            {formatRelative(p.date)}
                          </time>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          {/* Only the short part sticks, so nothing in the sidebar is ever out of reach. */}
          <div className="space-y-8 lg:sticky lg:top-36">
            <PriceWidgetMini limit={5} />
            <PreferredSourceCard />
          </div>
        </aside>
      </div>
    </>
  );
}

function ShareButtons({ url, title }: { url: string; title: string }) {
  const u = encodeURIComponent(url);
  const links = [
    { name: "แชร์ไปที่ Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, Icon: FacebookIcon, tone: "hover:bg-[#1877f2] hover:border-[#1877f2]" },
    { name: "แชร์ไปที่ LINE", href: `https://social-plugins.line.me/lineit/share?url=${u}`, Icon: LineIcon, tone: "hover:bg-[#06c755] hover:border-[#06c755]" },
    { name: "แชร์ไปที่ X", href: `https://twitter.com/intent/tweet?url=${u}&text=${encodeURIComponent(title)}`, Icon: XIcon, tone: "hover:bg-ink hover:border-ink" },
  ];
  return (
    <ul className="flex items-center gap-2">
      {links.map(({ name, href, Icon, tone }) => (
        <li key={name}>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={name}
            className={`h-10 w-10 grid place-items-center rounded-full border border-line text-ink-2 hover:text-white transition-colors ${tone}`}
          >
            <Icon className="h-[18px] w-[18px]" />
          </a>
        </li>
      ))}
    </ul>
  );
}
