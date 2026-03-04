"use client";

import Link from "next/link";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ImageWithSkeleton } from "@/components/ImageWithSkeleton";

export type PromoSlide = Readonly<{
  src: string;
  href: string;
  label: string;
}>;

const DEFAULT_SETTINGS = {
  dots: true,
  arrows: true,
  infinite: false,
  speed: 400,
  slidesToShow: 1,
  slidesToScroll: 1,
  adaptiveHeight: false,
} as const;

export function PromoSlider({ slides }: { slides: readonly PromoSlide[] }) {
  if (slides.length === 0) return null;

  const settings =
    slides.length > 1
      ? {
          ...DEFAULT_SETTINGS,
          infinite: true,
          autoplay: true,
          autoplaySpeed: 3000,
          arrows: false,
        }
      : {
          ...DEFAULT_SETTINGS,
          dots: false,
          arrows: false,
          infinite: false,
          autoplay: false,
        };

  return (
    <div className="promo-slider">
      <Slider {...settings}>
        {slides.map((slide) => (
          <div key={`${slide.href}|${slide.src}`}>
            <Link
              href={slide.href}
              aria-label={slide.label}
              className="block overflow-hidden rounded-xl border border-border bg-surface"
            >
              <div className="relative w-full bg-border aspect-2/1">
                <ImageWithSkeleton
                  src={slide.src}
                  alt={slide.label}
                  unoptimized={true}
                  quality={100}
                  priority={true}
                />
              </div>
            </Link>
          </div>
        ))}
      </Slider>
    </div>
  );
}
