import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chính sách bảo mật thông tin khách hàng",
  description:
    "Chính sách bảo mật thông tin cá nhân và dữ liệu khách hàng tại FROM THE STRESS.",
  openGraph: {
    images: [{ url: "/images/og_baoMat.jpg", alt: "Chính sách bảo mật" }],
  },
};

export default function ChinhSachBaoMatPage() {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-8 sm:px-6">
      <h1 className="font-display mb-6 text-2xl tracking-wide sm:text-3xl">
        CHÍNH SÁCH BẢO MẬT THÔNG TIN KHÁCH HÀNG
      </h1>
      <div className="space-y-6 text-muted text-sm leading-relaxed sm:text-base">
        <section>
          <h2 className="mb-2 text-base font-semibold text-text sm:text-lg">
            1. Thu thập thông tin
          </h2>
          <p>
            Chúng tôi chỉ thu thập thông tin cần thiết để xử lý đơn hàng và liên hệ giao nhận: họ tên, số điện thoại, địa chỉ, email. Thông tin được nhập trực tiếp bởi khách hàng khi thanh toán.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-text sm:text-lg">
            2. Sử dụng thông tin
          </h2>
          <p>
            Thông tin chỉ dùng cho mục đích xác nhận đơn hàng, giao hàng và hỗ trợ khách hàng. Chúng tôi không bán hoặc chuyển giao dữ liệu cá nhân cho bên thứ ba vì mục đích thương mại.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-text sm:text-lg">
            3. Bảo mật và lưu trữ
          </h2>
          <p>
            Dữ liệu được lưu trữ an toàn và chỉ những nhân sự có trách nhiệm mới được truy cập. Chúng tôi áp dụng các biện pháp kỹ thuật và quy trình phù hợp để hạn chế rò rỉ thông tin.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-text sm:text-lg">
            4. Liên hệ
          </h2>
          <p>
            Mọi thắc mắc về chính sách bảo mật hoặc yêu cầu chỉnh sửa/xóa thông tin cá nhân, vui lòng liên hệ qua thông tin trên website.
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
