import Link from "next/link";
import type { Metadata } from "next";
import { ArchiveHeader } from "@/components/ArchiveHeader";
import { SectionHeader } from "@/components/SectionHeader";

export const metadata: Metadata = {
  alternates: { canonical: "/about" },
  title: "เกี่ยวกับเรา",
  description:
    "เรื่องเล่าข่าวเกษตร — สื่อการเกษตรไทย รวมข่าวสาร บทความ Evergreen และความรู้การเกษตรที่ใช้ได้ยาวนาน",
};

const PROMISES = [
  {
    title: "ใช้ได้จริง",
    body: "คัดข้อมูลจากแหล่งที่เชื่อถือได้ แล้วเรียบเรียงให้อ่านจบแล้วลงมือทำได้ทันที",
  },
  {
    title: "ทันเหตุการณ์",
    body: "ติดตามนโยบาย ราคาพืชผล ภาวะตลาด และเทคโนโลยีใหม่ อย่างต่อเนื่องทุกวัน",
  },
  {
    title: "ใกล้ชิดพื้นที่",
    body: "ให้พื้นที่กับภูมิปัญญาชาวบ้านและประสบการณ์จริงของเกษตรกรทั่วประเทศ",
  },
];

const SECTIONS: [string, string][] = [
  ["ข่าวเกษตร", "news"],
  ["พืชเศรษฐกิจ", "economic-crops"],
  ["ปศุสัตว์", "domestic-animal"],
  ["ดินและน้ำ", "soil-and-water"],
  ["เทคโนโลยีการเกษตร", "agricultural-technology"],
  ["รู้หรือไม่?", "did-you-know"],
  ["ภูมิปัญญาชาวบ้าน", "folk-wisdom"],
  ["เกษตรแปลงใหญ่", "large-farm"],
];

export default function AboutPage() {
  return (
    <>
      <ArchiveHeader
        title="เกี่ยวกับเรา"
        description="เรื่องเล่าข่าวเกษตร รวบรวมข่าวสาร องค์ความรู้ และภูมิปัญญาการเกษตรไทย เล่าให้สั้น อ่านง่าย และใช้ได้จริง"
      />

      <section className="mx-auto max-w-[1400px] px-4 md:px-6 py-12 md:py-16 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-5 text-lg leading-[1.9] text-ink-2">
          <h2 className="font-heading font-bold text-2xl md:text-3xl leading-snug text-ink">
            ข้อมูลที่ดีเริ่มจากคำง่าย ๆ ใกล้ตัว
          </h2>
          <p>
            เราเชื่อว่าเกษตรกรควรได้อ่านข้อมูลด้วยภาษาที่เข้าใจทันที
            ไม่ใช่ศัพท์วิชาการที่ต้องตีความ เว็บไซต์นี้จึงออกแบบให้เรียบง่าย โหลดเร็ว และค้นหาได้คล่อง
          </p>
          <p>
            กองบรรณาธิการคัดกรองข้อมูลจากหน่วยงานราชการ นักวิชาการ
            และประสบการณ์ตรงของเกษตรกรในพื้นที่ ก่อนเรียบเรียงให้อ่านง่ายและนำไปใช้ได้จริง
          </p>
        </div>
        <ul className="lg:col-span-5 space-y-6">
          {PROMISES.map((v) => (
            <li key={v.title} className="rounded-lg bg-field p-6">
              <h3 className="font-heading font-bold text-xl text-leaf">{v.title}</h3>
              <p className="mt-2 text-ink-2 leading-relaxed">{v.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-12 md:py-16">
          <SectionHeader title="หมวดเนื้อหา" />
          <ul className="grid gap-3 grid-cols-2 md:grid-cols-4">
            {SECTIONS.map(([label, slug]) => (
              <li key={slug}>
                <Link
                  href={`/${slug}`}
                  className="block rounded-lg ring-1 ring-line px-5 py-4 font-semibold text-ink hover:ring-shoot hover:text-leaf transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
