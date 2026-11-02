"use client";

import Script from "next/script";
import { useEffect } from "react";

/**
 * "Add as a preferred source on Google".
 *
 * Uses Google's Preferred Sources SDK so the click opens Google's native
 * add-source flow over the page and returns the reader to the story
 * (https://developers.google.com/search/docs/appearance/preferred-sources).
 * Until the SDK is ready, or if it's blocked, the link falls back to Google's
 * documented deeplink.
 */
const DEEPLINK = "https://www.google.com/preferences/source?q=agrinewsthai.com";

type PreferredSourceApi = {
  init: (opts: { theme?: "light" | "dark"; lang?: string }) => void;
  addPreferredSource: () => void;
};

declare global {
  interface Window {
    PREFERRED_SOURCE?: Array<(api: PreferredSourceApi) => void>;
  }
}

// One init per page, shared by every button.
let api: PreferredSourceApi | null = null;
let queued = false;
function ensureInit() {
  if (queued || typeof window === "undefined") return;
  queued = true;
  (window.PREFERRED_SOURCE = window.PREFERRED_SOURCE || []).push((ps) => {
    ps.init({ theme: "light", lang: "th" });
    api = ps;
  });
}

export function PreferredSourceButton({ className = "" }: { className?: string }) {
  // Queue init before the SDK loads; it drains the queue when ready.
  useEffect(ensureInit, []);
  return (
    <>
      <Script
        id="google-preferred-source"
        src="https://news.google.com/swg/js/v1/publisher.js"
        strategy="afterInteractive"
        preferred-sources-control="manual"
      />
      <a
        href={DEEPLINK}
        target="_blank"
        rel="noopener"
        onClick={(e) => {
          if (!api) return; // SDK not ready: follow the deeplink
          e.preventDefault();
          api.addPreferredSource();
        }}
        className={`inline-flex items-center gap-2.5 h-11 pl-3 pr-4 rounded-full bg-paper ring-1 ring-line text-[15px] font-semibold text-ink hover:ring-leaf transition-shadow ${className}`}
      >
        <GoogleG className="h-5 w-5 shrink-0" />
        เพิ่มเป็นแหล่งข่าวที่ต้องการบน Google
      </a>
    </>
  );
}

/** Explainer + button, for article sidebars and the end of a story. */
export function PreferredSourceCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg bg-field p-5 ${className}`}>
      <p className="font-heading font-bold text-ink">เห็นข่าวเกษตรของเราก่อนใครบน Google</p>
      <p className="mt-1 text-sm leading-relaxed text-ink-2">
        ตั้งเรื่องเล่าข่าวเกษตรเป็นแหล่งข่าวที่ต้องการ ข่าวของเราจะขึ้นในส่วนเรื่องเด่นของ Google บ่อยขึ้น
      </p>
      <PreferredSourceButton className="mt-4" />
    </div>
  );
}

function GoogleG({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
