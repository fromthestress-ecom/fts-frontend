"use client";

import { useState, useEffect } from "react";

/**
 * Masks a VND price, keeping the first digit and trailing zeros visible.
 * Example: 299000 → "2??.000", 1500000 → "1.???.000"
 */
export function maskPrice(price: number): string {
  const formatted = new Intl.NumberFormat("vi-VN").format(price);
  // Split off the last ".000" group (trailing zeros)
  const lastDot = formatted.lastIndexOf(".");
  if (lastDot === -1) {
    // No dot, just mask all but first digit
    return formatted[0] + "?".repeat(formatted.length - 1);
  }

  const prefix = formatted.slice(0, lastDot);
  const suffix = formatted.slice(lastDot);

  let first = true;
  const masked = prefix
    .split("")
    .map((ch) => {
      if (!/\d/.test(ch)) return ch; // keep dots
      if (first) {
        first = false;
        return ch;
      }
      return "?";
    })
    .join("");

  return masked + suffix;
}

function calcRemaining(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0)
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    total: diff,
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

type CountdownPriceProps = {
  discountedPrice: number;
  startDate: string;
  size?: "sm" | "lg";
};

export function CountdownPrice({
  discountedPrice,
  startDate,
  size = "sm",
}: CountdownPriceProps) {
  const [remaining, setRemaining] = useState(() =>
    calcRemaining(new Date(startDate)),
  );

  useEffect(() => {
    const id = setInterval(() => {
      const r = calcRemaining(new Date(startDate));
      setRemaining(r);
      if (r.total <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [startDate]);

  const masked = maskPrice(discountedPrice);
  const isLg = size === "lg";

  if (remaining.total <= 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span
        className={`font-bold text-red-500 ${isLg ? "text-lg sm:text-xl" : "text-sm sm:text-base"}`}
      >
        {masked}₫
      </span>
      <div className="flex items-center gap-1">
        {[
          remaining.days > 0 ? `${remaining.days}d` : null,
          `${String(remaining.hours).padStart(2, "0")}h`,
          `${String(remaining.minutes).padStart(2, "0")}m`,
          `${String(remaining.seconds).padStart(2, "0")}s`,
        ]
          .filter(Boolean)
          .map((t) => (
            <span
              key={t}
              className={`rounded bg-black/80 font-mono font-bold text-white ${isLg ? "px-1.5 py-0.5 text-xs" : "px-1 py-0.5 text-[10px]"}`}
            >
              {t}
            </span>
          ))}
      </div>
    </div>
  );
}
