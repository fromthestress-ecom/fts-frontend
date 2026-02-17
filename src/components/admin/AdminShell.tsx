'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { setAdminKey } from './AdminGuard';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === '/admin/login';

  const handleLogout = () => {
    setAdminKey(null);
    router.replace('/admin/login');
  };

  if (isLogin) {
    return <div style={{ minHeight: '60vh', background: 'var(--surface)' }}>{children}</div>;
  }

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '60vh',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
      }}
    >
      <aside
        style={{
          width: 220,
          borderRight: '1px solid var(--border)',
          padding: '1.5rem 0',
        }}
      >
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Link
            href="/admin"
            style={{
              padding: '0.5rem 1.5rem',
              color: pathname === '/admin' ? 'var(--accent)' : 'var(--muted)',
            }}
          >
            Dashboard
          </Link>
          <Link
            href="/admin/categories"
            style={{
              padding: '0.5rem 1.5rem',
              color: pathname?.startsWith('/admin/categories') ? 'var(--accent)' : 'var(--muted)',
            }}
          >
            Danh mục
          </Link>
          <Link
            href="/admin/products"
            style={{
              padding: '0.5rem 1.5rem',
              color: pathname?.startsWith('/admin/products') ? 'var(--accent)' : 'var(--muted)',
            }}
          >
            Sản phẩm
          </Link>
          <Link
            href="/"
            style={{
              padding: '0.5rem 1.5rem',
              color: 'var(--accent)',
              marginTop: '1rem',
            }}
          >
            ← Về trang chủ
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              margin: '0.5rem 1.5rem 0',
              padding: '0.5rem',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 4,
              color: 'var(--muted)',
              cursor: 'pointer',
              textAlign: 'left',
              width: 'calc(100% - 3rem)',
            }}
          >
            Đăng xuất
          </button>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: '1.5rem 2rem' }}>{children}</main>
    </div>
  );
}
