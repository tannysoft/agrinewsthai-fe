import Link from "next/link";
import Image from "next/image";
import {
  getCategories,
  getCategoryBySlug,
  getPosts,
  getFeaturedImage,
  getPostHref,
  getTags,
  stripHtml,
} from "@/lib/wp";
import { PostCard } from "@/components/PostCard";
import { SectionHeader } from "@/components/SectionHeader";
import { HeroSlider } from "@/components/HeroSlider";
import { PriceWidget } from "@/components/PriceWidget";

export const revalidate = 300;

const FEATURE_CATEGORY_SLUGS = [
  "economic-crops",
  "domestic-animal",
  "soil-and-water",
  "agricultural-technology",
];

const EVERGREEN_SLUGS = ["did-you-know", "folk-wisdom"];

const CATEGORY_BLURBS: Record<string, string> = {
  "economic-crops":
    "ราคาและนโยบายพืชเศรษฐกิจไทย — ข้าว ยาง ปาล์ม อ้อย มันสำปะหลัง และตลาดส่งออก",
  "domestic-animal":
    "วงการปศุสัตว์ไทย โคนม สุกร สัตว์ปีก ประมง และเทคโนโลยีฟาร์ม",
  "soil-and-water":
    "การจัดการดิน น้ำ ชลประทาน และทรัพยากรธรรมชาติเพื่อการเกษตรที่ยั่งยืน",
  "agricultural-technology":
    "นวัตกรรมและเครื่องจักรการเกษตรสมัยใหม่ สำหรับเกษตรกรไทย",
  "did-you-know":
    "คำถามใกล้ตัวที่หลายคนยังเข้าใจผิด คำตอบที่ใช้อ้างอิงได้ยาวนาน",
  "folk-wisdom":
    "ภูมิปัญญาชาวบ้าน องค์ความรู้ดั้งเดิมที่สืบต่อกันในพื้นที่ทั่วประเทศ",
  news:
    "ข่าวเกษตรรายวัน — นโยบาย ตลาด พืชผล และความเคลื่อนไหวในแปลง",
  column:
    "มุมมองและบทวิเคราะห์จากคอลัมนิสต์ สำหรับผู้ที่ต้องการเข้าใจเกษตรเชิงลึก",
};

