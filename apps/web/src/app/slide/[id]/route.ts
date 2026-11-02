import { getPostById, getPrimaryCategory } from "@/lib/wp";

/**
 * Legacy /slide/{id} URLs: "สไลด์" was used as a primary category for homepage
 * carousel stories (SEO audit, Oct 2026). A route handler (not a page) so
 * crawlers get a real 308 to the story's own category.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId) || postId <= 0) return new Response("Not found", { status: 404 });
  const post = await getPostById(postId).catch(() => null);
  if (!post) return new Response("Not found", { status: 404 });
  const slug = getPrimaryCategory(post)?.slug;
  return Response.redirect(new URL(`/${slug && slug !== "slide" ? slug : "news"}/${postId}`, req.url), 308);
}
