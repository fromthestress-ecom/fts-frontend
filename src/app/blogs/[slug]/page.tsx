import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchApi, type BlogItem } from "@/lib/api";
import { BlogCard } from "@/components/BlogCard";
import { ShareButton } from "@/components/ShareButton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

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
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  try {
    const { blog } = await getBlogData(resolvedParams.slug);
    const title = blog.metaTitle || blog.title;
    const description = blog.metaDescription || blog.excerpt;
    const url = `${process.env.NEXT_PUBLIC_SITE_URL || "https://fromthestress.com"}/blogs/${blog.slug}`;

    return {
      title,
      description,
      alternates: {
        canonical: url,
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
      title: "Blog Not Found",
      description: "Bài viết không tồn tại",
    };
  }
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
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

  // Build JSON-LD Schema
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://fromthestress.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/blogs/${blog.slug}`,
    },
    headline: blog.metaTitle || blog.title,
    description: blog.metaDescription || blog.excerpt,
    image: blog.ogImage || blog.thumbnail,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "FROM THE STRESS",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/ftsshop.png`, // using placeholder standard logo
      },
    },
    datePublished: blog.publishedAt || blog.createdAt,
    dateModified: blog.createdAt,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto max-w-[800px] px-4 py-8 sm:px-6 sm:py-16">
        {/* Header */}
        <header className="mb-10 text-center flex flex-col items-center">
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
            <span>By {authorName}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-border border border-muted"></span>
            <span>{dateStr}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-border border border-muted"></span>
            <span>{blog.readingTime || 1} Min Read</span>
          </div>
        </header>

        {/* Full Width Hero Image */}
        {blog.thumbnail && (
          <div className="relative aspect-video w-full overflow-hidden mb-12 bg-surface">
            <img
              src={blog.thumbnail}
              alt={blog.title}
              className="object-cover w-full h-full block"
            />
          </div>
        )}

        {/* 12-Column Grid Layout for Editorial Feel */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 max-w-[1200px] mx-auto px-4 md:px-0">
          {/* Main Content (Centered/Constrained) */}
          <div className="col-span-12 md:col-span-8">
            <div className="blog-content prose prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {blog.content}
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
                Back to Journal
              </Link>

              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-muted uppercase tracking-widest">
                  Share:
                </span>
                <div className="flex gap-2">
                  <ShareButton />
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Sidebar (Desktop Only) */}
          <aside className="hidden md:block col-span-4 pl-4 border-l border-border">
            <div className="sticky top-24 space-y-12 h-[calc(100vh-100px)] overflow-y-auto pb-12 sidebar-scrollbar-hide">
              {/* Newsletter Stub */}
              <div className="bg-surface rounded-xl p-6 border border-border">
                <h3 className="font-display text-xl uppercase tracking-wider mb-2">
                  The Dispatch
                </h3>
                <p className="text-sm text-muted mb-6">
                  Join our inner circle. Editorial features, early access drops,
                  and studio insights delivered weekly.
                </p>
                <form className="flex flex-col gap-3">
                  <input
                    type="email"
                    placeholder="ENTER YOUR EMAIL"
                    className="bg-bg border border-border rounded px-4 py-3 text-sm focus:border-accent outline-none"
                  />
                  <button className="bg-text text-bg uppercase font-bold text-sm tracking-widest py-3 rounded hover:bg-accent hover:text-white transition-colors">
                    Subscribe
                  </button>
                </form>
              </div>

              {/* Tag Cloud Overview could go here based on all tags but keeping simple for now */}
              <div className="pt-8 border-t border-border">
                <p className="text-xs font-bold uppercase tracking-widest text-muted mb-4">
                  Share This Article
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
              Related Editorial
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
