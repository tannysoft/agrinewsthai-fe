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
import { ArchiveHeader } from "@/components/ArchiveHeader";
import { CropPriceCards } from "@/components/CropPriceCards";

export const revalidate = 3600; // refresh hourly

export const metadata: Metadata = {
  alternates: { canonical: "/prices" },
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

  const tab = (active: boolean) =>
    `h-10 px-5 inline-flex items-center rounded-full text-[15px] font-semibold transition-colors ${
      active ? "bg-leaf text-white" : "text-ink-2 hover:text-leaf"
    }`;

  return (
    <>
      <ArchiveHeader
        title="ราคาสินค้าเกษตรวันนี้"
        description={`ราคา${type === "retail" ? "ขายปลีก" : "ขายส่ง"}สินค้าเกษตรในกรุงเทพฯ จากกรมการค้าภายใน กระทรวงพาณิชย์${
          latestDate > 0 ? ` อัปเดต ${priceDateShort(new Date(latestDate).toISOString())}` : ""
        }`}
      >
        <div className="mt-6 inline-flex rounded-full bg-paper p-1 ring-1 ring-line">
          <Link href="/prices?type=retail" className={tab(type === "retail")} aria-current={type === "retail" ? "page" : undefined}>
            ขายปลีก
          </Link>
          <Link href="/prices?type=wholesale" className={tab(type === "wholesale")} aria-current={type === "wholesale" ? "page" : undefined}>
            ขายส่ง
          </Link>
        </div>
      </ArchiveHeader>

      <section className="border-b border-line">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-8 md:py-10">
          <h2 className="font-heading font-bold text-xl text-ink">ราคาพืชผลประจำวัน</h2>
          <p className="mt-1 text-sm text-ink-3">กดเพื่อดูกราฟย้อนหลังและราคาแยกตามพื้นที่</p>
          <div className="mt-4">
            <CropPriceCards />
          </div>
        </div>
      </section>

      <nav aria-label="กลุ่มสินค้า" className="border-b border-line">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6">
          <ul className="scroll-row flex gap-1 overflow-x-auto py-3">
            {groups.map((g) => {
              const active = g.group_id === currentGroupId;
              return (
                <li key={g.group_id} className="shrink-0">
                  <Link
                    href={`/prices?type=${type}&group=${g.group_id}`}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-full px-4 py-2 text-sm whitespace-nowrap transition-colors ${
                      active ? "bg-field text-leaf font-semibold ring-1 ring-shoot" : "text-ink-2 hover:bg-field"
                    }`}
                  >
                    {g.group_name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <section className="mx-auto max-w-[1400px] px-4 md:px-6 py-10 md:py-12">
        {currentGroup && (
          <div className="flex items-baseline justify-between gap-4 mb-5">
            <h2 className="font-heading font-bold text-2xl text-ink">{currentGroup.group_name}</h2>
            <span className="text-sm text-ink-3">
              {visibleProducts.length < products.length
                ? `แสดง ${visibleProducts.length} จาก ${products.length} รายการ`
                : `${products.length} รายการ`}
            </span>
          </div>
        )}

        {visibleProducts.length === 0 ? (
          <p className="py-16 text-center text-ink-2">กลุ่มนี้ยังไม่มีข้อมูลราคา ลองเลือกกลุ่มอื่นด้านบน</p>
        ) : (
          <div className="overflow-x-auto rounded-lg ring-1 ring-line">
            <table className="w-full border-collapse text-left">
              <thead className="bg-field text-sm text-ink-2">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">สินค้า</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-right">ราคา (ต่ำสุด–สูงสุด)</th>
                  <th scope="col" className="px-4 py-3 font-semibold hidden sm:table-cell">หน่วย</th>
                  <th scope="col" className="px-4 py-3 font-semibold hidden md:table-cell text-right">วันที่</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visibleProducts.map((p, i) => {
                  const rec: DITPriceRecord | null = priceRecords[i];
                  return (
                    <tr key={p.product_id} className="hover:bg-field/60">
                      <td className="px-4 py-3.5 text-ink">
                        {p.product_name}
                        {rec?.product_desc && (
                          <span className="block text-sm text-ink-3 mt-0.5">{rec.product_desc}</span>
                        )}
                        {rec?.unit && <span className="block text-xs text-ink-3 sm:hidden">{rec.unit}</span>}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap font-heading font-bold text-lg text-leaf tabular-nums">
                        {rec ? formatPrice(rec) : <span className="font-sans font-normal text-sm text-ink-3">ไม่มีข้อมูล</span>}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-ink-2 hidden sm:table-cell">{rec?.unit ?? "–"}</td>
                      <td className="px-4 py-3.5 text-sm text-ink-3 hidden md:table-cell text-right whitespace-nowrap">
                        {rec?.price_date ? priceDateShort(rec.price_date) : "–"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-6 text-sm text-ink-3">
          ที่มา{" "}
          <a href="https://pricelist.dit.go.th/" target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-leaf">
            กรมการค้าภายใน กระทรวงพาณิชย์
          </a>{" "}
          ราคาในต่างจังหวัดอาจแตกต่างจากนี้
        </p>
      </section>
    </>
  );
}
