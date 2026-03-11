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
        <nav className="mt-12 flex justify-center items-center gap-2">
          {page > 1 ? (
            <Link
              href={buildUrl({ page: String(page - 1) })}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-text hover:bg-border transition-colors mr-2"
              aria-label="Previous page"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bg text-muted opacity-50 cursor-not-allowed mr-2">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </div>
          )}

          <div className="flex items-center rounded-full bg-surface p-1 shadow-sm border border-border/50">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              const isCurrent = p === page;

              // Logic based on the screenshot:
              // Show first 4 pages, then ellipsis, then last 4 pages when totalPages is large
              let shouldShow = false;
              let isEllipsis = false;

              if (totalPages <= 9) {
                // If 9 or fewer pages, show all
                shouldShow = true;
              } else {
                // More than 9 pages
                if (page <= 5) {
                  // If near the start: show 1 2 3 4 5 ... last 2
                  if (p <= 5 || p >= totalPages - 1) shouldShow = true;
                  else if (p === 6) isEllipsis = true;
                } else if (page >= totalPages - 4) {
                  // If near the end: show first 2 ... last 5
                  if (p <= 2 || p >= totalPages - 4) shouldShow = true;
                  else if (p === 3) isEllipsis = true;
                } else {
                  // Somewhere in the middle: show first 2 ... current-1, current, current+1 ... last 2
                  if (p <= 2 || p >= totalPages - 1 || Math.abs(p - page) <= 1)
                    shouldShow = true;
                  else if (p === 3 || p === totalPages - 2) isEllipsis = true;
                }
              }

              if (isEllipsis) {
                return (
                  <span
                    key={`ellipsis-${p}`}
                    className="flex h-10 w-8 items-center justify-center text-muted font-medium"
                  >
                    ...
                  </span>
                );
              }

              if (!shouldShow) return null;

              return (
                <Link
                  key={p}
                  href={buildUrl({ page: String(p) })}
                  className={`flex h-10 min-w-[40px] items-center justify-center rounded-full px-2 text-[15px] font-semibold transition-all duration-200 ${
                    isCurrent
                      ? "bg-[#eab308] text-white shadow-md transform scale-[1.05]"
                      : "text-text hover:bg-border/60 hover:text-text"
                  }`}
                >
                  {p}
                </Link>
              );
            })}
          </div>

          {page < totalPages ? (
            <Link
              href={buildUrl({ page: String(page + 1) })}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-text hover:bg-border transition-colors ml-2"
              aria-label="Next page"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bg text-muted opacity-50 cursor-not-allowed ml-2">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          )}
        </nav>
      )}
    </>
  );
}
