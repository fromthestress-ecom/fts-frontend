import Link from "next/link";
import { fetchApi, type ProductListResult } from "@/lib/api";
import { BannerSlider } from "@/components/BannerSlider";
import { PromoSlider, type PromoSlide } from "@/components/PromoSlider";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

async function getFeaturedProducts(): Promise<ProductListResult> {
  try {
    return await fetchApi<ProductListResult>("/products?limit=8&sort=newest");
  } catch {
    return { items: [], total: 0, page: 1, limit: 8, totalPages: 0 };
  }
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

export default async function HomePage() {
  const { items } = await getFeaturedProducts();
  const firstSaleProduct = items.find(
    (p) => (p.compareAtPrice ?? 0) > 0 && (p.compareAtPrice ?? 0) > p.price,
  );

  const promoSlides: readonly PromoSlide[] = [
    {
      src: "https://pub-74aaef109f0d41358e5610e57268bc04.r2.dev/pages/banner/sale-8%3A3.png",
      href: "/san-pham?danh_muc=6992f805b6680f2f57a81752",
      label: "Khuyến mãi đang diễn ra",
    },
  ] as const;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />
      <BannerSlider />

      {items.length > 0 && (
        <section
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "4rem 1.5rem",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2rem",
              letterSpacing: "0.05em",
              marginBottom: "2rem",
            }}
          >
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
                    }}
                  >
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0]}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : null}
                  </div>
                  <div style={{ padding: "1rem" }}>
                    <h3
                      style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}
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
              style={{
                color: "var(--accent)",
                fontWeight: 600,
              }}
            >
              Xem tất cả →
            </Link>
          </div>
        </section>
      )}

      <section
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 1.5rem 4rem",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "2rem",
            letterSpacing: "0.05em",
            marginBottom: "1.5rem",
          }}
        >
          KHUYẾN MÃI
        </h2>
        <PromoSlider slides={promoSlides} />
      </section>
    </>
  );
}
