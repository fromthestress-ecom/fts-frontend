import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchApi, type Product, type ProductListResult } from "@/lib/api";
import dynamic from "next/dynamic";
import { AddToCartForm } from "@/components/AddToCartForm";
import { TrackViewItem } from "@/components/TrackViewItem";

const CountdownPrice = dynamic(
  () => import("@/components/CountdownPrice").then((m) => m.CountdownPrice),
);

const ProductImageSlider = dynamic(() =>
  import("@/components/ProductImageSlider").then((m) => m.ProductImageSlider),
);

const OtherProductsSection = dynamic(() =>
  import("@/components/OtherProductsSection").then(
    (m) => m.OtherProductsSection,
  ),
);
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fromthestress.vn";

async function getProduct(slug: string): Promise<Product | null> {
  try {
    return await fetchApi<Product>(`/products/${encodeURIComponent(slug)}`);
  } catch {
    return null;
  }
}

async function getOtherProductsByNavGroup(
  navGroup: string,
  excludeSlug: string,
): Promise<Product[]> {
  if (!navGroup.trim()) return [];
  try {
    const params = new URLSearchParams({
      navGroup: navGroup.trim(),
      exclude: excludeSlug,
      limit: "20",
    });
    const result = await fetchApi<ProductListResult>(`/products?${params}`);
    return result.items ?? [];
  } catch {
    return [];
  }
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Sản phẩm" };
  const template =
    typeof product.templateId === "object" && product.templateId !== null
      ? product.templateId
      : null;
  const description = template?.description || product.description;

  const title = `${product.name} | STREETWEAR`;
  const desc =
    description?.slice(0, 160) ??
    `Mua ${product.name} - ${new Intl.NumberFormat("vi-VN").format(product.price)}₫`;
  const image = product.images?.[0];
  return {
    title: product.name,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images: image ? [{ url: image, alt: product.name }] : undefined,
      type: "website",
      url: `${SITE_URL}/san-pham/${slug}`,
    },
    twitter: { card: "summary_large_image", title, description: desc },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const category =
    typeof product.categoryId === "object" && product.categoryId !== null
      ? (product.categoryId as { name?: string; navGroup?: string })
      : null;
  const categoryName = category?.name ?? null;
  const navGroup = category?.navGroup ?? "";

  const template =
    typeof product.templateId === "object" && product.templateId !== null
      ? product.templateId
      : null;
  const description = template?.description || product.description;
  const sizeChart = template?.sizeChart || product.sizeChart;

  const otherProducts =
    navGroup.trim() !== ""
      ? await getOtherProductsByNavGroup(navGroup, slug)
      : [];

  const isSoldOut = product.isSoldOut || !product.inStock;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: description ?? undefined,
    image: product.images,
    offers: {
      "@type": "Offer",
      price: product.finalPrice ?? product.price,
      priceCurrency: "VND",
      availability: isSoldOut
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TrackViewItem
        itemId={product._id}
        itemName={product.name}
        price={product.finalPrice ?? product.price}
        category={categoryName ?? undefined}
      />
      <div className="mx-auto max-w-[960px] px-4 py-8 sm:px-6">
        <nav className="mb-4 text-sm text-muted sm:text-base">
          <Link href="/san-pham">Sản phẩm</Link>
          {categoryName && (
            <>
              {" / "}
              <span>{categoryName}</span>
            </>
          )}
          {" / "}
          <span className="text-text">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 md:gap-8">
          <ProductImageSlider
            images={product.images ?? []}
            productName={product.name}
          />

          <div>
            <h1 className="font-display mb-2 text-2xl sm:text-3xl flex items-center gap-3">
              {product.name}
              {isSoldOut ? (
                <span className="rounded bg-red-600 px-2 py-1 text-sm font-bold text-white shadow-sm">
                  Sold Out
                </span>
              ) : product.preOrder ? (
                <span className="rounded bg-black/80 px-2 py-1 text-sm font-bold text-white shadow-sm">
                  Pre-order
                </span>
              ) : null}
            </h1>
            {product.eventDiscount?.status === "upcoming" &&
            product.eventDiscount.discountedPrice != null &&
            product.eventDiscount.startDate ? (
              <div className="mb-4">
                <p className="text-lg font-bold text-accent sm:text-xl">
                  {new Intl.NumberFormat("vi-VN").format(product.price)}₫
                </p>
                <CountdownPrice
                  discountedPrice={product.eventDiscount.discountedPrice}
                  startDate={product.eventDiscount.startDate}
                  size="lg"
                />
                <p className="mt-1 text-sm text-muted">
                  Event: {product.eventDiscount.eventName}
                </p>
              </div>
            ) : product.eventDiscount?.status === "active" ? (
              <div className="mb-4">
                <span className="text-lg font-bold text-accent sm:text-xl">
                  {new Intl.NumberFormat("vi-VN").format(
                    product.finalPrice ?? product.price,
                  )}
                  ₫
                </span>
                <span className="ml-2 text-base text-muted line-through">
                  {new Intl.NumberFormat("vi-VN").format(
                    product.eventDiscount.originalPrice,
                  )}
                  ₫
                </span>
                <span className="ml-2 rounded bg-red-500 px-2 py-1 text-xs font-bold text-white">
                  {product.eventDiscount.discountType === "percent"
                    ? `-${product.eventDiscount.discountValue}%`
                    : `-${new Intl.NumberFormat("vi-VN").format(product.eventDiscount.discountValue)}₫`}
                </span>
                <p className="mt-1 text-sm text-muted">
                  Event: {product.eventDiscount.eventName}
                </p>
              </div>
            ) : (
              <p className="mb-4 text-lg font-bold text-accent sm:text-xl">
                {new Intl.NumberFormat("vi-VN").format(product.price)}₫
                {product.compareAtPrice != null &&
                  product.compareAtPrice > product.price && (
                    <span className="ml-2 text-base text-muted line-through">
                      {new Intl.NumberFormat("vi-VN").format(
                        product.compareAtPrice,
                      )}
                      ₫
                    </span>
                  )}
              </p>
            )}
            <AddToCartForm product={product} />
          </div>
        </div>

        {/* Description & Size Chart full width below the fold */}
        {(description || sizeChart) && (
          <div className="mx-auto mt-16 max-w-[800px] border-t border-border pt-10">
            {description && (
              <div className="mb-10 text-muted leading-relaxed">
                {description.split("\n").map((line, i) => (
                  <p key={i} className="mb-0 min-h-[1em]">
                    {line}
                  </p>
                ))}
              </div>
            )}

            {sizeChart && (
              <div className="mt-8 text-center">
                <img
                  src={sizeChart}
                  alt={`Size Chart - ${product.name}`}
                  className="mx-auto max-w-full h-auto rounded-lg shadow-sm"
                />
              </div>
            )}
          </div>
        )}
      </div>

      <OtherProductsSection products={otherProducts} />
    </>
  );
}
