"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useCartDrawer } from "@/contexts/CartDrawerContext";
import { ImageWithSkeleton } from "@/components/ImageWithSkeleton";
import { setCartCount } from "@/hooks/useCartCount";
import type { Cart } from "@/lib/api";
import { useTranslations } from 'next-intl';

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function getGuestId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("streetwear-guest-id");
  if (!id) {
    id = `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("streetwear-guest-id", id);
  }
  return id;
}

export function CartDrawer() {
  const t = useTranslations('cart');
  const { isOpen, closeDrawer } = useCartDrawer();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/cart`, {
        headers: { "x-guest-id": getGuestId() },
      });
      if (res.ok) {
        const data = (await res.json()) as Cart;
        setCart(data);
        const total = data.items?.reduce((s, i) => s + i.quantity, 0) ?? 0;
        setCartCount(total);
      } else {
        setCart({ _id: "", items: [] });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load cart whenever drawer opens
  useEffect(() => {
    if (isOpen) loadCart();
  }, [isOpen, loadCart]);

  const updateQuantity = async (productId: string, quantity: number) => {
    const res = await fetch(`${API}/cart/items/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-guest-id": getGuestId(),
      },
      body: JSON.stringify({ quantity }),
    });
    if (res.ok) loadCart();
  };

  const removeItem = async (productId: string) => {
    await fetch(`${API}/cart/items/${productId}`, {
      method: "DELETE",
      headers: { "x-guest-id": getGuestId() },
    });
    loadCart();
  };

  const items = cart?.items ?? [];
  const subtotal = items.reduce((sum, i) => {
    const p = i.productId as { price?: number };
    return sum + (p?.price ?? 0) * i.quantity;
  }, 0);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          zIndex: 10000,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.35s ease",
          backdropFilter: isOpen ? "blur(2px)" : "none",
        }}
        aria-hidden
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-label={t('cart')}
        aria-modal="true"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(420px, 100vw)",
          background: "var(--bg)",
          borderLeft: "1px solid var(--border)",
          zIndex: 10001,
          display: "flex",
          flexDirection: "column",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.38s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: isOpen ? "-8px 0 40px rgba(0,0,0,0.35)" : "none",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px 16px",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: "var(--font-display)",
              fontSize: "22px",
              letterSpacing: "0.1em",
              color: "var(--text)",
            }}
          >
            {t('cartUpper')}
          </h2>
          <button
            onClick={closeDrawer}
            aria-label={t('closeCart')}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--muted)",
              padding: "4px",
              fontSize: "22px",
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
          >
            ✕
          </button>
        </div>

        {/* Scrollable cart items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 24px" }}>
          {loading ? (
            <p
              style={{
                color: "var(--muted)",
                padding: "32px 0",
                textAlign: "center",
              }}
            >
              {t('loading')}
            </p>
          ) : items.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "48px 0",
                color: "var(--muted)",
              }}
            >
              <p style={{ marginBottom: "16px" }}>{t('emptyCart')}</p>
              <Link
                href="/san-pham"
                onClick={closeDrawer}
                style={{
                  color: "var(--accent)",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                {t('shopNowArrow')}
              </Link>
            </div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {items.map((item) => {
                const p = item.productId as {
                  _id: string;
                  name: string;
                  price: number;
                  images?: string[];
                  slug?: string;
                };
                return (
                  <li
                    key={`${p._id}-${item.size ?? ""}-${item.color ?? ""}`}
                    style={{
                      display: "flex",
                      gap: "14px",
                      padding: "16px 0",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    {/* Image */}
                    <div
                      style={{
                        width: "80px",
                        height: "80px",
                        flexShrink: 0,
                        borderRadius: "8px",
                        overflow: "hidden",
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {p?.images?.[0] ? (
                        <ImageWithSkeleton src={p.images[0]} alt={p.name} />
                      ) : null}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link
                        href={`/san-pham/${p?.slug ?? p._id}`}
                        onClick={closeDrawer}
                        style={{
                          fontWeight: 700,
                          fontSize: "13px",
                          color: "var(--text)",
                          textDecoration: "none",
                          display: "block",
                          marginBottom: "2px",
                          lineHeight: 1.3,
                        }}
                      >
                        {p?.name}
                      </Link>
                      <p
                        style={{
                          margin: "0 0 6px",
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "var(--accent)",
                        }}
                      >
                        {new Intl.NumberFormat("vi-VN").format(p?.price ?? 0)}₫
                      </p>
                      {(item.size || item.color) && (
                        <p
                          style={{
                            margin: "0 0 8px",
                            fontSize: "12px",
                            color: "var(--muted)",
                          }}
                        >
                          {[item.size, item.color].filter(Boolean).join(" / ")}
                        </p>
                      )}

                      {/* Quantity controls + remove */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              p._id,
                              Math.max(1, item.quantity - 1),
                            )
                          }
                          style={qBtnStyle}
                        >
                          −
                        </button>
                        <span
                          style={{
                            minWidth: "24px",
                            textAlign: "center",
                            fontSize: "13px",
                            fontWeight: 600,
                          }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(p._id, item.quantity + 1)
                          }
                          style={qBtnStyle}
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(p._id)}
                          style={{
                            marginLeft: "auto",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "12px",
                            color: "var(--muted)",
                            padding: "2px 0",
                            textDecoration: "underline",
                            textUnderlineOffset: "2px",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "var(--text)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "var(--muted)")
                          }
                        >
                          {t('removeUpper')}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer: subtotal + CTA */}
        {items.length > 0 && (
          <div
            style={{
              flexShrink: 0,
              borderTop: "1px solid var(--border)",
              padding: "16px 24px 24px",
              background: "var(--bg)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <span style={{ fontSize: "14px", color: "var(--muted)" }}>
                {t('totalCart')}
              </span>
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "var(--text)",
                }}
              >
                {new Intl.NumberFormat("vi-VN").format(subtotal)}₫
              </span>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <Link
                href="/thanh-toan"
                onClick={closeDrawer}
                style={{
                  display: "block",
                  textAlign: "center",
                  background: "var(--text)",
                  color: "var(--bg)",
                  fontWeight: 700,
                  fontSize: "14px",
                  letterSpacing: "0.08em",
                  padding: "14px 0",
                  borderRadius: "6px",
                  textDecoration: "none",
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                {t('checkoutNow')}
              </Link>
              <Link
                href="/gio-hang"
                onClick={closeDrawer}
                style={{
                  display: "block",
                  textAlign: "center",
                  fontSize: "13px",
                  color: "var(--muted)",
                  textDecoration: "none",
                  padding: "6px 0",
                  letterSpacing: "0.04em",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--text)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--muted)")
                }
              >
                {t('viewCart')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const qBtnStyle: React.CSSProperties = {
  width: "28px",
  height: "28px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "4px",
  border: "1px solid var(--border)",
  background: "var(--surface)",
  color: "var(--text)",
  fontSize: "14px",
  cursor: "pointer",
  flexShrink: 0,
};
