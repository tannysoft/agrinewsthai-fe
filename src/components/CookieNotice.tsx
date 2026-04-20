"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "ant-cookie-consent";
type Consent = "accepted" | "declined";

export function CookieNotice() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Consent | null;
      if (!saved) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const decide = (value: Consent) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
      localStorage.setItem(`${STORAGE_KEY}-at`, new Date().toISOString());
    } catch {}
    setVisible(false);
  };

  if (!mounted || !visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="ประกาศเรื่องคุกกี้"
      className="fixed inset-x-3 bottom-3 md:inset-x-auto md:right-5 md:bottom-5 md:max-w-xs z-[60] rise"
    >
      <div className="relative bg-paper text-ink border border-ink shadow-page">
        <div className="absolute inset-0 border border-dashed border-ink/30 m-[2px] pointer-events-none" />

        <div className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-ink/20 bg-ink text-paper">
          <span className="font-[var(--font-stamp)] text-[9px] uppercase tracking-[0.28em] text-lime">
            § Notice · คุกกี้
          </span>
          <button
            type="button"
            onClick={() => decide("declined")}
            aria-label="ปิดประกาศ"
            className="text-paper/70 hover:text-lime leading-none text-sm"
          >
            ×
          </button>
        </div>

        <div className="px-3 py-3">
          <p className="text-[12px] leading-relaxed text-ink-soft">
            เว็บนี้ใช้<span className="marker is-active font-display font-semibold">คุกกี้</span>
            {" "}เพื่อวิเคราะห์การเข้าชมและปรับปรุงประสบการณ์การอ่าน
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => decide("accepted")}
              className="font-display font-semibold text-[12px] px-3 py-1.5 bg-ink text-paper hover:bg-moss-700 transition-colors"
            >
              ยอมรับ
            </button>
            <button
              type="button"
              onClick={() => decide("declined")}
              className="font-display font-medium text-[12px] px-3 py-1.5 border border-ink/40 text-ink hover:bg-paper-alt hover:border-ink transition-colors"
            >
              ปฏิเสธ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
