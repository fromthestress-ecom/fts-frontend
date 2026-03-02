"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { setAdminKey } from "./AdminGuard";

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
      <aside className="w-52 shrink-0 border-r border-border py-6 sm:w-56">
        <nav className="flex flex-col gap-1">
          <Link
            href="/admin"
            className={`px-6 py-2 text-sm sm:text-base ${pathname === "/admin" ? "text-accent" : "text-muted"}`}
          >
            Dashboard
          </Link>
          <Link
            href="/admin/categories"
            className={`px-6 py-2 text-sm sm:text-base ${pathname?.startsWith("/admin/categories") ? "text-accent" : "text-muted"}`}
          >
            Danh mục
          </Link>
          <Link
            href="/admin/products"
            className={`px-6 py-2 text-sm sm:text-base ${pathname?.startsWith("/admin/products") ? "text-accent" : "text-muted"}`}
          >
            Sản phẩm
          </Link>
          <Link
            href="/admin/blogs"
            className={`px-6 py-2 text-sm sm:text-base ${pathname?.startsWith("/admin/blogs") ? "text-accent" : "text-muted"}`}
          >
            Bài viết (Blogs)
          </Link>
          <Link
            href="/admin/tags"
            className={`px-6 py-2 text-sm sm:text-base ${pathname?.startsWith("/admin/tags") ? "text-accent" : "text-muted"}`}
          >
            Thẻ phân loại (Tags)
          </Link>
          <Link
            href="/"
            className="mt-4 px-6 py-2 text-accent text-sm sm:text-base"
          >
            ← Về trang chủ
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="mx-6 mt-2 w-[calc(100%-3rem)] rounded border border-border bg-transparent px-2 py-2 text-left text-sm text-muted sm:text-base"
          >
            Đăng xuất
          </button>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-6 sm:p-8">{children}</main>
    </div>
  );
}
