import { getCrop } from "@/lib/crops";
import { formatPrice, getDITSeries } from "@/lib/dit";
import { OG_SIZE, ogCard } from "@/lib/og";

export const alt = "ราคาพืชผลวันนี้ เรื่องเล่าข่าวเกษตร";
export const size = OG_SIZE;
export const contentType = "image/png";
export const revalidate = 3600;

export default async function Image({ params }: { params: Promise<{ crop: string }> }) {
  const { crop: slug } = await params;
  const crop = getCrop(slug);
  const latest = crop ? (await getDITSeries(crop.chart, 30)).latest : null;
  const head = crop?.series.find((s) => s.id === crop.chart);
  const date = latest
    ? new Date(latest.price_date).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Bangkok" })
    : "";
  return ogCard({
    title: crop?.title ?? "ราคาพืชผลวันนี้",
    subtitle: [head?.label, date && `ข้อมูล ${date}`].filter(Boolean).join(" · "),
    price: latest ? { label: "ราคาล่าสุด", value: formatPrice(latest), unit: latest.unit } : null,
  });
}
