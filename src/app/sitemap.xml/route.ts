import { fetchApi } from "@/lib/api";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fromthestress.com";

export async function GET() {
  try {
    // Fetch all published blogs (Setting a high limit to get all for sitemap)
    const data = await fetchApi<any>("/blogs?limit=1000");

    const blogs = data.blogs || [];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/blogs</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  ${blogs
    .map(
      (blog: any) => `
  <url>
    <loc>${BASE_URL}/blogs/${blog.slug}</loc>
    <lastmod>${new Date(blog.updatedAt || blog.createdAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join("")}
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "text/xml",
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate",
      },
    });
  } catch (err) {
    console.error("Sitemap generation failed:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
