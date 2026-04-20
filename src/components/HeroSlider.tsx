"use client";

import { useEffect, useRef, useState } from "react";
import { WPPost } from "@/lib/wp";
import { PostCard } from "./PostCard";
import { ArrowLeft, ArrowRight } from "./icons";

export function HeroSlider({ posts, interval = 7000 }: { posts: WPPost[]; interval?: number }) {
  const [idx, setIdx] = useState(0);
  const paused = useRef(false);
  const count = posts.length;

  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(() => {
      if (!paused.current) setIdx((i) => (i + 1) % count);
    }, interval);
    return () => clearInterval(id);
  }, [count, interval]);

  if (!count) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      onFocus={() => (paused.current = true)}
      onBlur={() => (paused.current = false)}
    >
      {/* Slide track — horizontal translate */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-[cubic-bezier(.22,.61,.36,1)]"
          style={{ transform: `translate3d(-${idx * 100}%, 0, 0)` }}
        >
          {posts.map((p, i) => (
            <div key={p.id} className="w-full shrink-0 grow-0 basis-full">
              <PostCard post={p} variant="headline" priority={i === 0} />
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      {count > 1 && (
        <div className="mt-8 flex items-center justify-between gap-4 pt-5 border-t border-ink/20">
          <div className="flex items-center gap-2 flex-wrap">
            {posts.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setIdx(i)}
                aria-label={`ไปสไลด์ที่ ${i + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i === idx ? "w-10 bg-ink" : "w-2.5 bg-ink/25 hover:bg-ink/50"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="issue-num text-xs text-ink-muted uppercase tracking-widest">
              {String(idx + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setIdx((i) => (i - 1 + count) % count)}
                aria-label="สไลด์ก่อนหน้า"
                className="h-10 w-10 grid place-items-center border border-ink rounded-full hover:bg-lime transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIdx((i) => (i + 1) % count)}
                aria-label="สไลด์ถัดไป"
                className="h-10 w-10 grid place-items-center border border-ink rounded-full hover:bg-lime transition-colors"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
