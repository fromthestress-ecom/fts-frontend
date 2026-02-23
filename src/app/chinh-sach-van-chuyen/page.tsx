import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chính sách vận chuyển & Giao nhận",
  description:
    "Chính sách giao hàng, phí vận chuyển và thời gian giao nhận tại FROM THE STRESS.",
};

export default function ChinhSachVanChuyenPage() {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-8 sm:px-6">
      <h1 className="font-display mb-6 text-2xl tracking-wide sm:text-3xl">
        CHÍNH SÁCH VẬN CHUYỂN & GIAO NHẬN
      </h1>
      <div className="space-y-6 text-muted text-sm leading-relaxed sm:text-base">
        <section>
          <h2 className="mb-2 text-base font-semibold text-text sm:text-lg">
            1. Phạm vi giao hàng
          </h2>
          <p>
            Chúng tôi giao hàng toàn quốc. Đơn hàng được xử lý và giao qua đơn
            vị vận chuyển uy tín. Thời gian giao dự kiến từ 2–7 ngày tùy khu
            vực.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-text sm:text-lg">
            2. Phí vận chuyển
          </h2>
          <p>
            Phí ship được tính theo đơn hàng. Đơn từ 500.000₫ trở lên thường
            được miễn phí vận chuyển (áp dụng theo chương trình hiện hành). Chi
            tiết phí sẽ hiển thị tại bước thanh toán.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-text sm:text-lg">
            3. Theo dõi đơn hàng
          </h2>
          <p>
            Sau khi đặt hàng, bạn nhận email xác nhận. Nhân viên sẽ liên hệ để
            xác nhận và báo tiến độ giao hàng. Bạn có thể tra cứu đơn hàng qua
            link trong email hoặc liên hệ trực tiếp.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-text sm:text-lg">
            4. Giao nhận và kiểm tra
          </h2>
          <p>
            Khi nhận hàng, vui lòng kiểm tra số lượng, sản phẩm và tình trạng
            bên ngoài. Nếu có sai sót hoặc hư hỏng, phản hồi ngay cho shipper
            hoặc liên hệ chúng tôi trong vòng 24–48 giờ.
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
