import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-[720px] px-4 md:px-6 py-20 md:py-28 text-center">
      <p className="font-heading font-bold text-7xl md:text-8xl text-sprout">404</p>
      <h1 className="mt-4 font-heading font-bold text-3xl md:text-4xl leading-snug text-ink">ไม่พบหน้านี้</h1>
      <p className="mt-4 text-lg text-ink-2 leading-relaxed">
        ลิงก์อาจเปลี่ยนหรือเรื่องถูกย้ายไปแล้ว ลองค้นหาด้วยหัวข้อที่สนใจ หรือกลับไปอ่านข่าวเกษตรที่หน้าแรก
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="h-12 px-6 inline-flex items-center rounded-full bg-leaf text-white font-semibold hover:bg-leaf-deep">
          กลับหน้าแรก
        </Link>
        <Link href="/search" className="h-12 px-6 inline-flex items-center rounded-full border border-line font-semibold text-leaf hover:border-leaf">
          ค้นหา
        </Link>
      </div>
    </section>
  );
}
