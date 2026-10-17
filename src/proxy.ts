import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Legacy /slide/{id} URLs: "สไลด์" was used as a primary category for homepage
 * carousel stories (SEO audit, Oct 2026). Send them to the story's real
 * category with a true 308 before rendering — the article page streams, so a
 * redirect from inside it would reach crawlers as a 200 + meta refresh.
 */
const WP_API = "https://www.agrinewsthai.com/wp-json/wp/v2";

type Term = { taxonomy: string; slug: string };

export async function proxy(request: NextRequest) {
  const id = request.nextUrl.pathname.match(/^\/slide\/(\d+)\/?$/)?.[1];
  if (!id) return NextResponse.next();

  try {
    const res = await fetch(
      `${WP_API}/posts/${id}?_embed=wp:term&_fields=id,_links,_embedded`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return NextResponse.next();
    const post = (await res.json()) as { _embedded?: { "wp:term"?: Term[][] } };
    const slug = post._embedded?.["wp:term"]
      ?.flat()
      .find((t) => t.taxonomy === "category" && t.slug !== "slide")?.slug;
    return NextResponse.redirect(new URL(`/${slug ?? "news"}/${id}`, request.url), 308);
  } catch {
    // WordPress unreachable: let the page render; it still sets the right canonical.
    return NextResponse.next();
  }
}

export const config = {
  matcher: "/slide/:id",
};
