import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { getAuthorBySlug, getPosts } from "@/lib/wp";
import { PostCard } from "@/components/PostCard";
import { Pagination } from "@/components/Pagination";
import { ArchiveHeader } from "@/components/ArchiveHeader";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL, breadcrumbSchema } from "@/lib/schema";

export const revalidate = 900;

type Props = { params: Promise<{ slug: string }> };

const PER_PAGE = 12;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) return { title: "ไม่พบผู้เขียน" };
  const url = `${SITE_URL}/author/${slug}`;
  const description = author.description || `เรื่องทั้งหมดโดย ${author.name} จากเรื่องเล่าข่าวเกษตร`;
  return {
    title: `${author.name} ผู้เขียน`,
    description,
    alternates: { canonical: url },
    openGraph: { type: "profile", url, title: author.name, description, locale: "th_TH" },
  };
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  // Old WordPress author URLs of staff without a public byline go to the news desk.
  if (!author) permanentRedirect("/news");

  const { data: posts, total, totalPages } = await getPosts({ authorId: author.id, perPage: PER_PAGE, page: 1 });
  if (!posts.length) notFound();

  const url = `${SITE_URL}/author/${slug}`;
  return (
    <>
      <JsonLd
        data={[
          { "@context": "https://schema.org", "@type": "ProfilePage", url, mainEntity: { "@type": "Person", name: author.name, url } },
          breadcrumbSchema([
            { name: "หน้าแรก", url: SITE_URL },
            { name: author.name, url },
          ]),
        ]}
      />
      <ArchiveHeader title={author.name} description={author.description || undefined} total={total} />

      <section className="mx-auto max-w-[1400px] px-4 md:px-6 py-10 md:py-14">
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <PostCard key={p.id} post={p} variant="card" priority={i < 3} />
          ))}
        </div>
        <Pagination currentPage={1} totalPages={totalPages} basePath={`/author/${slug}`} />
      </section>
    </>
  );
}
