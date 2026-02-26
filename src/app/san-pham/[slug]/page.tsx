import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchApi, type Product, type ProductListResult } from "@/lib/api";
import { AddToCartForm } from "@/components/AddToCartForm";
import { ProductImageSlider } from "@/components/ProductImageSlider";
import { OtherProductsSection } from "@/components/OtherProductsSection";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

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
  const title = `${product.name} | STREETWEAR`;
  const desc =
    product.description?.slice(0, 160) ??
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

  const otherProducts =
    navGroup.trim() !== ""
      ? await getOtherProductsByNavGroup(navGroup, slug)
      : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: product.images,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "VND",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
            <h1 className="font-display mb-2 text-2xl sm:text-3xl">
              {product.name}
            </h1>
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
            {product.description && (
              <p className="mb-6 leading-relaxed text-muted">
                {product.description}
              </p>
            )}
            <AddToCartForm product={product} />
          </div>
        </div>
      </div>

      <OtherProductsSection products={otherProducts} />
    </>
  );
}
