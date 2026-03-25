import {
  fetchApi,
  fetchBestSellingProducts,
  type ProductListResult,
  type Category,
  type Product,
} from "@/lib/api";
import { ProductGrid } from "@/components/ProductGrid";
import type { Metadata } from "next";

async function getBestSelling(): Promise<ProductListResult> {
  try {
    const products = await fetchBestSellingProducts(24); // fetch up to 24 best sellers
    // We wrap this array in the ProductListResult shape so it works with the standard ProductGrid.
    // The ProductGrid expects paginated data, but best-selling is a fixed top-N list.
    // So we'll pass it as a single page result.
    return {
      items: products,
      total: products.length,
      page: 1,
      limit: 24,
      totalPages: 1,
    };
  } catch {
    return { items: [], total: 0, page: 1, limit: 24, totalPages: 0 };
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

export default async function BestSellingPage() {
  const categories = await getCategories();
  const result = await getBestSelling();

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
      <h1 className="font-display mb-6 text-2xl tracking-wide sm:text-3xl text-accent">
        BEST SELLING ITEMS
      </h1>
      <p className="text-muted mb-8 max-w-2xl text-sm">
        Khám phá danh sách các thiết kế streetwear được săn đón nhiều nhất từ
        cộng đồng của chúng tôi.
      </p>

      {/* 
        We pass the fixed list to ProductGrid. 
        It will render the product cards nicely. 
        Note: since we are passing a single-page result, ProductGrid's pagination controls won't show.
        We can also hide category filtering if we want, but ProductGrid handles it automatically if they select.
        However, since best-selling is a fixed backend list, filtering it by appending "?category=" might not work as expected because the /best-selling API doesn't take category params right now. 
        If the user tries to filter on this page, it might just break or ignore.
        Let's pass empty params to ensure it just displays the items.
      */}
      <ProductGrid
        initialData={result}
        categories={categories}
        currentParams={{}}
        basePath="/best-selling"
      />
    </div>
  );
}
