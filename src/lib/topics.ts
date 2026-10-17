/**
 * Pillar pages (/topic/[slug]): one hub per topic farmers search repeatedly,
 * gathering news, evergreen know-how, tags and live prices. Recommended by the
 * Oct 2026 SEO audit so topic news links back to a single authoritative page.
 */
export type Topic = {
  slug: string;
  name: string;
  /** H1 / <title>. */
  title: string;
  description: string;
  /** WP search terms; results are merged and de-duplicated. */
  queries: string[];
  /** Matching /prices/[crop] page, if any. */
  crop?: string;
};

export const TOPICS: Topic[] = [
  {
    slug: "durian",
    name: "ทุเรียน",
    title: "ทุเรียน ข่าว ราคา และความรู้สำหรับชาวสวน",
    description:
      "รวมข่าวทุเรียนล่าสุด ราคาทุเรียนรายวัน ตลาดส่งออก และความรู้การดูแลสวนทุเรียน ไว้ในที่เดียว",
    queries: ["ทุเรียน"],
    crop: "durian",
  },
  {
    slug: "rice",
    name: "ข้าว",
    title: "ข้าว ข่าว ราคาข้าวเปลือก และความรู้สำหรับชาวนา",
    description:
      "รวมข่าวข้าวและชาวนาล่าสุด ราคาข้าวเปลือกรายวัน นโยบายและมาตรการช่วยเหลือ พันธุ์ข้าว และความรู้การทำนา",
    queries: ["ชาวนา", "ข้าวเปลือก", "กรมการข้าว"],
    crop: "rice",
  },
  {
    slug: "carbon-credit",
    name: "คาร์บอนเครดิต",
    title: "คาร์บอนเครดิตภาคเกษตร ข่าวและความรู้สำหรับเกษตรกร",
    description:
      "คาร์บอนเครดิตคืออะไร เกษตรกรเริ่มต้นอย่างไร และขายได้อย่างไร รวมข่าว คอลัมน์ และความรู้เรื่องคาร์บอนเครดิตภาคเกษตร",
    queries: ["คาร์บอนเครดิต"],
  },
  {
    slug: "flood",
    name: "น้ำท่วมกับเกษตรกร",
    title: "น้ำท่วมกับเกษตรกร ข่าว มาตรการช่วยเหลือ และการฟื้นฟูหลังน้ำลด",
    description:
      "ติดตามสถานการณ์น้ำท่วมที่กระทบพื้นที่เกษตร มาตรการช่วยเหลือเกษตรกร และวิธีฟื้นฟูแปลง สวน และฟาร์มหลังน้ำลด",
    queries: ["น้ำท่วม", "อุทกภัย"],
  },
];

export const getTopic = (slug: string) => TOPICS.find((t) => t.slug === slug) ?? null;
