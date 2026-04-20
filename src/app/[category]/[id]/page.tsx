import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  formatThaiDate,
  getAuthor,
  getFeaturedImage,
  getPostById,
  getPostHref,
  getPosts,
  getPrimaryCategory,
  stripHtml,
  WPTerm,
} from "@/lib/wp";
import { PostCard } from "@/components/PostCard";
import { SectionHeader } from "@/components/SectionHeader";
import { FacebookIcon, LineIcon, XIcon } from "@/components/icons";

export const revalidate = 300;

type Props = { params: Promise<{ category: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isFinite(postId) || postId <= 0) return { title: "ไม่พบบทความ" };
  const post = await getPostById(postId);
  if (!post) return { title: "ไม่พบบทความ" };
  const title = stripHtml(post.title.rendered);
  const description = stripHtml(post.excerpt.rendered).slice(0, 180);
  const img = getFeaturedImage(post, "large");
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.modified,
      images: img ? [{ url: img.src, width: img.width, height: img.height }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: img ? [img.src] : [],
    },
  };
}

function readingTime(html: string) {
  const text = stripHtml(html);
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(wordCount / 180));
}

export default async function PostPage({ params }: Props) {
  const { category: categorySlug, id } = await params;
  const postId = Number(id);
  if (!Number.isFinite(postId) || postId <= 0) notFound();

  const post = await getPostById(postId);
  if (!post) notFound();

  // Canonicalise: if URL category doesn't match the post's primary category,
  // redirect to the canonical WordPress-style URL.
  const canonical = getPostHref(post);
  if (canonical !== `/${categorySlug}/${post.id}`) redirect(canonical);

  const title = stripHtml(post.title.rendered);
  const img = getFeaturedImage(post, "large");
  const category = getPrimaryCategory(post);
  const author = getAuthor(post);
  const terms: WPTerm[] = post._embedded?.["wp:term"]?.flat() ?? [];
  const tags = terms.filter((t) => t.taxonomy === "post_tag");
  const mins = readingTime(post.content.rendered);

  const { data: related } = category
    ? await getPosts({ perPage: 6, categories: category.id, exclude: post.id })
    : { data: [] };

  const shareUrl = `https://agrinewsthai.com${canonical}`;

  return (
    <article className="relative">
      {/* ARTICLE MASTHEAD */}
      <header className="relative bg-paper border-b-2 border-ink">
        <div className="mx-auto max-w-[1400px] px-6 pt-10 md:pt-16 pb-12 md:pb-20 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-7 flex flex-col min-w-0">
            <nav
              className="font-[var(--font-stamp)] text-[10px] uppercase tracking-[0.2em] md:tracking-[0.25em] text-ink-muted flex items-center gap-2 w-full max-w-full overflow-hidden"
              aria-label="breadcrumb"
              style={{ whiteSpace: "nowrap" }}
            >
              <Link href="/" className="hover:text-moss-700 shrink-0 hidden sm:inline">
                หน้าแรก
              </Link>
              <span className="shrink-0 hidden sm:inline">›</span>
              {category && (
                <>
                  <Link
                    href={`/${category.slug}`}
                    className="hover:text-moss-700 shrink-0"
                  >
                    {category.name}
                  </Link>
                  <span className="shrink-0">›</span>
                </>
              )}
              <span
                className="normal-case truncate min-w-0 flex-1"
                title={title}
              >
                {title}
              </span>
            </nav>

            <div className="mt-8 flex items-center gap-3">
              {category && <span className="stamp stamp-filled tilt-l">{category.name}</span>}
              <span className="issue-num text-[11px] uppercase tracking-widest">
                · {formatThaiDate(post.date)}
              </span>
            </div>

            <h1 className="mt-6 font-display font-extrabold leading-[1.15] tracking-[-0.015em] text-ink text-[clamp(1.75rem,3.6vw,2.75rem)]">
              {title}
            </h1>

            <div className="mt-auto pt-10 grid grid-cols-2 md:grid-cols-3 gap-6 border-t border-ink/30">
              <div>
                <div className="font-[var(--font-stamp)] text-[10px] uppercase tracking-[0.25em] text-ink-muted">
                  ผู้เขียน
                </div>
                <div className="mt-2 font-display font-semibold">
                  {author?.name ?? "กองบรรณาธิการ"}
                </div>
              </div>
              <div>
                <div className="font-[var(--font-stamp)] text-[10px] uppercase tracking-[0.25em] text-ink-muted">
                  เวลาอ่าน
                </div>
                <div className="mt-2 issue-num font-bold">{mins} min</div>
              </div>
              <div>
                <div className="font-[var(--font-stamp)] text-[10px] uppercase tracking-[0.25em] text-ink-muted">
                  อัปเดต
                </div>
                <div className="mt-2 issue-num">{formatThaiDate(post.modified)}</div>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 relative">
            {img && (
              <div className="relative aspect-[4/3] md:aspect-[4/3] w-full ring-1 ring-ink bg-paper-alt overflow-hidden">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover duo"
                />
              </div>
            )}
            <div className="absolute -top-5 -right-5 stamp stamp-filled tilt-lg-r shadow-page hidden md:inline-block">
              Field Dispatch
            </div>
            <div className="mt-4 font-[var(--font-stamp)] text-[10px] uppercase tracking-[0.25em] text-ink-muted text-right">
              Photography · กองบรรณาธิการ
            </div>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="relative bg-paper">
        <div className="mx-auto max-w-[1400px] px-6 py-16 md:py-24 grid md:grid-cols-12 gap-12">
          {/* Sticky margin rail */}
          <aside className="md:col-span-3 order-2 md:order-1">
            <div className="md:sticky md:top-8 space-y-8">
              <div>
                <div className="font-[var(--font-stamp)] text-[10px] uppercase tracking-[0.25em] text-moss-700">
                  Share
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-2.5 border border-ink px-3 py-2 hover:bg-ink hover:text-paper text-xs font-[var(--font-stamp)] uppercase tracking-wider"
                  >
                    <FacebookIcon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">Facebook</span>
                    <span aria-hidden>→</span>
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${encodeURIComponent(title)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-2.5 border border-ink px-3 py-2 hover:bg-ink hover:text-paper text-xs font-[var(--font-stamp)] uppercase tracking-wider"
                  >
                    <XIcon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">X / Twitter</span>
                    <span aria-hidden>→</span>
                  </a>
                  <a
                    href={`https://social-plugins.line.me/lineit/share?url=${shareUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-2.5 border border-ink bg-lime px-3 py-2 hover:bg-ink hover:text-paper text-xs font-[var(--font-stamp)] uppercase tracking-wider"
                  >
                    <LineIcon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">LINE</span>
                    <span aria-hidden>→</span>
                  </a>
                </div>
              </div>

              {tags.length > 0 && (
                <div>
                  <div className="font-[var(--font-stamp)] text-[10px] uppercase tracking-[0.25em] text-moss-700">
                    Tags
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {tags.slice(0, 10).map((t) => (
                      <Link
                        key={t.id}
                        href={`/tag/${t.slug}`}
                        className="text-xs border border-ink/40 px-2 py-0.5 font-display hover:border-ink hover:bg-lime transition-colors"
                      >
                        #{t.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="font-[var(--font-stamp)] text-[10px] uppercase tracking-[0.25em] text-moss-700">
                  Issued
                </div>
                <div className="mt-3 issue-num text-sm text-ink">
                  {formatThaiDate(post.date)}
                </div>
              </div>
            </div>
          </aside>

          <div className="md:col-span-9 order-1 md:order-2">
            <div
              className="wp-content dropcap"
              dangerouslySetInnerHTML={{ __html: post.content.rendered }}
            />
          </div>
        </div>
      </div>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="bg-paper-alt border-t-2 border-ink">
          <div className="mx-auto max-w-[1400px] px-6 py-16 md:py-24">
            <SectionHeader
              no="VI"
              eyebrow={category ? `More from · ${category.name}` : "More"}
              title="อ่านเรื่องที่เกี่ยวข้อง"
              href={category ? `/${category.slug}` : undefined}
            />
            <div className="grid gap-10 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.slice(0, 3).map((p) => (
                <PostCard key={p.id} post={p} variant="card" />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
