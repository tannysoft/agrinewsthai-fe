import type { Metadata } from "next";
import { ArchiveHeader } from "@/components/ArchiveHeader";

export const metadata: Metadata = {
  alternates: { canonical: "/contact" },
  title: "ติดต่อเรา",
  description: "ติดต่อทีมงานเรื่องเล่าข่าวเกษตร สำหรับส่งข่าว สอบถาม ความร่วมมือ หรือลงโฆษณา",
};

const EMAIL = "contact@agrinewsthai.com";

const TOPICS = [
  { title: "ส่งข่าวและข้อมูล", body: "ข่าวในพื้นที่ งานเกษตร หรือเรื่องราวของเกษตรกรที่อยากให้เราเล่าต่อ" },
  { title: "ความร่วมมือ", body: "หน่วยงาน สหกรณ์ หรือองค์กรที่อยากทำเนื้อหาร่วมกัน" },
  { title: "ลงโฆษณา", body: "สินค้าและบริการเพื่อเกษตรกร ติดต่อทีมงานเพื่อขอรายละเอียด" },
];

export default function ContactPage() {
  return (
    <>
      <ArchiveHeader
        title="ติดต่อเรา"
        description="ส่งข่าว แจ้งข้อมูล หรือสอบถาม ทีมงานตอบกลับภายใน 1–2 วันทำการ"
      />

      <section className="mx-auto max-w-[1400px] px-4 md:px-6 py-12 md:py-16 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 className="font-heading font-bold text-2xl text-ink">อีเมล</h2>
          <a
            href={`mailto:${EMAIL}`}
            className="mt-2 inline-block text-xl md:text-2xl font-semibold text-leaf underline decoration-shoot decoration-2 underline-offset-4 break-all"
          >
            {EMAIL}
          </a>
          <p className="mt-4 text-ink-2 leading-relaxed">
            ระบุหัวข้อให้ชัดเจน และแนบรูปหรือเอกสารประกอบได้เลย
          </p>
        </div>

        <ul className="lg:col-span-7 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {TOPICS.map((t) => (
            <li key={t.title} className="rounded-lg bg-field p-6">
              <h3 className="font-heading font-bold text-lg text-leaf">{t.title}</h3>
              <p className="mt-1.5 text-ink-2 leading-relaxed">{t.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
