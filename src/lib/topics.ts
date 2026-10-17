/**
 * Pillar pages (/topic/[slug]): one hub per topic farmers search repeatedly,
 * gathering news, evergreen know-how, sub-topics and live prices. Recommended
 * by the Oct 2026 SEO audit so topic news links back to one authoritative page.
 *
 * Roles, to avoid the pages competing with each other in search:
 * - /topic/{slug}   the hub for the broad term ("ทุเรียน", "ข่าวทุเรียน")
 * - /prices/{crop}  the daily-price query ("ราคาทุเรียนวันนี้")
 * - /tag/{tag}      the full news archive; links back to the hub
 *
 * Editors can add a long-form guide and FAQ by publishing a WordPress Page
 * with the slug `topic-{slug}` (e.g. `topic-durian`); see getTopicGuide().
 */
export type Topic = {
  slug: string;
  name: string;
  /** H1 / <title>. */
  title: string;
  description: string;
  /** Exact WordPress tag name that defines the topic's news stream. */
  tag: string;
  /** Extra search terms for the know-how section (evergreen categories). */
  queries: string[];
  /** Sub-topic tags shown as their own sections when they have enough stories. */
  subTags: string[];
  /** Any of these tags on a story links that story back to this hub. */
  matchTags: string[];
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
    tag: "ทุเรียน",
    queries: ["ทุเรียน"],
    subTags: ["ส่งออกทุเรียน", "ทุเรียนอ่อน", "สวนทุเรียน"],
    matchTags: ["ทุเรียน", "ทุเรียนไทย", "ทุเรียนอ่อน", "ส่งออกทุเรียน", "สวนทุเรียน", "ล้งทุเรียน", "สวมสิทธิ์ทุเรียน", "ทุเรียนใต้", "ทุเรียนคุณภาพ", "ทุเรียนหมอนทอง", "ทุเรียนส่งออก", "ชาวสวนทุเรียน"],
    crop: "durian",
  },
  {
    slug: "rice",
    name: "ข้าว",
    title: "ข้าว ข่าว ราคาข้าวเปลือก และความรู้สำหรับชาวนา",
    description:
      "รวมข่าวข้าวและชาวนาล่าสุด ราคาข้าวเปลือกรายวัน นโยบายและมาตรการช่วยเหลือ พันธุ์ข้าว และความรู้การทำนา",
    tag: "ข้าว",
    queries: ["ข้าว", "ชาวนา"],
    subTags: ["ชาวนา", "ราคาข้าว", "เมล็ดพันธุ์ข้าว"],
    matchTags: ["ข้าว", "ชาวนา", "ข้าวไทย", "นาข้าว", "ราคาข้าว", "เมล็ดพันธุ์ข้าว", "กรมการข้าว", "ชาวนาไทย", "ช่วยเหลือชาวนา"],
    crop: "rice",
  },
  {
    slug: "rubber",
    name: "ยางพารา",
    title: "ยางพารา ข่าว ราคายาง และความรู้สำหรับชาวสวนยาง",
    description:
      "รวมข่าวยางพาราล่าสุด ราคายางพารารายวัน นโยบายและตลาดยาง และความรู้การจัดการสวนยาง",
    tag: "ยางพารา",
    queries: ["ยางพารา"],
    subTags: [],
    matchTags: ["ยางพารา", "ยางพาราไทย", "ราคายางพารา", "สวนยางพารา", "ส่งออกยางพารา", "ยางพาราเถื่อน"],
    crop: "rubber",
  },
  {
    slug: "palm",
    name: "ปาล์มน้ำมัน",
    title: "ปาล์มน้ำมัน ข่าว ราคาปาล์ม และความรู้สำหรับชาวสวนปาล์ม",
    description:
      "รวมข่าวปาล์มน้ำมันล่าสุด ราคาผลปาล์มรายวัน ตลาดน้ำมันปาล์ม และความรู้การดูแลสวนปาล์ม",
    tag: "ปาล์มน้ำมัน",
    queries: ["ปาล์ม"],
    subTags: ["น้ำมันปาล์ม", "ราคาปาล์ม"],
    matchTags: ["ปาล์มน้ำมัน", "ปาล์ม", "น้ำมันปาล์ม", "ราคาปาล์ม", "ชาวสวนปาล์ม", "ราคาปาล์มน้ำมัน", "สวนปาล์ม"],
    crop: "palm",
  },
  {
    slug: "carbon-credit",
    name: "คาร์บอนเครดิต",
    title: "คาร์บอนเครดิตภาคเกษตร ข่าวและความรู้สำหรับเกษตรกร",
    description:
      "คาร์บอนเครดิตคืออะไร เกษตรกรเริ่มต้นอย่างไร และขายได้อย่างไร รวมข่าว คอลัมน์ และความรู้เรื่องคาร์บอนเครดิตภาคเกษตร",
    tag: "คาร์บอนเครดิต",
    queries: ["คาร์บอนเครดิต"],
    subTags: ["ข้าวคาร์บอนต่ำ"],
    matchTags: ["คาร์บอนเครดิต", "ข้าวคาร์บอนต่ำ", "คาร์บอนต่ำ", "เกษตรคาร์บอนต่ำ", "ขายคาร์บอนเครดิต"],
  },
  {
    slug: "flood",
    name: "น้ำท่วมกับเกษตรกร",
    title: "น้ำท่วมกับเกษตรกร ข่าว มาตรการช่วยเหลือ และการฟื้นฟูหลังน้ำลด",
    description:
      "ติดตามสถานการณ์น้ำท่วมที่กระทบพื้นที่เกษตร มาตรการช่วยเหลือเกษตรกร และวิธีฟื้นฟูแปลง สวน และฟาร์มหลังน้ำลด",
    tag: "น้ำท่วม",
    queries: ["น้ำท่วม", "หลังน้ำลด"],
    subTags: ["น้ำท่วมภาคใต้"],
    matchTags: ["น้ำท่วม", "น้ำท่วมภาคใต้", "น้ำท่วมฉับพลัน", "สถานการณ์น้ำท่วม", "ผู้ประสบภัยน้ำท่วม", "น้ำท่วมขัง", "พื้นที่น้ำท่วม"],
  },
  {
    slug: "blackchin-tilapia",
    name: "ปลาหมอคางดำ",
    title: "ปลาหมอคางดำ ข่าว มาตรการ และวิธีรับมือการระบาด",
    description:
      "ติดตามข่าวการระบาดของปลาหมอคางดำ มาตรการภาครัฐ การรับซื้อ และวิธีกำจัดสำหรับเกษตรกรและผู้เลี้ยงสัตว์น้ำ",
    tag: "ปลาหมอคางดำ",
    queries: ["ปลาหมอคางดำ"],
    subTags: [],
    matchTags: ["ปลาหมอคางดำ", "การแพร่ระบาดปลาหมอคางดำ", "รับซื้อปลาหมอคางดำ", "แก้ปัญหาปลาหมอคางดำ", "กำจัดปลาหมอคางดำ"],
  },
  {
    slug: "farmer-aid",
    name: "เงินช่วยเหลือเกษตรกร",
    title: "เงินช่วยเหลือเกษตรกร มาตรการและโครงการล่าสุด",
    description:
      "รวมข่าวมาตรการและเงินช่วยเหลือเกษตรกร ใครได้ ได้เท่าไร และติดตามความคืบหน้าโครงการช่วยเหลือจากภาครัฐ",
    tag: "ช่วยเหลือเกษตรกร",
    queries: ["ช่วยเหลือเกษตรกร", "เงินช่วยเหลือ"],
    subTags: [],
    matchTags: ["ช่วยเหลือเกษตรกร", "เงินช่วยเหลือเกษตรกร", "มาตรการช่วยเหลือเกษตรกร", "ช่วยเหลือชาวนา", "มาตรการช่วยเหลือชาวนา"],
  },
];

export const getTopic = (slug: string) => TOPICS.find((t) => t.slug === slug) ?? null;

/** The hub a story belongs to, from its tag names (first topic in list order wins). */
export function topicForTags(tagNames: string[]): Topic | null {
  const names = new Set(tagNames);
  return TOPICS.find((t) => t.matchTags.some((m) => names.has(m))) ?? null;
}

export const topicForCrop = (crop: string) => TOPICS.find((t) => t.crop === crop) ?? null;
