import {
  fetchBestSellingProducts,
  sortProductsBySoldOut,
  fetchApi,
  type Category,
  type ProductListResult,
  type Product,
} from "@/lib/api";
import { ProductGrid } from "@/components/ProductGrid";
import type { Metadata } from "next";

function normalizeParams(
  raw: Record<string, string | string[] | undefined>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (!v) continue;
    const s = Array.isArray(v) ? v[0] : v;
    if (s) out[k] = s;
  }
  return out;
}

async function getCategories(): Promise<Category[]> {
  try { return await fetchApi<Category[]>("/categories"); } catch { return []; }
}

async function getBestSelling(categorySlug: string, categories: Category[], params: Record<string, string>): Promise<ProductListResult> {
  try {
    let products = await fetchBestSellingProducts(48);
    const sort = params.sap_xep;

    if (categorySlug.toLowerCase() === "tops" || categorySlug.toLowerCase() === "bottoms") {
      const navGroup = categorySlug.toLowerCase() === "tops" ? "Tops" : "Bottoms";
      const groupCatIds = categories.filter((c) => c.navGroup === navGroup).map((c) => c._id);
      products = products.filter((p) => {
        const pCatId = typeof p.categoryId === "string" ? p.categoryId : (p.categoryId as any)?._id;
        return groupCatIds.includes(pCatId);
      });
    } else {
      const targetCat = categories.find((c) => c.slug === categorySlug);
      if (targetCat) {
        products = products.filter((p) => {
          const pCatId = typeof p.categoryId === "string" ? p.categoryId : (p.categoryId as any)?._id;
          return pCatId === targetCat._id;
        });
      }
    }

    if (sort === "price_asc") products.sort((a, b) => (a.finalPrice ?? a.price) - (b.finalPrice ?? b.price));
    else if (sort === "price_desc") products.sort((a, b) => (b.finalPrice ?? b.price) - (a.finalPrice ?? a.price));
    else if (sort === "newest") products.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());

    return { items: sortProductsBySoldOut(products), total: products.length, page: 1, limit: 48, totalPages: 1 };
  } catch {
    return { items: [], total: 0, page: 1, limit: 48, totalPages: 0 };
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; locale?: string }>;
}): Promise<Metadata> {
  const { category, locale } = await params;
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://fromthestress.vn";
  const localePrefix = locale && locale !== "vi" ? `/${locale}` : "";
  const categories = await getCategories();
  const cat = categories.find((c) => c.slug === category);
  const label = cat?.name ?? (category.charAt(0).toUpperCase() + category.slice(1));
  const url = `${base}${localePrefix}/best-selling/${category}`;
  return {
    title: `Best Selling ${label} | FROM THE STRESS`,
    description: `Những sản phẩm ${label} bán chạy nhất - streetwear phong cách từ FROM THE STRESS.`,
    alternates: {
      canonical: url,
      languages: {
        vi: `${base}/best-selling/${category}`,
        en: `${base}/en/best-selling/${category}`,
      },
    },
    openGraph: { url, images: [{ url: "/images/og_image.jpg", width: 1200, height: 630 }] },
  };
}

export const dynamic = "force-dynamic";

export default async function BestSellingCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { category } = await params;
  const rawSearch = (await searchParams) ?? {};
  const normalizedSearch = normalizeParams(rawSearch);
  const categories = await getCategories();
  const result = await getBestSelling(category, categories, normalizedSearch);
  const cat = categories.find((c) => c.slug === category);
  const label = cat?.name ?? (category.charAt(0).toUpperCase() + category.slice(1));

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
      <h1 className="font-display mb-6 text-2xl tracking-wide sm:text-3xl text-accent">
        BEST SELLING - {label.toUpperCase()}
      </h1>
      <ProductGrid
        initialData={result}
        categories={categories}
        currentParams={normalizedSearch}
        categorySlug={category}
        basePath="/best-selling"
      />
    </div>
  );
}
