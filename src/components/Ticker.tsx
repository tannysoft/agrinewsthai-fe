import Link from "next/link";
import { WPPost, hrefFromWpLink, stripHtml } from "@/lib/wp";

export function Ticker({ posts }: { posts: WPPost[] }) {
  if (!posts?.length) return null;
  const items = posts.map((p) => ({
    href: hrefFromWpLink(p.link) || `/news/${p.id}`,
    id: p.id,
    title: stripHtml(p.title.rendered),
  }));
  const doubled = [...items, ...items];

  return (
    <div className="relative z-20 bg-ink text-paper border-y-2 border-ink overflow-hidden">
      <div className="flex items-stretch">
        <div className="shrink-0 bg-lime text-ink px-4 md:px-6 py-2.5 flex items-center gap-3 border-r-2 border-ink">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ink opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-ink" />
          </span>
          <span className="font-[var(--font-stamp)] text-xs md:text-sm uppercase tracking-[0.2em] whitespace-nowrap">
            News Wire
          </span>
        </div>

        <div className="flex-1 min-w-0 relative overflow-hidden">
          <div className="flex whitespace-nowrap ticker-track py-2.5 w-max">
            {doubled.map((item, idx) => (
              <Link
                key={`${item.id}-${idx}`}
                href={item.href}
                className="group px-6 inline-flex items-center gap-3 shrink-0"
              >
                <span className="issue-num text-lime text-xs">
                  № {String((idx % items.length) + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-[15px] md:text-base font-medium group-hover:text-lime transition-colors">
                  {item.title}
                </span>
                <span className="text-ink-faint" aria-hidden>·</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
