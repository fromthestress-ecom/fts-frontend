"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Cart, CreateOrderDto } from "@/lib/api";
import { setCartCount } from "@/hooks/useCartCount";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function getGuestId(): string {
  if (typeof window === "undefined") return "";
  const id = localStorage.getItem("streetwear-guest-id");
  return id ?? "";
}

const inputClass =
  "w-full rounded border border-border bg-surface px-3 py-2 text-text text-sm sm:text-base";

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
      setCart({ _id: "", items: [] });
      return;
    }
    fetch(`${API}/cart`, { headers: { "x-guest-id": guestId } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setCart(data ?? { _id: "", items: [] });
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
        const p = i.productId as {
          _id: string;
          name: string;
          price: number;
          images?: string[];
        };
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { orderNumber?: string };
      if (!res.ok)
        throw new Error(
          (data as { message?: string }).message ?? "Lỗi đặt hàng",
        );
      setCartCount(0);
      localStorage.removeItem("streetwear-guest-id");
      router.push(`/don-hang/${data.orderNumber ?? ""}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-muted">Đang tải...</p>;
  }

  if (!cart?.items?.length) {
    return (
      <p className="text-muted">
        Giỏ hàng trống.{" "}
        <Link href="/gio-hang" className="text-accent hover:underline">
          Xem giỏ hàng
        </Link>
        .
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
      <div className="mb-4">
        <label className="mb-1 block text-sm">Email *</label>
        <input type="email" name="email" required className={inputClass} />
      </div>
      <div className="mb-4">
        <label className="mb-1 block text-sm">Họ tên *</label>
        <input type="text" name="fullName" required className={inputClass} />
      </div>
      <div className="mb-4">
        <label className="mb-1 block text-sm">Số điện thoại *</label>
        <input type="tel" name="phone" required className={inputClass} />
      </div>
      <div className="mb-4">
        <label className="mb-1 block text-sm">Địa chỉ *</label>
        <input type="text" name="address" required className={inputClass} />
      </div>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm">Phường/Xã</label>
          <input type="text" name="ward" className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm">Quận/Huyện</label>
          <input type="text" name="district" className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm">Tỉnh/Thành</label>
          <input type="text" name="city" className={inputClass} />
        </div>
      </div>
      <div className="mb-4">
        <label className="mb-1 block text-sm">Ghi chú</label>
        <input type="text" name="note" className={inputClass} />
      </div>
      <div className="mb-4 rounded-lg bg-surface p-4">
        <p className="mb-2 text-muted">
          Tạm tính: {new Intl.NumberFormat("vi-VN").format(subtotal)}₫
        </p>
        <p className="mb-2 text-muted">
          Phí ship:{" "}
          {shippingFee === 0
            ? "Miễn phí"
            : `${new Intl.NumberFormat("vi-VN").format(shippingFee)}₫`}
        </p>
        <p className="text-lg font-bold">
          Tổng:{" "}
          {new Intl.NumberFormat("vi-VN").format(subtotal + shippingFee)}₫
        </p>
      </div>
      {error && (
        <p className="mb-4 text-sm text-red-500">{error}</p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded border-none bg-accent py-3.5 font-bold text-bg disabled:opacity-70"
      >
        {submitting ? "Đang xử lý..." : "Đặt hàng"}
      </button>
    </form>
  );
}
