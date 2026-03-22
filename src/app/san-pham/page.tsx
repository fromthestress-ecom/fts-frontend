import { fetchApi, type ProductListResult, type Category } from "@/lib/api";
import { ProductGrid } from "@/components/ProductGrid";
import { TrackViewItemList } from "@/components/TrackViewItemList";
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

/** Map nav slugs to backend category slug when slug is not a category in DB. */
const NAV_SLUG_TO_CATEGORY_SLUG: Record<string, string> = {
  boxy: "ao-thun",
  "baby-tee": "ao-thun",
  oversize: "ao-thun",
  cargo: "quan",
  shorts: "quan",
  jeans: "quan",
  "heavy-crown": "ao-hoodie",
  "gen-stress": "ao-thun",
};

const OBJECT_ID_REGEX = /^[a-fA-F0-9]{24}$/;

function resolveCategoryId(
  params: Record<string, string>,
  categories: Category[],
): string | undefined {
  const v = params.danh_muc;
  if (!v) return undefined;
  if (v.toLowerCase() === "tops" || v.toLowerCase() === "bottoms")
    return undefined; // Special nav groups handled separately
  if (OBJECT_ID_REGEX.test(v)) return v;
  let cat = categories.find((c) => c.slug === v);
  if (cat) return cat._id;
  const categorySlug = NAV_SLUG_TO_CATEGORY_SLUG[v];
  if (categorySlug) cat = categories.find((c) => c.slug === categorySlug);
  return cat?._id;
}

/** Resolve current filter to category slug for dropdown display (URL uses slug). */
function resolveCategorySlug(
  params: Record<string, string>,
  categories: Category[],
): string | undefined {
  const v = params.danh_muc;
  if (!v) return undefined;
  if (v.toLowerCase() === "tops") return "tops";
  if (v.toLowerCase() === "bottoms") return "bottoms";
  if (OBJECT_ID_REGEX.test(v)) {
    const cat = categories.find((c) => c._id === v);
    return cat?.slug;
  }
  if (categories.some((c) => c.slug === v)) return v;
  return NAV_SLUG_TO_CATEGORY_SLUG[v];
}

async function getProducts(
  searchParams: Record<string, string>,
  categories: Category[],
): Promise<ProductListResult> {
  const page = searchParams.page ?? "1";
  const categoryId = resolveCategoryId(searchParams, categories);
  const v = searchParams.danh_muc;
  let navGroup = "";
  if (v && (v.toLowerCase() === "tops" || v.toLowerCase() === "bottoms")) {
    navGroup = v.toLowerCase() === "tops" ? "Tops" : "Bottoms";
  }
  const q = (searchParams.q ?? "").trim();
  const sort = searchParams.sap_xep ?? "";
  const params = new URLSearchParams({ page, limit: "12" });
  if (categoryId) params.set("category", categoryId);
  if (navGroup) params.set("navGroup", navGroup);
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

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const params = normalizeParams(raw);
  const categories = await getCategories();
  const result = await getProducts(params, categories);
  const effectiveCategorySlug = resolveCategorySlug(params, categories);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
      <TrackViewItemList products={result.items} listName="Sản phẩm" />
      <h1 className="font-display mb-6 text-2xl tracking-wide sm:text-3xl">
        SẢN PHẨM
      </h1>
      <ProductGrid
        initialData={result}
        categories={categories}
        currentParams={params}
        effectiveCategorySlug={effectiveCategorySlug}
        basePath="/san-pham"
      />
    </div>
  );
}
