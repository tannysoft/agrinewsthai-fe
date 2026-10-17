import { getTopic } from "@/lib/topics";
import { getCrop } from "@/lib/crops";
import { formatPrice, getDITSeries } from "@/lib/dit";
import { OG_SIZE, ogCard } from "@/lib/og";

export const alt = "เรื่องเล่าข่าวเกษตร";
export const size = OG_SIZE;
export const contentType = "image/png";
export const revalidate = 3600;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = getTopic(slug);
  const crop = topic?.crop ? getCrop(topic.crop) : null;
  const latest = crop ? (await getDITSeries(crop.chart, 30)).latest : null;
  return ogCard({
    title: topic?.name ?? "เรื่องเล่าข่าวเกษตร",
    subtitle: topic ? "ข่าว ราคา และความรู้ อัปเดตทุกวัน" : "",
    price: crop && latest ? { label: "ราคาล่าสุด", value: formatPrice(latest), unit: latest.unit } : null,
  });
}
