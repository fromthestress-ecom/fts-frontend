'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Cart, CreateOrderDto } from '@/lib/api';
import { setCartCount } from '@/hooks/useCartCount';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

function getGuestId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('streetwear-guest-id');
  if (!id) return '';
  return id;
}

export function CheckoutForm() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const guestId = getGuestId();
    if (!guestId) {
      setLoading(false);
      setCart({ _id: '', items: [] });
      return;
    }
    fetch(`${API}/cart`, { headers: { 'x-guest-id': guestId } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setCart(data ?? { _id: '', items: [] });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!cart?.items?.length) return;
    const form = e.currentTarget;
    const payload: CreateOrderDto = {
      email: (form.email as HTMLInputElement).value.trim(),
      shippingAddress: {
        fullName: (form.fullName as HTMLInputElement).value.trim(),
        phone: (form.phone as HTMLInputElement).value.trim(),
        address: (form.address as HTMLInputElement).value.trim(),
        city: (form.city as HTMLInputElement).value.trim() || undefined,
        district: (form.district as HTMLInputElement).value.trim() || undefined,
        ward: (form.ward as HTMLInputElement).value.trim() || undefined,
      },
      items: cart.items.map((i) => {
        const p = i.productId as { _id: string; name: string; price: number; images?: string[] };
        return {
          productId: p._id,
          name: p.name,
          price: p.price,
          quantity: i.quantity,
          size: i.size,
          color: i.color,
          image: p.images?.[0],
        };
      }),
      note: (form.note as HTMLInputElement).value.trim() || undefined,
    };
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { orderNumber?: string };
      if (!res.ok) throw new Error((data as { message?: string }).message ?? 'Lỗi đặt hàng');
      setCartCount(0);
      localStorage.removeItem('streetwear-guest-id');
      router.push(`/don-hang/${data.orderNumber ?? ''}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p style={{ color: 'var(--muted)' }}>Đang tải...</p>;
  }

  if (!cart?.items?.length) {
    return (
      <p style={{ color: 'var(--muted)' }}>
        Giỏ hàng trống. <Link href="/gio-hang" style={{ color: 'var(--accent)' }}>Xem giỏ hàng</Link>.
      </p>
    );
  }

  const subtotal = cart.items.reduce((s, i) => {
    const p = i.productId as { price?: number };
    return s + (p?.price ?? 0) * i.quantity;
  }, 0);
  const shippingFee = subtotal >= 500000 ? 0 : 30000;

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
          Email *
        </label>
        <input
          type="email"
          name="email"
          required
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            color: 'var(--text)',
          }}
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
          Họ tên *
        </label>
        <input
          type="text"
          name="fullName"
          required
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            color: 'var(--text)',
          }}
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
          Số điện thoại *
        </label>
        <input
          type="tel"
          name="phone"
          required
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            color: 'var(--text)',
          }}
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
          Địa chỉ *
        </label>
        <input
          type="text"
          name="address"
          required
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            color: 'var(--text)',
          }}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Phường/Xã</label>
          <input type="text" name="ward" style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Quận/Huyện</label>
          <input type="text" name="district" style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Tỉnh/Thành</label>
          <input type="text" name="city" style={inputStyle} />
        </div>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Ghi chú</label>
        <input type="text" name="note" style={inputStyle} />
      </div>
      <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: 8, marginBottom: '1rem' }}>
        <p style={{ margin: '0 0 0.5rem', color: 'var(--muted)' }}>
          Tạm tính: {new Intl.NumberFormat('vi-VN').format(subtotal)}₫
        </p>
        <p style={{ margin: '0 0 0.5rem', color: 'var(--muted)' }}>
          Phí ship: {shippingFee === 0 ? 'Miễn phí' : `${new Intl.NumberFormat('vi-VN').format(shippingFee)}₫`}
        </p>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '1.125rem' }}>
          Tổng: {new Intl.NumberFormat('vi-VN').format(subtotal + shippingFee)}₫
        </p>
      </div>
      {error && <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        style={{
          width: '100%',
          padding: '0.875rem',
          background: 'var(--accent)',
          color: 'var(--bg)',
          fontWeight: 700,
          border: 'none',
          borderRadius: 4,
        }}
      >
        {submitting ? 'Đang xử lý...' : 'Đặt hàng'}
      </button>
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text)',
};
