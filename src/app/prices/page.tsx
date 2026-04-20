import Link from "next/link";
import type { Metadata } from "next";
import {
  getDITGroups,
  getDITProducts,
  getDITLatestPrices,
  formatPrice,
  priceDateShort,
  DITPriceRecord,
} from "@/lib/dit";
import { FlipPrice } from "@/components/FlipPrice";

export const revalidate = 3600; // refresh hourly

export const metadata: Metadata = {
  title: "ราคาสินค้าเกษตรรายวัน",
  description:
    "ติดตามราคาขายปลีก/ขายส่งสินค้าเกษตร — ข้าว ผัก ผลไม้ เนื้อสัตว์ สัตว์น้ำ อัปเดตรายวันจากกรมการค้าภายใน",
};

type Props = {
  searchParams: Promise<{ type?: string; group?: string }>;
};

export default async function PricesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const type = (sp.type === "wholesale" ? "wholesale" : "retail") as
    | "retail"
    | "wholesale";

  const groups = await getDITGroups(type);
  const currentGroupId = sp.group || groups[0]?.group_id;
  const currentGroup = groups.find((g) => g.group_id === currentGroupId);

  const products = currentGroupId ? await getDITProducts(currentGroupId) : [];

  // Cap to first 40 products to avoid fan-out explosion
  const visibleProducts = products.slice(0, 40);
  const priceRecords = await getDITLatestPrices(
    visibleProducts.map((p) => p.product_id)
  );
  const latestDate = priceRecords
    .map((r) => (r?.price_date ? new Date(r.price_date).getTime() : 0))
    .reduce((a, b) => Math.max(a, b), 0);

  return (
    <>
      <section className="bg-paper border-b-2 border-ink">
        <div className="mx-auto max-w-[1400px] px-6 py-12 md:py-20 grid md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-8">
            <div className="font-[var(--font-stamp)] text-[11px] uppercase tracking-[0.3em] text-moss-700">
              § Daily Prices · ราคาสินค้าเกษตร
            </div>
            <h1 className="mt-3 font-display font-extrabold leading-[1] tracking-[-0.02em] text-[clamp(2.25rem,5vw,4rem)] text-ink">
              ราคาสินค้าเกษตรวันนี้
            </h1>
            <p className="mt-4 max-w-2xl text-ink-soft text-sm md:text-base leading-relaxed">
              ราคาขายปลีกและขายส่งสินค้าเกษตร อัปเดตรายวันจาก
              กรมการค้าภายใน กระทรวงพาณิชย์
              {latestDate > 0 && (
                <>
                  {" "}
                  · อัปเดตล่าสุด {priceDateShort(new Date(latestDate).toISOString())}
                </>
              )}
            </p>
          </div>
          <div className="md:col-span-4 md:text-right">
            <div className="inline-flex border-2 border-ink">
              <Link
                href="/prices?type=retail"
                className={`font-[var(--font-stamp)] uppercase tracking-widest text-xs px-4 py-2.5 transition-colors ${
                  type === "retail"
                    ? "bg-ink text-paper"
                    : "bg-paper text-ink hover:bg-lime"
                }`}
              >
                ขายปลีก
              </Link>
              <Link
                href="/prices?type=wholesale"
                className={`font-[var(--font-stamp)] uppercase tracking-widest text-xs px-4 py-2.5 border-l-2 border-ink transition-colors ${
                  type === "wholesale"
                    ? "bg-ink text-paper"
                    : "bg-paper text-ink hover:bg-lime"
                }`}
              >
                ขายส่ง
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Group tabs */}
      <section className="bg-paper-alt border-b-2 border-ink">
        <div className="mx-auto max-w-[1400px] px-6 py-4 overflow-x-auto">
          <div className="flex gap-2 whitespace-nowrap">
            {groups.map((g) => {
              const active = g.group_id === currentGroupId;
              return (
                <Link
                  key={g.group_id}
                  href={`/prices?type=${type}&group=${g.group_id}`}
                  className={`font-display font-semibold text-sm px-4 py-2 border transition-colors ${
                    active
                      ? "bg-ink text-paper border-ink"
                      : "bg-paper text-ink border-ink/30 hover:bg-lime hover:border-ink"
                  }`}
                >
                  {g.group_name}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="mx-auto max-w-[1400px] px-6 py-10 md:py-14">
        {currentGroup && (
          <div className="flex items-end justify-between gap-4 pb-4 mb-6 border-b border-ink">
            <h2 className="font-display font-bold text-xl md:text-2xl leading-snug">
              {currentGroup.group_name}
            </h2>
            <span className="issue-num text-[11px] uppercase tracking-widest text-ink-muted">
              {visibleProducts.length} / {products.length} รายการ
            </span>
          </div>
        )}

        {visibleProducts.length === 0 ? (
          <p className="text-center py-16 text-ink-muted">
            ยังไม่มีข้อมูลในหมวดนี้
          </p>
        ) : (
          <div className="overflow-x-auto border border-ink">
            <table className="w-full border-collapse">
              <thead className="bg-ink text-paper font-[var(--font-stamp)] text-[11px] uppercase tracking-widest">
                <tr>
                  <th className="text-left px-4 py-3 w-12">№</th>
                  <th className="text-left px-4 py-3">รายการสินค้า</th>
                  <th className="text-right px-4 py-3">ราคา (ต่ำ – สูง)</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">หน่วย</th>
                  <th className="text-right px-4 py-3 hidden md:table-cell">
                    อัปเดต
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/15">
                {visibleProducts.map((p, i) => {
                  const rec: DITPriceRecord | null = priceRecords[i];
                  return (
                    <tr
                      key={p.product_id}
                      className="hover:bg-lime/40 transition-colors"
                    >
                      <td className="px-4 py-3 issue-num text-xs text-ink-muted">
                        {String(i + 1).padStart(2, "0")}
                      </td>
                      <td className="px-4 py-3 font-display font-semibold text-sm md:text-[15px] text-ink">
                        {p.product_name}
                        {rec?.product_desc && (
                          <span className="block text-xs text-ink-muted font-normal mt-0.5">
                            {rec.product_desc}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {rec ? (
                          <FlipPrice
                            value={formatPrice(rec)}
                            className="font-display font-extrabold text-base md:text-lg text-moss-900"
                          />
                        ) : (
                          <span className="text-ink-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-muted hidden sm:table-cell">
                        {rec?.unit ?? "—"}
                      </td>
                      <td className="px-4 py-3 issue-num text-[11px] uppercase tracking-widest text-ink-muted hidden md:table-cell text-right whitespace-nowrap">
                        {rec?.price_date
                          ? priceDateShort(rec.price_date)
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-8 text-xs text-ink-muted text-center max-w-2xl mx-auto">
          ที่มาข้อมูล:{" "}
          <a
            href="https://pricelist.dit.go.th/"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-moss-700"
          >
            กรมการค้าภายใน กระทรวงพาณิชย์ (DIT)
          </a>{" "}
          · ราคาที่แสดงเป็นราคา {type === "retail" ? "ขายปลีก" : "ขายส่ง"}{" "}
          ในกรุงเทพฯ และอาจแตกต่างตามพื้นที่
        </p>
      </section>
    </>
  );
}
