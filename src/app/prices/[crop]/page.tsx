import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CROPS, getCrop } from "@/lib/crops";
import { formatPrice, getDITSeries, midPrice, priceDateShort, type DITPriceRecord } from "@/lib/dit";
import { getPosts } from "@/lib/wp";
import { ArchiveHeader } from "@/components/ArchiveHeader";
import { SectionHeader } from "@/components/SectionHeader";
import { PostCard } from "@/components/PostCard";
import { PriceChart } from "@/components/PriceChart";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL, breadcrumbSchema } from "@/lib/schema";

// DIT publishes once per working day; hourly is plenty.
export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return CROPS.map((c) => ({ crop: c.slug }));
}

type Props = { params: Promise<{ crop: string }> };

const thDate = (iso: string) =>
  new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Bangkok" });

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { crop: slug } = await params;
  const crop = getCrop(slug);
  if (!crop) return {};
  const { latest } = await getDITSeries(crop.chart, 30);
  const head = crop.series.find((s) => s.id === crop.chart)!;
  // The live price in the description is what earns the click on a daily-price query.
  const description = latest
    ? `${crop.title} ${head.label} ${formatPrice(latest)} ${latest.unit} ข้อมูล ${thDate(latest.price_date)} จากกรมการค้าภายใน พร้อมกราฟย้อนหลังและราคาแยกตามพื้นที่ อัปเดตทุกวัน`
    : `${crop.title} ${crop.intro} อัปเดตทุกวันจากกรมการค้าภายใน`;
  const url = `${SITE_URL}/prices/${crop.slug}`;
  return {
    title: `${crop.title} ล่าสุด อัปเดตทุกวัน`,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title: `${crop.title} ล่าสุด`, description, locale: "th_TH" },
  };
}

function Change({ latest, previous }: { latest: DITPriceRecord | null; previous: DITPriceRecord | null }) {
  if (!latest || !previous) return <span className="text-ink-3">–</span>;
  const diff = midPrice(latest) - midPrice(previous);
  if (Math.abs(diff) < 0.005) return <span className="text-ink-3">ทรงตัว</span>;
  const up = diff > 0;
  return (
    <span className={`whitespace-nowrap font-semibold tabular-nums ${up ? "text-leaf" : "text-[#b42318]"}`}>
      <span aria-hidden>{up ? "▲" : "▼"}</span>
      <span className="sr-only">{up ? "เพิ่มขึ้น" : "ลดลง"}</span> {Math.abs(diff).toLocaleString("th-TH", { maximumFractionDigits: 2 })}
    </span>
  );
}

