import {
  fetchApi,
  fetchBestSellingProducts,
  type ProductListResult,
  type Category,
  type Product,
} from "@/lib/api";
import { ProductGrid } from "@/components/ProductGrid";
import type { Metadata } from "next";

/** Normalize searchParams: Next.js may give string | string[]; use single string. */
function normalizeParams(
  raw: Record<string, string | string[] | undefined>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (v === undefined || v === null) continue;
    const s = Array.isArray(v) ? v[0] : v;
    if (s !== undefined && s !== "") out[k] = s;
  }
  return out;
}

async function getBestSelling(params: Record<string, string>, categories: Category[]): Promise<ProductListResult> {
  try {
    let products = await fetchBestSellingProducts(48); // fetch more to allow filtering

    const categoryId = params.danh_muc;
    const sort = params.sap_xep;

    // Local filtering by category slug or ID
    if (categoryId) {
      const targetCategory = categories.find(c => c.slug === categoryId || c._id === categoryId);
      if (targetCategory) {
        products = products.filter(p => {
          const pCatId = typeof p.categoryId === 'string' ? p.categoryId : p.categoryId?._id;
          return pCatId === targetCategory._id;
        });
      } else if (categoryId.toLowerCase() === "tops" || categoryId.toLowerCase() === "bottoms") {
        const navGroup = categoryId.toLowerCase() === "tops" ? "Tops" : "Bottoms";
        const groupCatIds = categories.filter(c => c.navGroup === navGroup).map(c => c._id);
        products = products.filter(p => {
          const pCatId = typeof p.categoryId === 'string' ? p.categoryId : p.categoryId?._id;
          return groupCatIds.includes(pCatId!);
        });
      }
    }

    // Local sorting
    if (sort === "price_asc") {
      products.sort((a, b) => (a.finalPrice ?? a.price) - (b.finalPrice ?? b.price));
    } else if (sort === "price_desc") {
      products.sort((a, b) => (b.finalPrice ?? b.price) - (a.finalPrice ?? a.price));
    } else if (sort === "newest") {
      products.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
    }

    return {
      items: products,
      total: products.length,
      page: 1,
      limit: 48,
      totalPages: 1,
    };
  } catch (error) {
    console.error("Failed to fetch best selling products:", error);
    return { items: [], total: 0, page: 1, limit: 48, totalPages: 0 };
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    return await fetchApi<Category[]>("/categories");
  } catch {
    return [];
  }
}

export const metadata: Metadata = {
  title: "Best Selling Items",
  description:
    "Những sản phẩm streetwear bán chạy nhất của chúng tôi - hoodie, tee, jogger, sneaker.",
  openGraph: {
    title: "Best Sellers | STREETWEAR",
    description: "Những sản phẩm bán chạy nhất hiện tại.",
  },
};

export const dynamic = "force-dynamic";

export default async function BestSellingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const params = normalizeParams(raw);
  const categories = await getCategories();
  const result = await getBestSelling(params, categories);

  const effectiveCategorySlug = params.danh_muc;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
      <h1 className="font-display mb-6 text-2xl tracking-wide sm:text-3xl text-accent">
        BEST SELLING ITEMS
      </h1>
      <p className="text-muted mb-8 max-w-2xl text-sm">
        Khám phá danh sách các thiết kế streetwear được săn đón nhiều nhất từ
        cộng đồng của chúng tôi.
      </p>

      <ProductGrid
        initialData={result}
        categories={categories}
        currentParams={params}
        effectiveCategorySlug={effectiveCategorySlug}
        basePath="/best-selling"
      />
    </div>
  );
}
