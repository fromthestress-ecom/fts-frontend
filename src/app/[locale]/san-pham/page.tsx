import { fetchApi, type ProductListResult, type Category, type EventItem } from "@/lib/api";
import { ProductGrid } from "@/components/ProductGrid";
import { TrackViewItemList } from "@/components/TrackViewItemList";
import { getTranslations } from 'next-intl/server';
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

async function getProducts(
  searchParams: Record<string, string>,
): Promise<ProductListResult> {
  const page = searchParams.page ?? "1";
  const q = (searchParams.q ?? "").trim();
  const sort = searchParams.sap_xep ?? "";
  const event = searchParams.event ?? "";
  const params = new URLSearchParams({ page, limit: "12" });
  if (q) params.set("q", q);
  if (sort) params.set("sort", sort);
  if (event) params.set("event", event);
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

async function getEvents(): Promise<EventItem[]> {
  try {
    return await fetchApi<EventItem[]>("/events");
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale?: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { locale } = await params;
  const rawSearchParams = await searchParams;
  const t = await getTranslations("products");
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://fromthestress.vn";
  const localePrefix = locale && locale !== "vi" ? `/${locale}` : "";

  const canonicalUrl = `${base}${localePrefix}/san-pham`;
  const isSearch = !!rawSearchParams.q;

  return {
    title: t("productsTitle"),
    description: t("productsDesc"),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        vi: `${base}/san-pham`,
        en: `${base}/en/san-pham`,
      },
    },
    robots: isSearch ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      url: canonicalUrl,
      title: `${t("productsTitle")} | STREETWEAR`,
      description: t("productsDesc"),
      images: [{ url: "/images/og_image.jpg", width: 1200, height: 630, alt: "FROM THE STRESS" }],
    },
  };
}


export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const params = normalizeParams(raw);
  const categories = await getCategories();
  const events = await getEvents();
  const result = await getProducts(params);
  const t = await getTranslations('products');

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
      <TrackViewItemList products={result.items} listName={t('productsTitle')} />
      <h1 className="font-display mb-6 text-2xl tracking-wide sm:text-3xl">
        {t('productsUpper')}
      </h1>
      <ProductGrid
        initialData={result}
        categories={categories}
        events={events}
        currentParams={params}
        basePath="/san-pham"
      />
    </div>
  );
}
