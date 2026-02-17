import Link from "next/link";
import { fetchApi, type Product, type ProductListResult } from "@/lib/api";
import { BannerSlider } from "@/components/BannerSlider";
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

const SECTION_TITLE_STYLE = {
  fontFamily: "var(--font-display)",
  fontSize: "2rem",
  letterSpacing: "0.05em",
  marginBottom: "1.5rem",
} as const;

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
    <section
      style={{ maxWidth: 1280, margin: "0 auto", padding: "4rem 1.5rem" }}
    >
      <h2 style={{ ...SECTION_TITLE_STYLE, marginBottom: "2rem" }}>
        SẢN PHẨM MỚI
      </h2>
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {items.map((p) => (
          <li key={p._id}>
            <Link
              href={`/san-pham/${p.slug}`}
              className="product-card"
              style={{
                display: "block",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  aspectRatio: "1",
                  background: "var(--border)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {p.images?.[0] ? (
                  <img
                    src={p.images[0]}
                    alt=""
                    loading="lazy"
                    className="product-card__image-inner"
                    style={{ objectFit: "cover" }}
                  />
                ) : null}
              </div>
              <div style={{ padding: "1rem" }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "1rem",
                    fontWeight: 600,
                    minHeight: "42px",
                  }}
                >
                  {p.name}
                </h3>
                <p
                  style={{
                    margin: "0.25rem 0 0",
                    color: "var(--accent)",
                    fontWeight: 700,
                  }}
                >
                  {new Intl.NumberFormat("vi-VN").format(p.price)}₫
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <Link
          href="/san-pham"
          style={{ color: "var(--accent)", fontWeight: 600 }}
        >
          Xem tất cả →
        </Link>
      </div>
    </section>
  );
}

function PromoSection({ slides }: { slides: readonly PromoSlide[] }) {
  if (slides.length === 0) return null;

  return (
    <section
      style={{ maxWidth: 1280, margin: "0 auto", padding: "4rem 1.5rem" }}
    >
      <h2 style={SECTION_TITLE_STYLE}>KHUYẾN MÃI</h2>
      <PromoSlider slides={slides} />
    </section>
  );
}

function BrandsSection() {
  return (
    <section
      style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem 4rem" }}
    >
      <h2 style={SECTION_TITLE_STYLE}>THƯƠNG HIỆU</h2>
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1rem",
        }}
      >
        {BRAND_ITEMS.map((brand) => (
          <li
            key={brand.src}
            style={{
              overflow: "hidden",
            }}
          >
            <figure
              style={{
                margin: 0,
                padding: "1.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  width: "50%",
                  aspectRatio: "1 / 1",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <img
                  src={brand.src}
                  alt={brand.title}
                  loading="lazy"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
              <figcaption
                style={{
                  marginTop: "0.75rem",
                  color: "var(--muted)",
                  fontSize: "0.95rem",
                  textTransform: "capitalize",
                  textAlign: "center",
                  fontFamily: "var(--font-display)",
                }}
              >
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
