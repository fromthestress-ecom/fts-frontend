"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CartLink } from "./CartLink";
import { ThemeAwareImg } from "./ThemeAwareImg";
import { ThemeToggle } from "./ThemeToggle";
import type { NavGroupItem } from "@/lib/navGroups";

// ─── Helpers ────────────────────────────────────────────────────────────────

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

// ─── Logo ────────────────────────────────────────────────────────────────────

function Logo({ className }: { className?: string }) {
  return (
    <ThemeAwareImg
      darkSrc="/logo/logo_white.png"
      lightSrc="/logo/logo_black.png"
      alt="STREETWEAR"
      className={className}
    />
  );
}

// ─── Hamburger Button ────────────────────────────────────────────────────────

function HamburgerButton({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-label={isOpen ? "Đóng menu" : "Mở menu"}
      className="flex h-10 w-10 flex-col items-center justify-center gap-1 rounded border-0 bg-transparent text-text focus:outline-none"
    >
      <span
        className={`block h-0.5 w-6 origin-center rounded-full bg-current transition-all duration-300 ease-out ${isOpen ? "translate-y-[6px] rotate-45" : ""}`}
      />
      <span
        className={`block h-0.5 w-6 rounded-full bg-current transition-all duration-300 ease-out ${isOpen ? "scale-x-0 opacity-0" : ""}`}
      />
      <span
        className={`block h-0.5 w-6 origin-center rounded-full bg-current transition-all duration-300 ease-out ${isOpen ? "-translate-y-[6px] -rotate-45" : ""}`}
      />
    </button>
  );
}

// ─── NavItems (shared) ───────────────────────────────────────────────────────

type NavItemsProps = {
  navGroups: NavGroupItem[];
  pathname: string;
  searchParams: URLSearchParams | null;
  /** Mobile: accordion expand/collapse; Desktop: CSS hover dropdown */
  variant: "mobile" | "desktop";
  openNavKey?: string | null;
  onToggleNav?: (key: string) => void;
  onClose?: () => void;
};

