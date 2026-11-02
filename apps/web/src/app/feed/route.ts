import { rssResponse } from "@/lib/rss";

export const revalidate = 600;

export function GET() {
  return rssResponse();
}
