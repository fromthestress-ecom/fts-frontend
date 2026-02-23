"use client";

import Link from "next/link";
import type { Category } from "@/lib/api";

const PRODUCTS_BASE = "/san-pham";

type ProductCategoryNavProps = {
  categories: Category[];
  pathname: string | null;
  basePath?: string;
  className?: string;
  linkClassName?: string;
};

export function ProductCategoryNav({
  categories,
  pathname,
  basePath = PRODUCTS_BASE,
  className = "",
  linkClassName = "",
}: ProductCategoryNavProps) {
  const isAllActive =
    pathname === basePath && !pathname?.includes("?danh_muc=");
  const baseLink =
    "block px-4 py-2 text-sm transition-colors duration-150 hover:bg-border/60 hover:text-text " +
    linkClassName;

  return (
    <div
      className={`min-w-[180px] rounded-lg border border-border bg-surface py-1 shadow-lg ${className}`}
    >
      <Link
        href={basePath}
        className={`${baseLink} ${
          isAllActive ? "font-semibold text-accent" : "text-muted"
        }`}
      >
        Tất cả
      </Link>
      {categories.map((c) => {
        const href = `${basePath}?danh_muc=${encodeURIComponent(c._id)}`;
        const isActive = pathname?.includes(`danh_muc=${c._id}`);
        return (
          <Link
            key={c._id}
            href={href}
            className={`${baseLink} ${
              isActive ? "font-semibold text-accent" : "text-muted"
            }`}
          >
            {c.name}
          </Link>
        );
      })}
    </div>
  );
}