function NavItems({
  navGroups,
  pathname,
  searchParams,
  variant,
  openNavKey,
  onToggleNav,
  onClose,
}: NavItemsProps) {
  const isMobile = variant === "mobile";

  const linkBase = isMobile
    ? "rounded-lg px-4 py-3 text-lg uppercase"
    : "text-sm sm:text-base uppercase";

  const activeClass = "font-semibold text-accent";
  const inactiveClass = "font-normal text-muted";

  const aboutActiveClass =
    pathname === "/ve-chung-toi" ? activeClass : inactiveClass;

  return (
    <>
      {navGroups.length === 0 ? (
        <Link
          href="/san-pham"
          onClick={onClose}
          className={
            isMobile
              ? `${linkBase} ${inactiveClass}`
              : `text-sm sm:text-base ${inactiveClass}`
          }
        >
          Sản phẩm
        </Link>
      ) : (
        navGroups.map((item) => {
          const key = item.label;
          const isActive = isNavItemActive(item, searchParams);
          const itemActiveClass = isActive ? activeClass : inactiveClass;

          if (isMobile) {
            const isOpen = openNavKey === key;
            return (
              <div key={key} className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => onToggleNav?.(key)}
                  className={`flex w-full items-center justify-between ${linkBase} text-left ${itemActiveClass}`}
                  aria-expanded={isOpen}
                >
                  {item.label}
                  <span
                    className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
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
                      const childActive =
                        pathname === "/san-pham" &&
                        (searchParams?.get("danh_muc") ?? "") === child.slug;
                      return (
                        <Link
                          key={child.slug}
                          href={getChildHref(item.label, child.slug)}
                          onClick={onClose}
                          className={`rounded-lg px-4 py-2.5 text-base ${childActive ? activeClass : "text-muted"}`}
                        >
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Desktop: hover dropdown
          return (
            <div key={key} className="relative group">
              <Link
                href="/san-pham"
                className={`${linkBase} ${itemActiveClass}`}
              >
                {item.label}
              </Link>
              <div className="absolute left-0 top-full z-10 hidden min-w-[180px] pt-1 group-hover:block">
                <div className="rounded-lg border border-border bg-surface py-1 shadow-lg">
                  {item.children.map((child) => {
                    const childActive =
                      pathname === "/san-pham" &&
                      (searchParams?.get("danh_muc") ?? "") === child.slug;
                    return (
                      <Link
                        key={child.slug}
                        href={getChildHref(item.label, child.slug)}
                        className={`block px-4 py-2 text-sm transition-colors duration-150 hover:bg-border/60 hover:text-text ${childActive ? activeClass : "text-muted"}`}
                      >
                        {child.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })
      )}

      <Link
        href="/ve-chung-toi"
        onClick={onClose}
        className={
          isMobile
            ? `${linkBase} ${aboutActiveClass}`
            : `${linkBase} ${aboutActiveClass}`
        }
      >
        About Us
      </Link>

      <Link
        href="/lien-he"
        onClick={onClose}
        className={
          isMobile
            ? `${linkBase} ${aboutActiveClass}`
            : `${linkBase} ${aboutActiveClass}`
        }
      >
        Contact
      </Link>

      <Link
        href="/blogs"
        onClick={onClose}
        className={
          isMobile
            ? `${linkBase} ${aboutActiveClass}`
            : `${linkBase} ${aboutActiveClass}`
        }
      >
        Blogs
      </Link>
    </>
  );
}

// ─── Mobile Menu Panel ───────────────────────────────────────────────────────

type MobileMenuProps = {
  isOpen: boolean;
  isAtTop: boolean;
  navGroups: NavGroupItem[];
  pathname: string;
  searchParams: URLSearchParams | null;
  openNavKey: string | null;
  onToggleNav: (key: string) => void;
  onClose: () => void;
};

function MobileMenu({
  isOpen,
  isAtTop,
  navGroups,
  pathname,
  searchParams,
  openNavKey,
  onToggleNav,
  onClose,
}: MobileMenuProps) {
  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 z-[100] bg-black/70 transition-opacity duration-300 ease-out md:hidden ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        style={{ top: 0, left: 0, right: 0, bottom: 0 }}
        aria-hidden={!isOpen}
        onClick={onClose}
      />
      {/* Slide-in panel */}
      <div
        className={`fixed inset-y-0 right-0 z-[101] w-[min(100vw,320px)] flex flex-col bg-bg shadow-xl transition-all duration-300 ease-out md:hidden ${isOpen ? "translate-x-0" : "translate-x-full"} ${isAtTop ? "top-[106px]" : "top-[72px]"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <nav className="flex flex-col gap-1 px-4 pt-0 pb-6">
          <Link
            href="/san-pham"
            className="px-4 py-3 text-lg uppercase text-muted"
          >
            SHOP
          </Link>
          <NavItems
            navGroups={navGroups}
            pathname={pathname}
            searchParams={searchParams}
            variant="mobile"
            openNavKey={openNavKey}
            onToggleNav={onToggleNav}
            onClose={onClose}
          />
        </nav>
      </div>
    </>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────

type HeaderProps = {
  navGroups?: NavGroupItem[];
};

export function Header({ navGroups = [] }: HeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openNavKey, setOpenNavKey] = useState<string | null>(null);
  const [isAtTop, setIsAtTop] = useState(true);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    setOpenNavKey(null);
  }, []);

  const toggleNav = useCallback((key: string) => {
    setOpenNavKey((prev) => (prev === key ? null : key));
  }, []);

  // Close on route change
  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  // Track scroll position to toggle menu top offset
  useEffect(() => {
    const handleScroll = () => setIsAtTop(window.scrollY === 0);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Escape key + body scroll lock
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

  return (
    <>
      {/* Announcement bar */}
      <div className="announcement-bar">
        <div className="announcement-bar__track">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="announcement-bar__item">
              Women's Day Sale 10% off
            </span>
          ))}
        </div>
      </div>

      <header className="header-bar sticky top-0 z-[101] border-b border-border backdrop-blur-md">
        <div className="relative z-[60] mx-auto flex max-w-[1280px] items-center justify-between px-4 py-0 sm:px-6 max-sm:py-4">
          {/* Left: desktop logo / mobile cart */}
          <div className="flex w-1/3 justify-start sm:w-auto sm:flex-initial">
            <Link href="/" className="hidden sm:inline-block">
              <Logo className="w-[100px] max-md:w-24 object-contain aspect-square" />
            </Link>
            <div className="sm:hidden">
              <CartLink iconOnly />
            </div>
          </div>

          {/* Center: mobile logo */}
          <Link href="/" className="flex flex-1 justify-center sm:hidden">
            <Logo className="h-8 w-24 max-md:w-16 object-contain sm:h-9 sm:w-[100px]" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 md:flex md:gap-8">
            <NavItems
              navGroups={navGroups}
              pathname={pathname}
              searchParams={searchParams}
              variant="desktop"
            />
          </nav>

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              aria-label="Tìm kiếm"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-transparent text-muted transition-colors hover:text-text hover:border-text"
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
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            <ThemeToggle />
            <CartLink />
            <Link href="/san-pham" className="header-shop-btn">
              Shop all items
            </Link>
          </div>

          {/* Mobile right: theme + hamburger */}
          <div className="flex w-1/3 justify-end items-center gap-2 sm:w-auto sm:flex-initial md:hidden">
            <ThemeToggle />
            <div className="hidden sm:block">
              <CartLink />
            </div>
            <HamburgerButton
              isOpen={isMenuOpen}
              onToggle={() => setIsMenuOpen((prev) => !prev)}
            />
          </div>
        </div>
      </header>

      {/* Mobile menu: portal into body so overlay is above everything */}
      {typeof document !== "undefined" &&
        createPortal(
          <MobileMenu
            isOpen={isMenuOpen}
            isAtTop={isAtTop}
            navGroups={navGroups}
            pathname={pathname}
            searchParams={searchParams}
            openNavKey={openNavKey}
            onToggleNav={toggleNav}
            onClose={closeMenu}
          />,
          document.body,
        )}
    </>
  );
}
