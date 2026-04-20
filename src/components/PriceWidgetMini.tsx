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

/**
 * Compact price list for narrow sidebars (e.g. single-post page).
 * Shows first 6 commodities with icon + name + latest price.
 */
export async function PriceWidgetMini({
  limit = 6,
}: {
  limit?: number;
}) {
  const items = HOME_PRICE_ITEMS.slice(0, limit);
  const records = await getDITLatestPrices(items.map((i) => i.id));
  const latestDate = records
    .map((r) => (r?.price_date ? new Date(r.price_date).getTime() : 0))
    .reduce((a, b) => Math.max(a, b), 0);

  return (
    <div className="border border-ink bg-paper-alt">
      <div className="px-3 py-2 border-b border-ink bg-ink text-paper flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-[var(--font-stamp)] text-[10px] uppercase tracking-[0.2em]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-lime" />
          </span>
          <span>ราคาสินค้าเกษตรวันนี้</span>
        </div>
        {latestDate > 0 && (
          <span className="issue-num text-[10px] text-paper/70">
            {priceDateShort(new Date(latestDate).toISOString())}
          </span>
        )}
      </div>

      <ul className="divide-y divide-ink/15">
        {items.map((item, i) => {
          const rec = records[i];
          const Icon = ICON_MAP[item.icon];
          return (
            <li key={item.id}>
              <Link
                href="/prices"
                className="group flex items-center gap-2.5 px-3 py-2.5 hover:bg-lime transition-colors"
              >
                <Icon className="h-5 w-5 shrink-0 text-moss-700 group-hover:text-ink" />
                <span className="font-display font-semibold text-xs leading-tight text-ink line-clamp-1 flex-1 min-w-0">
                  {item.label}
                </span>
                {rec ? (
                  <FlipPrice
                    value={formatPrice(rec)}
                    className="font-display font-extrabold text-[13px] leading-none text-moss-900 shrink-0 whitespace-nowrap"
                  />
                ) : (
                  <span className="font-display font-extrabold text-[13px] leading-none text-moss-900 shrink-0">
                    —
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      <Link
        href="/prices"
        className="block px-3 py-2 border-t border-ink text-center font-[var(--font-stamp)] text-[10px] uppercase tracking-[0.25em] hover:bg-lime after-arrow"
      >
        ดูทั้งหมด
      </Link>
    </div>
  );
}
