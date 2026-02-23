"use client";

import Link from "next/link";
import { useCartCount } from "@/hooks/useCartCount";

export function CartLink() {
  const count = useCartCount();

  return (
    <Link
      href="/gio-hang"
      className="flex items-center gap-2 text-muted text-sm sm:text-base"
    >
      <span aria-hidden>🛒</span>
      <span>Giỏ hàng</span>
      {count > 0 && (
        <span className="rounded-full bg-accent px-2 py-0.5 text-bg text-xs font-bold">
          {count}
        </span>
      )}
    </Link>
  );
}
