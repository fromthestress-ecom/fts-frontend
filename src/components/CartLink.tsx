"use client";

import Link from "next/link";
import { useCartCount } from "@/hooks/useCartCount";

type CartLinkProps = {
  iconOnly?: boolean;
  className?: string;
};

export function CartLink({ iconOnly = false, className = "" }: CartLinkProps) {
  const count = useCartCount();

  return (
    <Link
      href="/gio-hang"
      className={`flex items-center gap-2 text-muted text-sm sm:text-base ${className}`}
      aria-label={iconOnly ? "Giỏ hàng" : undefined}
    >
      <span className="relative inline-block" aria-hidden>
        <img
          alt="cart-icon"
          src="/icon/shopping-bag-xxl.png"
          className="h-[16px] w-[16px] max-md:h-[22px] max-md:w-[22px]"
        />
        {count > 0 && (
          <span className="absolute -right-2 -top-2 rounded-full bg-accent px-1.5 py-0.5 text-bg text-[10px] font-bold leading-none min-w-[18px] text-center">
            {count}
          </span>
        )}
      </span>
      {!iconOnly && <span>Giỏ hàng</span>}
    </Link>
  );
}
