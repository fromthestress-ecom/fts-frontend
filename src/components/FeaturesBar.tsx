const FEATURES = [
  {
    title: "MIỄN PHÍ GIAO HÀNG",
    description: "Với hóa đơn từ 500.000 VNĐ",
    icon: (
      <img
        alt="free-shipping-icon"
        src="/icon/delivery-xxl.png"
        className="h-8 w-8"
      />
    ),
  },
  {
    title: "7 NGÀY ĐỔI SẢN PHẨM",
    description: "Đổi sản phẩm trong vòng 7 ngày",
    icon: (
      <img
        alt="7-day-return-icon"
        src="/icon/empty-box-xxl.png"
        className="h-8 w-8"
      />
    ),
  },
  {
    title: "MUA HÀNG (09H00 - 22H00, T2 - CN)",
    description: "Hotline Mua hàng 085 378 3578",
    icon: (
      <img alt="mua-hang-icon" src="/icon/phone-xxl.png" className="h-8 w-8" />
    ),
  },
  {
    title: "HỆ THỐNG CỬA HÀNG",
    description: "Cửa hàng trên toàn hệ thống",
    icon: (
      <img alt="cua-hang-icon" src="/icon/shop-xxl.png" className="h-8 w-8" />
    ),
  },
] as const;

export function FeaturesBar() {
  return (
    <section
      className="border-t border-neutral-200 bg-white px-4 py-10 text-neutral-800 sm:px-6 sm:py-12"
      aria-label="Tiện ích và chính sách"
    >
      <div className="mx-auto max-w-[1280px]">
        <ul className="grid list-none grid-cols-1 gap-8 p-0 m-0 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <li
              key={feature.title}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-4 flex size-16 shrink-0 items-center justify-center rounded-full bg-neutral-700 text-white sm:size-20">
                {feature.icon}
              </div>
              <h3 className="mb-1 text-sm font-bold uppercase tracking-wide sm:text-md">
                {feature.title}
              </h3>
              <p className="text-sm text-neutral-600 sm:text-base">
                {feature.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