export default async function CropPricePage({ params }: Props) {
  const { crop: slug } = await params;
  const crop = getCrop(slug);
  if (!crop) notFound();

  const [rows, { data: news }] = await Promise.all([
    Promise.all(crop.series.map(async (s) => ({ ...s, ...(await getDITSeries(s.id, s.id === crop.chart ? 90 : 14)) }))),
    getPosts({ perPage: 6, search: crop.newsQuery, orderby: "date" }),
  ]);
  const head = rows.find((r) => r.id === crop.chart)!;
  const priced = rows.filter((r) => r.latest);
  const updated = priced.map((r) => r.latest!.price_date).sort().at(-1);

  const points = head.history.map((r) => ({ date: r.price_date.slice(0, 10), value: midPrice(r), range: formatPrice(r) }));
  const url = `${SITE_URL}/prices/${crop.slug}`;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "หน้าแรก", url: SITE_URL },
            { name: "ราคาสินค้าเกษตร", url: `${SITE_URL}/prices` },
            { name: crop.title, url },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": url,
            url,
            name: crop.title,
            description: crop.intro,
            inLanguage: "th-TH",
            dateModified: updated ? new Date(updated).toISOString() : undefined,
            isPartOf: { "@id": `${SITE_URL}/#website` },
          },
        ]}
      />

      <ArchiveHeader
        title={crop.title}
        description={`${crop.intro} อัปเดตทุกวันทำการจากกรมการค้าภายใน`}
        parent={{ label: "ราคาสินค้าเกษตร", href: "/prices" }}
      />

      <section className="mx-auto max-w-[1400px] px-4 md:px-6 py-10 md:py-12 grid gap-10 lg:grid-cols-12">
        {/* Headline price for the main series */}
        <div className="lg:col-span-4">
          <p className="text-sm font-semibold text-ink-2">{head.label}</p>
          {head.latest ? (
            <>
              <p className="mt-2 font-heading font-bold text-5xl leading-none text-ink tabular-nums">{formatPrice(head.latest)}</p>
              <p className="mt-2 text-ink-2">{head.latest.unit}</p>
              <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span className="text-ink-3">เทียบวันก่อนหน้า</span>
                <Change latest={head.latest} previous={head.previous} />
              </p>
              <p className="mt-1 text-sm text-ink-3">ข้อมูลวันที่ {thDate(head.latest.price_date)}</p>
            </>
          ) : (
            <p className="mt-2 text-ink-2">ช่วงนี้ยังไม่มีราคารายงาน</p>
          )}
        </div>

        <div className="lg:col-span-8 min-w-0">
          <h2 className="font-heading font-bold text-lg text-ink">ราคา{head.label} ย้อนหลัง 90 วัน</h2>
          <p className="text-sm text-ink-3">ค่ากลางระหว่างราคาต่ำสุดและสูงสุดของแต่ละวัน ({head.latest?.unit ?? "บาท"})</p>
          <div className="mt-4">
            <PriceChart points={points} unit={head.latest?.unit ?? ""} label={head.label} />
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-10 md:py-12">
          <SectionHeader title={`${crop.title} แยกตามรายการ`} />
          <div className="overflow-x-auto rounded-lg border border-line">
            <table className="w-full border-collapse text-left">
              <thead className="bg-field text-sm text-ink-2">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">รายการ</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-right">ราคา</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-right hidden sm:table-cell">เปลี่ยนแปลง</th>
                  <th scope="col" className="px-4 py-3 font-semibold hidden sm:table-cell">หน่วย</th>
                  <th scope="col" className="px-4 py-3 font-semibold hidden md:table-cell text-right">วันที่</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3.5 text-ink">
                      {r.label}
                      {r.latest?.unit && <span className="block text-xs text-ink-3 sm:hidden">{r.latest.unit}</span>}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap font-heading font-bold text-lg text-ink tabular-nums">
                      {r.latest ? formatPrice(r.latest) : <span className="font-sans font-normal text-sm text-ink-3">ไม่มีราคา</span>}
                      <span className="block font-sans text-xs font-normal sm:hidden">
                        <Change latest={r.latest} previous={r.previous} />
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right text-sm hidden sm:table-cell">
                      <Change latest={r.latest} previous={r.previous} />
                    </td>
                    <td className="px-4 py-3.5 text-sm text-ink-2 hidden sm:table-cell">{r.latest?.unit ?? "–"}</td>
                    <td className="px-4 py-3.5 text-sm text-ink-3 hidden md:table-cell text-right whitespace-nowrap">
                      {r.latest ? priceDateShort(r.latest.price_date) : "–"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-ink-3">
            ที่มา{" "}
            <a href="https://pricelist.dit.go.th/" target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-leaf">
              กรมการค้าภายใน กระทรวงพาณิชย์
            </a>{" "}
            การเปลี่ยนแปลงเทียบกับวันที่มีราคาก่อนหน้า ราคาในแต่ละพื้นที่อาจต่างจากนี้
          </p>
        </div>
      </section>

      <section className="bg-field">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-8">
          <h2 className="font-heading font-bold text-ink">ราคาพืชผลอื่นวันนี้</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {CROPS.filter((c) => c.slug !== crop.slug).map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/prices/${c.slug}`}
                  className="inline-block rounded-full bg-paper px-4 py-2 text-sm font-semibold text-leaf ring-1 ring-line hover:ring-leaf"
                >
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {news.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-4 md:px-6 py-12 md:py-14">
          <SectionHeader
            title={`ข่าว${crop.name}ล่าสุด`}
            href={`/search?q=${encodeURIComponent(crop.newsQuery)}`}
            linkLabel="ดูข่าวทั้งหมด"
          />
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((p) => (
              <PostCard key={p.id} post={p} variant="card" />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
