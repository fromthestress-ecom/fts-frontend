import Link from "next/link";
import {
  fetchApi,
  fetchBestSellingProducts,
  type Product,
  type ProductListResult,
  type BlogItem,
  type EventItem,
} from "@/lib/api";
import dynamic from "next/dynamic";
import { BrandsSectionLogos } from "@/components/BrandsSectionLogos";
import { FeaturesBar } from "@/components/FeaturesBar";
import { ProductCard } from "@/components/ProductCard";
import { BlogCard } from "@/components/BlogCard";
import type { PromoSlide } from "@/components/PromoSlider";
import { CollectionsSection } from "@/components/CollectionsSection";
import { getTranslations } from 'next-intl/server';

// const BannerSlider = dynamic(
//   () => import("@/components/BannerSlider").then((m) => m.BannerSlider),
// );

const HeroBanner = dynamic(
  () => import("@/components/HeroBanner").then((m) => m.HeroBanner),
);

const PromoSlider = dynamic(
  () => import("@/components/PromoSlider").then((m) => m.PromoSlider),
);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fromthestress.vn";

async function getFeaturedProducts(): Promise<ProductListResult> {
  try {
    return await fetchApi<ProductListResult>("/products?limit=8&sort=newest");
  } catch {
    return { items: [], total: 0, page: 1, limit: 8, totalPages: 0 };
  }
}

async function getBestSelling(): Promise<Product[]> {
  try {
    return await fetchBestSellingProducts(4);
  } catch {
    return [];
  }
}

async function getLatestBlogs(): Promise<{ blogs: BlogItem[] }> {
  try {
    return await fetchApi<{ blogs: BlogItem[] }>("/blogs?limit=4");
  } catch {
    return { blogs: [] };
  }
}

async function getActiveEvents(): Promise<EventItem[]> {
  try {
    return await fetchApi<EventItem[]>("/events");
  } catch {
    return [];
  }
}

async function FeaturedProductsSection({ items }: { items: readonly Product[] }) {
  if (items.length === 0) return null;
  const t = await getTranslations('home');

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-12">
      <h2 className="font-display mb-6 text-xl tracking-wide sm:mb-8 sm:text-2xl">
        {t('newProducts')}
      </h2>
      <ul className="grid list-none grid-cols-2 gap-4 p-0 m-0 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {items.map((p) => (
          <li key={p._id}>
            <ProductCard product={p} headingLevel="h3" />
          </li>
        ))}
      </ul>
      <div className="mt-8 text-center">
        <a
          href="/san-pham"
          className="font-semibold text-accent hover:underline"
        >
          {t('viewAll')}
        </a>
      </div>
    </section>
  );
}

async function BestSellingProductsSection({ items }: { items: readonly Product[] }) {
  if (items.length === 0) return null;
  const t = await getTranslations('home');

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-12">
      <h2 className="font-display mb-6 text-xl tracking-wide sm:mb-8 sm:text-2xl text-accent">
        {t('bestSelling')}
      </h2>
      <ul className="grid list-none grid-cols-2 gap-4 p-0 m-0 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {items.map((p) => (
          <li key={p._id}>
            <ProductCard product={p} headingLevel="h3" />
          </li>
        ))}
      </ul>
      <div className="mt-8 text-center">
        <a
          href="/san-pham"
          className="font-semibold text-accent hover:underline"
        >
          {t('viewAll')}
        </a>
      </div>
    </section>
  );
}

async function PromoSection({ slides }: { slides: readonly PromoSlide[] }) {
  if (slides.length === 0) return null;
  const t = await getTranslations('home');

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-12">
      <h2 className="font-display mb-6 text-xl tracking-wide sm:text-2xl">
        {t('promotions')}
      </h2>
      <PromoSlider slides={slides} />
    </section>
  );
}

async function LatestStoriesSection({ blogs }: { blogs: readonly BlogItem[] }) {
  if (blogs.length === 0) return null;
  const t = await getTranslations('home');

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-12 bg-surface mt-12 mb-4">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-display text-2xl tracking-wide sm:text-3xl uppercase m-0">
            {t('latestStories')}
          </h2>
          <p className="text-muted mt-2 text-sm max-w-xl">
            {t('storiesDesc')}
          </p>
        </div>
        <Link
          href="/blogs"
          className="hidden sm:inline-flex items-center gap-2 font-semibold text-text border border-text px-4 py-2 rounded-full hover:bg-text hover:text-bg transition-colors uppercase text-xs tracking-widest"
        >
          {t('viewJournal')}
        </Link>
      </div>
      <ul className="grid list-none grid-cols-1 gap-6 p-0 m-0 sm:grid-cols-2 lg:grid-cols-4">
        {blogs.map((b) => (
          <li key={b._id}>
            <BlogCard blog={b} headingLevel="h3" />
          </li>
        ))}
      </ul>
      <div className="mt-8 text-center sm:hidden">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 font-semibold text-text border border-text px-6 py-3 rounded-full hover:bg-text hover:text-bg transition-colors uppercase text-xs tracking-widest"
        >
          {t('viewJournal')}
        </Link>
      </div>
    </section>
  );
}

async function BrandsSection() {
  const t = await getTranslations('home');
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-12">
      <h2 className="font-display mb-6 text-xl tracking-wide sm:text-2xl">
        {t('brands')}
      </h2>
      <BrandsSectionLogos />
    </section>
  );
}

const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "STREETWEAR",
  url: SITE_URL,
  description: "Thời trang đường phố cao cấp - Hoodie, tee, jogger, sneaker.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/san-pham?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

function buildPromoSlides(
  events: readonly EventItem[],
): readonly PromoSlide[] {
  return events
    .filter((e) => e.bannerImage)
    .map((e) => ({
      src: e.bannerImage!,
      href: `/san-pham?event=${e._id}`,
      label: e.name,
      startDate: e.startDate,
    }));
}

export default async function HomePage() {
  const { items } = await getFeaturedProducts();
  const bestSellers = await getBestSelling();
  const { blogs } = await getLatestBlogs();
  const activeEvents = await getActiveEvents();
  const promoSlides = buildPromoSlides(activeEvents);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />
      <HeroBanner />

      <PromoSection slides={promoSlides} />
      <BestSellingProductsSection items={bestSellers} />
      <FeaturedProductsSection items={items} />
      <CollectionsSection />
      <LatestStoriesSection blogs={blogs} />
      <BrandsSection />
      <FeaturesBar />
    </>
  );
}
