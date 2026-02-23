"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CartLink } from "./CartLink";

const NAV = [
  { href: "/", label: "Trang chủ" },
  { href: "/san-pham", label: "Sản phẩm" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[rgba(10,10,10,0.9)] backdrop-blur-md">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="font-display text-xl tracking-[0.15em] text-text sm:text-2xl">
          <img
            src="https://pub-74aaef109f0d41358e5610e57268bc04.r2.dev/pages/logos/logo_white.png"
            alt="STREETWEAR"
            className="h-8 w-24 object-contain sm:h-9 sm:w-[100px]"
          />
        </Link>
        <nav className="flex items-center gap-6 sm:gap-8">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm sm:text-base ${
                pathname === href || (href !== "/" && pathname?.startsWith(href))
                  ? "font-semibold text-accent"
                  : "font-normal text-muted"
              }`}
            >
              {label}
            </Link>
          ))}
          <CartLink />
        </nav>
      </div>
    </header>
  );
}
