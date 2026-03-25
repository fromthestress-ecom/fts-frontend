import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

interface Order {
  orderNumber: string;
  email: string;
  items: {
    name: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
    image?: string;
    preOrder?: boolean;
  }[];
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city?: string;
  };
  subtotal: number;
  shippingFee: number;
  discount?: number;
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
  const t = await getTranslations('order');
  const order = await getOrder(orderNumber);
  const firstImage = order?.items?.[0]?.image;
  const titleStr = t('orderTitle', { id: orderNumber });
  return {
    title: titleStr,
    robots: { index: false, follow: false },
    ...(firstImage
      ? { openGraph: { images: [{ url: firstImage, alt: titleStr }] } }
      : {}),
  };
}

export default async function OrderDetailPage({ params }: Props) {
  const t = await getTranslations('order');
  const { orderNumber } = await params;
  const order = await getOrder(orderNumber);
  if (!order) notFound();

  const total = order.subtotal - (order.discount || 0) + order.shippingFee;
  const hasPreOrder = order.items.some((item) => item.preOrder);
  const depositAmount = hasPreOrder ? total / 2 : 0;

  return (
    <div className="mx-auto max-w-[640px] px-4 py-8 sm:px-6">
      <h1 className="font-display mb-2 text-2xl tracking-wide sm:text-3xl">
        {t('orderUpper', { id: order.orderNumber })}
      </h1>
      <p className="mb-6 text-muted">
        {t('thanksEmail', { email: order.email })}
      </p>
      <div className="mb-6 rounded-lg bg-surface p-6">
        <h2 className="mb-3 text-base">{t('deliverTo')}</h2>
        <p className="m-0">
          {order.shippingAddress.fullName} · {order.shippingAddress.phone}
        </p>
        <p className="mt-1 text-muted">
          {order.shippingAddress.address}
          {order.shippingAddress.city ? `, ${order.shippingAddress.city}` : ""}
        </p>
      </div>
      <ul className="list-none p-0 m-0">
        {order.items.map((item, i) => (
          <li
            key={i}
            className="flex justify-between border-b border-border py-3"
          >
            <span>
              {item.name} × {item.quantity}
              {(item.size || item.color) && (
                <span className="text-sm text-muted">
                  {" "}
                  ({[item.size, item.color].filter(Boolean).join(" / ")})
                </span>
              )}
            </span>
            <span>
              {new Intl.NumberFormat("vi-VN").format(
                item.price * item.quantity,
              )}
              ₫
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 text-right">
        <p className="my-1 text-muted">
          {t('subtotal')} {new Intl.NumberFormat("vi-VN").format(order.subtotal)}₫
        </p>
        {(order.discount || 0) > 0 && (
          <p className="my-1 text-accent">
            {t('discount')}
            {new Intl.NumberFormat("vi-VN").format(order.discount || 0)}₫
          </p>
        )}
        <p className="my-1 text-muted">
          {t('shippingFee')}{" "}
          {order.shippingFee === 0
            ? t('freeShip')
            : `${new Intl.NumberFormat("vi-VN").format(order.shippingFee)}₫`}
        </p>
        <p className="mt-2 text-lg font-bold">
          {t('total')} {new Intl.NumberFormat("vi-VN").format(total)}₫
        </p>
        {hasPreOrder && (
          <div className="mt-4 rounded-lg bg-accent/10 p-4 border border-accent/20 text-left">
            <h3 className="text-base font-bold text-accent mb-2">
              {t('preOrderInfo')}
            </h3>
            <p className="text-sm mb-2 text-text">
              {t('preOrderNoticeText')}
            </p>
            <p className="text-sm mb-1 text-text">
              {t('depositAmount')}{" "}
              <strong className="text-base text-accent">
                {new Intl.NumberFormat("vi-VN").format(depositAmount)}₫
              </strong>
            </p>
            <p className="text-sm mb-1 text-text">
              {t('accountNumber')} <strong>0123456789</strong> (Ngân hàng VCB)
            </p>
            <p className="text-sm mb-0 text-text">
              {t('accountOwner')} <strong>STREETWEAR STORE</strong>
            </p>
            <p className="text-sm mt-2 text-text">
              {t('transferNote')} <strong>{order.orderNumber} SĐT</strong> ({t('example')}{" "}
              {order.orderNumber} 0987654321)
            </p>
          </div>
        )}
      </div>
      <p className="mt-6">
        <Link href="/san-pham" className="text-accent hover:underline">
          {t('continueShopping')}
        </Link>
      </p>
    </div>
  );
}
