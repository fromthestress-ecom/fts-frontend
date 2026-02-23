"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CartLink } from "./CartLink";
import { ProductCategoryNav } from "./ProductCategoryNav";
import { fetchApi } from "@/lib/api";
import type { Category } from "@/lib/api";

const NAV_MAIN = [
  { href: "/", label: "Trang chủ" },
  { href: "/san-pham", label: "Sản phẩm", hasSubmenu: true },
];

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsOpen, setProductsOpen] = useState(false);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    setProductsOpen(false);
  }, []);

  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  useEffect(() => {
    let cancelled = false;
    fetchApi<Category[]>("/categories")
      .then((data) => {
        if (!cancelled) setCategories(data ?? []);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isMenuOpen, closeMenu]);

  const isProductsActive =
    pathname === "/san-pham" || pathname?.startsWith("/san-pham");

  const mobileMenuContent = (
    <>
      {/* Overlay: full viewport, dimmed - render via portal so it sits above all content */}
      <div
        className={`fixed  inset-0 z-[100] bg-black/70 transition-opacity duration-300 ease-out md:hidden ${
          isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ top: 0, left: 0, right: 0, bottom: 0 }}
        aria-hidden={!isMenuOpen}
        onClick={closeMenu}
      />
      {/* Menu panel: slides in from the right */}
      <div
        className={`fixed top-[72px] inset-y-0 right-0 z-[101] w-[min(100vw,320px)] flex flex-col bg-bg shadow-xl transition-transform duration-300 ease-out md:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button on top of menu (above panel content) */}
        {/* <div className="absolute right-4 top-4 z-[102] md:hidden">
          <button
            type="button"
            onClick={closeMenu}
            aria-label="Đóng menu"
            className="flex h-10 w-10 flex-col items-center justify-center gap-1 rounded border-0 bg-transparent text-text focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
          >
            <span
              className={`block h-0.5 w-6 origin-center rounded-full bg-current transition-all duration-300 ease-out ${
                isMenuOpen ? "translate-y-[6px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 rounded-full bg-current transition-all duration-300 ease-out ${
                isMenuOpen ? "scale-x-0 opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 origin-center rounded-full bg-current transition-all duration-300 ease-out ${
                isMenuOpen ? "-translate-y-[6px] -rotate-45" : ""
              }`}
            />
          </button>
        </div> */}
        <nav className="flex flex-col gap-1 px-4 pt-0 pb-6">
          <Link
            href="/"
            onClick={closeMenu}
            className={`rounded-lg px-4 py-3 text-lg ${
              pathname === "/"
                ? "font-semibold text-accent"
                : "font-normal text-muted"
            }`}
          >
            Trang chủ
          </Link>

          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => setProductsOpen((o) => !o)}
              className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-lg ${
                isProductsActive
                  ? "font-semibold text-accent"
                  : "font-normal text-muted"
              }`}
              aria-expanded={productsOpen}
            >
              Sản phẩm
              <span
                className={`transition-transform duration-200 ${
                  productsOpen ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>
            {productsOpen && (
              <div className="flex flex-col gap-0.5 pl-4">
                <Link
                  href="/san-pham"
                  onClick={closeMenu}
                  className={`rounded-lg px-4 py-2.5 text-base ${
                    pathname === "/san-pham" &&
                    !pathname?.includes("?danh_muc=")
                      ? "font-semibold text-accent"
                      : "text-muted"
                  }`}
                >
                  Tất cả
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c._id}
                    href={`/san-pham?danh_muc=${encodeURIComponent(c._id)}`}
                    onClick={closeMenu}
                    className={`rounded-lg px-4 py-2.5 text-base ${
                      pathname?.includes(`danh_muc=${c._id}`)
                        ? "font-semibold text-accent"
                        : "text-muted"
                    }`}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="mt-2 border-t border-border pt-4">
            <div className="px-4 py-2 text-lg">
              <CartLink />
            </div>
          </div>
        </nav>
      </div>
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-[101] border-b border-border bg-[rgba(10,10,10,0.9)] backdrop-blur-md">
        <div className="relative z-[60] mx-auto flex max-w-[1280px] items-center justify-between px-4 py-0 sm:px-6 max-sm:py-4">
          <div className="flex w-1/3 justify-start sm:w-auto sm:flex-initial">
            <Link
              href="/"
              className="font-display text-xl tracking-[0.15em] text-text hidden sm:inline-block sm:text-2xl"
            >
              <img
                src="https://pub-74aaef109f0d41358e5610e57268bc04.r2.dev/pages/logos/logo_white.png"
                alt="STREETWEAR"
                className=" w-[100px] max-md:w-24 object-contain aspect-square"
              />
            </Link>
            <div className="sm:hidden">
              <CartLink iconOnly />
            </div>
          </div>

          <Link
            href="/"
            className="font-display text-xl tracking-[0.15em] text-text flex flex-1 justify-center sm:hidden sm:flex-initial sm:justify-start sm:text-2xl"
          >
            <img
              src="https://pub-74aaef109f0d41358e5610e57268bc04.r2.dev/pages/logos/logo_white.png"
              alt="STREETWEAR"
              className="h-8 w-24 max-md:w-16 object-contain sm:h-9 sm:w-[100px]"
            />
          </Link>

          {/* Desktop nav (md+) */}
          <nav className="hidden items-center gap-6 md:flex md:gap-8">
            <Link
              href="/"
              className={`text-sm sm:text-base ${
                pathname === "/"
                  ? "font-semibold text-accent"
                  : "font-normal text-muted"
              }`}
            >
              Trang chủ
            </Link>
            <div className="relative group">
              <Link
                href="/san-pham"
                className={`text-sm sm:text-base ${
                  isProductsActive
                    ? "font-semibold text-accent"
                    : "font-normal text-muted"
                }`}
              >
                Sản phẩm
              </Link>
              {categories.length > 0 && (
                <div className="absolute left-0 top-full z-10 hidden pt-1 group-hover:block">
                  <ProductCategoryNav
                    categories={categories}
                    pathname={pathname}
                    basePath="/san-pham"
                  />
                </div>
              )}
            </div>
            <CartLink />
          </nav>

          <div className="flex w-1/3 justify-end gap-3 sm:w-auto sm:flex-initial md:hidden">
            <div className="hidden sm:block">
              <CartLink />
            </div>
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
              className="flex h-10 w-10 flex-col items-center justify-center gap-1 rounded border-0 bg-transparent text-text focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
            >
              <span
                className={`block h-0.5 w-6 origin-center rounded-full bg-current transition-all duration-300 ease-out ${
                  isMenuOpen ? "translate-y-[6px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-6 rounded-full bg-current transition-all duration-300 ease-out ${
                  isMenuOpen ? "scale-x-0 opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-6 origin-center rounded-full bg-current transition-all duration-300 ease-out ${
                  isMenuOpen ? "-translate-y-[6px] -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay + menu panel: render into body so overlay is above all content */}
      {typeof document !== "undefined" &&
        createPortal(mobileMenuContent, document.body)}
    </>
  );
}
