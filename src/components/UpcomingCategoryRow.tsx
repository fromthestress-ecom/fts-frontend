"use client";

import Link from "next/link";
import { useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import type { Product } from "@/lib/api";

type CategoryGroup = {
  id: string;
  name: string;
  products: Product[];
  minPrice: number;
  maxPrice: number;
};

type Props = {
  group: CategoryGroup;
  imageLeft: boolean;
};

export function UpcomingCategoryRow({ group, imageLeft }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const productsWithImage = group.products.filter((p) => p.images?.[0]);

  const mainSliderSettings = {
    dots: false,
    arrows: false,
    infinite: productsWithImage.length > 1,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 3000,
    slidesToShow: 1,
    slidesToScroll: 1,
    beforeChange: (_: number, next: number) => setCurrentSlide(next),
  };

  return (
    <div
      className={`collections-section__row ${
        imageLeft
          ? "collections-section__row--img-left"
          : "collections-section__row--img-right"
      }`}
    >
      <div className="collections-section__img-card relative">
        <Slider {...mainSliderSettings} className="h-full">
          {productsWithImage.map((p) => (
            <div key={p._id} className="relative w-full h-[380px] sm:h-[450px]">
              <Link
                href={`/san-pham/${p.slug}`}
                className="block w-full h-full cursor-pointer"
              >
                {p.images?.[0] && (
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="collections-section__img absolute inset-0 w-full h-full object-cover"
                  />
                )}
              </Link>
            </div>
          ))}
        </Slider>
        {productsWithImage.length > 1 && (
          <div className="collections-section__dots" aria-hidden>
            {productsWithImage.map((_, di) => (
              <span
                key={di}
                className={`collections-section__dot ${
                  di === currentSlide ? "collections-section__dot--active" : ""
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="collections-section__text-card">
        <div className="collections-section__tags">
          <span className="collections-section__tag collections-section__tag--pill">
            Pre-order
          </span>
          <span className="collections-section__tag collections-section__tag--label">
            {group.name}
          </span>
        </div>
        <h3 className="collections-section__title text-[1.8rem] sm:text-[2.2rem] font-bold mt-2 mb-4 leading-tight uppercase font-display">
          Sản phẩm sắp ra mắt
          <br />
          {group.name}
        </h3>
        <p className="collections-section__desc text-muted mb-6">
          Đặt trước ngay những thiết kế mới nhất của chúng tôi để không bỏ lỡ xu
          hướng. Bạn sẽ là một trong những người đầu tiên sở hữu những sản phẩm
          mang đậm phong cách đường phố này! Đặt cọc trước 50% để giữ chỗ.
        </p>

        <div className="collections-section__pricing-row flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto">
          <div className="collections-section__pricing">
            <span className="collections-section__pricing-label block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
              Giá ưu đãi từ:
            </span>
            <div className="collections-section__prices flex items-center gap-2">
              <span className="collections-section__price font-bold text-lg">
                {new Intl.NumberFormat("vi-VN").format(group.minPrice)}đ
              </span>
              {group.minPrice !== group.maxPrice && (
                <>
                  <span className="text-muted">-</span>
                  <span className="collections-section__price font-bold text-lg">
                    {new Intl.NumberFormat("vi-VN").format(group.maxPrice)}đ
                  </span>
                </>
              )}
            </div>
          </div>
          <Link
            href={`/san-pham?danh_muc=${group.id}&preOrder=true`}
            className="collections-section__cta inline-flex items-center justify-center rounded-full bg-text px-6 py-3 font-semibold text-bg transition-opacity hover:opacity-80"
          >
            Xem tất cả {group.name}
          </Link>
        </div>
      </div>
    </div>
  );
}
