import Link from "next/link";
import { fetchApi, type Product, type ProductListResult } from "@/lib/api";
import { BannerSlider } from "@/components/BannerSlider";
import { ImageWithSkeleton } from "@/components/ImageWithSkeleton";
import { PromoSlider, type PromoSlide } from "@/components/PromoSlider";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type BrandItem = Readonly<{
  src: string;
  title: string;
}>;

const BRAND_ITEMS = [
  {
    src: "https://pub-74aaef109f0d41358e5610e57268bc04.r2.dev/pages/logos/logo_white.png",
    title: "signature logo",
  },
  {
    src: "https://pub-74aaef109f0d41358e5610e57268bc04.r2.dev/pages/logos/logo_new_white.png",
    title: "fts big logo",
  },
] as const satisfies readonly BrandItem[];

async function getFeaturedProducts(): Promise<ProductListResult> {
  try {
    return await fetchApi<ProductListResult>("/products?limit=8&sort=newest");
  } catch {
    return { items: [], total: 0, page: 1, limit: 8, totalPages: 0 };
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
            <Link
              href={`/san-pham/${p.slug}`}
              className="product-card block overflow-hidden rounded-lg border border-border bg-surface"
            >
              <div className="relative aspect-square overflow-hidden bg-border">
                {p.images?.[0] ? (
                  <ImageWithSkeleton
                    src={p.images[0]}
                    alt=""
                    className="product-card__image-inner"
                  />
                ) : null}
              </div>
              <div className="p-4">
                <h3 className="min-h-[42px] text-sm font-semibold m-0 sm:text-base">
                  {p.name}
                </h3>
                <p className="mt-1 text-sm font-bold text-accent sm:text-base">
                  {new Intl.NumberFormat("vi-VN").format(p.price)}₫
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-8 text-center">
        <Link href="/san-pham" className="font-semibold text-accent hover:underline">
          Xem tất cả →
        </Link>
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

function BrandsSection() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-16 pt-0 sm:px-6">
      <h2 className="font-display mb-6 text-xl tracking-wide sm:text-2xl">
        THƯƠNG HIỆU
      </h2>
      <ul className="grid list-none grid-cols-1 gap-4 p-0 m-0 sm:grid-cols-2 sm:gap-6">
        {BRAND_ITEMS.map((brand) => (
          <li key={brand.src} className="overflow-hidden">
            <figure className="m-0 flex flex-col items-center justify-center p-5">
              <div className="grid w-1/2 place-items-center aspect-square">
                <img
                  src={brand.src}
                  alt={brand.title}
                  loading="lazy"
                  className="h-full w-full object-contain"
                />
              </div>
              <figcaption className="font-display mt-3 text-center text-sm capitalize text-muted sm:text-base">
                {brand.title}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
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
  const promoSlides = buildPromoSlides(items);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />
      <BannerSlider />

      <PromoSection slides={promoSlides} />
      <FeaturedProductsSection items={items} />
      <BrandsSection />
    </>
  );
}
