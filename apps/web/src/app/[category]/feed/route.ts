import { rssResponse } from "@/lib/rss";

export const revalidate = 600;

export async function GET(_req: Request, { params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  return rssResponse(category);
}
