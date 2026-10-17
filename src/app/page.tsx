import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  getCategories,
  getCategoryBySlug,
  getPosts,
  getFeaturedImage,
  getPostHref,
  getPrimaryCategory,
  getTags,
  formatRelative,
  stripHtml,
  type WPCategory,
  type WPPost,
} from "@/lib/wp";
import { PostCard, Thumb } from "@/components/PostCard";
import { SectionHeader, SproutIcon } from "@/components/SectionHeader";
import { PriceWidget } from "@/components/PriceWidget";

export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Every category, in the same order as the original homepage.
const HOME_CATEGORY_SLUGS = [
  "news",
  "domestic-animal",
  "soil-and-water",
  "large-farm",
  "economic-crops",
  "agriculture-special",
  "column",
  "did-you-know",
  "agricultural-technology",
  "folk-wisdom",
] as const;

type Slug = (typeof HOME_CATEGORY_SLUGS)[number];
type Desk = { cat: WPCategory; posts: WPPost[] };

const EMPTY = { data: [] as WPPost[], totalPages: 0, total: 0 };

export default async function HomePage() {
  const [slideCat, categories] = await Promise.all([
    getCategoryBySlug("slide"),
    getCategories({ exclude: [13] }),
  ]);

  const homeCats = HOME_CATEGORY_SLUGS
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter((c): c is WPCategory => Boolean(c));

  const newsCatId = homeCats.find((c) => c.slug === "news")?.id;

  const [{ data: slides }, { data: latest }, { data: popularTags }, deskList] = await Promise.all([
    slideCat ? getPosts({ perPage: 5, categories: slideCat.id }) : Promise.resolve(EMPTY),
    // Newest stories from every desk except ข่าวเกษตร, which has its own block beside it.
    getPosts({ perPage: 16, categoriesExclude: newsCatId ? [newsCatId] : undefined }),
    getTags({ perPage: 20, orderby: "count", order: "desc" }),
    // Over-fetch a little so each desk still fills after removing hero stories.
    Promise.all(
      homeCats.map((c) =>
        getPosts({ perPage: 9, categories: c.id }).then(({ data }) => ({ cat: c, posts: data }))
      )
    ),
  ]);

  const heroPool = slides.length
    ? slides
    : (deskList.find((d) => d.cat.slug === "news")?.posts ?? []).slice(0, 5);
  const [lead, ...heroSide] = heroPool;
  const heroIds = new Set(heroPool.map((p) => p.id));

  const desks = new Map<Slug, Desk>();
  for (const d of deskList) {
    desks.set(d.cat.slug as Slug, { cat: d.cat, posts: d.posts.filter((p) => !heroIds.has(p.id)) });
  }
  const desk = (slug: Slug) => {
    const d = desks.get(slug);
    return d && d.posts.length ? d : null;
  };

  const news = desk("news");

  // "Just in" from the other desks; it only needs to avoid the hero, since
  // ข่าวเกษตร beside it is excluded at the query.
  const justIn = latest.filter((p) => !heroIds.has(p.id)).slice(0, 4);

  return (
    <>
      <h1 className="sr-only">ข่าวเกษตร ล่าสุดวันนี้ จากเรื่องเล่าข่าวเกษตร</h1>

      {/* Lead story on brand green */}
      {lead && (
        <section className="bg-leaf text-white">
          <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-6 md:py-10 grid gap-8 lg:grid-cols-12">
            <LeadStory post={lead} />

            {heroSide.length > 0 && (
              <div className="lg:col-span-4">
                <h2 className="font-semibold text-sprout">เรื่องเด่นวันนี้</h2>
                <ul className="mt-1 divide-y divide-white/15">
                  {heroSide.slice(0, 4).map((p) => (
                    <li key={p.id}>
                      <Link href={getPostHref(p)} className="group grid grid-cols-[1fr_7.5rem] gap-4 py-4">
                        <div className="min-w-0">
                          <h3 className="font-heading font-semibold text-[16px] leading-[1.6] line-clamp-3">
                            <span className="headline-link">{stripHtml(p.title.rendered)}</span>
                          </h3>
                          <time dateTime={p.date} className="mt-1 block text-[13px] text-white/60">
                            {formatRelative(p.date)}
                          </time>
                        </div>
                        <Thumb
                          img={getFeaturedImage(p, "medium")}
                          className="aspect-[4/3] bg-white/10"
                          sizes="120px"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      <PriceWidget />

      {/* ข่าวเกษตร beside a small just-in list */}
      {(news || justIn.length > 0) && (
        <Band divider={false}>
          <div className="grid gap-12 lg:grid-cols-12">
            {news && (
              <div className="lg:col-span-8">
                <SectionHeader title={news.cat.name} href={`/${news.cat.slug}`} />
                <LeadList posts={news.posts} />
              </div>
            )}
            {justIn.length > 0 && (
              <aside className="lg:col-span-4">
                <div className="rounded-lg bg-field p-5 md:p-6">
                  <h2 className="flex items-center gap-2 font-heading font-bold text-lg text-ink">
                    <SproutIcon className="h-5 w-5" />
                    อัปเดตล่าสุด
                  </h2>
                  <ol className="mt-5 ml-1.5 space-y-6 border-l-2 border-line">
                    {justIn.map((p) => {
                      const cat = getPrimaryCategory(p);
                      return (
                        <li key={p.id} className="pl-5">
                          {/* The dot is centred on the time row, sitting on the timeline rule (pl-5 + half the 2px rule). */}
                          <p className="relative flex min-h-5 flex-wrap items-center gap-x-2 text-xs">
                            <span className="absolute -left-[27px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-shoot ring-4 ring-field" aria-hidden />
                            <time dateTime={p.date} className="font-semibold text-leaf">{formatRelative(p.date)}</time>
                            {cat && <span className="text-ink-3">{cat.name}</span>}
                          </p>
                          <Link href={getPostHref(p)} className="group mt-1 grid grid-cols-[1fr_4.5rem] gap-3 items-start">
                            <h3 className="text-[15px] leading-[1.55] text-ink line-clamp-2">
                              <span className="headline-link">{stripHtml(p.title.rendered)}</span>
                            </h3>
                            <Thumb img={getFeaturedImage(p, "medium")} className="aspect-[4/3] rounded" sizes="72px" />
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </aside>
            )}
          </div>
        </Band>
      )}

      <Pair left={desk("domestic-animal")} right={desk("soil-and-water")} />

      <GridDesk desk={desk("large-farm")} />

      <WideDesk desk={desk("economic-crops")} />

      <GridDesk desk={desk("agriculture-special")} tinted />

      <GridDesk desk={desk("column")} />

      <WideDesk desk={desk("did-you-know")} tinted />

      <Pair left={desk("agricultural-technology")} right={desk("folk-wisdom")} />

      {popularTags.length > 0 && (
        <Band tinted>
          <SectionHeader title="เรื่องที่คนสนใจ" href="/tags" linkLabel="แท็กทั้งหมด" />
          <ul className="flex flex-wrap gap-2">
            {popularTags.map((t) => (
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
        </Band>
      )}
    </>
  );
}

/* ---------- section shells ---------- */

function Band({
  children,
  tinted = false,
  divider = true,
}: {
  children: ReactNode;
  tinted?: boolean;
  /** Top rule between plain sections; off when the section above already ends in one. */
  divider?: boolean;
}) {
  return (
    <section className={tinted ? "bg-field" : divider ? "border-t border-line" : undefined}>
      <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-12 md:py-14">{children}</div>
    </section>
  );
}

/** Lead card beside a list of compact stories; full-width desks use a 7/5 split and a longer list so both columns end together. */
function LeadList({ posts, wide = false }: { posts: WPPost[]; wide?: boolean }) {
  const [first, ...rest] = posts;
  return (
    <div className={`grid gap-x-8 gap-y-6 ${wide ? "md:grid-cols-12" : "md:grid-cols-2"}`}>
      <div className={wide ? "md:col-span-7" : undefined}>
        <PostCard post={first} variant="card" showCategory={false} />
      </div>
      <ul className={`space-y-4 ${wide ? "md:col-span-5" : ""}`}>
        {rest.slice(0, wide ? 6 : 4).map((p) => (
          <li key={p.id}>
            <PostCard post={p} variant="compact" />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Full-width lead + list. */
function WideDesk({ desk, tinted = false }: { desk: Desk | null; tinted?: boolean }) {
  if (!desk) return null;
  return (
    <Band tinted={tinted}>
      <SectionHeader title={desk.cat.name} href={`/${desk.cat.slug}`} />
      <LeadList posts={desk.posts} wide />
    </Band>
  );
}

/** Four cards in a row. */
function GridDesk({ desk, tinted = false }: { desk: Desk | null; tinted?: boolean }) {
  if (!desk) return null;
  return (
    <Band tinted={tinted}>
      <SectionHeader title={desk.cat.name} href={`/${desk.cat.slug}`} />
      <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {desk.posts.slice(0, 4).map((p) => (
          <PostCard key={p.id} post={p} variant="card" showCategory={false} />
        ))}
      </div>
    </Band>
  );
}

/** Two categories side by side, each a card over three compact stories. */
function Pair({ left, right }: { left: Desk | null; right: Desk | null }) {
  const items = [left, right].filter((d): d is Desk => Boolean(d));
  if (!items.length) return null;
  return (
    <Band>
      <div className="grid gap-x-12 gap-y-14 md:grid-cols-2">
        {items.map(({ cat, posts }) => {
          const [first, ...others] = posts;
          return (
            <div key={cat.id}>
              <SectionHeader title={cat.name} href={`/${cat.slug}`} />
              <PostCard post={first} variant="card" showCategory={false} />
              <ul className="mt-6 space-y-4 border-t border-line pt-5">
                {others.slice(0, 3).map((p) => (
                  <li key={p.id}>
                    <PostCard post={p} variant="compact" />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Band>
  );
}

/** Lead story with the headline over the photo; on desktop it fills the row, so it always matches the list beside it. */
function LeadStory({ post }: { post: WPPost }) {
  const img = getFeaturedImage(post, "large");
  const category = getPrimaryCategory(post);
  return (
    <Link
      href={getPostHref(post)}
      className="group relative block overflow-hidden rounded-lg bg-white/10 aspect-[4/3] sm:aspect-[16/10] lg:col-span-8 lg:aspect-auto lg:min-h-[460px]"
    >
      {img && (
        <Image
          src={img.src}
          alt={img.alt}
          fill
          priority
          sizes="(min-width: 1400px) 900px, (min-width: 1024px) 66vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
        <div className="flex flex-wrap items-center gap-x-3 text-sm">
          {category && <span className="rounded bg-sprout px-2 py-0.5 font-semibold text-leaf-deep">{category.name}</span>}
          <time dateTime={post.date} className="text-white/75">
            {formatRelative(post.date)}
          </time>
        </div>
        <h2 className="mt-3 max-w-3xl font-heading font-bold text-[1.45rem] sm:text-[1.9rem] md:text-[2.3rem] leading-[1.4] text-white line-clamp-3">
          <span className="headline-link">{stripHtml(post.title.rendered)}</span>
        </h2>
      </div>
    </Link>
  );
}
