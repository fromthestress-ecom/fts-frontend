import type { MetadataRoute } from 'next';
import { fetchApi } from '@/lib/api';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fromthestress.vn';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const getAlternates = (path: string) => ({
    languages: {
      vi: `${BASE}${path}`,
      en: `${BASE}/en${path}`,
    },
  });

  // 1. Static Pages
  const staticPaths = [
    { path: "", priority: 1.0, freq: "daily" as const },
    { path: "/san-pham", priority: 0.9, freq: "daily" as const },
    { path: "/blogs", priority: 0.9, freq: "daily" as const },
    { path: "/best-selling", priority: 0.8, freq: "daily" as const },
    { path: "/ve-chung-toi", priority: 0.7, freq: "monthly" as const },
    { path: "/lien-he", priority: 0.7, freq: "monthly" as const },
    { path: "/doi-tac", priority: 0.6, freq: "monthly" as const },
    { path: "/chinh-sach-bao-mat", priority: 0.3, freq: "yearly" as const },
    { path: "/chinh-sach-doi-tra", priority: 0.3, freq: "yearly" as const },
    { path: "/chinh-sach-gioi-thieu", priority: 0.3, freq: "yearly" as const },
    { path: "/chinh-sach-van-chuyen", priority: 0.3, freq: "yearly" as const },
    { path: "/huong-dan-mua-hang", priority: 0.5, freq: "monthly" as const },
  ];

  const staticPages: MetadataRoute.Sitemap = staticPaths.map((item) => ({
    url: `${BASE}${item.path}`,
    lastModified: now,
    changeFrequency: item.freq,
    priority: item.priority,
    alternates: getAlternates(item.path),
  }));

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
    alternates: getAlternates(`/san-pham/${p.slug}`),
  }));

  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((b) => ({
    url: `${BASE}/blogs/${b.slug}`,
    lastModified: b.updatedAt ? new Date(b.updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.7,
    alternates: getAlternates(`/blogs/${b.slug}`),
  }));

  return [...staticPages, ...productPages, ...blogPages];
}
