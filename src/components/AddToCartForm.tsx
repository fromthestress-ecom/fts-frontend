"use client";

import { useState } from "react";
import type { Product } from "@/lib/api";
import { setCartCount } from "@/hooks/useCartCount";

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

type AddToCartFormProps = { product: Product };

type OptionGroupProps = {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (next: string) => void;
};

function OptionGroup({ label, options, value, onChange }: OptionGroupProps) {
  if (!options.length) return null;

  return (
    <div className="mb-4">
      <div className="mb-2 text-sm">{label}</div>
      <div
        role="radiogroup"
        aria-label={label}
        className="flex flex-wrap gap-2"
      >
        {options.map((opt) => {
          const isSelected = opt === value;
          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(opt)}
              className={`rounded-full border px-3 py-2 text-sm leading-none sm:text-base ${
                isSelected
                  ? "border-accent bg-accent font-bold text-bg"
                  : "border-border bg-surface font-medium text-text"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AddToCartForm({ product }: AddToCartFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState(product.sizes?.[0] ?? "");
  const [color, setColor] = useState(product.colors?.[0] ?? "");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );

  const isSoldOut = product.isSoldOut || !product.inStock;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const guestId = getGuestId();

      // Save affiliate ref if present in the URL
      if (typeof window !== "undefined") {
        const queryParams = new URLSearchParams(window.location.search);
        const refParam = queryParams.get("ref");
        if (refParam) {
          localStorage.setItem("streetwear-affiliate-ref", refParam);
        }
      }

      const res = await fetch(`${API}/cart/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-guest-id": guestId,
        },
        body: JSON.stringify({
          productId: product._id,
          quantity,
          size: size || undefined,
          color: color || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to add");
      const data = (await res.json()) as { items?: { quantity: number }[] };
      const total = data.items?.reduce((s, i) => s + i.quantity, 0) ?? quantity;
      setCartCount(total);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <OptionGroup
        label="Size"
        options={product.sizes ?? []}
        value={size}
        onChange={setSize}
      />
      <OptionGroup
        label="Màu"
        options={product.colors ?? []}
        value={color}
        onChange={setColor}
      />
      <div className="mb-4">
        <label className="mb-2 block text-sm">Số lượng</label>
        <input
          type="number"
          min={1}
          max={product.stockQuantity || 99}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value) || 1)}
          className="w-20 rounded border border-border bg-surface px-3 py-2 text-text text-sm sm:text-base"
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading" || isSoldOut}
        className={`rounded border-none px-8 py-3.5 font-bold text-bg ${
          isSoldOut ? "bg-border" : "bg-accent"
        }`}
      >
        {status === "loading"
          ? "Đang thêm..."
          : status === "done"
            ? "Đã thêm vào giỏ"
            : isSoldOut
              ? "Hết hàng"
              : product.preOrder
                ? "Đặt trước (Pre-order)"
                : "Thêm vào giỏ"}
      </button>
      {status === "error" && (
        <p className="mt-2 text-sm text-red-500">Có lỗi, vui lòng thử lại.</p>
      )}
    </form>
  );
}
