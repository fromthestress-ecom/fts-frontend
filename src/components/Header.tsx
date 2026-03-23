"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { CartLink } from "./CartLink";
import { ThemeAwareImg } from "./ThemeAwareImg";
import { ThemeToggle } from "./ThemeToggle";
import { AuthDrawer } from "./AuthDrawer";
import { UserDropdown } from "./UserDropdown";
import { useAuth } from "@/contexts/AuthContext";
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
  if (value.toLowerCase() === item.label.toLowerCase()) return true;
  return item.children.some((c) => c.slug === value);
}

// ─── Logo ────────────────────────────────────────────────────────────────────

function Logo({ className }: { className?: string }) {
  return (
    <ThemeAwareImg
      darkSrc="/logo/logo_white.webp"
      lightSrc="/logo/logo_black.webp"
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
  /** Mobile: accordion expand/collapse; Desktop: slide-down panel */
  variant: "mobile" | "desktop";
  openNavKey?: string | null;
  onToggleNav?: (key: string) => void;
  onClose?: () => void;
  activePanel?: string | null;
  onPanelEnter?: (key: string) => void;
  onPanelLeave?: () => void;
};

function NavItems({
  navGroups,
  pathname,
  searchParams,
  variant,
  openNavKey,
  onToggleNav,
  onClose,
  activePanel,
  onPanelEnter,
  onPanelLeave,
}: NavItemsProps) {
  const isMobile = variant === "mobile";

  const linkBase = isMobile
    ? "rounded-lg px-4 py-3 text-lg uppercase"
    : "text-sm sm:text-base uppercase";

  const activeClass = "font-semibold text-accent";
  const inactiveClass = "font-normal text-muted";

  const aboutActiveClass =
    pathname === "/ve-chung-toi" ? activeClass : inactiveClass;
  const bestSellerActiveClass =
    pathname === "/best-selling" ? activeClass : inactiveClass;
  const contactActiveClass =
    pathname === "/lien-he" ? activeClass : inactiveClass;
  const blogsActiveClass = pathname?.startsWith("/blogs")
    ? activeClass
    : inactiveClass;

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
                  onClick={(e) => {
                    // If they click the label but it's not the arrow, maybe route them to the group instead of just expanding?
                    // But in accordion, usually the whole row expands it.
                    // Let's keep it expanding for now.
                    onToggleNav?.(key);
                  }}
                  className={`flex w-full items-center justify-between ${linkBase} text-left ${itemActiveClass}`}
                  aria-expanded={isOpen}
                >
                  <Link
                    href={`/san-pham?danh_muc=${encodeURIComponent(item.label.toLowerCase())}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose?.();
                    }}
                    className="hover:text-accent"
                  >
                    {item.label}
                  </Link>
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

          // Desktop: slide-down panel trigger
          return (
            <div
              key={key}
              className="relative -mx-1"
              onMouseEnter={() => onPanelEnter?.(key)}
              onMouseLeave={() => onPanelLeave?.()}
            >
              <Link
                href={`/san-pham?danh_muc=${encodeURIComponent(item.label.toLowerCase())}`}
                className={`${linkBase} ${itemActiveClass} relative block px-3 py-3 transition-colors duration-200 hover:text-accent ${activePanel === key ? "text-accent" : ""}`}
              >
                {item.label}
                <span
                  className={`absolute bottom-1 left-3 right-3 h-[2px] bg-accent transition-all duration-300 ${activePanel === key ? "opacity-100" : "opacity-0"}`}
                />
              </Link>
            </div>
          );
        })
      )}

      <Link
        href="/best-selling"
        onClick={onClose}
        className={
          isMobile
            ? `${linkBase} ${bestSellerActiveClass}`
            : `${linkBase} ${bestSellerActiveClass}`
        }
      >
        Best Sellers
      </Link>

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
            ? `${linkBase} ${contactActiveClass}`
            : `${linkBase} ${contactActiveClass}`
        }
      >
        Contact
      </Link>

      <Link
        href="/blogs"
        onClick={onClose}
        className={
          isMobile
            ? `${linkBase} ${blogsActiveClass}`
            : `${linkBase} ${blogsActiveClass}`
        }
      >
        Blogs
      </Link>

      <Link
        href="/vouchers-collector"
        onClick={onClose}
        className={
          isMobile
            ? `${linkBase} ${blogsActiveClass}`
            : `${linkBase} ${blogsActiveClass}`
        }
      >
        Vouchers
      </Link>
    </>
  );
}

// ─── Slide-down Panel (Desktop) ──────────────────────────────────────────────

type SlideDownPanelProps = {
  navGroups: NavGroupItem[];
  activePanel: string | null;
  pathname: string;
  searchParams: URLSearchParams | null;
  onMouseEnter: (key: string) => void;
  onMouseLeave: () => void;
};

function SlideDownPanel({
  navGroups,
  activePanel,
  pathname,
  searchParams,
  onMouseEnter,
  onMouseLeave,
}: SlideDownPanelProps) {
  const activeGroup = navGroups.find((g) => g.label === activePanel);
  const isOpen = !!activeGroup;
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    headerRef.current = document.querySelector("header.header-bar");
  }, []);

  const backdrop =
    typeof document !== "undefined"
      ? createPortal(
          <div
            className={`fixed inset-0 z-[100] bg-black/40 transition-opacity duration-300 ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
            style={{ top: headerRef.current ? `${headerRef.current.getBoundingClientRect().bottom}px` : "0px" }}
            onMouseEnter={onMouseLeave}
          />,
          document.body,
        )
      : null;

  return (
    <>
      {backdrop}
      {/* Panel - positioned right below the nav wrapper */}
      <div
        className={`absolute left-0 right-0 top-full z-[99] overflow-hidden border-b border-border bg-bg/95 backdrop-blur-md shadow-lg transition-all duration-300 ease-out ${isOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}
        onMouseEnter={() => activePanel && onMouseEnter(activePanel)}
        onMouseLeave={onMouseLeave}
      >
        <div className="mx-auto max-w-[1280px] px-6 py-8">
          {activeGroup && (
            <div className="flex gap-12">
              <div>
                <h3 className="font-display mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                  {activeGroup.label}
                </h3>
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {activeGroup.children.map((child) => {
                    const childActive =
                      pathname === "/san-pham" &&
                      (searchParams?.get("danh_muc") ?? "") === child.slug;
                    return (
                      <li key={child.slug}>
                        <Link
                          href={getChildHref(activeGroup.label, child.slug)}
                          className={`text-sm transition-colors duration-150 hover:text-accent ${childActive ? "font-semibold text-accent" : "text-text"}`}
                        >
                          {child.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="flex items-center">
                <Link
                  href={`/san-pham?danh_muc=${encodeURIComponent(activeGroup.label.toLowerCase())}`}
                  className="text-xs font-semibold uppercase tracking-[0.15em] text-muted transition-colors hover:text-accent"
                >
                  Xem tất cả {activeGroup.label} →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
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
        className={`fixed inset-y-0 right-0 z-[101] w-[min(100vw)] flex flex-col bg-bg shadow-xl transition-all duration-300 ease-out md:hidden ${isOpen ? "translate-x-0" : "translate-x-full"} ${isAtTop ? "top-[106px]" : "top-[72px]"}`}
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
  const { user, loading: authLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openNavKey, setOpenNavKey] = useState<string | null>(null);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const panelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePanelEnter = useCallback((key: string) => {
    if (panelTimeoutRef.current) clearTimeout(panelTimeoutRef.current);
    setActivePanel(key);
  }, []);

  const handlePanelLeave = useCallback(() => {
    panelTimeoutRef.current = setTimeout(() => setActivePanel(null), 300);
  }, []);

  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/san-pham?q=${encodeURIComponent(searchQuery.trim())}`);
      closeMenu();
    }
  };

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
    setActivePanel(null);
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

  const isAdminRoute = pathname?.startsWith("/admin");

  return (
    <>
      {/* Announcement bar */}
      {!isAdminRoute && (
        <div className="announcement-bar">
          <div className="announcement-bar__track">
            {[...Array(6)].map((_, i) => (
              <span key={i} className="announcement-bar__item">
                Welcome to From the Stress
              </span>
            ))}
          </div>
        </div>
      )}

      <header className="header-bar sticky top-0 z-[101] border-b border-border backdrop-blur-md py-4 max-sm:py-0">
        <div className="relative z-[60] mx-auto flex max-w-[1280px] items-center justify-between px-4 py-0 sm:px-6 max-sm:py-4">
          {/* Left: desktop logo / mobile cart */}
          <div className="flex w-1/3 justify-start sm:w-auto sm:flex-initial">
            <Link href="/" className="hidden sm:inline-block">
              <Logo className="w-[100px] max-md:w-24 object-contain aspect-[2/1]" />
            </Link>
            {!isAdminRoute && (
              <div className="sm:hidden">
                <CartLink iconOnly />
              </div>
            )}
          </div>

          {/* Center: mobile logo. Desktop: Search bar */}
          <Link href="/" className="flex flex-1 justify-center sm:hidden">
            <Logo className="h-8 w-24 max-md:w-16 object-contain sm:h-9 sm:w-[100px]" />
          </Link>

          {!isAdminRoute && (
            <div className="hidden flex-1 md:flex items-center justify-center px-4 md:px-8 xl:px-12">
              <form
                onSubmit={handleSearch}
                className="flex w-full max-w-2xl items-center rounded-sm border border-border overflow-hidden bg-surface transition-colors focus-within:border-accent"
              >
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="flex-1 bg-transparent px-4 py-2 text-sm text-text outline-none placeholder:text-muted h-[40px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  aria-label="Tìm kiếm"
                  className="flex h-[40px] w-[50px] items-center justify-center bg-[#333] text-white transition-colors hover:bg-black"
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
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
              </form>
            </div>
          )}

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-5">
            {!isAdminRoute && (
              <>
                {!authLoading && (
                  <div className="flex items-center">
                    {user ? (
                      <UserDropdown />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsAuthOpen(true)}
                        aria-label="Đăng nhập"
                        className="flex items-center gap-2 group text-left"
                      >
                        <div className="flex items-center justify-center text-muted transition-colors group-hover:text-text">
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                        <div className="flex flex-col text-sm leading-tight">
                          <span className="text-muted text-xs">
                            Đăng nhập / Đăng ký
                          </span>
                          <span className="font-semibold text-text flex items-center gap-1">
                            Tài khoản của tôi{" "}
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="opacity-50"
                            >
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          </span>
                        </div>
                      </button>
                    )}
                  </div>
                )}

                <CartLink showText />
              </>
            )}
            <ThemeToggle />
          </div>

          {/* Mobile right: theme + hamburger */}
          <div className="flex w-1/3 justify-end items-center gap-2 sm:w-auto sm:flex-initial md:hidden">
            <ThemeToggle />
            {!isAdminRoute && (
              <>
                {!authLoading &&
                  (user ? (
                    <UserDropdown />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAuthOpen(true)}
                      aria-label="Đăng nhập"
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-transparent text-muted transition-colors hover:text-text hover:border-text"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </button>
                  ))}
                <div className="hidden sm:block">
                  <CartLink />
                </div>
                <HamburgerButton
                  isOpen={isMenuOpen}
                  onToggle={() => setIsMenuOpen((prev) => !prev)}
                />
              </>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        {!isAdminRoute && (
          <div className="md:hidden px-4 pb-4">
            <form
              onSubmit={handleSearch}
              className="flex w-full items-center rounded-sm overflow-hidden bg-[#f5f5f5] dark:bg-surface border border-transparent transition-colors focus-within:border-accent"
            >
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="flex-1 bg-transparent px-4 py-2 text-sm text-text outline-none placeholder:text-muted h-[40px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                aria-label="Tìm kiếm"
                className="flex h-[40px] w-[50px] items-center justify-center text-muted transition-colors hover:text-text"
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
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            </form>
          </div>
        )}
        {!isAdminRoute && (
          <div className="relative hidden md:block">
            <nav className="flex items-center gap-6 md:gap-8 justify-center pt-4 pb-2">
              <NavItems
                navGroups={navGroups}
                pathname={pathname}
                searchParams={searchParams}
                variant="desktop"
                activePanel={activePanel}
                onPanelEnter={handlePanelEnter}
                onPanelLeave={handlePanelLeave}
              />
            </nav>
            <SlideDownPanel
              navGroups={navGroups}
              activePanel={activePanel}
              pathname={pathname}
              searchParams={searchParams}
              onMouseEnter={handlePanelEnter}
              onMouseLeave={handlePanelLeave}
            />
          </div>
        )}
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

      {/* Auth Drawer */}
      <AuthDrawer isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
