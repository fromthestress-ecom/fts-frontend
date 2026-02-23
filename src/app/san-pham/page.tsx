import { fetchApi, type ProductListResult, type Category } from "@/lib/api";
import { ProductGrid } from "@/components/ProductGrid";
import type { Metadata } from "next";

async function getProducts(
  searchParams: Record<string, string | undefined>,
): Promise<ProductListResult> {
  const page = searchParams.page ?? "1";
  const category = searchParams.danh_muc ?? "";
  const q = searchParams.q ?? "";
  const sort = searchParams.sap_xep ?? "";
  const params = new URLSearchParams({ page, limit: "12" });
  if (category) params.set("category", category);
  if (q) params.set("q", q);
  if (sort) params.set("sort", sort);
  try {
    return await fetchApi<ProductListResult>(`/products?${params}`);
  } catch {
    return { items: [], total: 0, page: 1, limit: 12, totalPages: 0 };
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
  title: "Sản phẩm",
  description:
    "Danh sách sản phẩm thời trang streetwear - áo hoodie, tee, quần jogger.",
  openGraph: {
    title: "Sản phẩm | STREETWEAR",
    description: "Danh sách sản phẩm thời trang streetwear.",
  },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const [result, categories] = await Promise.all([
    getProducts(params),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
      <h1 className="font-display mb-6 text-2xl tracking-wide sm:text-3xl">
        SẢN PHẨM
      </h1>
      <ProductGrid
        initialData={result}
        categories={categories}
        currentParams={params}
        basePath="/san-pham"
      />
    </div>
  );
}
