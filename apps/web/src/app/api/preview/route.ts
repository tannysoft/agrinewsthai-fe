import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Entry point for the CMS "Preview" button:
 * /api/preview?secret=…&id={postId}. Turns on draft mode and opens the story.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = process.env.PREVIEW_SECRET;
  const id = Number(url.searchParams.get("id"));
  if (!secret || url.searchParams.get("secret") !== secret || !Number.isInteger(id) || id <= 0) {
    return new Response("Invalid preview link", { status: 401 });
  }
  (await draftMode()).enable();
  redirect(`/news/${id}`);
}
