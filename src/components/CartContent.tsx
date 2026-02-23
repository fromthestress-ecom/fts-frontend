"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Cart } from "@/lib/api";
import { setCartCount } from "@/hooks/useCartCount";
import { ImageWithSkeleton } from "@/components/ImageWithSkeleton";

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

export function CartContent() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    const guestId = getGuestId();
    const res = await fetch(`${API}/cart`, {
      headers: { "x-guest-id": guestId },
    });
    if (res.ok) {
      const data = (await res.json()) as Cart;
      setCart(data);
      const total = data.items?.reduce((s, i) => s + i.quantity, 0) ?? 0;
      setCartCount(total);
    } else {
      setCart({ _id: "", items: [] });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCart();
  }, []);

  const updateQuantity = async (productId: string, quantity: number) => {
    const guestId = getGuestId();
    const res = await fetch(`${API}/cart/items/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-guest-id": guestId,
      },
      body: JSON.stringify({ quantity }),
    });
    if (res.ok) loadCart();
  };

  const removeItem = async (productId: string) => {
    const guestId = getGuestId();
    await fetch(`${API}/cart/items/${productId}`, {
      method: "DELETE",
      headers: { "x-guest-id": guestId },
    });
    loadCart();
  };

  if (loading) {
    return <p className="text-muted">Đang tải giỏ hàng...</p>;
  }

  if (!cart?.items?.length) {
    return (
      <div className="py-12 text-center text-muted">
        <p>Giỏ hàng trống.</p>
        <Link
          href="/san-pham"
          className="mt-4 inline-block font-semibold text-accent hover:underline"
        >
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
      <ul className="list-none p-0 m-0">
        {cart.items.map((item) => {
          const p = item.productId as {
            _id: string;
            name: string;
            price: number;
            images?: string[];
            slug?: string;
          };
          const lineTotal = (p?.price ?? 0) * item.quantity;
          return (
            <li
              key={`${p._id}-${item.size ?? ""}-${item.color ?? ""}`}
              className="flex gap-4 border-b border-border py-4"
            >
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded bg-surface">
                {p?.images?.[0] ? (
                  <ImageWithSkeleton
                    src={p.images[0]}
                    alt=""
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/san-pham/${p?.slug ?? p._id}`}
                  className="font-semibold hover:underline"
                >
                  {p?.name}
                </Link>
                {(item.size || item.color) && (
                  <p className="mt-1 text-sm text-muted">
                    {[item.size, item.color].filter(Boolean).join(" / ")}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(p._id, Math.max(0, item.quantity - 1))
                    }
                    className="flex h-7 w-7 items-center justify-center rounded border border-border bg-surface text-text text-sm"
                  >
                    −
                  </button>
                  <span className="min-w-6 text-center text-sm">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(p._id, item.quantity + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded border border-border bg-surface text-text text-sm"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(p._id)}
                    className="ml-auto border-none bg-transparent text-sm text-muted hover:text-text"
                  >
                    Xóa
                  </button>
                </div>
              </div>
              <div className="font-bold text-accent text-sm sm:text-base">
                {new Intl.NumberFormat("vi-VN").format(lineTotal)}₫
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
        <span className="text-lg">Tạm tính</span>
        <span className="text-xl font-bold text-accent">
          {new Intl.NumberFormat("vi-VN").format(subtotal)}₫
        </span>
      </div>
      <Link
        href="/thanh-toan"
        className="mt-6 inline-block rounded bg-accent px-8 py-3.5 font-bold text-bg hover:opacity-90"
      >
        Thanh toán
      </Link>
    </>
  );
}
