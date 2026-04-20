import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-[1400px] px-6 py-24 md:py-32 grid md:grid-cols-12 gap-10 items-center">
      <div className="md:col-span-5 md:col-start-2">
        <div className="font-[var(--font-stamp)] text-[11px] uppercase tracking-[0.3em] text-moss-700">
          § Error — 404
        </div>
        <div className="mt-4 big-num text-[clamp(5rem,13vw,10rem)] tilt-lg-l inline-block">
          404
        </div>
        <h1 className="mt-2 font-display font-extrabold text-3xl md:text-5xl leading-[1.05] tracking-[-0.015em]">
          หน้าที่คุณตามหา<br />ไม่อยู่แล้ว
        </h1>
        <p className="mt-6 text-lg text-ink-soft max-w-md leading-relaxed">
          อาจถูกย้าย เปลี่ยนชื่อ หรือยังไม่ได้เผยแพร่
          ลองกลับไปหน้าแรก หรือค้นหาสิ่งที่ต้องการได้เลย
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/"
            className="bg-ink text-paper font-[var(--font-stamp)] uppercase tracking-[0.25em] text-xs px-6 py-3.5 hover:bg-moss-700"
          >
            กลับหน้าแรก →
          </Link>
          <Link
            href="/search"
            className="border-2 border-ink font-[var(--font-stamp)] uppercase tracking-[0.25em] text-xs px-6 py-3.5 hover:bg-lime"
          >
            ค้นหา
          </Link>
        </div>
      </div>
    </section>
  );
}
