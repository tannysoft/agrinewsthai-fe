import type { FeaturedImage } from "@/lib/wp";

/**
 * A plain <img> straight from the media domain, with the CMS's resized
 * copies as srcset (no Next.js image optimizer). `fill` covers its
 * positioned parent like next/image's fill.
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
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={img.src}
      srcSet={img.srcSet}
      sizes={img.srcSet ? sizes : undefined}
      alt={img.alt}
      width={img.width}
      height={img.height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={`${fill ? "absolute inset-0 h-full w-full" : ""} ${className}`.trim()}
    />
  );
}
