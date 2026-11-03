import { rssResponse } from "@/lib/rss";

export const revalidate = 900;

export function GET() {
  return rssResponse();
}
