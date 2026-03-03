"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { ProductListResult, Category } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";

type ProductGridProps = {
  initialData: ProductListResult;
  categories: Category[];
  currentParams: Record<string, string | undefined>;
  effectiveCategorySlug?: string;
  basePath: string;
};

export function ProductGrid({
  initialData,
  categories,
  currentParams,
  effectiveCategorySlug,
  basePath,
}: ProductGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const buildUrl = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams?.toString() ?? "");
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    const q = next.toString();
    return q ? `${basePath}?${q}` : basePath;
  };

  const { items, page, totalPages } = initialData;

  return (
    <>
      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-6 sm:gap-8">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted">Danh mục</label>
          <select
            value={effectiveCategorySlug ?? currentParams.danh_muc ?? ""}
            onChange={(e) => {
              const v = e.target.value || null;
              router.push(buildUrl({ danh_muc: v ?? null, page: null }));
            }}
            className="rounded border border-border bg-surface px-3 py-2 text-text text-sm sm:text-base"
          >
            <option value="">Tất cả</option>
            <option disabled>── Loại ──</option>
            <option value="tops">Tops (Áo)</option>
            <option value="bottoms">Bottoms (Quần)</option>
            <option disabled>── Danh mục ──</option>
            {categories.map((c) => (
              <option key={c._id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted">Sắp xếp</label>
          <select
            value={currentParams.sap_xep ?? ""}
            onChange={(e) =>
              router.push(
                buildUrl({ sap_xep: e.target.value || null, page: null }),
              )
            }
            className="rounded border border-border bg-surface px-3 py-2 text-text text-sm sm:text-base"
          >
            <option value="">Mặc định</option>
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá thấp → cao</option>
            <option value="price_desc">Giá cao → thấp</option>
            <option value="name">Tên A-Z</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <ul className="grid list-none grid-cols-2 gap-4 p-0 m-0 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {items.map((p) => (
          <li key={p._id}>
            <ProductCard product={p} headingLevel="h2" />
          </li>
        ))}
      </ul>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-8 flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={buildUrl({ page: String(page - 1) })}
              className="rounded border border-border px-4 py-2 text-sm sm:text-base"
            >
              Trước
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-muted sm:text-base">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={buildUrl({ page: String(page + 1) })}
              className="rounded border border-border px-4 py-2 text-sm sm:text-base"
            >
              Sau
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
