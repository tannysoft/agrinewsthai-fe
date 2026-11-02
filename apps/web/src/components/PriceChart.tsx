"use client";

import { useLayoutEffect, useRef, useState } from "react";

export type PricePoint = { date: string; value: number; range: string };

const LINE = "#588522"; // logo green; validated for ≥3:1 on white
const H = 260;
const PAD = { top: 20, right: 64, bottom: 30, left: 52 };

const thMonth = (iso: string) =>
  new Date(iso).toLocaleDateString("th-TH", { month: "short", timeZone: "Asia/Bangkok" });
const thDay = (iso: string) =>
  new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit", timeZone: "Asia/Bangkok" });
const fmt = (n: number) => n.toLocaleString("th-TH", { maximumFractionDigits: 2 });

/** Round tick step to 1/2/2.5/5 × 10^n. */
function niceStep(span: number, count: number) {
  const raw = span / Math.max(count, 1);
  const mag = 10 ** Math.floor(Math.log10(raw || 1));
  const n = raw / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag;
}

/**
 * One-series daily price trend: 2px line, recessive hairline grid, latest
 * point marked and labelled, crosshair + tooltip snapping to the nearest day.
 */
export function PriceChart({ points, unit, label }: { points: PricePoint[]; unit: string; label: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(720);
  const [hover, setHover] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (points.length < 2) {
    return <p className="rounded-lg bg-field p-6 text-center text-ink-2">ข้อมูลย้อนหลังยังไม่พอสำหรับแสดงกราฟ</p>;
  }

  const t0 = new Date(points[0].date).getTime();
  const t1 = new Date(points.at(-1)!.date).getTime();
  const vals = points.map((p) => p.value);
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  const step = niceStep(hi - lo || hi * 0.1 || 1, 4);
  const yMin = Math.floor((lo - (hi - lo) * 0.1) / step) * step;
  const yMax = Math.ceil((hi + (hi - lo) * 0.1) / step) * step || yMin + step;
  const ticks: number[] = [];
  for (let v = yMin; v <= yMax + step / 2; v += step) ticks.push(+v.toFixed(6));

  const plotW = width - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const x = (iso: string) => PAD.left + ((new Date(iso).getTime() - t0) / (t1 - t0 || 1)) * plotW;
  const y = (v: number) => PAD.top + (1 - (v - yMin) / (yMax - yMin || 1)) * plotH;

  const path = points.map((p, i) => `${i ? "L" : "M"}${x(p.date).toFixed(1)},${y(p.value).toFixed(1)}`).join("");

  // One x label per month, at the first priced day of that month.
  const months = points.filter((p, i) => i === 0 || p.date.slice(0, 7) !== points[i - 1].date.slice(0, 7));

  const last = points.at(-1)!;
  const active = hover !== null ? points[hover] : null;

  const onMove = (clientX: number) => {
    const rect = wrap.current!.getBoundingClientRect();
    const px = clientX - rect.left;
    let best = 0;
    let bestD = Infinity;
    points.forEach((p, i) => {
      const d = Math.abs(x(p.date) - px);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    setHover(best);
  };

  return (
    <div
      ref={wrap}
      className="relative select-none touch-pan-y"
      onPointerMove={(e) => onMove(e.clientX)}
      onPointerLeave={() => setHover(null)}
    >
      <svg width={width} height={H} role="img" aria-label={`กราฟ${label} ย้อนหลัง ราคาล่าสุด ${fmt(last.value)} ${unit}`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke="#e7ece0" strokeWidth={1} />
            <text x={PAD.left - 8} y={y(t)} dy="0.35em" textAnchor="end" fontSize={12} fill="#78826d">
              {fmt(t)}
            </text>
          </g>
        ))}
        {months.map((m) => (
          <text key={m.date} x={x(m.date)} y={H - 8} fontSize={12} fill="#78826d" textAnchor="start">
            {thMonth(m.date)}
          </text>
        ))}
        <path d={path} fill="none" stroke={LINE} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(last.date)} cy={y(last.value)} r={4.5} fill={LINE} stroke="#fff" strokeWidth={2} />
        <text x={x(last.date) + 9} y={y(last.value)} dy="0.35em" fontSize={13} fontWeight={600} fill="#1f2a17">
          {fmt(last.value)}
        </text>
        {active && (
          <g>
            <line x1={x(active.date)} x2={x(active.date)} y1={PAD.top} y2={H - PAD.bottom} stroke="#4a5540" strokeWidth={1} />
            <circle cx={x(active.date)} cy={y(active.value)} r={4.5} fill={LINE} stroke="#fff" strokeWidth={2} />
          </g>
        )}
      </svg>

      {active && (
        <div
          className="pointer-events-none absolute top-1 z-10 rounded-md bg-ink px-3 py-2 text-white shadow-lg"
          style={{
            left: Math.min(Math.max(x(active.date) - 70, 0), width - 150),
          }}
        >
          <p className="font-semibold tabular-nums">
            {active.range} <span className="text-xs font-normal text-white/70">{unit}</span>
          </p>
          <p className="flex items-center gap-1.5 text-xs text-white/70">
            <span className="inline-block h-0.5 w-3 rounded" style={{ background: "#a3c96a" }} aria-hidden />
            {thDay(active.date)}
          </p>
        </div>
      )}
    </div>
  );
}
