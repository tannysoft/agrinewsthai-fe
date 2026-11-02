import Link from "next/link";
import Image from "next/image";
import {
  WPPost,
  formatRelative,
  getFeaturedImage,
  getPostHref,
  getExcerpt,
  getPrimaryCategory,
  stripHtml,
} from "@/lib/wp";

type Variant =
  | "feature" // wide: image left, large headline + excerpt right
  | "card" // image on top, headline below
  | "row" // list row: thumbnail left, headline + excerpt
  | "compact"; // small thumbnail + headline, for sidebars

export function PostCard({
  post,
  variant = "card",
  priority = false,
  showCategory = true,
}: {
  post: WPPost;
  variant?: Variant;
  priority?: boolean;
  showCategory?: boolean;
}) {
  const img = getFeaturedImage(post, variant === "feature" ? "large" : "medium_large");
  const category = showCategory ? getPrimaryCategory(post) : null;
  const title = stripHtml(post.title.rendered);
  const excerpt = getExcerpt(post);
  const href = getPostHref(post);

  const meta = (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]">
      {category && <span className="font-semibold text-leaf">{category.name}</span>}
      <time dateTime={post.date} className="text-ink-3">
        {formatRelative(post.date)}
      </time>
    </p>
  );

  if (variant === "feature") {
    return (
      <Link href={href} className="group grid gap-5 md:gap-8 md:grid-cols-12 md:items-center">
        <Thumb img={img} className="md:col-span-7 aspect-[16/10]" sizes="(min-width: 768px) 55vw, 100vw" priority={priority} />
        <div className="md:col-span-5">
          {meta}
          <h2 className="mt-3 font-heading font-bold text-2xl md:text-[2rem] leading-[1.45] text-ink">
            <span className="headline-link">{title}</span>
          </h2>
          {excerpt && <p className="mt-3 text-ink-2 leading-relaxed line-clamp-3">{excerpt}</p>}
        </div>
      </Link>
    );
  }

  if (variant === "row") {
    return (
      <Link href={href} className="group grid grid-cols-[7.5rem_1fr] sm:grid-cols-[13rem_1fr] gap-4 sm:gap-6 items-start">
        <Thumb img={img} className="aspect-[4/3]" sizes="(min-width: 640px) 208px, 120px" priority={priority} />
        <div className="min-w-0">
          {meta}
          <h3 className="mt-1.5 font-heading font-semibold text-[17px] sm:text-xl leading-[1.5] text-ink line-clamp-3">
            <span className="headline-link">{title}</span>
          </h3>
          {excerpt && (
            <p className="hidden sm:block mt-2 text-[15px] text-ink-2 leading-relaxed line-clamp-2">{excerpt}</p>
          )}
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={href} className="group grid grid-cols-[8rem_1fr] gap-3 items-start">
        <Thumb img={img} className="aspect-[16/9]" sizes="128px" />
        <div className="min-w-0">
          <h3 className="font-heading font-semibold text-[15px] leading-[1.55] text-ink line-clamp-2">
            <span className="headline-link">{title}</span>
          </h3>
          <time dateTime={post.date} className="mt-1 block text-[13px] text-ink-3">
            {formatRelative(post.date)}
          </time>
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} className="group flex flex-col">
      <Thumb img={img} className="aspect-[16/10]" sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw" priority={priority} />
      <div className="mt-3.5">
        {meta}
        <h3 className="mt-1.5 font-heading font-semibold text-lg leading-[1.55] text-ink line-clamp-3">
          <span className="headline-link">{title}</span>
        </h3>
      </div>
    </Link>
  );
}

export function Thumb({
  img,
  className = "",
  sizes,
  priority = false,
}: {
  img: ReturnType<typeof getFeaturedImage>;
  className?: string;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden rounded-md bg-field ${className}`}>
      {img && (
        <Image
          src={img.src}
          alt={img.alt}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      )}
    </div>
  );
}
