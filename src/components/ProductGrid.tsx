'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ProductListResult, Category } from '@/lib/api';

type ProductGridProps = {
  initialData: ProductListResult;
  categories: Category[];
  currentParams: Record<string, string | undefined>;
  basePath: string;
};

export function ProductGrid({
  initialData,
  categories,
  currentParams,
  basePath,
}: ProductGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const buildUrl = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams?.toString() ?? '');
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === '') next.delete(k);
      else next.set(k, v);
    }
    const q = next.toString();
    return q ? `${basePath}?${q}` : basePath;
  };

  const { items, total, page, limit, totalPages } = initialData;

  return (
    <>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <div>
          <label style={{ fontSize: '0.875rem', color: 'var(--muted)', marginRight: '0.5rem' }}>
            Danh mục
          </label>
          <select
            value={currentParams.danh_muc ?? ''}
            onChange={(e) => router.push(buildUrl({ danh_muc: e.target.value || null, page: null }))}
            style={{
              padding: '0.5rem 0.75rem',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              color: 'var(--text)',
            }}
          >
            <option value="">Tất cả</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '0.875rem', color: 'var(--muted)', marginRight: '0.5rem' }}>
            Sắp xếp
          </label>
          <select
            value={currentParams.sap_xep ?? ''}
            onChange={(e) => router.push(buildUrl({ sap_xep: e.target.value || null, page: null }))}
            style={{
              padding: '0.5rem 0.75rem',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              color: 'var(--text)',
            }}
          >
            <option value="">Mặc định</option>
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá thấp → cao</option>
            <option value="price_desc">Giá cao → thấp</option>
            <option value="name">Tên A-Z</option>
          </select>
        </div>
      </div>

      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {items.map((p) => (
          <li key={p._id}>
            <Link
              href={`/san-pham/${p.slug}`}
              style={{
                display: 'block',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                overflow: 'hidden',
              }}
            >
              <div style={{ aspectRatio: '1', background: 'var(--border)', position: 'relative' }}>
                {p.images?.[0] ? (
                  <img
                    src={p.images[0]}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : null}
              </div>
              <div style={{ padding: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{p.name}</h2>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--accent)', fontWeight: 700 }}>
                  {new Intl.NumberFormat('vi-VN').format(p.price)}₫
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <nav
          style={{
            marginTop: '2rem',
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          {page > 1 && (
            <Link
              href={buildUrl({ page: String(page - 1) })}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid var(--border)',
                borderRadius: 4,
              }}
            >
              Trước
            </Link>
          )}
          <span style={{ padding: '0.5rem 1rem', color: 'var(--muted)' }}>
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={buildUrl({ page: String(page + 1) })}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid var(--border)',
                borderRadius: 4,
              }}
            >
              Sau
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