export default async function HomePage() {
  const slideCat = await getCategoryBySlug("slide");
  const [{ data: slides }, { data: latest }, categories] = await Promise.all([
    slideCat
      ? getPosts({ perPage: 5, page: 1, categories: slideCat.id })
      : Promise.resolve({ data: [], totalPages: 0, total: 0 }),
    getPosts({ perPage: 25, page: 1 }),
    getCategories({ exclude: [13] }),
  ]);

  const slideIds = new Set(slides.map((s) => s.id));
  const rest = latest.filter((p) => !slideIds.has(p.id));
  const bento = rest.slice(0, 4);
  const fieldNotes = rest.slice(4, 10);
  const moreCards = rest.slice(10, 16);
  const evergreenSeed = rest.slice(16, 20);

  const featureCats = FEATURE_CATEGORY_SLUGS
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const evergreenCats = EVERGREEN_SLUGS
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const columnCat = categories.find((c) => c.slug === "column");
  const [{ data: columnPosts }, { data: popularTags }] = await Promise.all([
    columnCat
      ? getPosts({ perPage: 5, categories: columnCat.id })
      : Promise.resolve({ data: [] }),
    getTags({ perPage: 20, orderby: "count", order: "desc" }),
  ]);

  const [byCategory, evergreenFromCats] = await Promise.all([
    Promise.all(
      featureCats.slice(0, 3).map((c) =>
        getPosts({ perPage: 5, categories: c.id }).then(({ data }) => ({
          cat: c,
          posts: data,
        }))
      )
    ),
    evergreenCats.length
      ? getPosts({ perPage: 4, categories: evergreenCats.map((c) => c.id) }).then(
          ({ data }) => data
        )
      : Promise.resolve(evergreenSeed),
  ]);

  const evergreen = evergreenFromCats.length ? evergreenFromCats : evergreenSeed;

  return (
    <>
      {/* HERO */}
      <section className="relative">
        <div className="mx-auto max-w-[1400px] px-6 pt-12 md:pt-20 pb-14 md:pb-24">
          {slides.length > 0 ? (
            <HeroSlider posts={slides} />
          ) : rest[0] ? (
            <div className="rise">
              <PostCard post={rest[0]} variant="headline" priority />
            </div>
          ) : null}
        </div>
      </section>

      {/* BENTO — 3 smaller features framing the hero */}
      <section className="border-y-2 border-ink bg-paper-alt/60">
        <div className="mx-auto max-w-[1400px] px-6 py-10 md:py-14">
          <div className="grid md:grid-cols-12 gap-6 md:items-stretch">
            <div className="md:col-span-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="font-[var(--font-stamp)] text-[11px] uppercase tracking-[0.3em] text-moss-700">
                  Also on the wire
                </span>
                <span className="issue-num text-[10px] text-ink-muted">§ 001</span>
              </div>
              {bento[0] && <PostCard post={bento[0]} variant="feature" />}
            </div>
            <div className="md:col-span-4 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="font-[var(--font-stamp)] text-[11px] uppercase tracking-[0.3em] text-moss-700">
                  Currents
                </span>
                <span className="issue-num text-[10px] text-ink-muted">§ 002</span>
              </div>
              <div className="flex-1 min-h-0">
                {bento[1] && <PostCard post={bento[1]} variant="bento-sq" />}
              </div>
            </div>
            <div className="md:col-span-3 flex flex-col min-w-0 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="font-[var(--font-stamp)] text-[11px] uppercase tracking-[0.3em] text-moss-700">
                  Quote
                </span>
                <span className="issue-num text-[10px] text-ink-muted">§ 003</span>
              </div>
              {bento[2] && <PostCard post={bento[2]} variant="quote" />}
              {bento[3] && (
                <div className="mt-4 pt-4 border-t border-ink/20">
                  <PostCard post={bento[3]} variant="brief" index={1} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* DAILY PRICES — DIT commodity prices */}
      <PriceWidget />

      {/* FIELD NOTES — numbered compact grid */}
      <section className="relative">
        <div className="mx-auto max-w-[1400px] px-6 py-14 md:py-20">
          <SectionHeader
            no="I"
            eyebrow="Highlights · เรื่องเด่นคัดสรร"
            title="เรื่องเด่น"
            href="/latest"
          />
          <div className="grid gap-x-8 gap-y-8 md:gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {fieldNotes.slice(0, 6).map((p, i) => (
              <PostCard key={p.id} post={p} variant="brief" index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORY DISPATCH PANELS — dark editorial, 3 tonal variations */}
      {byCategory.map(({ cat, posts }, idx) => {
        if (!posts.length) return null;
        const tailLimit = 4; // all panels show 1 lead + 4 tail = 5 total
        const [lead, ...tail] = posts;
        const toneClass = [
          "bg-moss-900 text-paper",
          "bg-moss-500 text-paper",
          "bg-ink text-paper",
        ][idx % 3];
        return (
          <section
            key={cat.id}
            className={`${toneClass} relative overflow-hidden`}
          >
            <div className="mx-auto max-w-[1400px] px-6 py-16 md:py-24 grid md:grid-cols-12 gap-10">
              {/* Left: section header */}
              <div className="md:col-span-4 flex flex-col justify-between">
                <div>
                  <div className="font-[var(--font-stamp)] text-[11px] uppercase tracking-[0.3em] text-lime">
                    § {String(idx + 2).padStart(3, "0")} · Dispatch
                  </div>
                  <h2 className="mt-4 font-display text-4xl md:text-5xl font-extrabold leading-[0.95] tracking-[-0.015em]">
                    {cat.name}
                  </h2>
                  <p className="mt-5 text-paper/70 max-w-sm leading-relaxed">
                    {CATEGORY_BLURBS[cat.slug] ||
                      (cat.description
                        ? cat.description.replace(/<[^>]*>/g, "").slice(0, 140)
                        : `รวมบทความและข่าวสารในหมวด ${cat.name}`)}
                  </p>
                </div>
                <Link
                  href={`/${cat.slug}`}
                  className="group mt-8 inline-flex items-center gap-3 w-fit font-[var(--font-stamp)] uppercase tracking-[0.25em] text-sm"
                >
                  <span className="h-px w-10 bg-lime" />
                  <span className="after-arrow">ดูทั้งหมด</span>
                </Link>
              </div>

              {/* Right: lead card + list with thumbnails */}
              <div className="md:col-span-8 grid md:grid-cols-2 gap-x-8 gap-y-8">
                {/* Lead */}
                <Link href={getPostHref(lead)} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden ring-1 ring-paper/20">
                    {(() => {
                      const leadImg = getFeaturedImage(lead, "large");
                      return leadImg ? (
                        <Image
                          src={leadImg.src}
                          alt={leadImg.alt}
                          fill
                          sizes="(min-width: 1024px) 30vw, 100vw"
                          className="object-cover duo transition-transform duration-700 group-hover:scale-[1.05]"
                        />
                      ) : null;
                    })()}
                    <span className="absolute top-3 left-3 font-[var(--font-stamp)] text-[10px] uppercase tracking-[0.25em] bg-lime text-ink px-2 py-1">
                      เรื่องเด่น
                    </span>
                  </div>
                  <h3 className="mt-4 font-display font-bold text-xl md:text-2xl leading-[1.3] tracking-[-0.005em] text-paper group-hover:text-lime transition-colors line-clamp-2">
                    {stripHtml(lead.title.rendered)}
                  </h3>
                  <p className="mt-2 issue-num text-[10px] uppercase tracking-widest text-paper/50">
                    {new Date(lead.date).toLocaleDateString("th-TH", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </Link>

                {/* Tail list with thumbnails */}
                <div className="flex flex-col divide-y divide-paper/15">
                  {tail.slice(0, tailLimit).map((p, i) => {
                    const tImg = getFeaturedImage(p, "medium_large");
                    return (
                      <Link
                        key={p.id}
                        href={getPostHref(p)}
                        className="group py-3.5 first:pt-0 last:pb-0 flex gap-4 items-start"
                      >
                        <span className="issue-num text-lime text-sm shrink-0 pt-0.5 w-6">
                          {String(i + 2).padStart(2, "0")}
                        </span>
                        <div className="relative shrink-0 w-20 h-20 overflow-hidden ring-1 ring-paper/20 bg-paper/5">
                          {tImg && (
                            <Image
                              src={tImg.src}
                              alt={tImg.alt}
                              fill
                              sizes="80px"
                              className="object-cover duo transition-transform duration-500 group-hover:scale-[1.08]"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-display text-sm md:text-[15px] font-semibold leading-[1.35] text-paper group-hover:text-lime transition-colors line-clamp-3">
                            {stripHtml(p.title.rendered)}
                          </h4>
                          <p className="mt-1 issue-num text-[10px] uppercase tracking-widest text-paper/50">
                            {new Date(p.date).toLocaleDateString("th-TH", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* COLUMN — คอลัมน์ */}
      {columnCat && columnPosts.length > 0 && (
        <section className="bg-paper-alt border-y-2 border-ink">
          <div className="mx-auto max-w-[1400px] px-6 py-14 md:py-20 grid md:grid-cols-12 gap-10">
            <div className="md:col-span-4">
              <div className="font-[var(--font-stamp)] text-[11px] uppercase tracking-[0.3em] text-moss-700">
                § 005 · Column
              </div>
              <h2 className="mt-3 font-display text-3xl md:text-5xl font-extrabold leading-[1.05] tracking-[-0.015em] text-moss-900">
                คอลัมน์
              </h2>
              <p className="mt-4 text-ink-soft max-w-sm leading-relaxed">
                มุมมอง บทวิเคราะห์ และเรื่องเล่าจากคอลัมนิสต์ —
                อ่านเพื่อทำความเข้าใจการเกษตรไทยในเชิงลึก
              </p>
              <Link
                href={`/${columnCat.slug}`}
                className="group mt-6 inline-flex items-center gap-3 w-fit font-[var(--font-stamp)] uppercase tracking-[0.25em] text-xs border-b border-ink pb-1 after-arrow"
              >
                ดูคอลัมน์ทั้งหมด
              </Link>
            </div>

            <div className="md:col-span-8 grid md:grid-cols-2 gap-x-8 gap-y-10">
              {/* Lead column article */}
              {(() => {
                const [lead] = columnPosts;
                if (!lead) return null;
                const leadImg = getFeaturedImage(lead, "large");
                return (
                  <Link href={getPostHref(lead)} className="group block">
                    <div className="relative aspect-[4/3] overflow-hidden ring-1 ring-ink bg-paper">
                      {leadImg && (
                        <Image
                          src={leadImg.src}
                          alt={leadImg.alt}
                          fill
                          sizes="(min-width: 1024px) 35vw, 100vw"
                          className="object-cover duo transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                      )}
                    </div>
                    <div className="mt-4 font-[var(--font-stamp)] text-[10px] uppercase tracking-[0.25em] text-moss-700">
                      Columnist · {lead._embedded?.author?.[0]?.name ?? "กองบรรณาธิการ"}
                    </div>
                    <h3 className="mt-2 font-display font-bold text-xl md:text-2xl leading-[1.25] tracking-[-0.005em] text-ink group-hover:text-moss-700">
                      <span className="marker">{stripHtml(lead.title.rendered)}</span>
                    </h3>
                    <p className="mt-2 text-sm text-ink-muted line-clamp-3">
                      {stripHtml(lead.excerpt.rendered)}
                    </p>
                  </Link>
                );
              })()}

              {/* Brief list of other columns */}
              <div className="flex flex-col divide-y divide-ink/15">
                {columnPosts.slice(1, 5).map((p, i) => {
                  const tImg = getFeaturedImage(p, "medium_large");
                  const author = p._embedded?.author?.[0]?.name;
                  return (
                    <Link
                      key={p.id}
                      href={getPostHref(p)}
                      className="group py-4 first:pt-0 last:pb-0 flex gap-4 items-start"
                    >
                      <div className="relative shrink-0 w-20 h-20 overflow-hidden ring-1 ring-ink/30 bg-paper">
                        {tImg && (
                          <Image
                            src={tImg.src}
                            alt={tImg.alt}
                            fill
                            sizes="80px"
                            className="object-cover duo transition-transform duration-500 group-hover:scale-[1.08]"
                          />
                        )}
                        <span className="absolute bottom-0 left-0 bg-lime text-ink issue-num font-bold text-[11px] px-1.5 leading-tight border-t border-r border-ink">
                          {String(i + 2).padStart(2, "0")}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-[var(--font-stamp)] text-[9px] uppercase tracking-[0.25em] text-moss-700">
                          {author ?? "คอลัมนิสต์"}
                        </div>
                        <h4 className="mt-0.5 font-display text-[15px] font-semibold leading-[1.35] text-ink group-hover:text-moss-700 line-clamp-3">
                          {stripHtml(p.title.rendered)}
                        </h4>
                        <p className="mt-1 issue-num text-[10px] uppercase tracking-widest text-ink-muted">
                          {new Date(p.date).toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* GRID OF CARDS */}
      <section className="bg-paper">
        <div className="mx-auto max-w-[1400px] px-6 py-16 md:py-24">
          <SectionHeader
            no="VI"
            eyebrow="From the Archive"
            title="อ่านเพิ่มเติม"
            href="/latest"
          />
          <div className="grid gap-10 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {moreCards.map((p) => (
              <PostCard key={p.id} post={p} variant="card" />
            ))}
          </div>
        </div>
      </section>

      {/* EVERGREEN */}
      <section className="bg-lime text-ink border-y-2 border-ink">
        <div className="mx-auto max-w-[1400px] px-6 py-16 md:py-24">
          <div className="grid md:grid-cols-12 gap-10 mb-10 md:mb-14 items-end">
            <div className="md:col-span-7">
              <div className="font-[var(--font-stamp)] text-[11px] uppercase tracking-[0.3em] text-moss-700">
                § VII · Evergreen
              </div>
              <h2 className="mt-3 font-display text-4xl md:text-5xl font-extrabold leading-[0.95] tracking-[-0.015em]">
                อ่านเมื่อไหร่ก็ไม่เก่า
              </h2>
            </div>
            <div className="md:col-span-5 md:text-right">
              <p className="text-ink/80 text-base md:text-lg leading-relaxed">
                บทความเชิงความรู้ที่ใช้อ้างอิงได้ข้ามปี —
                ภูมิปัญญาชาวบ้าน เทคนิคสั้น และคำตอบสำหรับ
                “รู้หรือไม่?” ที่หลายคนเข้าใจผิด
              </p>
            </div>
          </div>

          <div className="grid gap-0 md:grid-cols-4 border-t-2 border-ink">
            {evergreen.slice(0, 4).map((p, i) => {
              const eImg = getFeaturedImage(p, "medium_large");
              return (
                <Link
                  key={p.id}
                  href={getPostHref(p)}
                  className={`group flex flex-col border-b-2 md:border-b-0 border-ink ${
                    i < 3 ? "md:border-r-2" : ""
                  } hover:bg-ink hover:text-paper transition-colors`}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-moss-50/30">
                    {eImg && (
                      <Image
                        src={eImg.src}
                        alt={eImg.alt}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover duo transition-transform duration-500 group-hover:scale-[1.05]"
                      />
                    )}
                    <span className="absolute top-0 left-0 bg-lime text-ink font-display font-extrabold text-xl issue-num px-3 py-1.5 border-r-2 border-b-2 border-ink">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex-1 p-5 md:p-6 flex flex-col">
                    <h3 className="font-display font-bold text-base md:text-[17px] leading-[1.3] tracking-[-0.005em] line-clamp-4 flex-1">
                      {stripHtml(p.title.rendered)}
                    </h3>
                    <div className="mt-5 pt-3 border-t border-ink/30 group-hover:border-paper/30 flex items-center justify-between">
                      <span className="font-[var(--font-stamp)] text-[10px] uppercase tracking-widest">
                        อ่านต่อ
                      </span>
                      <span aria-hidden>→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* POPULAR TAGS */}
      {popularTags.length > 0 && (
        <section className="bg-paper-alt border-b-2 border-ink">
          <div className="mx-auto max-w-[1400px] px-6 py-12 md:py-16">
            <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6 pb-6 mb-8 border-b-2 border-ink">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 font-[var(--font-stamp)] text-[11px] tracking-[0.3em] uppercase text-moss-700">
                  <span className="issue-num text-ink-muted border border-ink px-2 py-0.5">
                    § VIII
                  </span>
                  <span>Popular Tags · แท็กยอดนิยม</span>
                </div>
                <h2 className="font-display font-extrabold text-2xl md:text-4xl leading-[1.05] tracking-[-0.015em] text-ink">
                  เรื่องที่คนอ่านมากสุด
                </h2>
              </div>
              <Link
                href="/tags"
                className="group shrink-0 font-[var(--font-stamp)] text-xs uppercase tracking-[0.25em] border-b border-ink pb-1 after-arrow"
              >
                ดูแท็กทั้งหมด
              </Link>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-3 items-baseline">
              {popularTags.slice(0, 20).map((t, i) => {
                const max = popularTags[0]?.count ?? 1;
                const ratio = Math.max(0.2, Math.min(1, t.count / Math.max(max, 1)));
                const size = 0.95 + ratio * 1.25;
                return (
                  <Link
                    key={t.id}
                    href={`/tag/${t.slug}`}
                    className="group font-display font-bold text-ink hover:text-moss-700 transition-colors"
                    style={{ fontSize: `${size}rem` }}
                  >
                    <span className="text-moss-700">#</span>
                    {t.name}
                    <span className="issue-num text-[10px] font-normal ml-1 text-ink-muted align-super">
                      {t.count}
                    </span>
                    {i < 19 && <span className="ml-2 text-ink/30 font-normal">·</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* POSTCARD CTA */}
      <section className="bg-paper">
        <div className="mx-auto max-w-[1400px] px-6 py-16 md:py-24">
          <div className="mx-auto max-w-4xl relative bg-paper-alt border-2 border-ink p-8 md:p-14 crop-marks">
            <div className="absolute -top-4 -left-4 stamp stamp-filled tilt-lg-l">ส่งทางอีเมลล์</div>
            <div className="absolute -top-4 -right-4 hidden md:block">
              <div className="stamp tilt-lg-r bg-paper font-[var(--font-stamp)]">
                <div className="text-[10px] leading-none mb-1">THAILAND</div>
                <div className="text-xl leading-none font-bold">฿3</div>
              </div>
            </div>
            <div className="font-[var(--font-stamp)] text-[11px] uppercase tracking-[0.3em] text-moss-700">
              Newsletter № 001 · Subscribe
            </div>
            <h2 className="mt-3 font-display font-extrabold text-3xl md:text-4xl leading-[1.05] tracking-[-0.01em]">
              ส่งข่าวเกษตร<br />ถึงหน้าบ้านทุกสัปดาห์
            </h2>
            <p className="mt-5 max-w-2xl text-ink-soft text-base md:text-lg">
              สรุปข่าวสำคัญ เทคโนโลยีใหม่ ราคาพืชผล ภูมิปัญญาชาวบ้าน —
              คัดกรองมาเป็นจดหมายข่าวอ่านง่ายทุกสัปดาห์
            </p>
            <form className="mt-8 flex flex-col sm:flex-row gap-3 max-w-xl">
              <input
                type="email"
                required
                placeholder="name@farm.th"
                className="flex-1 bg-paper border-2 border-ink px-5 py-3.5 font-display text-lg focus:outline-none focus:bg-lime placeholder:text-ink/40"
              />
              <button
                type="submit"
                className="bg-ink text-paper font-[var(--font-stamp)] uppercase tracking-[0.2em] text-sm px-6 py-3.5 hover:bg-moss-700"
              >
                สมัครเลย →
              </button>
            </form>
            <p className="mt-4 issue-num text-[10px] uppercase tracking-widest text-ink-muted">
              ไม่สแปม · ยกเลิกได้ทุกเมื่อ · ดูแลโดยกองบรรณาธิการ
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
