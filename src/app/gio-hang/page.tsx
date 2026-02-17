import Link from 'next/link';
import { CartContent } from '@/components/CartContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Giỏ hàng',
  description: 'Giỏ hàng mua sắm thời trang streetwear.',
};

export default function CartPage() {
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2rem',
          letterSpacing: '0.05em',
          marginBottom: '1.5rem',
        }}
      >
        GIỎ HÀNG
      </h1>
      <CartContent />
    </div>
  );
}
