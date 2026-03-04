"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BlogCard } from "./BlogCard";
import type { BlogItem, BlogCategory, Tag } from "@/lib/api";

type BlogListResult = {
  blogs: BlogItem[];
  total: number;
  page: number;
  totalPages: number;
};

type BlogGridProps = {
  initialData: BlogListResult;
  categories: BlogCategory[];
  tags: Tag[];
  currentParams: Record<string, string | undefined>;
  basePath: string;
};

export function BlogGrid({
  initialData,
  categories,
  tags,
  currentParams,
  basePath,
}: BlogGridProps) {
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

  const { blogs, page, totalPages, total } = initialData;

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get("q") as string;
    router.push(buildUrl({ search: q || null, page: null }));
  };

  return (
    <>
      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <Link
            href={buildUrl({ category: null, page: null })}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 uppercase tracking-widest ${
              !currentParams.category
                ? "bg-text text-bg"
                : "bg-surface text-muted border border-border hover:text-text hover:border-text"
            }`}
          >
            All{" "}
            <span className="opacity-60 ml-1 text-xs">
              {!currentParams.category ? `(${total})` : ""}
            </span>
          </Link>
          {categories.map((c) => (
            <Link
              key={c._id}
              href={buildUrl({ category: c.slug, page: null })}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 uppercase tracking-widest hidden sm:inline-block ${
                currentParams.category === c.slug
                  ? "bg-text text-bg"
                  : "bg-surface text-muted border border-border hover:text-text hover:border-text"
              }`}
            >
              {c.name}
            </Link>
          ))}

          <select
            value={currentParams.category ?? ""}
            onChange={(e) => {
              const v = e.target.value || null;
              router.push(buildUrl({ category: v ?? null, page: null }));
            }}
            className="sm:hidden rounded-full border border-border bg-surface px-4 py-2 text-text text-sm font-semibold uppercase tracking-widest outline-none"
          >
            <option value="">Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <form
          onSubmit={handleSearch}
          className="flex w-full md:w-[300px] relative"
        >
          <input
            type="text"
            name="q"
            defaultValue={currentParams.search || ""}
            placeholder="Search stories..."
            className="w-full rounded-full border border-border bg-surface pl-5 pr-12 py-2.5 text-text text-sm focus:border-text outline-none transition-colors"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text p-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>
      </div>

      {tags.length > 0 && (
        <div className="mb-10 flex flex-wrap gap-2">
          {tags.map((t) => (
            <Link
              key={t._id}
              href={buildUrl({
                tag: currentParams.tag === t.slug ? null : t.slug,
                page: null,
              })}
              className={`px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider transition-colors ${
                currentParams.tag === t.slug
                  ? "bg-text text-bg border-text"
                  : "bg-surface text-muted border-border hover:border-text hover:text-text"
              }`}
            >
              #{t.name}
            </Link>
          ))}
        </div>
      )}

      {/* Grid */}
      {blogs.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-center col-span-full border border-dashed border-border rounded-lg bg-surface/50">
          <svg
            className="w-12 h-12 text-muted mb-4 opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v10a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-xl font-display uppercase text-text mb-2">
            No Stories Found
          </p>
          <p className="text-muted text-sm max-w-sm">
            We couldn't find any stories matching your current filters and
            search.
          </p>
          {(currentParams.search || currentParams.category) && (
            <Link
              href={basePath}
              className="mt-6 px-6 py-2 bg-text text-bg rounded-full text-xs font-bold uppercase tracking-widest hover:opacity-90"
            >
              Clear Filters
            </Link>
          )}
        </div>
      ) : (
        <ul className="grid list-none grid-cols-1 gap-6 p-0 m-0 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((b) => (
            <li key={b._id}>
              <BlogCard blog={b} headingLevel="h2" />
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-16 flex items-center justify-center gap-4">
          {page > 1 ? (
            <Link
              href={buildUrl({ page: String(page - 1) })}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-surface text-text hover:border-text transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
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
            <div className="w-10 h-10 rounded-full border border-transparent flex items-center justify-center opacity-30 cursor-not-allowed text-muted">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
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

          <span className="text-sm font-bold tracking-widest text-muted uppercase">
            Page <span className="text-text">{page}</span> of {totalPages}
          </span>

          {page < totalPages ? (
            <Link
              href={buildUrl({ page: String(page + 1) })}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-surface text-text hover:border-text transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
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
            <div className="w-10 h-10 rounded-full border border-transparent flex items-center justify-center opacity-30 cursor-not-allowed text-muted">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
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
