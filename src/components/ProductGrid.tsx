"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { ProductListResult, Category } from "@/lib/api";

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
    const next = new URLSearchParams(searchParams?.toString() ?? "");
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    const q = next.toString();
    return q ? `${basePath}?${q}` : basePath;
  };

  const { items, total, page, limit, totalPages } = initialData;

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-6 sm:gap-8">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted">Danh mục</label>
          <select
            value={currentParams.danh_muc ?? ""}
            onChange={(e) =>
              router.push(
                buildUrl({ danh_muc: e.target.value || null, page: null }),
              )
            }
            className="rounded border border-border bg-surface px-3 py-2 text-text text-sm sm:text-base"
          >
            <option value="">Tất cả</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
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

      <ul className="grid list-none grid-cols-2 gap-4 p-0 m-0 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {items.map((p) => (
          <li key={p._id}>
            <Link
              href={`/san-pham/${p.slug}`}
              className="product-card block overflow-hidden rounded-lg border border-border bg-surface"
            >
              <div className="relative aspect-square overflow-hidden bg-border">
                {p.images?.[0] ? (
                  <img
                    src={p.images[0]}
                    alt=""
                    className="product-card__image-inner h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="p-4">
                <h2 className="min-h-[42px] text-sm font-semibold m-0 sm:text-base">
                  {p.name}
                </h2>
                <p className="mt-1 text-sm font-bold text-accent sm:text-base">
                  {new Intl.NumberFormat("vi-VN").format(p.price)}₫
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

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
