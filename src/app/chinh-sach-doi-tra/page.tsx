import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chính sách đổi trả và hoàn tiền",
  description:
    "Điều kiện đổi trả, hoàn tiền và bảo hành sản phẩm tại FROM THE STRESS.",
  openGraph: {
    images: [{ url: "/images/og_refund.jpg", alt: "Chính sách đổi trả" }],
  },
};

export default function ChinhSachDoiTraPage() {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-8 sm:px-6">
      <h1 className="font-display mb-6 text-2xl tracking-wide sm:text-3xl">
        CHÍNH SÁCH ĐỔI TRẢ VÀ HOÀN TIỀN
      </h1>
      <div className="space-y-6 text-muted text-sm leading-relaxed sm:text-base">
        <section>
          <h2 className="mb-2 text-base font-semibold text-text sm:text-lg">
            1. Điều kiện đổi trả
          </h2>
          <p>
            Sản phẩm được đổi/trả trong vòng 07 ngày kể từ ngày nhận hàng, còn nguyên tem, chưa qua sử dụng hoặc giặt. Sản phẩm lỗi từ nhà sản xuất hoặc giao sai so với đơn hàng được ưu tiên xử lý đổi trả.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-text sm:text-lg">
            2. Các trường hợp không áp dụng đổi trả
          </h2>
          <p>
            Sản phẩm đã qua sử dụng, giặt, cắt tag; đồ lót, đồ thể thao (trừ lỗi nhà sản xuất); sản phẩm khuyến mãi đặc biệt (nếu có quy định riêng). Một số nhóm hàng có thể có điều kiện riêng, vui lòng xem tại trang sản phẩm.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-text sm:text-lg">
            3. Quy trình đổi trả
          </h2>
          <p>
            Liên hệ qua email hoặc hotline để báo lý do và gửi ảnh sản phẩm (nếu lỗi). Sau khi được xác nhận, bạn gửi hàng về địa chỉ chúng tôi cung cấp. Sau khi kiểm tra, chúng tôi sẽ đổi sản phẩm mới hoặc xử lý hoàn tiền theo chính sách.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-text sm:text-lg">
            4. Hoàn tiền
          </h2>
          <p>
            Hoàn tiền được thực hiện trong vòng 5–7 ngày làm việc sau khi xác nhận đổi trả. Tiền được hoàn qua phương thức thanh toán ban đầu hoặc chuyển khoản theo thông tin bạn cung cấp.
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
