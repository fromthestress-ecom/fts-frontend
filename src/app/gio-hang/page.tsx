import { CartContent } from "@/components/CartContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giỏ hàng",
  description: "Giỏ hàng mua sắm thời trang streetwear.",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-[960px] px-4 py-8 sm:px-6">
      <h1 className="font-display mb-6 text-2xl tracking-wide sm:text-3xl">
        GIỎ HÀNG
      </h1>
      <CartContent />
    </div>
  );
}
