"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function DoiTacLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isAffiliate, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [loading, user, router]);

  // For the landing page (doi-tac), don't show sidebar layout
  if (pathname === "/doi-tac") {
    return <>{children}</>;
  }

  // For dashboard sub-pages, require active affiliate
  if (loading) {
    return (
      <div className="affiliate-layout">
        <div className="affiliate-content">
          <p className="text-muted">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAffiliate) {
    return (
      <div className="affiliate-layout">
        <div className="affiliate-content">
          <h1 className="affiliate-content__title">Chưa kích hoạt</h1>
          <p className="text-muted">
            Bạn cần có tài khoản đối tác đã được phê duyệt để truy cập trang
            này.
          </p>
          <Link
            href="/doi-tac"
            className="affiliate-landing__cta"
            style={{ marginTop: "1rem", display: "inline-flex" }}
          >
            Đăng ký Đối tác
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      href: "/doi-tac/dashboard",
      label: "Tổng quan",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      href: "/doi-tac/hoa-hong",
      label: "Hoa hồng",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      href: "/doi-tac/rut-tien",
      label: "Rút tiền",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
    },
    {
      href: "/doi-tac/san-pham",
      label: "Sản phẩm",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
      ),
    },
  ];

  return (
    <div className="affiliate-layout">
      <aside className="affiliate-sidebar">
        <h2 className="affiliate-sidebar__title">Đối tác</h2>
        <nav className="affiliate-sidebar__nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`affiliate-sidebar__link ${
                pathname === item.href ? "affiliate-sidebar__link--active" : ""
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="affiliate-content">{children}</div>
    </div>
  );
}
