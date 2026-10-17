"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "ant-cookie-consent";
type Consent = "accepted" | "declined";

// Tiny external store over localStorage so the banner reads consent without
// setState-in-effect, and renders nothing on the server.
const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function readConsent(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function CookieNotice() {
  const consent = useSyncExternalStore(subscribe, readConsent, () => "server");

  const decide = (value: Consent) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
      localStorage.setItem(`${STORAGE_KEY}-at`, new Date().toISOString());
    } catch {}
    listeners.forEach((l) => l());
  };

  if (consent !== "") return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-labelledby="cookie-title"
      className="cookie-enter fixed inset-x-0 bottom-0 z-[60] sm:inset-x-auto sm:left-5 sm:bottom-5 sm:max-w-[400px]"
    >
      <div className="rounded-t-2xl sm:rounded-2xl bg-paper p-5 shadow-[0_-4px_30px_rgba(22,61,0,0.12)] sm:shadow-[0_12px_40px_rgba(22,61,0,0.18)] ring-1 ring-line">
        <div className="flex gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-field text-leaf" aria-hidden>
            <CookieIcon className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <h2 id="cookie-title" className="font-heading font-bold text-ink">เว็บไซต์นี้ใช้คุกกี้</h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-2">
              เราใช้คุกกี้เพื่อนับสถิติการเข้าชมและปรับปรุงการอ่านข่าวให้ดีขึ้น คุณเลือกได้ว่าจะยอมรับทั้งหมดหรือเฉพาะที่จำเป็น
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => decide("declined")}
            className="h-11 rounded-full border border-line text-sm font-semibold text-ink-2 hover:border-leaf hover:text-leaf transition-colors"
          >
            เฉพาะที่จำเป็น
          </button>
          <button
            type="button"
            onClick={() => decide("accepted")}
            className="h-11 rounded-full bg-leaf text-sm font-semibold text-white hover:bg-leaf-deep transition-colors"
          >
            ยอมรับทั้งหมด
          </button>
        </div>
      </div>
    </div>
  );
}

function CookieIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.2A9 9 0 1 1 11.8 3a3 3 0 0 0 3.7 3.7A3 3 0 0 0 21 12.2Z" />
      <circle cx="8.5" cy="10" r="1" fill="currentColor" />
      <circle cx="10" cy="15.5" r="1" fill="currentColor" />
      <circle cx="15" cy="14.5" r="1" fill="currentColor" />
    </svg>
  );
}
