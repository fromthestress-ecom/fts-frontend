"use client";

import Link from "next/link";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import type { Product } from "@/lib/api";
import { ImageWithSkeleton } from "@/components/ImageWithSkeleton";

const SLIDER_SETTINGS = {
  dots: true,
  arrows: true,
  infinite: false,
  speed: 300,
  slidesToShow: 4,
  slidesToScroll: 1,
  responsive: [
    { breakpoint: 1024, settings: { slidesToShow: 3 } },
    { breakpoint: 640, settings: { slidesToShow: 2 } },
  ],
} as const;

type OtherProductsSectionProps = {
  products: Product[];
};

export function OtherProductsSection({ products }: OtherProductsSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className="border-t border-border bg-surface/50 py-8">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <h2 className="font-display mb-6 text-xl tracking-wide sm:text-2xl">
          CÁC SẢN PHẨM KHÁC
        </h2>
        <div className="other-products-slider">
          <Slider {...SLIDER_SETTINGS}>
            {products.map((p) => (
              <div key={p._id} className="px-2">
                <Link
                  href={`/san-pham/${p.slug}`}
                  className="product-card block overflow-hidden rounded-lg border border-border bg-bg"
                >
                  <div className="relative aspect-square overflow-hidden bg-border">
                    {p.images?.[0] ? (
                      <ImageWithSkeleton
                        src={p.images[0]}
                        alt=""
                        className="product-card__image-inner"
                      />
                    ) : null}
                  </div>
                  <div className="p-4">
                    <h3 className="min-h-[42px] text-sm font-semibold m-0 sm:text-base line-clamp-2">
                      {p.name}
                    </h3>
                    <p className="mt-1 text-sm font-bold text-accent sm:text-base">
                      {new Intl.NumberFormat("vi-VN").format(p.price)}₫
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
}
