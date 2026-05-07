import { notFound, redirect } from "next/navigation";
import { fetchApi, type ProductListResult, type Category, type EventItem, type Product, getProductUrl } from "@/lib/api";
import { ProductGrid } from "@/components/ProductGrid";
import { TrackViewItemList } from "@/components/TrackViewItemList";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

const NAV_SLUG_TO_CATEGORY_SLUG: Record<string, string> = {
  boxy: "ao-thun", "baby-tee": "ao-thun", oversize: "ao-thun",
  cargo: "quan", shorts: "quan", jeans: "quan",
  "heavy-crown": "ao-hoodie", "gen-stress": "ao-thun",
};
const NAV_GROUPS = ["tops", "bottoms"];

async function getCategories(): Promise<Category[]> {
  try { return await fetchApi<Category[]>("/categories"); } catch { return []; }
}

async function getEvents(): Promise<EventItem[]> {
  try { return await fetchApi<EventItem[]>("/events"); } catch { return []; }
}

function isCategorySlug(slug: string, categories: Category[]): boolean {
  if (NAV_GROUPS.includes(slug.toLowerCase())) return true;
  if (categories.some((c) => c.slug === slug)) return true;
  if (NAV_SLUG_TO_CATEGORY_SLUG[slug]) return true;
  return false;
}

async function getCategoryProducts(
  categorySlug: string,
  categories: Category[],
  searchParams: Record<string, string>,
): Promise<ProductListResult> {
  const page = searchParams.page ?? "1";
  const q = (searchParams.q ?? "").trim();
  const sort = searchParams.sap_xep ?? "";
  const params = new URLSearchParams({ page, limit: "12" });

  if (NAV_GROUPS.includes(categorySlug.toLowerCase())) {
    params.set("navGroup", categorySlug.toLowerCase() === "tops" ? "Tops" : "Bottoms");
  } else {
    let cat = categories.find((c) => c.slug === categorySlug);
    if (!cat) {
      const mapped = NAV_SLUG_TO_CATEGORY_SLUG[categorySlug];
      if (mapped) cat = categories.find((c) => c.slug === mapped);
    }
    if (cat) params.set("category", cat._id);
  }
  if (q) params.set("q", q);
  if (sort) params.set("sort", sort);
  try {
    return await fetchApi<ProductListResult>(`/products?${params}`);
  } catch {
    return { items: [], total: 0, page: 1, limit: 12, totalPages: 0 };
  }
}

type Props = {
  params: Promise<{ slug: string; locale?: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://fromthestress.vn";
  const localePrefix = locale && locale !== "vi" ? `/${locale}` : "";
  const categories = await getCategories();

  if (!isCategorySlug(slug, categories)) {
    return { title: "FROM THE STRESS" };
  }

  const isNavGroup = NAV_GROUPS.includes(slug.toLowerCase());
  const cat = isNavGroup ? null : categories.find((c) => c.slug === slug);
  const label = isNavGroup ? slug.charAt(0).toUpperCase() + slug.slice(1) : (cat?.name ?? slug);
  const url = `${base}${localePrefix}/san-pham/${slug}`;

  return {
    title: `${label} | FROM THE STRESS`,
    description: `Khám phá bộ sưu tập ${label} - streetwear phong cách từ FROM THE STRESS.`,
    alternates: {
      canonical: url,
      languages: {
        vi: `${base}/san-pham/${slug}`,
        en: `${base}/en/san-pham/${slug}`,
      },
    },
    openGraph: {
      url,
      title: `${label} | STREETWEAR`,
      images: [{ url: "/images/og_image.jpg", width: 1200, height: 630 }],
    },
  };
}

export default async function CategoryOrRedirectPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const categories = await getCategories();

  if (!isCategorySlug(slug, categories)) {
    // Old product URL - fetch product and redirect to correct URL
    try {
      const product = await fetchApi<Product>(`/products/${encodeURIComponent(slug)}`);
      redirect(getProductUrl(product));
    } catch {
      notFound();
    }
  }

  const rawSearch = (await searchParams) ?? {};
  const normalizedSearch: Record<string, string> = {};
  for (const [k, v] of Object.entries(rawSearch)) {
    if (!v) continue;
    normalizedSearch[k] = Array.isArray(v) ? v[0] : v;
  }

  const events = await getEvents();
  const result = await getCategoryProducts(slug, categories, normalizedSearch);
  const t = await getTranslations("products");
  const isNavGroup = NAV_GROUPS.includes(slug.toLowerCase());
  const cat = isNavGroup ? null : categories.find((c) => c.slug === slug);
  const label = isNavGroup ? slug.charAt(0).toUpperCase() + slug.slice(1) : (cat?.name ?? slug);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
      <TrackViewItemList products={result.items} listName={label} />
      <h1 className="font-display mb-6 text-2xl tracking-wide sm:text-3xl">
        {label.toUpperCase()}
      </h1>
      <ProductGrid
        initialData={result}
        categories={categories}
        events={events}
        currentParams={normalizedSearch}
        categorySlug={slug}
        basePath="/san-pham"
      />
    </div>
  );
}
