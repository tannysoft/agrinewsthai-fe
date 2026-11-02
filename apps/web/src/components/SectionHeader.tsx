import Link from "next/link";

/** A two-leaf seedling in the logo's greens; marks section titles. */
export function SproutIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={`shrink-0 ${className}`} viewBox="0 0 24 24" aria-hidden>
      <path d="M12 21.5V11" stroke="#1e5100" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M12 14.5C7.6 14.6 4.6 11.7 4.4 7.2c4.4-.1 7.4 2.8 7.6 7.3Z" fill="#8cb52b" />
      <path d="M12 11.5c.1-4.9 3.2-8 8-8.1-.1 4.9-3.2 8-8 8.1Z" fill="#588522" />
    </svg>
  );
}

export function SectionHeader({
  title,
  href,
  linkLabel = "ดูทั้งหมด",
  description,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  description?: string;
}) {
  return (
    <header className="mb-6 md:mb-8">
      <div className="flex items-center gap-4">
        <h2 className="flex min-w-0 items-center gap-2.5 font-heading font-bold text-2xl md:text-[1.75rem] leading-snug text-ink">
          <SproutIcon className="h-7 w-7 md:h-8 md:w-8" />
          {title}
        </h2>
        {href && (
          <Link
            href={href}
            className="ml-auto shrink-0 text-[15px] font-semibold text-leaf hover:underline underline-offset-4"
          >
            {linkLabel}
          </Link>
        )}
      </div>
      {description && <p className="mt-2 max-w-2xl text-ink-2">{description}</p>}
    </header>
  );
}
