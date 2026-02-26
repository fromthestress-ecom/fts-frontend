"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CartLink } from "./CartLink";
import { ThemeAwareImg } from "./ThemeAwareImg";
import { ThemeToggle } from "./ThemeToggle";
import type { NavGroupItem } from "@/lib/navGroups";

function getChildHref(_parentLabel: string, slug: string): string {
  return `/san-pham?danh_muc=${encodeURIComponent(slug)}`;
}

function isNavItemActive(
  item: NavGroupItem,
  searchParams: URLSearchParams | null,
): boolean {
  if (!searchParams) return false;
  const value = searchParams.get("danh_muc");
  if (!value) return false;
  return item.children.some((c) => c.slug === value);
}

type HeaderProps = {
  navGroups?: NavGroupItem[];
};

export function Header({ navGroups = [] }: HeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openNavKey, setOpenNavKey] = useState<string | null>(null);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    setOpenNavKey(null);
  }, []);

  const toggleNav = useCallback((key: string) => {
    setOpenNavKey((prev) => (prev === key ? null : key));
  }, []);

  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

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

          {navGroups.length === 0 ? (
            <Link
              href="/san-pham"
              onClick={closeMenu}
              className="rounded-lg px-4 py-3 text-lg font-normal text-muted"
            >
              Sản phẩm
            </Link>
          ) : (
            navGroups.map((item) => {
              const key = item.label;
              const isOpen = openNavKey === key;
              return (
                <div key={key} className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => toggleNav(key)}
                    className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-lg ${
                      isNavItemActive(item, searchParams)
                        ? "font-semibold text-accent"
                        : "font-normal text-muted"
                    }`}
                    aria-expanded={isOpen}
                  >
                    {item.label}
                    <span
                      className={`transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      <ThemeAwareImg
                        darkSrc="/icon/arrow-down-white.png"
                        lightSrc="/icon/arrow-down-black.png"
                        alt=""
                        className="h-4 w-4 opacity-50"
                      />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="flex flex-col gap-0.5 pl-4">
                      {item.children.map((child) => {
                        const isActive =
                          pathname === "/san-pham" &&
                          (searchParams?.get("danh_muc") ?? "") === child.slug;
                        return (
                          <Link
                            key={child.slug}
                            href={getChildHref(item.label, child.slug)}
                            onClick={closeMenu}
                            className={`rounded-lg px-4 py-2.5 text-base ${
                              isActive
                                ? "font-semibold text-accent"
                                : "text-muted"
                            }`}
                          >
                            {child.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}

          <Link
            href="/ve-chung-toi"
            onClick={closeMenu}
            className={`rounded-lg px-4 py-3 text-lg ${
              pathname === "/ve-chung-toi"
                ? "font-semibold text-accent"
                : "font-normal text-muted"
            }`}
          >
            Về chúng tôi
          </Link>

          <div className="mt-2 flex items-center gap-3 border-t border-border pt-4">
            <div className="px-4 py-2">
              <ThemeToggle />
            </div>
            <div className="text-lg">
              <CartLink />
            </div>
          </div>
        </nav>
      </div>
    </>
  );

  return (
    <>
      <header className="header-bar sticky top-0 z-[101] border-b border-border backdrop-blur-md">
        <div className="relative z-[60] mx-auto flex max-w-[1280px] items-center justify-between px-4 py-0 sm:px-6 max-sm:py-4">
          <div className="flex w-1/3 justify-start sm:w-auto sm:flex-initial">
            <Link
              href="/"
              className="font-display text-xl tracking-[0.15em] text-text hidden sm:inline-block sm:text-2xl"
            >
              <ThemeAwareImg
                darkSrc="/logo/logo_white.png"
                lightSrc="/logo/logo_black.png"
                alt="STREETWEAR"
                className="w-[100px] max-md:w-24 object-contain aspect-square"
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
            <ThemeAwareImg
              darkSrc="/logo/logo_white.png"
              lightSrc="/logo/logo_black.png"
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
            {navGroups.length === 0 ? (
              <Link
                href="/san-pham"
                className="text-sm sm:text-base font-normal text-muted"
              >
                Sản phẩm
              </Link>
            ) : (
              navGroups.map((item) => (
                <div key={item.label} className="relative group">
                  <Link
                    href="/san-pham"
                    className={`text-sm sm:text-base ${
                      isNavItemActive(item, searchParams)
                        ? "font-semibold text-accent"
                        : "font-normal text-muted"
                    }`}
                  >
                    {item.label}
                  </Link>
                  <div className="absolute left-0 top-full z-10 hidden min-w-[180px] pt-1 group-hover:block">
                    <div className="rounded-lg border border-border bg-surface py-1 shadow-lg">
                      {item.children.map((child) => {
                        const isActive =
                          pathname === "/san-pham" &&
                          (searchParams?.get("danh_muc") ?? "") === child.slug;
                        return (
                          <Link
                            key={child.slug}
                            href={getChildHref(item.label, child.slug)}
                            className={`block px-4 py-2 text-sm transition-colors duration-150 hover:bg-border/60 hover:text-text ${
                              isActive
                                ? "font-semibold text-accent"
                                : "text-muted"
                            }`}
                          >
                            {child.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
            <Link
              href="/ve-chung-toi"
              className={`text-sm sm:text-base ${
                pathname === "/ve-chung-toi"
                  ? "font-semibold text-accent"
                  : "font-normal text-muted"
              }`}
            >
              Về chúng tôi
            </Link>
            <ThemeToggle />
            <CartLink />
          </nav>

          <div className="flex w-1/3 justify-end items-center gap-2 sm:w-auto sm:flex-initial md:hidden">
            <ThemeToggle />
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
