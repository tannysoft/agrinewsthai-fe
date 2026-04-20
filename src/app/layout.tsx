import type { Metadata } from "next";
import {
  Kanit,
  IBM_Plex_Sans_Thai_Looped,
  Chonburi,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import { Masthead } from "@/components/Masthead";
import { Colophon } from "@/components/Colophon";
import { Ticker } from "@/components/Ticker";
import { getCategories, getPosts } from "@/lib/wp";

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const plexThai = IBM_Plex_Sans_Thai_Looped({
  variable: "--font-plex-thai",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const chonburi = Chonburi({
  variable: "--font-chonburi",
  subsets: ["latin", "thai"],
  weight: ["400"],
  display: "swap",
});

const jetMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://agrinewsthai.com"),
  title: {
    default: "เรื่องเล่าข่าวเกษตร · AGRI NEWS THAI",
    template: "%s · เรื่องเล่าข่าวเกษตร",
  },
  description:
    "ข่าวสาร ความรู้ และภูมิปัญญาการเกษตรไทย — ทันสมัย อ่านง่าย ใช้ได้จริง",
  keywords: ["ข่าวเกษตร", "เกษตรกรไทย", "พืชเศรษฐกิจ", "ปศุสัตว์", "ดินและน้ำ", "เทคโนโลยีการเกษตร"],
  openGraph: {
    type: "website",
    locale: "th_TH",
    siteName: "เรื่องเล่าข่าวเกษตร",
  },
  icons: { icon: "/favicon.ico" },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [categories, { data: tickerPosts }] = await Promise.all([
    getCategories({ exclude: [13] }),
    getPosts({
      perPage: 10,
      page: 1,
      embed: false,
      fields: ["id", "slug", "title", "date", "link"],
    }),
  ]);

  return (
    <html
      lang="th"
      className={`${kanit.variable} ${plexThai.variable} ${chonburi.variable} ${jetMono.variable} antialiased`}
    >
      <body className="flex flex-col min-h-screen">
        <Masthead categories={categories} />
        <Ticker posts={tickerPosts} />
        <main className="flex-1 relative z-[2]">{children}</main>
        <Colophon categories={categories} />
      </body>
    </html>
  );
}
