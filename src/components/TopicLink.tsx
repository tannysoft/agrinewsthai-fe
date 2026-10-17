import Link from "next/link";
import type { Topic } from "@/lib/topics";
import { SproutIcon } from "./SectionHeader";

/** Card linking a story back to its pillar page (and the topic's daily price page, if any). */
export function TopicLinkBox({ topic }: { topic: Topic }) {
  return (
    <aside className="mt-8 flex flex-col gap-4 rounded-lg bg-field p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <SproutIcon className="mt-0.5 h-7 w-7" />
        <div>
          <p className="font-heading font-bold text-ink">ติดตามเรื่อง{topic.name}ทั้งหมด</p>
          <p className="mt-0.5 text-sm text-ink-2">{topic.description}</p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        {topic.crop && (
          <Link
            href={`/prices/${topic.crop}`}
            className="inline-flex h-10 items-center rounded-full bg-paper px-4 text-sm font-semibold text-leaf ring-1 ring-line hover:ring-leaf"
          >
            ดูราคาวันนี้
          </Link>
        )}
        <Link
          href={`/topic/${topic.slug}`}
          className="inline-flex h-10 items-center rounded-full bg-leaf px-4 text-sm font-semibold text-white hover:bg-leaf-deep"
        >
          รวมเรื่อง{topic.name}
        </Link>
      </div>
    </aside>
  );
}

/** Small chip pointing an archive (tag / price page) at its pillar page. */
export function TopicChip({ topic }: { topic: Topic }) {
  return (
    <Link
      href={`/topic/${topic.slug}`}
      className="mt-5 inline-flex items-center gap-2 rounded-full bg-paper px-4 py-2 text-sm font-semibold text-leaf ring-1 ring-line hover:ring-leaf"
    >
      <SproutIcon className="h-4 w-4" />
      หน้ารวมเรื่อง{topic.name}: ข่าว ราคา และความรู้
    </Link>
  );
}
