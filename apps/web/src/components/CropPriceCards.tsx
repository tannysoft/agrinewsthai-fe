import Link from "next/link";
import { CROPS } from "@/lib/crops";
import { formatPrice, getDITSeries } from "@/lib/dit";

/** One card per crop price page, each showing that crop's latest headline price. */
export async function CropPriceCards() {
  const latest = await Promise.all(CROPS.map((c) => getDITSeries(c.chart, 30).then((s) => s.latest)));
  return (
    <ul className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
      {CROPS.map((c, i) => {
        const rec = latest[i];
        return (
          <li key={c.slug}>
            <Link
              href={`/prices/${c.slug}`}
              className="flex h-full flex-col rounded-lg border border-line bg-paper p-4 hover:border-shoot transition-colors"
            >
              <span className="font-semibold text-leaf">{c.title}</span>
              <span className="mt-auto pt-3 font-heading font-bold text-xl leading-tight text-ink tabular-nums">
                {rec ? formatPrice(rec) : "ไม่มีราคา"}
              </span>
              {rec && <span className="mt-0.5 text-xs text-ink-3">{rec.unit}</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
