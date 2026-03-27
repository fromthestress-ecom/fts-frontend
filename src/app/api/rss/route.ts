import { NextResponse } from "next/server";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fromthestress.com";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const revalidate = 3600; // Regenerate every hour

export async function GET() {
  let blogs: any[] = [];

  try {
    const res = await fetch(`${BASE}/blogs?limit=50&status=published`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      blogs = data.blogs || [];
    }
  } catch (error) {
    console.error("[RSS Feed] Failed to fetch blogs:", error);
  }

  const items = blogs
    .map((blog) => {
      const pubDate = new Date(blog.publishedAt || blog.createdAt).toUTCString();
      const link = `${SITE}/blogs/${blog.slug}`;
      const description = blog.excerpt || blog.title;
      const authorName =
        typeof blog.authorId === "object" ? blog.authorId?.name : "FROM THE STRESS";
      const categoryName =
        typeof blog.categoryId === "object" ? blog.categoryId?.name : null;

      return `
    <item>
      <title>${escapeXml(blog.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>
      <author>noreply@fromthestress.com (${escapeXml(authorName)})</author>
      ${categoryName ? `<category>${escapeXml(categoryName)}</category>` : ""}
      ${blog.thumbnail ? `<enclosure url="${escapeXml(blog.thumbnail)}" type="image/jpeg" length="0" />` : ""}
    </item>`;
    })
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>FROM THE STRESS - Blog</title>
    <link>${SITE}/blogs</link>
    <description>Cập nhật xu hướng thời trang streetwear, baggy, oversized mới nhất từ FROM THE STRESS.</description>
    <language>vi</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE}/api/rss" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE}/ftsshop.png</url>
      <title>FROM THE STRESS</title>
      <link>${SITE}</link>
    </image>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
