import Link from "next/link";
import { HOME_PRICE_ITEMS, formatPrice, getDITLatestPrices } from "@/lib/dit";
import { PRICE_ICONS, latestPriceDate } from "./PriceWidget";

/** Compact price list for narrow columns (e.g. beside an article). */
export async function PriceWidgetMini({ limit = 6 }: { limit?: number }) {
  const items = HOME_PRICE_ITEMS.slice(0, limit);
  const records = await getDITLatestPrices(items.map((i) => i.id));
  const updated = latestPriceDate(records);

  return (
    <div className="rounded-lg bg-field p-5">
      <h2 className="font-heading font-bold text-lg text-leaf">ราคาขายปลีกวันนี้</h2>
      {updated && <p className="mt-0.5 text-[13px] text-ink-3">ข้อมูลกรมการค้าภายใน {updated}</p>}

      <ul className="mt-4 divide-y divide-line">
        {items.map((item, i) => {
          const rec = records[i];
          const Icon = PRICE_ICONS[item.icon];
          return (
            <li key={item.id} className="flex items-center gap-3 py-2.5">
              <Icon className="h-5 w-5 shrink-0 text-shoot" />
              <span className="flex-1 min-w-0 text-sm text-ink-2 line-clamp-1">{item.label}</span>
              <span className="shrink-0 text-right">
                <span className="block font-heading font-bold text-ink tabular-nums">
                  {rec ? formatPrice(rec) : "–"}
                </span>
                {rec && <span className="block text-[11px] text-ink-3">{rec.unit}</span>}
              </span>
            </li>
          );
        })}
      </ul>

      <Link href="/prices" className="mt-3 inline-block text-sm font-semibold text-leaf hover:underline underline-offset-4">
        ดูราคาสินค้าเกษตรทั้งหมด
      </Link>
    </div>
  );
}
