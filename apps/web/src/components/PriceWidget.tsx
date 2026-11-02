import Link from "next/link";
import { CROPS } from "@/lib/crops";
import type { ReactNode } from "react";
import {
  HOME_PRICE_ITEMS,
  formatPrice,
  getDITLatestPrices,
  type DITPriceRecord,
  type HomePriceItem,
} from "@/lib/dit";
import {
  ChickenIcon,
  CitrusIcon,
  EggIcon,
  FishIcon,
  GarlicIcon,
  LeafIcon,
  PigIcon,
  RiceIcon,
} from "./icons";

export const PRICE_ICONS: Record<HomePriceItem["icon"], (p: { className?: string }) => ReactNode> = {
  rice: RiceIcon,
  chicken: ChickenIcon,
  pig: PigIcon,
  egg: EggIcon,
  fish: FishIcon,
  leaf: LeafIcon,
  citrus: CitrusIcon,
  garlic: GarlicIcon,
};

export function latestPriceDate(records: (DITPriceRecord | null)[]): string | null {
  const ts = records
    .map((r) => (r?.price_date ? new Date(r.price_date).getTime() : 0))
    .reduce((a, b) => Math.max(a, b), 0);
  if (!ts) return null;
  return new Date(ts).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });
}

/** Home page: a horizontal strip of today's prices, directly under the hero. */
export async function PriceWidget() {
  const records = await getDITLatestPrices(HOME_PRICE_ITEMS.map((i) => i.id));
  const updated = latestPriceDate(records);

  return (
    <section aria-labelledby="prices-heading" className="bg-field border-b border-line">
      <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-6 md:py-8">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 mb-4">
          <h2 id="prices-heading" className="font-heading font-bold text-xl text-leaf">
            ราคาขายปลีกวันนี้
          </h2>
          <p className="text-sm text-ink-3">
            {updated ? `ข้อมูลกรมการค้าภายใน ${updated}` : "ข้อมูลกรมการค้าภายใน"}
            <Link href="/prices" className="ml-4 font-semibold text-leaf hover:underline underline-offset-4">
              ดูราคาทั้งหมด
            </Link>
          </p>
        </div>

        <ul className="scroll-row -mx-4 px-4 md:mx-0 md:px-0 flex md:grid md:grid-cols-4 lg:grid-cols-8 gap-3 overflow-x-auto snap-x">
          {HOME_PRICE_ITEMS.map((item, i) => {
            const rec = records[i];
            const Icon = PRICE_ICONS[item.icon];
            return (
              <li key={item.id} className="snap-start shrink-0 w-[10.5rem] md:w-auto">
                <Link
                  href="/prices"
                  className="flex h-full flex-col rounded-lg border border-line bg-paper p-3.5 hover:border-shoot transition-colors"
                >
                  <span className="flex items-start gap-2">
                    <Icon className="h-6 w-6 shrink-0 text-shoot" />
                    <span className="text-[13px] leading-snug text-ink-2 line-clamp-2">{item.label}</span>
                  </span>
                  <span className="mt-auto pt-3 font-heading font-bold text-xl leading-none text-ink tabular-nums">
                    {rec ? formatPrice(rec) : "ไม่มีข้อมูล"}
                  </span>
                  {rec && <span className="mt-1 text-xs text-ink-3">{rec.unit}</span>}
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="mt-4 flex flex-wrap items-center gap-x-1 gap-y-2 text-sm">
          <span className="mr-2 font-semibold text-ink-2">ราคาพืชผลวันนี้</span>
          {CROPS.map((c) => (
            <Link
              key={c.slug}
              href={`/prices/${c.slug}`}
              className="rounded-full bg-paper px-3 py-1 text-leaf ring-1 ring-line hover:ring-leaf"
            >
              {c.name}
            </Link>
          ))}
        </p>
      </div>
    </section>
  );
}
