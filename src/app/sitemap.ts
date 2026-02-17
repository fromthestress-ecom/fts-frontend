import type { MetadataRoute } from 'next';
import { fetchApi } from '@/lib/api';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/san-pham`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/gio-hang`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  let productSlugs: { slug: string }[] = [];
  try {
    productSlugs = await fetchApi<{ slug: string }[]>('/products/slugs');
  } catch {
    // ignore
  }

  const productPages: MetadataRoute.Sitemap = productSlugs.map(({ slug }) => ({
    url: `${BASE}/san-pham/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...productPages];
}
