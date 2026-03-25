"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Cart, CreateOrderDto } from "@/lib/api";
import { setCartCount } from "@/hooks/useCartCount";
import { useAuth } from "@/contexts/AuthContext";
import { trackBeginCheckout, trackPurchase } from "@/lib/gtag";
import { useTranslations } from 'next-intl';

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function getGuestId(): string {
  if (typeof window === "undefined") return "";
  const id = localStorage.getItem("streetwear-guest-id");
  return id ?? "";
}

const inputClass =
  "w-full rounded border border-border bg-surface px-3 py-2 text-text text-sm sm:text-base";

export function CheckoutForm() {
  const t = useTranslations('checkout');
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
          (data as { message?: string }).message ?? t('orderError'),
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
      setError(err instanceof Error ? err.message : t('genericError'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-muted">{t('processing')}</p>;
  }

  if (!cart?.items?.length) {
    return (
      <p className="text-muted">
        {t('emptyCart')}{" "}
        <Link href="/gio-hang" className="text-accent hover:underline">
          {t('viewCart')}
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
        <label className="mb-1 block text-sm">{t('email')}</label>
        <input
          type="email"
          name="email"
          required
          defaultValue={user?.email}
          className={inputClass}
        />
      </div>
      <div className="mb-4">
        <label className="mb-1 block text-sm">{t('fullName')}</label>
        <input
          type="text"
          name="fullName"
          required
          defaultValue={user?.fullName}
          className={inputClass}
        />
      </div>
      <div className="mb-4">
        <label className="mb-1 block text-sm">{t('phone')}</label>
        <input
          type="tel"
          name="phone"
          required
          defaultValue={user?.phone}
          className={inputClass}
        />
      </div>
      <div className="mb-4">
        <label className="mb-1 block text-sm">{t('address')}</label>
        <input type="text" name="address" required className={inputClass} />
      </div>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm">{t('ward')}</label>
          <input type="text" name="ward" className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm">{t('district')}</label>
          <input type="text" name="district" className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm">{t('city')}</label>
          <input type="text" name="city" className={inputClass} />
        </div>
      </div>
      <div className="mb-4">
        <label className="mb-1 block text-sm">{t('note')}</label>
        <input type="text" name="note" className={inputClass} />
      </div>

      {/* Referral Code */}
      <div className="mb-4">
        <label className="mb-1 block text-sm">{t('referralCode')}</label>
        {!user ? (
          <p className="text-sm italic text-muted">
            {t('loginToUseReferral')}
          </p>
        ) : (
          <>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder={t('referralPlaceholder')}
                className={inputClass}
                style={{ textTransform: "uppercase" }}
              />
              <button
                type="button"
                onClick={() => validateReferral(referralCode)}
                disabled={checkingReferral || !referralCode}
                className="rounded border border-border bg-surface px-4 py-2 text-sm font-semibold text-text transition-colors hover:bg-border disabled:opacity-50"
              >
                {checkingReferral ? "..." : t('apply')}
              </button>
            </div>
            {referralValid === true && referralDiscount && (
              <p className="mt-1 text-sm" style={{ color: "#22c55e" }}>
                {t('referralValid', { 
                  value: referralDiscount.value, 
                  type: referralDiscount.type === "percent" ? "%" : "đ", 
                  name: referralDiscount.name 
                })}
              </p>
            )}
            {referralValid === false && (
              <p className="mt-1 text-sm" style={{ color: "#ef4444" }}>
                {t('referralInvalid')}
              </p>
            )}
          </>
        )}
      </div>
      <div className="mb-4 rounded-lg bg-surface p-4">
        <p className="mb-2 text-muted">
          {t('subtotalCart')} {new Intl.NumberFormat("vi-VN").format(subtotal)}₫
        </p>
        {discountAmount > 0 && (
          <p className="mb-2 text-accent">
            {t('discountCart')} -{new Intl.NumberFormat("vi-VN").format(discountAmount)}₫
          </p>
        )}
        <p className="mb-2 text-muted">
          {t('shippingFee')}{" "}
          {shippingFee === 0
            ? t('freeShip')
            : `${new Intl.NumberFormat("vi-VN").format(shippingFee)}₫`}
        </p>
        <p className="text-lg font-bold">
          {t('totalPay')} {new Intl.NumberFormat("vi-VN").format(total)}₫
        </p>
        {hasPreOrder && (
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-sm font-semibold text-accent mb-1">
              {t('preOrderNotice')}
            </p>
            <p className="text-xl font-bold text-accent">
              {t('deposit')} {new Intl.NumberFormat("vi-VN").format(depositAmount)}₫
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
          ? t('processing')
          : hasPreOrder
            ? t('orderTransfer')
            : t('orderSubmit')}
      </button>
    </form>
  );
}
