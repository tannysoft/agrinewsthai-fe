import type { Metadata } from "next";
import { Google_Sans } from "next/font/google";
import "./globals.css";
import { Masthead } from "@/components/Masthead";
import { Colophon } from "@/components/Colophon";
import { CookieNotice } from "@/components/CookieNotice";
import { JsonLd } from "@/components/JsonLd";
import { getCategories } from "@/lib/wp";
import { organizationSchema, websiteSchema } from "@/lib/schema";

const googleSans = Google_Sans({
  variable: "--font-google-sans",
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.agrinewsthai.com"),
  title: {
    default: "ข่าวเกษตรวันนี้ ล่าสุด ราคาพืชผล นโยบายเกษตร | เรื่องเล่าข่าวเกษตร",
    template: "%s | เรื่องเล่าข่าวเกษตร",
  },
  description:
    "อัปเดตข่าวเกษตรล่าสุดทุกวัน ข้าว ทุเรียน ยางพารา ปศุสัตว์ ประมง น้ำและนโยบายกระทรวงเกษตรฯ อ่านก่อนใครที่เรื่องเล่าข่าวเกษตร",
  keywords: ["ข่าวเกษตร", "เกษตรกรไทย", "พืชเศรษฐกิจ", "ปศุสัตว์", "ดินและน้ำ", "เทคโนโลยีการเกษตร"],
  openGraph: {
    type: "website",
    locale: "th_TH",
    title: "ข่าวเกษตรวันนี้ ล่าสุด ราคาพืชผล นโยบายเกษตร | เรื่องเล่าข่าวเกษตร",
    description:
      "อัปเดตข่าวเกษตรล่าสุดทุกวัน ข้าว ทุเรียน ยางพารา ปศุสัตว์ ประมง น้ำและนโยบายกระทรวงเกษตรฯ อ่านก่อนใครที่เรื่องเล่าข่าวเกษตร",
    siteName: "เรื่องเล่าข่าวเกษตร",
    url: "https://www.agrinewsthai.com",
    images: [
      {
        url: "/logo.svg",
        width: 904,
        height: 311,
        alt: "เรื่องเล่าข่าวเกษตร",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@agrinewsthai",
    creator: "@agrinewsthai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  // Next.js 16 auto-generates <link rel="icon"> + apple-touch-icon from
  // app/icon.png + app/apple-icon.png. No explicit `icons` override needed.
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const categories = await getCategories({ exclude: [13] });

  return (
    <html
      lang="th"
      className={`${googleSans.variable} antialiased`}
    >
      <body className="flex flex-col min-h-screen">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:bg-leaf focus:text-white focus:px-4 focus:py-2 focus:rounded-md"
        >
          ข้ามไปยังเนื้อหา
        </a>
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <Masthead categories={categories} />
        <main id="main" className="flex-1">{children}</main>
        <Colophon categories={categories} />
        <CookieNotice />
      </body>
    </html>
  );
}
