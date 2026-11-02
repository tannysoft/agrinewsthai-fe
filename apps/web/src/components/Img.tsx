import type { FeaturedImage } from "@/lib/wp";

/**
 * A plain <img> straight from the media domain (no Next.js image optimizer).
 * CMS images come as <picture>: WebP copies for current browsers, the
 * original JPG/PNG for those without WebP. `fill` covers the positioned
 * parent like next/image's fill.
 */
export function Img({
  img,
  sizes,
  priority = false,
  fill = false,
  className = "",
}: {
  img: FeaturedImage;
  sizes: string;
  priority?: boolean;
  fill?: boolean;
  className?: string;
}) {
  const tag = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={img.src}
      srcSet={img.webp ? undefined : img.srcSet}
      sizes={img.srcSet && !img.webp ? sizes : undefined}
      alt={img.alt}
      width={img.width}
      height={img.height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={`${fill ? "absolute inset-0 h-full w-full" : ""} ${className}`.trim()}
    />
  );
  if (!img.webp) return tag;
  return (
    <picture>
      <source type="image/webp" srcSet={img.srcSet} sizes={sizes} />
      {tag}
    </picture>
  );
}
