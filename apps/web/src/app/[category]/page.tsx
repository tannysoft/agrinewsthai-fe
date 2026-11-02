import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategoryBySlug, getPosts } from "@/lib/wp";
import { categoryCopy, categoryMetadata } from "@/lib/category-meta";
import { PostCard } from "@/components/PostCard";
import { Pagination } from "@/components/Pagination";
import { ArchiveHeader } from "@/components/ArchiveHeader";
import { JsonLd } from "@/components/JsonLd";
import {
  SITE_URL,
  breadcrumbSchema,
  tagCategoryToCollection,
} from "@/lib/schema";

export const revalidate = 300;

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = await getCategoryBySlug(category);
  if (!cat) return { title: "ไม่พบหมวดหมู่" };
  return categoryMetadata(cat);
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params;
  const page = 1;

  const cat = await getCategoryBySlug(slug);
  if (!cat) notFound();

  const { data: posts, total } = await getPosts({
    perPage: 13,
    page,
    categories: cat.id,
  });

  const page1Count = 13;
  const totalPages = total <= page1Count
    ? 1
    : 1 + Math.ceil((total - page1Count) / 12);

  const [lead, second, ...rest] = posts;

  const url = `${SITE_URL}/${slug}`;
  const schemas = [
    tagCategoryToCollection(cat, url),
    breadcrumbSchema([
      { name: "หน้าแรก", url: SITE_URL },
      { name: cat.name, url },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <ArchiveHeader
        title={cat.name}
        description={categoryCopy(cat).description}
        total={total}
      />

      <section className="mx-auto max-w-[1400px] px-4 md:px-6 py-10 md:py-14">
        {posts.length === 0 ? (
          <p className="py-20 text-center text-ink-2">หมวดนี้ยังไม่มีเรื่อง ลองดู<Link href="/news" className="text-leaf underline underline-offset-4">ข่าวเกษตร</Link>แทน</p>
        ) : (
          <>
            {lead && (
              <div className="pb-10 mb-10 border-b border-line">
                <PostCard post={lead} variant="feature" priority showCategory={false} />
              </div>
            )}
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {[second, ...rest].filter(Boolean).map((p) => (
                <PostCard key={p!.id} post={p!} variant="card" showCategory={false} />
              ))}
            </div>
          </>
        )}

        <Pagination currentPage={page} totalPages={Math.min(totalPages, 50)} basePath={`/${slug}`} />
      </section>
    </>
  );
}
