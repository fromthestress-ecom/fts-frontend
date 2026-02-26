"use client";

import Link from "next/link";
import { useState } from "react";
import { ImageWithSkeleton } from "@/components/ImageWithSkeleton";
import { useCartDrawer } from "@/contexts/CartDrawerContext";
import { setCartCount } from "@/hooks/useCartCount";
import type { Product } from "@/lib/api";

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

type ProductCardProps = {
  product: Product;
  /** h2 for grid pages, h3 when nested inside a section already with h2 */
  headingLevel?: "h2" | "h3";
};

export function ProductCard({
  product: p,
  headingLevel = "h2",
}: ProductCardProps) {
  const { openDrawer } = useCartDrawer();
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!p.inStock || status === "loading") return;

    setStatus("loading");
    try {
      const res = await fetch(`${API}/cart/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-guest-id": getGuestId(),
        },
        body: JSON.stringify({
          productId: p._id,
          quantity: 1,
          size: p.sizes?.[0] ?? undefined,
          color: p.colors?.[0] ?? undefined,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { items?: { quantity: number }[] };
        const total = data.items?.reduce((s, i) => s + i.quantity, 0) ?? 1;
        setCartCount(total);
        setStatus("done");
        openDrawer();
        setTimeout(() => setStatus("idle"), 2500);
      } else {
        setStatus("idle");
      }
    } catch {
      setStatus("idle");
    }
  };

  const isDisabled = !p.inStock || status === "loading";
  const Heading = headingLevel;

  return (
    <div className="product-card overflow-hidden rounded-lg border border-border bg-surface flex flex-col">
      {/* Clickable image + info area */}
      <Link href={`/san-pham/${p.slug}`} className="block flex-1">
        <div className="relative aspect-square overflow-hidden bg-border">
          {p.images?.[0] ? (
            <ImageWithSkeleton
              src={p.images[0]}
              alt={p.name}
              className="product-card__image-inner"
            />
          ) : null}
        </div>
        <div className="p-3 pb-0">
          <Heading className="min-h-[42px] text-sm font-semibold m-0 sm:text-base">
            {p.name}
          </Heading>
          <p className="mt-1 text-sm font-bold text-accent sm:text-base">
            {new Intl.NumberFormat("vi-VN").format(p.price)}₫
          </p>
        </div>
      </Link>

      {/* Add to cart button — outside the Link to avoid nested interactive elements */}
      <div className="px-3 pb-3 pt-2">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isDisabled}
          onMouseEnter={(e) => {
            if (!isDisabled && status !== "done") {
              e.currentTarget.style.background = "var(--text)";
              e.currentTarget.style.color = "var(--bg)";
            }
          }}
          onMouseLeave={(e) => {
            if (status !== "done") {
              e.currentTarget.style.background = "var(--surface)";
              e.currentTarget.style.color = "var(--text)";
            }
          }}
          style={{
            width: "100%",
            padding: "9px 0",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            background: status === "done" ? "var(--accent)" : "var(--surface)",
            color: status === "done" ? "var(--bg)" : "var(--text)",
            fontWeight: 700,
            fontSize: "12px",
            letterSpacing: "0.06em",
            cursor: isDisabled ? "not-allowed" : "pointer",
            opacity: !p.inStock ? 0.5 : 1,
            transition: "background 0.2s ease, color 0.2s ease",
          }}
        >
          {status === "loading"
            ? "Đang thêm..."
            : status === "done"
              ? "✓ Đã thêm"
              : p.inStock
                ? "THÊM VÀO GIỎ"
                : "HẾT HÀNG"}
        </button>
      </div>
    </div>
  );
}
