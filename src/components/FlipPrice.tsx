"use client";

import { useEffect, useRef, useState } from "react";

const DIGITS = "0123456789";

/**
 * Split-flap / Solari-board style number reveal.
 *
 * - SSR renders the target value intact (no hydration shift / flicker).
 * - On mount each character runs a short "cycle" of random digits before
 *   settling to its final value, staggered left-to-right — like flight
 *   boards at the airport.
 * - Non-numeric characters (—, –, spaces, periods) pass through unchanged.
 */
export function FlipPrice({
  value,
  className = "",
  perChar = 35,
  settleEach = 120,
  cycleMs = 500,
}: {
  value: string;
  className?: string;
  /** ms between random-digit ticks while a position is still cycling. */
  perChar?: number;
  /** additional ms of cycling added per position (staggered settle). */
  settleEach?: number;
  /** base cycle duration before the first digit settles. */
  cycleMs?: number;
}) {
  const [hydrated, setHydrated] = useState(false);
  const [display, setDisplay] = useState(value);
  const lastValueRef = useRef(value);

  // Hydration-safe: render real value server-side, animate only after mount.
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    lastValueRef.current = value;

    const chars = value.split("");
    const digitIdx = chars
      .map((c, i) => ({ c, i }))
      .filter(({ c }) => /\d/.test(c));
    if (digitIdx.length === 0) {
      setDisplay(value);
      return;
    }

    const start = performance.now();
    let raf = 0;
    let tickAccum = 0;
    let lastNow = start;

    const run = (now: number) => {
      if (lastValueRef.current !== value) return; // superseded
      const elapsed = now - start;
      tickAccum += now - lastNow;
      lastNow = now;

      const out = [...chars];
      let stillCycling = false;

      digitIdx.forEach(({ i }, order) => {
        const settleAt = cycleMs + order * settleEach;
        if (elapsed >= settleAt) {
          out[i] = chars[i];
        } else {
          stillCycling = true;
          if (tickAccum >= perChar) {
            out[i] = DIGITS[Math.floor(Math.random() * DIGITS.length)];
          }
        }
      });

      if (tickAccum >= perChar) tickAccum = 0;
      setDisplay(out.join(""));
      if (stillCycling) raf = requestAnimationFrame(run);
    };

    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [value, hydrated, perChar, settleEach, cycleMs]);

  return (
    <span className={`flip-price ${className}`} aria-label={value}>
      {display.split("").map((c, i) => {
        const settled = c === value[i];
        return (
          <span
            key={`${i}-${c}`}
            className={`flip-char inline-block tabular-nums ${
              settled ? "is-settled" : ""
            }`}
            aria-hidden
          >
            {c}
          </span>
        );
      })}
    </span>
  );
}
