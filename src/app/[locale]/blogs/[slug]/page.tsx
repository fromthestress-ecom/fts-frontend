import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchApi, type BlogItem } from "@/lib/api";
import { BlogCard } from "@/components/BlogCard";
import { ShareButton } from "@/components/ShareButton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { getTranslations } from 'next-intl/server';
import { TableOfContents } from "@/components/TableOfContents";
import { extractHeadings, extractText, generateSlug } from "@/lib/toc";
import { EmbeddedProduct } from "@/components/EmbeddedProduct";

export const revalidate = 60; // Cache for 60s

async function getBlogData(
  slug: string,
): Promise<{ blog: BlogItem; relatedBlogs: BlogItem[] }> {
  try {
    return await fetchApi<{ blog: BlogItem; relatedBlogs: BlogItem[] }>(
      `/blogs/${slug}`,
      {
        next: { revalidate: 60 },
      },
    );
  } catch (error: any) {
    if (error.message === "Blog not found") notFound();
    console.error(`[BlogDetail Error - slug: ${slug}]:`, error);
    throw error;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale?: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const t = await getTranslations('blogDetails');
  try {
    const { blog } = await getBlogData(resolvedParams.slug);
    const title = blog.metaTitle || blog.title;
    const description = blog.metaDescription || blog.excerpt;
    const base = process.env.NEXT_PUBLIC_SITE_URL || "https://fromthestress.vn";
    const localePrefix = resolvedParams.locale && resolvedParams.locale !== 'vi' ? `/${resolvedParams.locale}` : '';
    const url = `${base}${localePrefix}/blogs/${blog.slug}`;

    return {
      title,
      description,
      alternates: {
        canonical: url,
        languages: {
          vi: `${base}/blogs/${blog.slug}`,
          en: `${base}/en/blogs/${blog.slug}`,
        },
      },
      openGraph: {
        title,
        description,
        url,
        type: "article",
        publishedTime: blog.publishedAt || blog.createdAt,
        authors: [
          typeof blog.authorId === "object"
            ? (blog.authorId as any).name
            : "FROM THE STRESS",
        ],
        images:
          blog.ogImage || blog.thumbnail
            ? [blog.ogImage || (blog.thumbnail as string)]
            : [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images:
          blog.ogImage || blog.thumbnail
            ? [blog.ogImage || (blog.thumbnail as string)]
            : [],
      },
    };
  } catch {
    return {
      title: t('notFoundTitle'),
      description: t('notFoundDesc'),
    };
  }
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = await getTranslations('blogDetails');
  let data;
  try {
    data = await getBlogData(slug);
  } catch {
    notFound();
  }

  const { blog, relatedBlogs } = data;
  const dateStr = new Date(
    blog.publishedAt || blog.createdAt,
  ).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const categoryName =
    typeof blog.categoryId === "object" && "name" in blog.categoryId
      ? blog.categoryId.name
      : null;
  const authorName =
    typeof blog.authorId === "object"
      ? (blog.authorId as any).name
      : "FROM THE STRESS";

  // Build JSON-LD Schemas
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://fromthestress.com";
  const wordCount = blog.content ? blog.content.split(/\s+/).length : 0;

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/blogs/${blog.slug}`,
    },
    headline: blog.metaTitle || blog.title,
    description: blog.metaDescription || blog.excerpt,
    image: blog.ogImage || blog.thumbnail,
    wordCount,
    ...(categoryName ? { articleSection: categoryName } : {}),
    inLanguage: "vi-VN",
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "FROM THE STRESS",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/ftsshop.png`,
      },
    },
    datePublished: blog.publishedAt || blog.createdAt,
    dateModified: blog.updatedAt || blog.createdAt,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${baseUrl}/blogs`,
      },
      ...(categoryName
        ? [{
            "@type": "ListItem",
            position: 3,
            name: categoryName,
            item: `${baseUrl}/blogs?category=${typeof blog.categoryId === "object" ? (blog.categoryId as any).slug : ""}`,
          }, {
            "@type": "ListItem",
            position: 4,
            name: blog.title,
            item: `${baseUrl}/blogs/${blog.slug}`,
          }]
        : [{
            "@type": "ListItem",
            position: 3,
            name: blog.title,
            item: `${baseUrl}/blogs/${blog.slug}`,
          }]
      ),
    ],
  };

  const parsedContent = blog.content.replace(/::product\{slug="([^"]+)"\}/g, '<product-embed slug="$1"></product-embed>');
  const headings = blog.showToc !== false ? extractHeadings(parsedContent) : [];
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <article className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 sm:py-16">
        {/* Header */}
        <header className="mb-10 text-center flex flex-col items-center max-w-[800px] mx-auto">
          {categoryName && (
            <Link
              href={`/blogs?category=${typeof blog.categoryId === "object" ? blog.categoryId.slug : ""}`}
            >
              <span className="text-xs font-bold text-bg bg-text tracking-widest uppercase px-4 py-1.5 rounded-full mb-6 inline-block hover:bg-accent hover:text-bg hover:border-accent transition-colors border border-text">
                {categoryName}
              </span>
            </Link>
          )}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight leading-tight mb-6 m-0">
            {blog.title}
          </h1>
          <div className="flex items-center justify-center gap-4 text-xs sm:text-sm text-muted font-bold tracking-widest uppercase">
            <span>{t('by')} {authorName}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-border border border-muted"></span>
            <span>{dateStr}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-border border border-muted"></span>
            <span>{blog.readingTime || 1} {t('minRead')}</span>
          </div>
        </header>

        {/* 12-Column Grid Layout for Editorial Feel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content (Centered/Constrained) */}
          <div className="lg:col-span-8">
            {blog.bannerImage ? (
              <div className="relative aspect-video w-full overflow-hidden mb-10 bg-surface rounded-xl">
                <img
                  src={blog.bannerImage}
                  alt={blog.title}
                  className="object-cover w-full h-full block hover:scale-105 transition-transform duration-700"
                />
              </div>
            ) : blog.thumbnail && (
              <div className="relative aspect-video w-full overflow-hidden mb-10 bg-surface rounded-xl">
                <img
                  src={blog.thumbnail}
                  alt={blog.title}
                  className="object-cover w-full h-full block hover:scale-105 transition-transform duration-700"
                />
              </div>
            )}

            <div className="blog-content prose prose-invert max-w-none text-base sm:text-lg leading-relaxed text-text/90">
              {/* Optional inline TOC inside article on mobile */}
              <div className="md:hidden mb-8">
                {blog.showToc !== false && <TableOfContents headings={headings} />}
              </div>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  // @ts-expect-error - Custom HTML component mapped in rehypeRaw
                  "product-embed": ({node, slug, ...props}: any) => {
                    return <EmbeddedProduct slug={slug} />;
                  },
                  h2: ({node, children, ...props}) => {
                    const id = generateSlug(extractText(children));
                    return <h2 id={id} className="scroll-mt-24" {...props}>{children}</h2>;
                  },
                  h3: ({node, children, ...props}) => {
                    const id = generateSlug(extractText(children));
                    return <h3 id={id} className="scroll-mt-24" {...props}>{children}</h3>;
                  },
                  h4: ({node, children, ...props}) => {
                    const id = generateSlug(extractText(children));
                    return <h4 id={id} className="scroll-mt-24" {...props}>{children}</h4>;
                  },
                  p: ({node, children, ...props}: any) => {
                    return <div className="mb-4 leading-relaxed" {...props}>{children}</div>;
                  }
                }}
              >
                {parsedContent}
              </ReactMarkdown>
            </div>

            {/* Tags display */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-12 pt-6 border-t border-border">
                {blog.tags.map((tag: any) => (
                  <Link
                    key={tag._id}
                    href={`/blogs?tag=${tag.slug}`}
                    className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-surface border border-border rounded hover:border-accent hover:text-accent transition-colors"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Footer actions inside the column */}
            <div className="mt-8 pt-8 border-t border-border flex justify-between items-center sm:flex-row flex-col gap-4">
              <Link
                href="/blogs"
                className="font-semibold text-text hover:text-accent flex items-center gap-2 uppercase text-sm tracking-widest"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                {t('backToJournal')}
              </Link>

              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-muted uppercase tracking-widest">
                  {t('share')}
                </span>
                <div className="flex gap-2">
                  <ShareButton />
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Sidebar (Desktop Only) */}
          <aside className="hidden lg:block lg:col-span-4 lg:pl-6">
            <div className="sticky top-24 space-y-12 h-[calc(100vh-100px)] overflow-y-auto pb-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {blog.showToc !== false && headings.length > 0 && (
                <TableOfContents headings={headings} />
              )}
              {/* Newsletter Stub */}
              <div className="bg-surface rounded-xl p-6 border border-border">
                <h3 className="font-display text-xl uppercase tracking-wider mb-2">
                  {t('theDispatch')}
                </h3>
                <p className="text-sm text-muted mb-6">
                  {t('dispatchDesc')}
                </p>
                <form className="flex flex-col gap-3">
                  <input
                    type="email"
                    placeholder={t('enterEmail')}
                    className="bg-bg border border-border rounded px-4 py-3 text-sm focus:border-accent outline-none"
                  />
                  <button className="bg-text text-bg uppercase font-bold text-sm tracking-widest py-3 rounded hover:bg-accent hover:text-white transition-colors">
                    {t('subscribe')}
                  </button>
                </form>
              </div>

              {/* Tag Cloud Overview could go here based on all tags but keeping simple for now */}
              <div className="pt-8 border-t border-border">
                <p className="text-xs font-bold uppercase tracking-widest text-muted mb-4">
                  {t('shareThisArticle')}
                </p>
                <div className="flex gap-2">
                  <ShareButton />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </article>

      {/* Related Posts */}
      {relatedBlogs?.length > 0 && (
        <section className="bg-surface border-t border-border mt-12">
          <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6">
            <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-wide mb-10 text-center text-text m-0">
              {t('relatedEditorial')}
            </h2>
            <ul className="grid list-none grid-cols-1 gap-6 p-0 m-0 sm:grid-cols-3">
              {relatedBlogs.map((b) => (
                <li key={b._id}>
                  <BlogCard blog={b} headingLevel="h3" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
