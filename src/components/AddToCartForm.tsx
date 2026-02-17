'use client';

import { useState } from 'react';
import type { Product } from '@/lib/api';
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

type AddToCartFormProps = { product: Product };

type OptionGroupProps = {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (next: string) => void;
};

function OptionGroup({ label, options, value, onChange }: OptionGroupProps) {
  if (!options.length) return null;

  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>{label}</div>
      <div role="radiogroup" aria-label={label} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {options.map((opt) => {
          const isSelected = opt === value;
          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(opt)}
              style={{
                padding: '0.5rem 0.75rem',
                background: isSelected ? 'var(--accent)' : 'var(--surface)',
                color: isSelected ? 'var(--bg)' : 'var(--text)',
                border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 999,
                fontWeight: isSelected ? 700 : 500,
                lineHeight: 1,
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AddToCartForm({ product }: AddToCartFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState(product.sizes?.[0] ?? '');
  const [color, setColor] = useState(product.colors?.[0] ?? '');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const guestId = getGuestId();
      const res = await fetch(`${API}/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-guest-id': guestId,
        },
        body: JSON.stringify({
          productId: product._id,
          quantity,
          size: size || undefined,
          color: color || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to add');
      const data = (await res.json()) as { items?: { quantity: number }[] };
      const total = data.items?.reduce((s, i) => s + i.quantity, 0) ?? quantity;
      setCartCount(total);
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <OptionGroup
        label="Size"
        options={product.sizes ?? []}
        value={size}
        onChange={setSize}
      />
      <OptionGroup
        label="Màu"
        options={product.colors ?? []}
        value={color}
        onChange={setColor}
      />
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
          Số lượng
        </label>
        <input
          type="number"
          min={1}
          max={product.stockQuantity || 99}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value) || 1)}
          style={{
            width: 80,
            padding: '0.5rem 0.75rem',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            color: 'var(--text)',
          }}
        />
      </div>
      <button
        type="submit"
        disabled={status === 'loading' || !product.inStock}
        style={{
          padding: '0.875rem 2rem',
          background: product.inStock ? 'var(--accent)' : 'var(--border)',
          color: 'var(--bg)',
          fontWeight: 700,
          border: 'none',
          borderRadius: 4,
        }}
      >
        {status === 'loading'
          ? 'Đang thêm...'
          : status === 'done'
            ? 'Đã thêm vào giỏ'
            : product.inStock
              ? 'Thêm vào giỏ'
              : 'Hết hàng'}
      </button>
      {status === 'error' && (
        <p style={{ marginTop: '0.5rem', color: '#ef4444', fontSize: '0.875rem' }}>
          Có lỗi, vui lòng thử lại.
        </p>
      )}
    </form>
  );
}
