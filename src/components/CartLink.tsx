"use client";

import Link from "next/link";
import { useCartCount } from "@/hooks/useCartCount";
import { ThemeAwareImg } from "./ThemeAwareImg";

type CartLinkProps = {
  iconOnly?: boolean;
  className?: string;
  showText?: boolean;
};

export function CartLink({
  iconOnly = false,
  className = "",
  showText = false,
}: CartLinkProps) {
  const count = useCartCount();

  return (
    <Link
      href="/gio-hang"
      className={`flex items-center gap-2 text-muted text-sm sm:text-base hover:text-text transition-colors ${className}`}
      aria-label={iconOnly ? "Giỏ hàng" : undefined}
    >
      <span className="relative inline-block" aria-hidden>
        <ThemeAwareImg
          darkSrc="/icon/shopping-bag-xxl-white.png"
          lightSrc="/icon/shopping-bag-xxl-black.png"
          alt=""
          className="h-[22px] w-[22px]"
        />
        {count > 0 && (
          <span className="absolute -right-2 -top-2 rounded-full bg-accent px-1.5 py-0.5 text-bg text-[10px] font-bold leading-none min-w-[18px] text-center border border-bg">
            {count}
          </span>
        )}
      </span>
      {!iconOnly && showText && (
        <span className="font-semibold text-text max-md:hidden">Giỏ hàng</span>
      )}
    </Link>
  );
}
