import type { MetadataRoute } from 'next';
import { fetchApi } from '@/lib/api';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fromthestress.vn';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 1. Static Pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/san-pham`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/blogs`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/best-selling`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/ve-chung-toi`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/lien-he`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/doi-tac`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/chinh-sach-bao-mat`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/chinh-sach-doi-tra`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/chinh-sach-gioi-thieu`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/chinh-sach-van-chuyen`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/huong-dan-mua-hang`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  // 2. Fetch Dynamic Data
  let productSlugs: { slug: string; updatedAt?: string }[] = [];
  let blogSlugs: { slug: string; updatedAt?: string }[] = [];

  try {
    const [products, blogsData] = await Promise.all([
      fetchApi<{ slug: string; updatedAt?: string }[]>("/products/slugs"),
      fetchApi<any>("/blogs?limit=500"),
    ]);
    productSlugs = products;
    blogSlugs = blogsData.blogs || [];
  } catch (error) {
    console.error("Sitemap data fetch failed:", error);
  }

  // 3. Map Dynamic Pages
  const productPages: MetadataRoute.Sitemap = productSlugs.map((p) => ({
    url: `${BASE}/san-pham/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((b) => ({
    url: `${BASE}/blogs/${b.slug}`,
    lastModified: b.updatedAt ? new Date(b.updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...blogPages];
}
