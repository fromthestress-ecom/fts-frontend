"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { ProductListResult, Category } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('products');
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
    <div className="flex flex-col items-start gap-8 lg:flex-row lg:gap-12">
      {/* Sidebar Filters */}
      <aside className="w-full flex-shrink-0 lg:w-64">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[20px] font-bold text-text">{t('filter')}</h2>
          {(effectiveCategorySlug || currentParams.danh_muc) && (
            <Link
              href={buildUrl({ danh_muc: null, page: null })}
              className="text-[13px] text-text hover:underline"
            >
              {t('clearAll')}
            </Link>
          )}
        </div>
        <div className="mb-8 text-[13px] text-muted">
          {t('showingProducts', { count: initialData.total || items.length })}
        </div>

        {/* Categories as text links */}
        <div className="flex flex-col gap-[14px]">
          <Link
            href={buildUrl({ danh_muc: null, page: null })}
            className={`text-[14px] ${
              !effectiveCategorySlug &&
              currentParams.danh_muc !== "tops" &&
              currentParams.danh_muc !== "bottoms"
                ? "font-medium underline decoration-1 underline-offset-[6px]"
                : "text-text hover:underline hover:decoration-1 hover:underline-offset-[6px]"
            }`}
          >
            {t('all')}
          </Link>

          {categories.map((c) => {
            const isActive =
              effectiveCategorySlug === c.slug ||
              currentParams.danh_muc === c.slug;
            return (
              <Link
                key={c._id}
                href={buildUrl({ danh_muc: c.slug, page: null })}
                className={`text-[14px] ${
                  isActive
                    ? "font-medium underline decoration-1 underline-offset-[6px]"
                    : "text-text hover:underline hover:decoration-1 hover:underline-offset-[6px]"
                }`}
              >
                {c.name}
              </Link>
            );
          })}
        </div>

        <hr className="my-6 border-border" />

        {/* Filter Group: Checkboxes for Tops/Bottoms */}
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-text">{t('type')}</h3>
          {(currentParams.danh_muc === "tops" ||
            currentParams.danh_muc === "bottoms") && (
            <Link
              href={buildUrl({ danh_muc: null, page: null })}
              className="text-[13px] text-text hover:underline"
            >
              {t('clear')}
            </Link>
          )}
        </div>
        <div className="flex flex-col gap-[14px]">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={
                currentParams.danh_muc === "tops" ||
                effectiveCategorySlug === "tops"
              }
              onChange={() =>
                router.push(
                  buildUrl({
                    danh_muc: currentParams.danh_muc === "tops" ? null : "tops",
                    page: null,
                  }),
                )
              }
              className="h-[18px] w-[18px] cursor-pointer appearance-none rounded-sm border-[1.5px] border-text bg-transparent checked:bg-text checked:bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M2.5%206.5L5%209L9.5%203.5%22%20stroke%3D%22white%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] checked:bg-center checked:bg-no-repeat focus:outline-none focus:ring-2 focus:ring-text/30 focus:ring-offset-1 focus:ring-offset-bg"
            />
            <span className="text-[14px] text-text">{t('tops')}</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={
                currentParams.danh_muc === "bottoms" ||
                effectiveCategorySlug === "bottoms"
              }
              onChange={() =>
                router.push(
                  buildUrl({
                    danh_muc:
                      currentParams.danh_muc === "bottoms" ? null : "bottoms",
                    page: null,
                  }),
                )
              }
              className="h-[18px] w-[18px] cursor-pointer appearance-none rounded-sm border-[1.5px] border-text bg-transparent checked:bg-text checked:bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M2.5%206.5L5%209L9.5%203.5%22%20stroke%3D%22white%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] checked:bg-center checked:bg-no-repeat focus:outline-none focus:ring-2 focus:ring-text/30 focus:ring-offset-1 focus:ring-offset-bg"
            />
            <span className="text-[14px] text-text">{t('bottoms')}</span>
          </label>
        </div>

        <hr className="mb-6 mt-8 block border-border lg:hidden" />
      </aside>

      {/* Main Content Area */}
      <div className="relative w-full flex-1">
        {/* Top Header logic for Active tags & Sort by */}
        <div className="mb-6 flex min-h-[40px] flex-wrap items-center justify-between gap-4 border-b border-transparent lg:border-border pb-2 lg:pb-0 lg:border-none">
          <div className="flex flex-wrap items-center gap-2">
            {/* Tag matching screenshot */}
            {(effectiveCategorySlug || currentParams.danh_muc) && (
              <div className="flex items-center gap-2 bg-surface px-3 py-1.5 text-[13px] border border-border/60 rounded flex-shrink-0">
                <span>
                  {currentParams.danh_muc === "tops"
                    ? t('tops')
                    : currentParams.danh_muc === "bottoms"
                      ? t('bottoms')
                      : categories.find(
                          (c) =>
                            c.slug === effectiveCategorySlug ||
                            c.slug === currentParams.danh_muc,
                        )?.name ||
                        effectiveCategorySlug ||
                        currentParams.danh_muc}
                </span>
                <button
                  onClick={() =>
                    router.push(buildUrl({ danh_muc: null, page: null }))
                  }
                  className="cursor-pointer text-muted hover:text-text ml-1"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="whitespace-nowrap text-[13px] text-text">
              {t('sortBy')}
            </span>
            <select
              value={currentParams.sap_xep ?? ""}
              onChange={(e) =>
                router.push(
                  buildUrl({ sap_xep: e.target.value || null, page: null }),
                )
              }
              className="cursor-pointer border-none bg-transparent py-1 text-[13px] font-medium text-text outline-none focus:ring-0"
            >
              <option value="">{t('sortDefault')}</option>
              <option value="newest">{t('sortNewest')}</option>
              <option value="price_asc">{t('sortPriceAsc')}</option>
              <option value="price_desc">{t('sortPriceDesc')}</option>
              <option value="name">{t('sortName')}</option>
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
      </div>
    </div>
  );
}
