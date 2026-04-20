import Link from "next/link";
import type { ReactNode } from "react";
import {
  HOME_PRICE_ITEMS,
  formatPrice,
  getDITLatestPrices,
  priceDateShort,
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
import { FlipPrice } from "./FlipPrice";

const ICON_MAP: Record<HomePriceItem["icon"], (p: { className?: string }) => ReactNode> = {
  rice: RiceIcon,
  chicken: ChickenIcon,
  pig: PigIcon,
  egg: EggIcon,
  fish: FishIcon,
  leaf: LeafIcon,
  citrus: CitrusIcon,
  garlic: GarlicIcon,
};

export async function PriceWidget() {
  const records = await getDITLatestPrices(HOME_PRICE_ITEMS.map((i) => i.id));
  const latestDate = records
    .map((r) => (r?.price_date ? new Date(r.price_date).getTime() : 0))
    .reduce((a, b) => Math.max(a, b), 0);

  return (
    <section className="bg-paper border-y-2 border-ink">
      <div className="mx-auto max-w-[1400px] px-6 py-12 md:py-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6 pb-6 mb-8 border-b-2 border-ink">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 font-[var(--font-stamp)] text-[11px] tracking-[0.3em] uppercase text-moss-700">
              <span className="issue-num text-ink-muted border border-ink px-2 py-0.5">
                § 00
              </span>
              <span>Daily Prices · ราคาสินค้าเกษตรวันนี้</span>
              <span className="relative hidden sm:flex h-2 w-2 ml-1">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-moss-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-moss-700" />
              </span>
            </div>
            <h2 className="font-display font-extrabold text-2xl md:text-4xl leading-[1.05] tracking-[-0.015em] text-ink">
              ราคาขายปลีกวันนี้
            </h2>
            {latestDate > 0 && (
              <p className="mt-2 issue-num text-[11px] uppercase tracking-widest text-ink-muted">
                Updated · {priceDateShort(new Date(latestDate).toISOString())} ·
                ที่มา: กรมการค้าภายใน
              </p>
            )}
          </div>
          <Link
            href="/prices"
            className="group shrink-0 font-[var(--font-stamp)] text-xs uppercase tracking-[0.25em] border-b border-ink pb-1 after-arrow"
          >
            ดูราคาทั้งหมด
          </Link>
        </div>

        {/* Grid of commodities */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-ink border border-ink">
          {HOME_PRICE_ITEMS.map((item, i) => {
            const rec = records[i];
            const Icon = ICON_MAP[item.icon];
            return (
              <Link
                key={item.id}
                href="/prices"
                className="group bg-paper hover:bg-lime transition-colors p-4 md:p-5 flex flex-col min-h-[7.5rem]"
              >
                <div className="flex items-center gap-3 mb-auto">
                  <Icon className="h-7 w-7 md:h-8 md:w-8 shrink-0 text-moss-700 group-hover:text-ink transition-colors" />
                  <span className="font-display font-semibold text-sm md:text-[15px] leading-tight text-ink line-clamp-2 pt-0.5">
                    {item.label}
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-ink/15">
                  {rec ? (
                    <>
                      <FlipPrice
                        value={formatPrice(rec)}
                        className="font-display font-extrabold text-lg md:text-xl leading-none text-moss-900"
                      />
                      <div className="issue-num text-[10px] uppercase tracking-widest text-ink-muted mt-1.5">
                        {rec.unit}
                      </div>
                    </>
                  ) : (
                    <div className="issue-num text-[11px] text-ink-muted uppercase">
                      — no data —
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
