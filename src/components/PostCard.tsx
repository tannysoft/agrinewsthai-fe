import Link from "next/link";
import Image from "next/image";
import {
  WPPost,
  formatRelative,
  formatThaiDate,
  getAuthor,
  getFeaturedImage,
  getPostHref,
  getPrimaryCategory,
  stripHtml,
} from "@/lib/wp";

type Variant =
  | "headline" // HUGE editorial hero
  | "feature" // large with image block
  | "card" // standard card
  | "index" // numbered list row, image right (legacy)
  | "brief" // compact numbered card for grid
  | "bento-sq" // square image-heavy
  | "quote"; // quote-block style

export function PostCard({
  post,
  variant = "card",
  priority = false,
  index,
}: {
  post: WPPost;
  variant?: Variant;
  priority?: boolean;
  index?: number;
}) {
  const img = getFeaturedImage(post, variant === "headline" ? "large" : "medium_large");
  const category = getPrimaryCategory(post);
  const title = stripHtml(post.title.rendered);
  const excerpt = stripHtml(post.excerpt.rendered);
  const author = getAuthor(post);
  const href = getPostHref(post);
  const date = formatRelative(post.date);
  const dateLong = formatThaiDate(post.date);

  if (variant === "headline") {
    return (
      <Link href={href} className="group block relative">
        <div className="grid md:grid-cols-12 gap-6 md:gap-10 items-end">
          <div className="md:col-span-7 space-y-5">
            {category && (
              <div className="flex items-center gap-3">
                <span className="stamp stamp-filled tilt-l">{category.name}</span>
                <span className="issue-num text-xs uppercase tracking-widest text-ink-muted">
                  FEATURED · {dateLong}
                </span>
              </div>
            )}
            <h1 className="font-display font-extrabold leading-[1.15] tracking-[-0.015em] text-ink text-[clamp(1.75rem,3.6vw,2.75rem)] line-clamp-4">
              <span className="marker">{title}</span>
            </h1>
            <p className="text-base md:text-lg text-ink-soft max-w-xl leading-[1.7] line-clamp-2">
              {excerpt}
            </p>
            <div className="flex items-center gap-4 pt-4 border-t border-ink/20">
              <span className="font-[var(--font-stamp)] text-xs uppercase tracking-[0.2em]">
                {author?.name ?? "กองบรรณาธิการ"}
              </span>
              <span className="flex-1 hairline h-px" />
              <span className="issue-num text-xs text-ink-muted">อ่านต่อ →</span>
            </div>
          </div>

          <div className="md:col-span-5 relative">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper-alt border border-ink">
              {img && (
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  priority={priority}
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover duo transition-transform duration-700 group-hover:scale-[1.04]"
                />
              )}
            </div>
            <div className="absolute -top-3 -right-3 stamp stamp-filled tilt-lg-r shadow-page z-10">
              ฉบับนี้
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "feature") {
    return (
      <Link href={href} className="group block">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-paper-alt ring-1 ring-ink mb-4">
          {img && (
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(min-width: 1024px) 33vw, 100vw"
              className="object-cover duo transition-transform duration-700 group-hover:scale-[1.05]"
            />
          )}
          {category && (
            <div className="absolute top-3 left-3">
              <span className="stamp stamp-filled">{category.name}</span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
            <span className="issue-num text-[10px] uppercase tracking-widest bg-paper px-2 py-1 border border-ink">
              {dateLong}
            </span>
          </div>
        </div>
        <h3 className="font-display text-lg md:text-xl font-bold leading-[1.25] tracking-[-0.005em] text-ink">
          <span className="marker">{title}</span>
        </h3>
        <p className="mt-2 text-sm text-ink-muted line-clamp-2">{excerpt}</p>
      </Link>
    );
  }

  if (variant === "index") {
    return (
      <Link
        href={href}
        className="group grid grid-cols-[auto_1fr_auto] items-center gap-5 md:gap-8 py-5 border-t border-ink hover:bg-paper-alt transition-colors px-2 -mx-2"
      >
        <span className="big-num">{typeof index === "number" ? String(index + 1).padStart(2, "0") : "—"}</span>
        <div className="min-w-0">
          {category && (
            <span className="font-[var(--font-stamp)] text-[10px] uppercase tracking-[0.25em] text-moss-700">
              {category.name}
            </span>
          )}
          <h3 className="mt-1 font-display font-bold text-base md:text-xl leading-[1.25] tracking-[-0.005em] text-ink line-clamp-2">
            <span className="marker">{title}</span>
          </h3>
          <p className="mt-1 issue-num text-[11px] text-ink-muted uppercase tracking-widest">
            {dateLong} · {date}
          </p>
        </div>
        <div className="hidden md:block relative w-40 h-28 shrink-0 ring-1 ring-ink overflow-hidden bg-paper-alt">
          {img && (
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="160px"
              className="object-cover duo transition-transform duration-500 group-hover:scale-[1.08]"
            />
          )}
        </div>
      </Link>
    );
  }

  if (variant === "brief") {
    const n = typeof index === "number" ? String(index + 1).padStart(2, "0") : "—";
    return (
      <Link href={href} className="group flex gap-4 items-start">
        <div className="relative w-28 h-28 md:w-32 md:h-32 shrink-0 overflow-hidden ring-1 ring-ink bg-paper-alt">
          {img && (
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="140px"
              className="object-cover duo transition-transform duration-500 group-hover:scale-[1.06]"
            />
          )}
          <span className="absolute bottom-0 left-0 bg-lime text-ink font-display font-extrabold text-lg leading-none px-2 py-1 border-t border-r border-ink issue-num">
            {n}
          </span>
        </div>
        <div className="flex-1 min-w-0 pt-1">
          {category && (
            <span className="font-[var(--font-stamp)] text-[10px] uppercase tracking-[0.25em] text-moss-700">
              {category.name}
            </span>
          )}
          <h3 className="mt-1 font-display font-bold text-base md:text-[17px] leading-[1.3] tracking-[-0.005em] text-ink line-clamp-3">
            <span className="marker">{title}</span>
          </h3>
          <p className="mt-2 issue-num text-[10px] uppercase tracking-widest text-ink-muted">
            {dateLong}
          </p>
        </div>
      </Link>
    );
  }

  if (variant === "bento-sq") {
    return (
      <Link href={href} className="group relative block w-full h-full min-h-[22rem] overflow-hidden bg-paper-alt ring-1 ring-ink">
        <div className="absolute inset-0">
          {img && (
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(min-width: 1024px) 30vw, 50vw"
              className="object-cover duo transition-transform duration-700 group-hover:scale-[1.06]"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/30 to-transparent" />
        </div>
        <div className="relative h-full flex flex-col justify-between p-5 md:p-6 text-paper">
          <div className="flex items-start justify-between">
            {category && <span className="stamp stamp-filled">{category.name}</span>}
            <span className="issue-num text-[10px] uppercase tracking-widest text-paper/80">
              {dateLong}
            </span>
          </div>
          <div>
            <h3 className="font-display font-bold text-lg md:text-xl leading-[1.2] tracking-tight line-clamp-4">
              {title}
            </h3>
            <p className="mt-2 text-xs text-paper/70 font-[var(--font-stamp)] uppercase tracking-widest after-arrow">
              อ่านต่อ
            </p>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "quote") {
    return (
      <Link href={href} className="group block">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-paper-alt ring-1 ring-ink mb-4">
          {img && (
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(min-width: 1024px) 20vw, 50vw"
              className="object-cover duo transition-transform duration-500 group-hover:scale-[1.04]"
            />
          )}
        </div>
        {category && (
          <span className="font-[var(--font-stamp)] text-[10px] uppercase tracking-[0.25em] text-moss-700">
            {category.name}
          </span>
        )}
        <h3 className="mt-2 font-display text-base md:text-lg font-semibold leading-[1.3] tracking-[-0.005em] text-ink line-clamp-3">
          {title}
        </h3>
        <div className="mt-3 pt-3 border-t border-ink/20 flex items-center justify-between text-[11px]">
          <span className="font-[var(--font-stamp)] uppercase tracking-widest">
            {author?.name ?? "กองบรรณาธิการ"}
          </span>
          <span className="issue-num text-ink-muted">{date}</span>
        </div>
      </Link>
    );
  }

  // default "card"
  return (
    <Link href={href} className="group flex flex-col">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper-alt ring-1 ring-ink">
        {img && (
          <Image
            src={img.src}
            alt={img.alt}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover duo transition-transform duration-500 group-hover:scale-[1.05]"
          />
        )}
      </div>
      <div className="pt-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {category && (
            <span className="font-[var(--font-stamp)] text-[10px] uppercase tracking-[0.25em] text-moss-700">
              {category.name}
            </span>
          )}
          <span className="h-px flex-1 bg-ink/15" />
          <span className="issue-num text-[10px] text-ink-muted uppercase">{dateLong}</span>
        </div>
        <h3 className="font-display text-base md:text-lg font-bold leading-[1.3] tracking-[-0.005em] text-ink line-clamp-3">
          <span className="marker">{title}</span>
        </h3>
        <p className="text-sm text-ink-muted line-clamp-2">{excerpt}</p>
      </div>
    </Link>
  );
}
