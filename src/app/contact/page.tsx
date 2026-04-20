import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ติดต่อเรา",
  description: "ติดต่อทีมงานเรื่องเล่าข่าวเกษตร สำหรับสอบถามข่าวสาร ความร่วมมือ หรือลงโฆษณา",
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-paper border-b-2 border-ink">
        <div className="mx-auto max-w-[1400px] px-6 py-20 md:py-28 grid md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-8">
            <div className="font-[var(--font-stamp)] text-[11px] uppercase tracking-[0.3em] text-moss-700">
              § Contact · ถึงหน้าบ้าน
            </div>
            <h1 className="mt-4 font-display font-extrabold leading-[1] tracking-[-0.02em] text-[clamp(2.25rem,5.5vw,4.75rem)]">
              ส่งข่าว·<br />
              <span className="text-moss-700">ส่งความคิด</span><br />
              ถึงเรา
            </h1>
          </div>
          <div className="md:col-span-4">
            <p className="text-lg leading-relaxed text-ink-soft">
              ส่งข่าว แจ้งข้อมูล ความร่วมมือ หรือสอบถามทั่วไป
              ทีมงานพร้อมรับฟังและตอบกลับภายใน 1–2 วันทำการ
            </p>
          </div>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-[1400px] px-6 py-16 md:py-24 grid md:grid-cols-12 gap-10">
          <aside className="md:col-span-4 space-y-10">
            {[
              { label: "Post", title: "อีเมล", value: "contact@agrinewsthai.com" },
              { label: "Phone", title: "โทรศัพท์", value: "02-000-0000" },
              { label: "Office", title: "ที่อยู่", value: "กรุงเทพมหานคร, ประเทศไทย" },
            ].map((c) => (
              <div key={c.label} className="border-l-2 border-ink pl-5">
                <div className="font-[var(--font-stamp)] text-[11px] uppercase tracking-[0.3em] text-moss-700">
                  § {c.label}
                </div>
                <div className="mt-2 font-display text-xl font-bold">{c.title}</div>
                <div className="mt-1 text-ink-soft">{c.value}</div>
              </div>
            ))}
          </aside>

          <form className="md:col-span-8 bg-paper-alt border-2 border-ink p-6 md:p-10 crop-marks relative">
            <div className="absolute -top-4 -left-4 stamp stamp-filled tilt-lg-l">ฟอร์มติดต่อ</div>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="ชื่อ" name="name" />
              <Field label="อีเมล" name="email" type="email" />
            </div>
            <div className="mt-6">
              <Field label="หัวข้อ" name="subject" />
            </div>
            <div className="mt-6">
              <label className="block font-[var(--font-stamp)] text-[11px] uppercase tracking-[0.25em] text-moss-700 mb-2">
                ข้อความ
              </label>
              <textarea
                rows={6}
                className="w-full bg-paper border-2 border-ink p-4 font-display text-lg focus:outline-none focus:bg-lime placeholder:text-ink/40"
              />
            </div>
            <button
              type="submit"
              className="mt-8 bg-ink text-paper font-[var(--font-stamp)] uppercase tracking-[0.25em] text-sm px-8 py-4 hover:bg-moss-700"
            >
              ส่งข้อความ →
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

function Field({ label, name, type = "text" }: { label: string; name: string; type?: string }) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block font-[var(--font-stamp)] text-[11px] uppercase tracking-[0.25em] text-moss-700 mb-2"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className="w-full bg-paper border-2 border-ink px-4 py-3 font-display text-lg focus:outline-none focus:bg-lime placeholder:text-ink/40"
      />
    </div>
  );
}
