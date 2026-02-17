import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchApi, type Product } from '@/lib/api';
import { AddToCartForm } from '@/components/AddToCartForm';
import { ProductImageSlider } from '@/components/ProductImageSlider';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

async function getProduct(slug: string): Promise<Product | null> {
  try {
    return await fetchApi<Product>(`/products/${encodeURIComponent(slug)}`);
  } catch {
    return null;
  }
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: 'Sản phẩm' };
  const title = `${product.name} | STREETWEAR`;
  const desc =
    product.description?.slice(0, 160) ??
    `Mua ${product.name} - ${new Intl.NumberFormat('vi-VN').format(product.price)}₫`;
  const image = product.images?.[0];
  return {
    title: product.name,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images: image ? [{ url: image, alt: product.name }] : undefined,
      type: 'website',
      url: `${SITE_URL}/san-pham/${slug}`,
    },
    twitter: { card: 'summary_large_image', title, description: desc },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const categoryName =
    typeof product.categoryId === 'object' && product.categoryId !== null
      ? (product.categoryId as { name?: string }).name
      : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? undefined,
    image: product.images,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'VND',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <nav style={{ marginBottom: '1rem', color: 'var(--muted)', fontSize: '0.875rem' }}>
          <Link href="/san-pham">Sản phẩm</Link>
          {categoryName && (
            <>
              {' / '}
              <span>{categoryName}</span>
            </>
          )}
          {' / '}
          <span style={{ color: 'var(--text)' }}>{product.name}</span>
        </nav>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem',
            alignItems: 'start',
          }}
        >
          <ProductImageSlider
            images={product.images ?? []}
            productName={product.name}
          />

          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.5rem' }}>
              {product.name}
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '1rem' }}>
              {new Intl.NumberFormat('vi-VN').format(product.price)}₫
              {product.compareAtPrice != null && product.compareAtPrice > product.price && (
                <span style={{ marginLeft: '0.5rem', color: 'var(--muted)', textDecoration: 'line-through', fontSize: '1rem' }}>
                  {new Intl.NumberFormat('vi-VN').format(product.compareAtPrice)}₫
                </span>
              )}
            </p>
            {product.description && (
              <p style={{ color: 'var(--muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                {product.description}
              </p>
            )}
            <AddToCartForm product={product} />
          </div>
        </div>
      </div>
    </>
  );
}
