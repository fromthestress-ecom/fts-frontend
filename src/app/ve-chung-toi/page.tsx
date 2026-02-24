import Link from "next/link";
import type { Metadata } from "next";
import { AboutLogoBackground } from "@/components/AboutLogoBackground";

export const metadata: Metadata = {
  title: "Về chúng tôi | From the Stress",
  description:
    "From the Stress to the Best: Biến áp lực thành bản sắc rạng rỡ. Câu chuyện thương hiệu streetwear F.T.S và sứ mệnh đồng hành cùng Gen Stress.",
};

export default function VeChungToiPage() {
  return (
    <div className="relative min-h-[60vh]">
      <AboutLogoBackground />
      <div className="relative z-10 mx-auto max-w-[720px] px-4 py-8 sm:px-6">
        <h1 className="font-display mb-2 text-2xl tracking-wide sm:text-3xl">
          VỀ CHÚNG TÔI
        </h1>
        <p className="mb-8 text-lg font-medium text-muted sm:text-xl">
          From the Stress to the Best: Biến áp lực thành bản sắc rạng rỡ.
        </p>
        <div className="space-y-6 text-muted text-sm leading-relaxed sm:text-base">
          <section>
            <h2 className="mb-2 text-base font-semibold text-text sm:text-lg">
              Câu chuyện khởi đầu từ những áp lực
            </h2>
            <p>
              From the Stress (F.T.S) được ra đời không chỉ như một thương hiệu
              thời trang đơn thuần, mà là một hành trình tìm kiếm sự cân bằng
              giữa những bộn bề của cuộc sống hiện đại. Được sáng lập bởi Đặng
              Hoàng Đại Nghĩa, F.T.S là nơi hội tụ của niềm đam mê thiết kế và
              khát khao chuyển hóa những cảm xúc nặng nề thành nguồn năng lượng
              nghệ thuật đầy bản lĩnh.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-base font-semibold text-text sm:text-lg">
              Thấu hiểu thế hệ &quot;Gen Stress&quot;
            </h2>
            <p>
              Chúng tôi gọi khách hàng của mình là Gen Stress — một thế hệ trẻ
              năng động nhưng cũng đầy rẫy những trăn trở về sự nghiệp, học tập
              và cuộc sống. Trong dòng chảy hối hả đó, F.T.S thấu hiểu rằng vấn
              đề mental health (sức khỏe tinh thần) là một mảnh ghép quan trọng
              cần được quan tâm. Chúng tôi tin rằng, mỗi cá nhân đều giống như
              những quân cờ trên bàn cờ cuộc đời; dù là quân &quot;Hậu&quot;
              (Queen) quyền năng hay người đang gánh trên vai chiếc vương miện
              &quot;Heavy Crown&quot; đầy sức nặng, tất cả đều cần sự bền bỉ để
              vượt qua áp lực (stress) và tiến tới thành công.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-base font-semibold text-text sm:text-lg">
              Ngôn ngữ Streetwear &amp; Fashion đầy chiều sâu
            </h2>
            <p>
              Phong cách streetwear của F.T.S là sự giao thoa giữa tính ứng dụng
              cao và ngôn ngữ thiết kế độc đáo. Từ những form dáng Boxy-fit
              phóng khoáng, bụi bặm cho đến những chiếc Baby Tee ôm sát đầy
              quyến rũ, mỗi sản phẩm đều được chăm chút kỹ lưỡng từ chất liệu
              vải cao cấp đến những graphic mang tính biểu tượng. Với chúng tôi,
              thời trang là cách bạn đối diện với thế giới: Bạn không cần phải
              trốn tránh áp lực, hãy mặc lấy nó, làm chủ nó và biến nó thành
              phong cách riêng của chính mình.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-base font-semibold text-text sm:text-lg">
              Sứ mệnh đồng hành
            </h2>
            <p>
              Sứ mệnh của From the Stress là trở thành người bạn đồng hành cùng
              bạn trên con đường chăm sóc mental health thông qua sự tự tin và
              diện mạo rạng rỡ. Chúng tôi cam kết mang đến những giá trị thực,
              giúp bạn khẳng định cái &quot;tôi&quot; khác biệt và luôn kiêu
              hãnh tiến về phía trước đúng như tinh thần: From the Stress to the
              Best.
            </p>
          </section>
          <p className="text-center font-medium text-text">
            Chào mừng bạn đến với cộng đồng của sự bản lĩnh và tự do.
          </p>
        </div>
        <p className="mt-8">
          <Link href="/" className="text-accent hover:underline">
            ← Về trang chủ
          </Link>
        </p>
      </div>
    </div>
  );
}
