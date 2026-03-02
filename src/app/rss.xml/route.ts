import { fetchApi } from "@/lib/api";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fromthestress.com";

export async function GET() {
  try {
    const data = await fetchApi<any>("/blogs?limit=50");
    const blogs = data.blogs || [];

    const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>FROM THE STRESS - Journal</title>
    <link>${BASE_URL}/blogs</link>
    <description>The latest streetwear editorials, lookbooks, and insights from FROM THE STRESS.</description>
    <language>vi</language>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    ${blogs
      .map(
        (blog: any) => `
    <item>
      <title><![CDATA[${blog.title}]]></title>
      <link>${BASE_URL}/blogs/${blog.slug}</link>
      <guid>${BASE_URL}/blogs/${blog.slug}</guid>
      <pubDate>${new Date(blog.publishedAt || blog.createdAt).toUTCString()}</pubDate>
      <description><![CDATA[${blog.excerpt}]]></description>
      ${blog.thumbnail ? `<enclosure url="${blog.thumbnail.replace(/&/g, "&amp;")}" type="image/jpeg" />` : ""}
    </item>`
      )
      .join("")}
  </channel>
</rss>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "text/xml",
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate",
      },
    });
  } catch (err) {
    console.error("RSS generation failed:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
