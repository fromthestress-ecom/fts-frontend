"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/lib/api";
import { useTranslations, useLocale } from 'next-intl';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
  color?: string;
}

interface OrderOverview {
  _id: string;
  orderNumber: string;
  email: string;
  createdAt: string;
  subtotal: number;
  shippingFee: number;
  discount?: number;
  status: string;
  items: OrderItem[];
}

export default function OrderHistoryPage() {
  const t = useTranslations('orderHistory');
  const locale = useLocale();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<OrderOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Protect route
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  // Fetch orders
  useEffect(() => {
    if (!user?.email) return;

    let isMounted = true;
    setLoading(true);

    fetchApi<OrderOverview[]>(
      `/orders/my?email=${encodeURIComponent(user.email)}`,
    )
      .then((data) => {
        if (isMounted) {
          setOrders(data);
          setError("");
        }
      })
      .catch((err) => {
        if (isMounted)
          setError(err.message || t('fetchError'));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user?.email]);

  if (authLoading || (loading && !error)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-accent"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="order-page">
      <div className="order-page__inner">
        <h1 className="order-page__title">{t('myOrdersTitle')}</h1>
        <p className="order-page__subtitle">
          {t('myOrdersSubtitle')}
        </p>

        {error ? (
          <div className="rounded-lg bg-red-500/10 p-4 text-center text-red-500 mt-6 border border-red-500/20">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="order-empty">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="order-empty__icon"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <h2 className="order-empty__title">{t('emptyOrdersTitle')}</h2>
            <p className="order-empty__text">
              {t('emptyOrdersDesc')}
            </p>
            <Link href="/san-pham" className="order-empty__btn">
              {t('backToProducts')}
            </Link>
          </div>
        ) : (
          <div className="order-list">
            {orders.map((order) => {
              const totalAmount =
                order.subtotal - (order.discount || 0) + order.shippingFee;
              const formattedDate = new Date(
                order.createdAt,
              ).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              // Status Badge Styles
              let statusLabel = order.status;
              let statusClass = "order-badge--neutral";

              switch (order.status) {
                case "pending":
                  statusLabel = t('statusPending');
                  statusClass = "order-badge--warning";
                  break;
                case "processing":
                  statusLabel = t('statusProcessing');
                  statusClass = "order-badge--warning";
                  break;
                case "shipped":
                  statusLabel = t('statusShipped');
                  statusClass = "order-badge--info";
                  break;
                case "delivered":
                  statusLabel = t('statusDelivered');
                  statusClass = "order-badge--success";
                  break;
                case "cancelled":
                  statusLabel = t('statusCancelled');
                  statusClass = "order-badge--danger";
                  break;
              }

              return (
                <div key={order._id} className="order-card">
                  <div className="order-card__header">
                    <div>
                      <h3 className="order-card__number">
                        #{order.orderNumber}
                      </h3>
                      <p className="order-card__date">{formattedDate}</p>
                    </div>
                    <span className={`order-badge ${statusClass}`}>
                      {statusLabel}
                    </span>
                  </div>

                  <div className="order-card__body">
                    <ul className="order-items-list">
                      {order.items.slice(0, 2).map((item, idx) => (
                        <li key={idx} className="order-item">
                          <div className="order-item__info">
                            <span className="order-item__name">
                              {item.name}
                            </span>
                            {(item.size || item.color) && (
                              <span className="order-item__variant">
                                (
                                {[item.size, item.color]
                                  .filter(Boolean)
                                  .join(" / ")}
                                )
                              </span>
                            )}
                          </div>
                          <span className="order-item__qty">
                            x{item.quantity}
                          </span>
                        </li>
                      ))}
                      {order.items.length > 2 && (
                        <li className="order-item order-item--more">
                          {t('moreItems', { count: order.items.length - 2 })}
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="order-card__footer">
                    <div className="order-card__total">
                      <span>{t('totalAmount')}</span>
                      <strong>
                        {new Intl.NumberFormat("vi-VN").format(totalAmount)}₫
                      </strong>
                    </div>
                    <Link
                      href={`/don-hang/${order.orderNumber}`}
                      className="order-view-btn"
                    >
                      {t('viewDetails')}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
