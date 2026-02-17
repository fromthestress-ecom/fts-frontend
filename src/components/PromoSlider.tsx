"use client";

import Link from "next/link";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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
          autoplaySpeed: 5000,
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
              style={{
                display: "block",
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid var(--border)",
                background: "var(--surface)",
              }}
            >
              <div
                style={{
                  width: "100%",
                  position: "relative",
                  background: "var(--border)",
                }}
              >
                <img
                  src={slide.src}
                  alt={slide.label}
                  loading="lazy"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            </Link>
          </div>
        ))}
      </Slider>
    </div>
  );
}
