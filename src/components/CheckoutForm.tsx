"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Cart, CreateOrderDto } from "@/lib/api";
import { setCartCount } from "@/hooks/useCartCount";
import { useAuth } from "@/contexts/AuthContext";
import { trackBeginCheckout, trackPurchase } from "@/lib/gtag";

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
  const searchParams = useSearchParams();
  const { user, token } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Referral code state
  const [referralCode, setReferralCode] = useState("");
  const [referralValid, setReferralValid] = useState<boolean | null>(null);
  const [referralDiscount, setReferralDiscount] = useState<{
    type: string;
    value: number;
    name: string;
  } | null>(null);
  const [checkingReferral, setCheckingReferral] = useState(false);

  // Affiliate ref from URL or LocalStorage
  const urlRef = searchParams?.get("ref") || "";
  const [affiliateRef, setAffiliateRef] = useState(urlRef);

  useEffect(() => {
    if (typeof window !== "undefined") {
      let lsRef = localStorage.getItem("streetwear-affiliate-ref") || "";
      if (urlRef) {
        localStorage.setItem("streetwear-affiliate-ref", urlRef);
        lsRef = urlRef;
      }
      setAffiliateRef(lsRef);
    }
  }, [urlRef]);

  useEffect(() => {
    const guestId = getGuestId();
    if (!guestId) {
      setLoading(false);
      setCart({ _id: "", items: [] });
      return;
    }
    fetch(`${API}/cart`, { headers: { "x-guest-id": guestId } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Cart | null) => {
        const c = data ?? { _id: "", items: [] };
        setCart(c);
        if (c.items?.length) {
          const gaItems = c.items.map((i) => {
            const prod = i.productId as { _id: string; name: string; price: number; finalPrice?: number };
            return {
              item_id: prod._id,
              item_name: prod.name,
              price: prod.finalPrice ?? prod.price,
              quantity: i.quantity,
            };
          });
          const total = gaItems.reduce((s, it) => s + it.price * (it.quantity ?? 1), 0);
          trackBeginCheckout(gaItems, total);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Validate referral code
  const validateReferral = useCallback(async (code: string) => {
    if (!code || code.length < 3) {
      setReferralValid(null);
      setReferralDiscount(null);
      return;
    }
    setCheckingReferral(true);
    try {
      const res = await fetch(
        `${API}/referrals/validate/${encodeURIComponent(code)}`,
      );
      const data = await res.json();
      if (data.valid) {
        setReferralValid(true);
        setReferralDiscount({
          type: data.discountType,
          value: data.discountValue,
          name: data.referrerName,
        });
      } else {
        setReferralValid(false);
        setReferralDiscount(null);
      }
    } catch {
      setReferralValid(false);
      setReferralDiscount(null);
    } finally {
      setCheckingReferral(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!cart?.items?.length) return;
    const form = e.currentTarget;
    const payload: CreateOrderDto & {
      referralCode?: string;
      affiliateRef?: string;
      userId?: string;
    } = {
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
          finalPrice?: number;
          images?: string[];
          preOrder?: boolean;
        };
        return {
          productId: p._id,
          name: p.name,
          price: p.finalPrice ?? p.price,
          quantity: i.quantity,
          size: i.size,
          color: i.color,
          image: p.images?.[0],
          preOrder: !!p.preOrder,
        };
      }),
      note: (form.note as HTMLInputElement).value.trim() || undefined,
    };

    // Add referral & affiliate data
    if (referralValid && referralCode && user) {
      payload.referralCode = referralCode.toUpperCase();
      payload.userId = user.id;
    }
    if (affiliateRef) {
      payload.affiliateRef = affiliateRef;
      if (user) payload.userId = user.id;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { orderNumber?: string; subtotal?: number; shippingFee?: number };
      if (!res.ok)
        throw new Error(
          (data as { message?: string }).message ?? "Lỗi đặt hàng",
        );
      trackPurchase(
        data.orderNumber ?? "",
        payload.items.map((it) => ({
          item_id: it.productId,
          item_name: it.name,
          price: it.price,
          quantity: it.quantity,
        })),
        data.subtotal ?? subtotal,
        data.shippingFee ?? shippingFee,
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

  let discountAmount = 0;
  if (referralValid === true && referralDiscount) {
    if (referralDiscount.type === "percent") {
      discountAmount = (subtotal * referralDiscount.value) / 100;
    } else {
      discountAmount = referralDiscount.value;
    }
  }

  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const total = Math.max(0, subtotal - discountAmount) + shippingFee;

  const hasPreOrder = cart.items.some((i) => {
    const p = i.productId as { preOrder?: boolean };
    return p?.preOrder;
  });

  const depositAmount = hasPreOrder ? total / 2 : 0;

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="mb-1 block text-sm">Email *</label>
        <input
          type="email"
          name="email"
          required
          defaultValue={user?.email}
          className={inputClass}
        />
      </div>
      <div className="mb-4">
        <label className="mb-1 block text-sm">Họ tên *</label>
        <input
          type="text"
          name="fullName"
          required
          defaultValue={user?.fullName}
          className={inputClass}
        />
      </div>
      <div className="mb-4">
        <label className="mb-1 block text-sm">Số điện thoại *</label>
        <input
          type="tel"
          name="phone"
          required
          defaultValue={user?.phone}
          className={inputClass}
        />
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

      {/* Referral Code */}
      <div className="mb-4">
        <label className="mb-1 block text-sm">Mã giới thiệu (nếu có)</label>
        {!user ? (
          <p className="text-sm italic text-muted">
            Vui lòng đăng nhập / đăng ký để có thể sử dụng mã giới thiệu.
          </p>
        ) : (
          <>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="VD: NGHIA4821"
                className={inputClass}
                style={{ textTransform: "uppercase" }}
              />
              <button
                type="button"
                onClick={() => validateReferral(referralCode)}
                disabled={checkingReferral || !referralCode}
                className="rounded border border-border bg-surface px-4 py-2 text-sm font-semibold text-text transition-colors hover:bg-border disabled:opacity-50"
              >
                {checkingReferral ? "..." : "Áp dụng"}
              </button>
            </div>
            {referralValid === true && referralDiscount && (
              <p className="mt-1 text-sm" style={{ color: "#22c55e" }}>
                ✓ Mã hợp lệ! Giảm {referralDiscount.value}
                {referralDiscount.type === "percent" ? "%" : "đ"} từ{" "}
                {referralDiscount.name}
              </p>
            )}
            {referralValid === false && (
              <p className="mt-1 text-sm" style={{ color: "#ef4444" }}>
                ✗ Mã không hợp lệ
              </p>
            )}
          </>
        )}
      </div>
      <div className="mb-4 rounded-lg bg-surface p-4">
        <p className="mb-2 text-muted">
          Tạm tính: {new Intl.NumberFormat("vi-VN").format(subtotal)}₫
        </p>
        {discountAmount > 0 && (
          <p className="mb-2 text-accent">
            Giảm giá: -{new Intl.NumberFormat("vi-VN").format(discountAmount)}₫
          </p>
        )}
        <p className="mb-2 text-muted">
          Phí ship:{" "}
          {shippingFee === 0
            ? "Miễn phí"
            : `${new Intl.NumberFormat("vi-VN").format(shippingFee)}₫`}
        </p>
        <p className="text-lg font-bold">
          Tổng thanh toán: {new Intl.NumberFormat("vi-VN").format(total)}₫
        </p>
        {hasPreOrder && (
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-sm font-semibold text-accent mb-1">
              * Đơn hàng có sản phẩm Pre-order, yêu cầu chuyển khoản cọc 50%:
            </p>
            <p className="text-xl font-bold text-accent">
              Tiền cọc: {new Intl.NumberFormat("vi-VN").format(depositAmount)}₫
            </p>
          </div>
        )}
      </div>
      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded border-none bg-accent py-3.5 font-bold text-bg disabled:opacity-70"
      >
        {submitting
          ? "Đang xử lý..."
          : hasPreOrder
            ? "Đặt hàng & Chuyển khoản"
            : "Đặt hàng"}
      </button>
    </form>
  );
}
