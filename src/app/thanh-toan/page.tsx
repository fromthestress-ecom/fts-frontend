import Link from "next/link";
import { CheckoutForm } from "@/components/CheckoutForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thanh toán",
  description: "Thanh toán đơn hàng thời trang streetwear.",
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-[640px] px-4 py-8 sm:px-6">
      <h1 className="font-display mb-6 text-2xl tracking-wide sm:text-3xl">
        THANH TOÁN
      </h1>
      <CheckoutForm />
      <p className="mt-4 text-sm text-muted sm:text-base">
        <Link href="/gio-hang" className="text-accent hover:underline">
          ← Quay lại giỏ hàng
        </Link>
      </p>
    </div>
  );
}
