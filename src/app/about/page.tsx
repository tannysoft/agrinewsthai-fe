import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "เกี่ยวกับเรา",
  description:
    "เรื่องเล่าข่าวเกษตร — สื่อการเกษตรไทย รวมข่าวสาร บทความ Evergreen และความรู้การเกษตรที่ใช้ได้ยาวนาน",
};

export default function AboutPage() {
  return (
    <>
      <section className="bg-paper border-b-2 border-ink">
        <div className="mx-auto max-w-[1400px] px-6 py-20 md:py-28 grid md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-8">
            <div className="font-[var(--font-stamp)] text-[11px] uppercase tracking-[0.3em] text-moss-700">
              § About · บทนำ
            </div>
            <h1 className="mt-4 font-display font-extrabold leading-[1] tracking-[-0.02em] text-[clamp(2.25rem,5.5vw,4.75rem)]">
              เราเล่า<br />
              <span className="marker is-active">เรื่องเกษตร</span><br />
              แบบเข้าใจง่าย
            </h1>
          </div>
          <div className="md:col-span-4">
            <p className="text-lg md:text-xl leading-relaxed text-ink-soft">
              <strong>เรื่องเล่าข่าวเกษตร</strong> คือปูมการเกษตรไทยร่วมสมัย —
              รวมข่าวสาร องค์ความรู้ และภูมิปัญญาพื้นถิ่น
              คัดกรองให้สั้น อ่านง่าย และใช้ได้จริง
            </p>
          </div>
        </div>
      </section>

      <section className="bg-paper border-b-2 border-ink">
        <div className="mx-auto max-w-[1400px] px-6 py-16 md:py-24">
          <div className="grid md:grid-cols-3 border-t border-b border-ink divide-y md:divide-y-0 md:divide-x divide-ink">
            {[
              {
                no: "01",
                kicker: "Relevant",
                title: "เนื้อหาที่ใช้ได้จริง",
                body: "คัดกรองข้อมูลจากแหล่งที่น่าเชื่อถือ เรียบเรียงให้อ่านง่าย นำไปปฏิบัติได้ทันที ไม่ต้องตีความ",
              },
              {
                no: "02",
                kicker: "Timely",
                title: "ทันทุกความเคลื่อนไหว",
                body: "ติดตามข่าวนโยบาย ราคาพืชผล ภาวะตลาด และเทคโนโลยีใหม่ ๆ อย่างต่อเนื่องทุกสัปดาห์",
              },
              {
                no: "03",
                kicker: "Grounded",
                title: "ใกล้ชิดชาวไร่ชาวนา",
                body: "ให้พื้นที่กับภูมิปัญญาชาวบ้าน ถ่ายทอดประสบการณ์จริงจากพื้นที่ทั่วประเทศไทย",
              },
            ].map((v) => (
              <div key={v.no} className="p-8 md:p-10">
                <div className="big-num">{v.no}</div>
                <div className="mt-6 font-[var(--font-stamp)] text-[11px] uppercase tracking-[0.3em] text-moss-700">
                  {v.kicker}
                </div>
                <h3 className="mt-2 font-display text-xl md:text-2xl font-bold leading-tight tracking-tight">
                  {v.title}
                </h3>
                <p className="mt-4 text-ink-soft leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-[1400px] px-6 py-16 md:py-24 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="font-[var(--font-stamp)] text-[11px] uppercase tracking-[0.3em] text-lime">
              § Mission · พันธกิจ
            </div>
            <h2 className="mt-4 font-display font-extrabold text-3xl md:text-5xl leading-[1.05] tracking-[-0.015em]">
              ยกระดับการเข้าถึง<br />
              ข้อมูลการเกษตร<br />
              <span className="text-lime">ของคนไทย</span>
            </h2>
          </div>
          <div className="md:col-span-7 md:pt-6 space-y-5 text-paper/85 text-base md:text-lg leading-relaxed">
            <p>
              เราเชื่อว่าข้อมูลที่ดี ย่อมเริ่มต้นที่คำง่าย ๆ ใกล้ตัว —
              ไม่ใช่ศัพท์วิชาการที่อ่านแล้วไม่รู้เรื่อง
              จึงตั้งใจออกแบบปูมเล่มนี้ให้เรียบง่าย โหลดเร็ว ค้นหาคล่อง
              และสะท้อนตัวตนของสื่อเกษตรไทยได้อย่างมั่นใจ
            </p>
            <p>
              กองบรรณาธิการคัดกรองข้อมูลจากแหล่งที่น่าเชื่อถือ
              ทั้งหน่วยงานราชการ นักวิชาการ และประสบการณ์ตรงของเกษตรกรในพื้นที่
              ก่อนเรียบเรียงให้อ่านง่ายและนำไปใช้ได้จริง
            </p>
          </div>
        </div>
      </section>

      <section className="bg-paper border-t-2 border-ink">
        <div className="mx-auto max-w-[1400px] px-6 py-16 md:py-24">
          <div className="font-[var(--font-stamp)] text-[11px] uppercase tracking-[0.3em] text-moss-700 mb-5">
            § Index · หมวดหมู่
          </div>
          <h2 className="font-display font-extrabold text-3xl md:text-5xl leading-[1.05] tracking-[-0.015em] max-w-3xl">
            สำรวจเรื่องที่คุณ<br />สนใจ
          </h2>
          <div className="mt-12 grid md:grid-cols-4 border-t border-ink">
            {[
              ["ข่าวเกษตร", "news"],
              ["พืชเศรษฐกิจ", "economic-crops"],
              ["ปศุสัตว์", "domestic-animal"],
              ["ดินและน้ำ", "soil-and-water"],
              ["เทคโนโลยีเกษตร", "agricultural-technology"],
              ["รู้หรือไม่?", "did-you-know"],
              ["ภูมิปัญญาชาวบ้าน", "folk-wisdom"],
              ["เกษตรแปลงใหญ่", "large-farm"],
            ].map(([label, slug], i) => (
              <Link
                key={slug}
                href={`/${slug}`}
                className={`group flex items-center gap-4 p-6 md:p-8 border-b border-ink hover:bg-lime transition-colors ${
                  i % 4 < 3 ? "md:border-r" : ""
                }`}
              >
                <span className="big-num opacity-30 group-hover:opacity-100 group-hover:text-moss-700">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-base md:text-lg font-bold flex-1">{label}</span>
                <span className="text-xl" aria-hidden>→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
