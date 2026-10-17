import { ImageResponse } from "next/og";

/**
 * Social share cards (og:image) for pillar and price pages, rendered with
 * next/og. Thai needs a font with Thai glyphs, fetched from Google Fonts subset
 * to exactly the characters on the card (a few KB). Not Google Sans: its
 * OpenType tables use a GSUB lookup (type 7) that next/og's renderer rejects.
 */
export const OG_SIZE = { width: 1200, height: 630 };
const OG_FONT = "Noto Sans Thai";

async function loadFont(text: string, weight: 400 | 700): Promise<ArrayBuffer | null> {
  try {
    const chars = Array.from(new Set(text)).join("");
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${OG_FONT.replace(/ /g, "+")}:wght@${weight}&text=${encodeURIComponent(chars)}`,
      { next: { revalidate: 86400 } }
    ).then((r) => r.text());
    const url = css.match(/src: url\(([^)]+)\) format\('(?:truetype|opentype)'\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export async function ogCard({
  title,
  subtitle,
  price,
}: {
  title: string;
  subtitle: string;
  price?: { label: string; value: string; unit: string } | null;
}) {
  const brand = "เรื่องเล่าข่าวเกษตร";
  const site = "agrinewsthai.com";
  const allText = [brand, site, title, subtitle, price?.label, price?.value, price?.unit].filter(Boolean).join("");
  const [bold, regular] = await Promise.all([loadFont(allText, 700), loadFont(allText, 400)]);
  const fonts = [
    ...(bold ? [{ name: OG_FONT, data: bold, weight: 700 as const, style: "normal" as const }] : []),
    ...(regular ? [{ name: OG_FONT, data: regular, weight: 400 as const, style: "normal" as const }] : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#1e5100",
          color: "#ffffff",
          padding: "64px 72px",
          fontFamily: OG_FONT,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="52" height="52" viewBox="0 0 24 24">
            <path d="M12 21.5V11" stroke="#abd130" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M12 14.5C7.6 14.6 4.6 11.7 4.4 7.2c4.4-.1 7.4 2.8 7.6 7.3Z" fill="#abd130" />
            <path d="M12 11.5c.1-4.9 3.2-8 8-8.1-.1 4.9-3.2 8-8 8.1Z" fill="#8cb52b" />
          </svg>
          <span style={{ fontSize: 34, fontWeight: 700, color: "#abd130" }}>{brand}</span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 48 }}>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: price ? 640 : 1056 }}>
            <span style={{ fontSize: price ? 60 : 68, fontWeight: 700, lineHeight: 1.3 }}>{title}</span>
            <span style={{ marginTop: 20, fontSize: 28, lineHeight: 1.5, color: "rgba(255,255,255,0.78)" }}>{subtitle}</span>
          </div>
          {price && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                background: "#f2f6ea",
                color: "#1f2a17",
                borderRadius: 24,
                padding: "28px 36px",
                minWidth: 360,
              }}
            >
              <span style={{ fontSize: 24, color: "#1e5100", fontWeight: 700 }}>{price.label}</span>
              <span style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.15, marginTop: 8 }}>{price.value}</span>
              <span style={{ fontSize: 24, color: "#4a5540" }}>{price.unit}</span>
            </div>
          )}
        </div>

        <span style={{ fontSize: 24, color: "rgba(255,255,255,0.6)" }}>{site}</span>
      </div>
    ),
    { ...OG_SIZE, fonts }
  );
}
