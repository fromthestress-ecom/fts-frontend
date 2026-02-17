import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import type { Metadata } from 'next';

interface Order {
  orderNumber: string;
  email: string;
  items: { name: string; price: number; quantity: number; size?: string; color?: string }[];
  shippingAddress: { fullName: string; phone: string; address: string; city?: string };
  subtotal: number;
  shippingFee: number;
  status: string;
}

async function getOrder(orderNumber: string): Promise<Order | null> {
  try {
    return await fetchApi<Order>(`/orders/${encodeURIComponent(orderNumber)}`);
  } catch {
    return null;
  }
}

type Props = { params: Promise<{ orderNumber: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orderNumber } = await params;
  return { title: `Đơn hàng ${orderNumber}` };
}

export default async function OrderDetailPage({ params }: Props) {
  const { orderNumber } = await params;
  const order = await getOrder(orderNumber);
  if (!order) notFound();

  const total = order.subtotal + order.shippingFee;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2rem',
          letterSpacing: '0.05em',
          marginBottom: '0.5rem',
        }}
      >
        ĐƠN HÀNG {order.orderNumber}
      </h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
        Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ qua email {order.email}.
      </p>
      <div style={{ background: 'var(--surface)', borderRadius: 8, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Giao hàng đến</h2>
        <p style={{ margin: 0 }}>
          {order.shippingAddress.fullName} · {order.shippingAddress.phone}
        </p>
        <p style={{ margin: '0.25rem 0 0', color: 'var(--muted)' }}>
          {order.shippingAddress.address}
          {order.shippingAddress.city ? `, ${order.shippingAddress.city}` : ''}
        </p>
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {order.items.map((item, i) => (
          <li
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.75rem 0',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <span>
              {item.name} × {item.quantity}
              {(item.size || item.color) && (
                <span style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
                  {' '}
                  ({[item.size, item.color].filter(Boolean).join(' / ')})
                </span>
              )}
            </span>
            <span>{new Intl.NumberFormat('vi-VN').format(item.price * item.quantity)}₫</span>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: '1rem', textAlign: 'right' }}>
        <p style={{ margin: '0.25rem 0', color: 'var(--muted)' }}>
          Tạm tính: {new Intl.NumberFormat('vi-VN').format(order.subtotal)}₫
        </p>
        <p style={{ margin: '0.25rem 0', color: 'var(--muted)' }}>
          Phí ship: {order.shippingFee === 0 ? 'Miễn phí' : `${new Intl.NumberFormat('vi-VN').format(order.shippingFee)}₫`}
        </p>
        <p style={{ margin: '0.5rem 0 0', fontWeight: 700, fontSize: '1.125rem' }}>
          Tổng: {new Intl.NumberFormat('vi-VN').format(total)}₫
        </p>
      </div>
      <p style={{ marginTop: '1.5rem' }}>
        <Link href="/san-pham" style={{ color: 'var(--accent)' }}>
          Tiếp tục mua sắm →
        </Link>
      </p>
    </div>
  );
}
