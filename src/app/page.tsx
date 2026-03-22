import Link from "next/link";
import {
  fetchApi,
  fetchBestSellingProducts,
  type Product,
  type ProductListResult,
  type BlogItem,
} from "@/lib/api";
import dynamic from "next/dynamic";
import { BrandsSectionLogos } from "@/components/BrandsSectionLogos";
import { FeaturesBar } from "@/components/FeaturesBar";
import { ProductCard } from "@/components/ProductCard";
import { BlogCard } from "@/components/BlogCard";
import type { PromoSlide } from "@/components/PromoSlider";
import { CollectionsSection } from "@/components/CollectionsSection";

const BannerSlider = dynamic(
  () => import("@/components/BannerSlider").then((m) => m.BannerSlider),
);

const PromoSlider = dynamic(
  () => import("@/components/PromoSlider").then((m) => m.PromoSlider),
);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

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

function FeaturedProductsSection({ items }: { items: readonly Product[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-12">
      <h2 className="font-display mb-6 text-xl tracking-wide sm:mb-8 sm:text-2xl">
        SẢN PHẨM MỚI
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
          Xem tất cả →
        </a>
      </div>
    </section>
  );
}

function BestSellingProductsSection({ items }: { items: readonly Product[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-12">
      <h2 className="font-display mb-6 text-xl tracking-wide sm:mb-8 sm:text-2xl text-accent">
        BEST SELLING ITEMS
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
          Xem tất cả →
        </a>
      </div>
    </section>
  );
}

function PromoSection({ slides }: { slides: readonly PromoSlide[] }) {
  if (slides.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-12">
      <h2 className="font-display mb-6 text-xl tracking-wide sm:text-2xl">
        KHUYẾN MÃI
      </h2>
      <PromoSlider slides={slides} />
    </section>
  );
}

function LatestStoriesSection({ blogs }: { blogs: readonly BlogItem[] }) {
  if (blogs.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-12 bg-surface mt-12 mb-4">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-display text-2xl tracking-wide sm:text-3xl uppercase m-0">
            LATEST STORIES
          </h2>
          <p className="text-muted mt-2 text-sm max-w-xl">
            Dive into the latest drops, culture, and streetwear stories from our
            journal.
          </p>
        </div>
        <Link
          href="/blogs"
          className="hidden sm:inline-flex items-center gap-2 font-semibold text-text border border-text px-4 py-2 rounded-full hover:bg-text hover:text-bg transition-colors uppercase text-xs tracking-widest"
        >
          View Journal
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
          View Journal
        </Link>
      </div>
    </section>
  );
}

function BrandsSection() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-12">
      <h2 className="font-display mb-6 text-xl tracking-wide sm:text-2xl">
        THƯƠNG HIỆU
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

function buildPromoSlides(items: readonly Product[]): readonly PromoSlide[] {
  const firstSaleProduct = items.find(
    (p) => (p.compareAtPrice ?? 0) > 0 && (p.compareAtPrice ?? 0) > p.price,
  );

  return [
    {
      src: "https://pub-74aaef109f0d41358e5610e57268bc04.r2.dev/pages/banner/sale-8%3A3.png",
      href: firstSaleProduct?.slug
        ? `/san-pham?danh_muc=6992f805b6680f2f57a81752`
        : "/san-pham",
      label: "Khuyến mãi đang diễn ra",
    },
    {
      src: "https://pub-74aaef109f0d41358e5610e57268bc04.r2.dev/pages/banner/couple_sale.png",
      href: firstSaleProduct?.slug
        ? `/san-pham?danh_muc=6992d102e1609ae8e4fe18d3`
        : "/san-pham",
      label: "Khuyến mãi đang diễn ra",
    },
  ] as const;
}

export default async function HomePage() {
  const { items } = await getFeaturedProducts();
  const bestSellers = await getBestSelling();
  const { blogs } = await getLatestBlogs();
  const promoSlides = buildPromoSlides(items);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />
      <BannerSlider />

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
