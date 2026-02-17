'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Cart } from '@/lib/api';
import { setCartCount } from '@/hooks/useCartCount';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

function getGuestId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('streetwear-guest-id');
  if (!id) {
    id = `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('streetwear-guest-id', id);
  }
  return id;
}

export function CartContent() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    const guestId = getGuestId();
    const res = await fetch(`${API}/cart`, { headers: { 'x-guest-id': guestId } });
    if (res.ok) {
      const data = (await res.json()) as Cart;
      setCart(data);
      const total = data.items?.reduce((s, i) => s + i.quantity, 0) ?? 0;
      setCartCount(total);
    } else {
      setCart({ _id: '', items: [] });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCart();
  }, []);

  const updateQuantity = async (productId: string, quantity: number) => {
    const guestId = getGuestId();
    const res = await fetch(`${API}/cart/items/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-guest-id': guestId },
      body: JSON.stringify({ quantity }),
    });
    if (res.ok) loadCart();
  };

  const removeItem = async (productId: string) => {
    const guestId = getGuestId();
    await fetch(`${API}/cart/items/${productId}`, {
      method: 'DELETE',
      headers: { 'x-guest-id': guestId },
    });
    loadCart();
  };

  if (loading) {
    return <p style={{ color: 'var(--muted)' }}>Đang tải giỏ hàng...</p>;
  }

  if (!cart?.items?.length) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
        <p>Giỏ hàng trống.</p>
        <Link href="/san-pham" style={{ color: 'var(--accent)', marginTop: '1rem', display: 'inline-block' }}>
          Mua sắm ngay
        </Link>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, i) => {
    const p = i.productId as { price?: number };
    return sum + (p?.price ?? 0) * i.quantity;
  }, 0);

  return (
    <>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {cart.items.map((item) => {
          const p = item.productId as { _id: string; name: string; price: number; images?: string[] };
          const lineTotal = (p?.price ?? 0) * item.quantity;
          return (
            <li
              key={`${p._id}-${item.size ?? ''}-${item.color ?? ''}`}
              style={{
                display: 'flex',
                gap: '1rem',
                padding: '1rem 0',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  background: 'var(--surface)',
                  borderRadius: 4,
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {p?.images?.[0] ? (
                  <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : null}
              </div>
              <div style={{ flex: 1 }}>
                <Link href={`/san-pham/${(p as { slug?: string }).slug ?? p._id}`} style={{ fontWeight: 600 }}>
                  {p?.name}
                </Link>
                {(item.size || item.color) && (
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--muted)' }}>
                    {[item.size, item.color].filter(Boolean).join(' / ')}
                  </p>
                )}
                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => updateQuantity(p._id, Math.max(0, item.quantity - 1))}
                    style={{
                      width: 28,
                      height: 28,
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                      borderRadius: 4,
                      color: 'var(--text)',
                    }}
                  >
                    −
                  </button>
                  <span style={{ minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(p._id, item.quantity + 1)}
                    style={{
                      width: 28,
                      height: 28,
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                      borderRadius: 4,
                      color: 'var(--text)',
                    }}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(p._id)}
                    style={{
                      marginLeft: 'auto',
                      background: 'none',
                      border: 'none',
                      color: 'var(--muted)',
                      fontSize: '0.875rem',
                    }}
                  >
                    Xóa
                  </button>
                </div>
              </div>
              <div style={{ fontWeight: 700, color: 'var(--accent)' }}>
                {new Intl.NumberFormat('vi-VN').format(lineTotal)}₫
              </div>
            </li>
          );
        })}
      </ul>
      <div
        style={{
          marginTop: '2rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '1.125rem' }}>Tạm tính</span>
        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)' }}>
          {new Intl.NumberFormat('vi-VN').format(subtotal)}₫
        </span>
      </div>
      <Link
        href="/thanh-toan"
        style={{
          display: 'inline-block',
          marginTop: '1.5rem',
          padding: '0.875rem 2rem',
          background: 'var(--accent)',
          color: 'var(--bg)',
          fontWeight: 700,
          borderRadius: 4,
        }}
      >
        Thanh toán
      </Link>
    </>
  );
}
