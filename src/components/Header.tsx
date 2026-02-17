"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CartLink } from "./CartLink";

const NAV = [
  { href: "/", label: "Trang chủ" },
  { href: "/san-pham", label: "Sản phẩm" },
  // { href: '/admin', label: 'Admin' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(10, 10, 10, 0.9)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "1rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.75rem",
            letterSpacing: "0.15em",
            color: "var(--text)",
          }}
        >
          <img
            src="https://pub-74aaef109f0d41358e5610e57268bc04.r2.dev/pages/logos/logo_white.png"
            alt="STREETWEAR"
            style={{
              width: "100px",
              objectFit: "contain",
            }}
          />
        </Link>
        <nav style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                color:
                  pathname === href ||
                  (href !== "/" && pathname?.startsWith(href))
                    ? "var(--accent)"
                    : "var(--muted)",
                fontWeight: pathname === href ? 600 : 400,
              }}
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
