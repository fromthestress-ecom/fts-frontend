import Link from 'next/link';
import { CheckoutForm } from '@/components/CheckoutForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thanh toán',
  description: 'Thanh toán đơn hàng thời trang streetwear.',
};

export default function CheckoutPage() {
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2rem',
          letterSpacing: '0.05em',
          marginBottom: '1.5rem',
        }}
      >
        THANH TOÁN
      </h1>
      <CheckoutForm />
      <p style={{ marginTop: '1rem', color: 'var(--muted)', fontSize: '0.875rem' }}>
        <Link href="/gio-hang" style={{ color: 'var(--accent)' }}>
          ← Quay lại giỏ hàng
        </Link>
      </p>
    </div>
  );
}
