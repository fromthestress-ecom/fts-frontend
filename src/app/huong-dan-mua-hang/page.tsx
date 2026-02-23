import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hướng dẫn mua hàng & Thanh toán",
  description:
    "Hướng dẫn đặt hàng và thanh toán tại FROM THE STRESS. Các bước mua sắm an toàn, tiện lợi.",
};

export default function HuongDanMuaHangPage() {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-8 sm:px-6">
      <h1 className="font-display mb-6 text-2xl tracking-wide sm:text-3xl">
        HƯỚNG DẪN MUA HÀNG & THANH TOÁN
      </h1>
      <div className="space-y-6 text-muted text-sm leading-relaxed sm:text-base">
        <section>
          <h2 className="mb-2 text-base font-semibold text-text sm:text-lg">
            1. Chọn sản phẩm
          </h2>
          <p>
            Truy cập mục{" "}
            <Link href="/san-pham" className="text-accent hover:underline">
              Sản phẩm
            </Link>
            , chọn size và màu phù hợp, bấm &quot;Thêm vào giỏ&quot;.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-text sm:text-lg">
            2. Xem giỏ hàng và thanh toán
          </h2>
          <p>
            Vào{" "}
            <Link href="/gio-hang" className="text-accent hover:underline">
              Giỏ hàng
            </Link>
            , kiểm tra đơn hàng rồi bấm &quot;Thanh toán&quot;. Điền đầy đủ
            thông tin giao nhận và email.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-text sm:text-lg">
            3. Xác nhận đơn hàng
          </h2>
          <p>
            Sau khi đặt hàng, bạn sẽ nhận email xác nhận. Chúng tôi sẽ liên hệ
            để xác nhận và giao hàng trong thời gian sớm nhất.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-text sm:text-lg">
            Phương thức thanh toán
          </h2>
          <p>
            Hiện tại chúng tôi áp dụng thanh toán khi nhận hàng (COD). Các hình
            thức chuyển khoản hoặc ví điện tử có thể được cập nhật sau.
          </p>
        </section>
      </div>
      <p className="mt-8">
        <Link href="/" className="text-accent hover:underline">
          ← Về trang chủ
        </Link>
      </p>
    </div>
  );
}
