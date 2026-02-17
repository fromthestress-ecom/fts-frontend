'use client';

import Link from 'next/link';
import { useCartCount } from '@/hooks/useCartCount';

export function CartLink() {
  const count = useCartCount();

  return (
    <Link
      href="/gio-hang"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: 'var(--muted)',
      }}
    >
      <span aria-hidden>🛒</span>
      <span>Giỏ hàng</span>
      {count > 0 && (
        <span
          style={{
            background: 'var(--accent)',
            color: 'var(--bg)',
            borderRadius: 9999,
            padding: '0.15rem 0.5rem',
            fontSize: '0.75rem',
            fontWeight: 700,
          }}
        >
          {count}
        </span>
      )}
    </Link>
  );
}
