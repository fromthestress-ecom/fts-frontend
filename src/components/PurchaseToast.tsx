"use client";

import { useEffect, useState, useCallback } from "react";

type PurchaseItem = {
  id: number;
  productName: string;
  category: string;
  image: string;
  minutesAgo: number;
};

const FAKE_PRODUCTS: Omit<PurchaseItem, "id" | "minutesAgo">[] = [
  {
    productName: "SWE ROYAL WAFFLE L/S TEE - BLACK",
    category: "Sản phẩm",
    image: "/placeholder-product.jpg",
  },
  {
    productName: "FTS CORE HOODIE OVERSIZED - NAVY",
    category: "Sản phẩm",
    image: "/placeholder-product.jpg",
  },
  {
    productName: "STREET CARGO PANTS - OLIVE",
    category: "Sản phẩm",
    image: "/placeholder-product.jpg",
  },
  {
    productName: "ACID WASH TEE VINTAGE - WHITE",
    category: "Sản phẩm",
    image: "/placeholder-product.jpg",
  },
  {
    productName: "REFLECTIVE LOGO CAP - BLACK",
    category: "Sản phẩm",
    image: "/placeholder-product.jpg",
  },
  {
    productName: "HEAVY FLEECE CREWNECK - GREY",
    category: "Sản phẩm",
    image: "/placeholder-product.jpg",
  },
  {
    productName: "RIPSTOP SHORTS - KHAKI",
    category: "Sản phẩm",
    image: "/placeholder-product.jpg",
  },
  {
    productName: "PREMIUM COACH JACKET - FOREST",
    category: "Sản phẩm",
    image: "/placeholder-product.jpg",
  },
];

function randomMinutes() {
  return Math.floor(Math.random() * 36) + 10; // 10–45
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

let toastIdCounter = 0;

function generateToast(): PurchaseItem {
  const base = pickRandom(FAKE_PRODUCTS);
  return { ...base, id: ++toastIdCounter, minutesAgo: randomMinutes() };
}

export function PurchaseToast() {
  const [toasts, setToasts] = useState<PurchaseItem[]>([]);
  const [visible, setVisible] = useState<Set<number>>(new Set());

  const showToast = useCallback(() => {
    const toast = generateToast();
    setToasts((prev) => [...prev, toast]);

    // Animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setVisible((prev) => new Set(prev).add(toast.id));
      });
    });

    // Remove after 4.5 s (4 s display + 0.5 s slide-out)
    setTimeout(() => {
      setVisible((prev) => {
        const next = new Set(prev);
        next.delete(toast.id);
        return next;
      });
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 500);
    }, 4500);
  }, []);

  useEffect(() => {
    // First toast after 3 s, then every 8–15 s
    const firstTimer = setTimeout(() => {
      showToast();
      const interval = setInterval(
        () => showToast(),
        Math.random() * 7000 + 8000,
      );
      return () => clearInterval(interval);
    }, 20000);

    return () => clearTimeout(firstTimer);
  }, [showToast]);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        left: "24px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        pointerEvents: "none",
      }}
    >
      {toasts.map((toast) => (
        <ToastCard
          key={toast.id}
          toast={toast}
          visible={visible.has(toast.id)}
        />
      ))}
    </div>
  );
}

function ToastCard({
  toast,
  visible,
}: {
  toast: PurchaseItem;
  visible: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "10px 14px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)",
        maxWidth: "320px",
        minWidth: "280px",
        pointerEvents: "auto",
        transform: visible ? "translateX(0)" : "translateX(-120%)",
        opacity: visible ? 1 : 0,
        transition:
          "transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease",
        willChange: "transform, opacity",
        position: "relative",
      }}
    >
      {/* Product image */}
      <div
        style={{
          width: "54px",
          height: "54px",
          borderRadius: "8px",
          overflow: "hidden",
          flexShrink: 0,
          background: "var(--border)",
        }}
      >
        <ProductThumb name={toast.productName} />
      </div>

      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: "11px",
            color: "var(--muted)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            fontWeight: 600,
          }}
        >
          {toast.category}
        </p>
        <p
          style={{
            margin: "2px 0 4px",
            fontSize: "13px",
            fontWeight: 700,
            color: "var(--text)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {toast.productName}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "12px",
            color: "var(--muted)",
          }}
        >
          Đã được mua cách đây {toast.minutesAgo} phút
        </p>
      </div>

      {/* Accent dot */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "12px",
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: "var(--accent)",
          boxShadow: "0 0 6px var(--accent)",
        }}
      />
    </div>
  );
}

/** Generates a simple SVG placeholder with the product initial as thumbnail */
function ProductThumb({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <svg
      width="54"
      height="54"
      viewBox="0 0 54 54"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <rect width="54" height="54" fill="var(--border)" />
      {/* Simple tee-shirt silhouette */}
      <path
        d="M18 14 L12 22 L18 24 L18 40 L36 40 L36 24 L42 22 L36 14 Q33 20 27 20 Q21 20 18 14Z"
        fill="var(--muted)"
        opacity="0.45"
      />
      <text
        x="27"
        y="31"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="13"
        fontWeight="700"
        fontFamily="DM Sans, system-ui, sans-serif"
        fill="var(--text)"
        opacity="0.7"
      >
        {initial}
      </text>
    </svg>
  );
}
