import type { JsonLd as JsonLdObj } from "@/lib/schema";

/**
 * Render one or more JSON-LD schema blocks inline.
 * Multiple blocks are rendered as separate <script> tags (preferred over a
 * single @graph array so Google can handle partial schemas independently).
 */
export function JsonLd({ data }: { data: JsonLdObj | JsonLdObj[] }) {
  const blocks = Array.isArray(data) ? data : [data];
  return (
    <>
      {blocks.map((block, i) => (
        <script
          // eslint-disable-next-line react/no-danger
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(block).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}
