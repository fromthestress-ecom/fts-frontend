"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { setAdminKey } from "./AdminGuard";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive: (pathname: string) => boolean;
  badge?: string;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    label: "Navigation",
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        icon: (
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-accent/10 text-accent">
            ⌂
          </span>
        ),
        isActive: (pathname) => pathname === "/admin",
      },
      {
        href: "/admin/orders",
        label: "Đơn hàng",
        icon: (
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-sky-500/10 text-sky-400">
            ⇄
          </span>
        ),
        isActive: (pathname) =>
          pathname === "/admin/orders" ||
          pathname.startsWith("/admin/orders/"),
      },
      {
        href: "/admin/users",
        label: "Người dùng",
        icon: (
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-emerald-500/10 text-emerald-400">
            👤
          </span>
        ),
        isActive: (pathname) =>
          pathname === "/admin/users" ||
          pathname.startsWith("/admin/users/"),
      },
    ],
  },
  {
    label: "Catalog",
    items: [
      {
        href: "/admin/categories",
        label: "Danh mục",
        icon: (
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-amber-500/10 text-amber-400">
            #
          </span>
        ),
        isActive: (pathname) =>
          pathname === "/admin/categories" ||
          pathname.startsWith("/admin/categories/"),
      },
      {
        href: "/admin/products",
        label: "Sản phẩm",
        icon: (
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-indigo-500/10 text-indigo-400">
            ☐
          </span>
        ),
        isActive: (pathname) =>
          pathname === "/admin/products" ||
          pathname.startsWith("/admin/products/"),
      },
      {
        href: "/admin/templates",
        label: "Mẫu mô tả",
        icon: (
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-fuchsia-500/10 text-fuchsia-400">
            T
          </span>
        ),
        isActive: (pathname) =>
          pathname === "/admin/templates" ||
          pathname.startsWith("/admin/templates/"),
      },
      {
        href: "/admin/events",
        label: "Events / Khuyến mãi",
        icon: (
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-red-500/10 text-red-400">
            %
          </span>
        ),
        isActive: (pathname) =>
          pathname === "/admin/events" ||
          pathname.startsWith("/admin/events/"),
        badge: "NEW",
      },
    ],
  },
  {
    label: "Nội dung",
    items: [
      {
        href: "/admin/blogs",
        label: "Bài viết",
        icon: (
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-cyan-500/10 text-cyan-400">
            ✎
          </span>
        ),
        isActive: (pathname) =>
          pathname === "/admin/blogs" ||
          pathname.startsWith("/admin/blogs/"),
      },
      {
        href: "/admin/blog-crawl",
        label: "Auto Crawl",
        icon: (
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-violet-500/10 text-violet-400">
            ⚡
          </span>
        ),
        isActive: (pathname) =>
          pathname === "/admin/blog-crawl" ||
          pathname.startsWith("/admin/blog-crawl/"),
        badge: "AI",
      },
      {
        href: "/admin/blog-categories",
        label: "DM Bài viết",
        icon: (
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-rose-500/10 text-rose-400">
            ☰
          </span>
        ),
        isActive: (pathname) =>
          pathname === "/admin/blog-categories" ||
          pathname.startsWith("/admin/blog-categories/"),
      },
      {
        href: "/admin/authors",
        label: "Tác giả",
        icon: (
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-lime-500/10 text-lime-400">
            ✹
          </span>
        ),
        isActive: (pathname) =>
          pathname === "/admin/authors" ||
          pathname.startsWith("/admin/authors/"),
      },
      {
        href: "/admin/tags",
        label: "Thẻ phân loại",
        icon: (
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-slate-500/10 text-slate-300">
            ⌗
          </span>
        ),
        isActive: (pathname) =>
          pathname === "/admin/tags" || pathname.startsWith("/admin/tags/"),
      },
    ],
  },
  {
    label: "Affiliate & Referral",
    items: [
      {
        href: "/admin/affiliates",
        label: "Affiliate",
        icon: (
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-orange-500/10 text-orange-400">
            %
          </span>
        ),
        isActive: (pathname) =>
          pathname === "/admin/affiliates" ||
          pathname.startsWith("/admin/affiliates/"),
      },
      {
        href: "/admin/referrals",
        label: "Mã giới thiệu",
        icon: (
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-teal-500/10 text-teal-400">
            ↻
          </span>
        ),
        isActive: (pathname) =>
          pathname === "/admin/referrals" ||
          pathname.startsWith("/admin/referrals/"),
        badge: "NEW",
      },
    ],
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";

  const handleLogout = () => {
    setAdminKey(null);
    router.replace("/admin/login");
  };

  if (isLogin) {
    return <div className="min-h-[60vh] bg-surface">{children}</div>;
  }

  return (
    <div className="flex min-h-[60vh] border-t border-border bg-surface">
      <aside className="w-60 shrink-0 border-r border-border bg-bg py-6 text-text">
        <div className="px-6 pb-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          Admin Panel
        </div>
        <nav className="flex flex-col gap-4 text-[13px]">
          {navSections.map((section) => (
            <div key={section.label}>
              <div className="px-6 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                {section.label}
              </div>
              <ul className="m-0 list-none p-0">
                {section.items.map((item) => {
                  const active = item.isActive(pathname || "");
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`group flex items-center gap-3 px-6 py-2.5 text-[13px] transition-colors ${
                          active
                            ? "bg-surface text-text font-semibold"
                            : "text-muted hover:bg-surface hover:text-text"
                        }`}
                      >
                        {item.icon}
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <span className="rounded-full bg-accent text-[9px] font-semibold uppercase tracking-wide text-bg px-1.5 py-0.5">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <div className="mt-4 border-t border-border pt-3">
            <Link
              href="/"
              className="block px-6 py-2 text-[13px] text-accent hover:underline"
            >
              ← Về trang chủ
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="mx-6 mt-2 w-[calc(100%-3rem)] rounded border border-border bg-transparent px-2 py-2 text-left text-[13px] text-muted hover:text-text"
            >
              Đăng xuất
            </button>
          </div>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-6 sm:p-8">{children}</main>
    </div>
  );
}
