"use client";

import { useState, useCallback, useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Link from "next/link";
import LoadingIcon from "@/components/icons/LoadingIcon";

type BannerSlide = {
  src: string;
  thumb: string;
  tag1?: string;
  tag2?: string;
  title: string;
  subtitle: string;
  label?: string;
};

const BANNER_SLIDES: BannerSlide[] = [
  {
    src: "https://pub-74aaef109f0d41358e5610e57268bc04.r2.dev/pages/banner/1.png",
    thumb:
      "https://pub-74aaef109f0d41358e5610e57268bc04.r2.dev/pages/banner/1.png",
    tag1: "New",
    tag2: "Bộ sưu tập mới",
    title: "Streetwear\ncho cuộc sống hiện đại",
    subtitle:
      "Khám phá các trang phục mới nhất được thiết kế cho phong cách đường phố đỉnh cao.",
    label: "Phong Cách",
  },
  {
    src: "https://pub-74aaef109f0d41358e5610e57268bc04.r2.dev/pages/banner/2.png",
    thumb:
      "https://pub-74aaef109f0d41358e5610e57268bc04.r2.dev/pages/banner/2.png",
    tag1: "Hot",
    tag2: "Xu hướng mùa này",
    title: "Phong cách\nvượt thời gian",
    subtitle:
      "Những thiết kế tinh tế kết hợp hoàn hảo giữa hiện đại và cổ điển.",
    label: "Trending",
  },
  {
    src: "https://pub-74aaef109f0d41358e5610e57268bc04.r2.dev/pages/banner/co%CC%9B%CC%89i%20bo%CC%89%20a%CC%81p%20lu%CC%9B%CC%A3c%20(640%20x%20360%20px)%20(1).png",
    thumb:
      "https://pub-74aaef109f0d41358e5610e57268bc04.r2.dev/pages/banner/co%CC%9B%CC%89i%20bo%CC%89%20a%CC%81p%20lu%CC%9B%CC%A3c%20(640%20x%20360%20px)%20(1).png",
    tag1: "Sale",
    tag2: "Ưu đãi đặc biệt",
    title: "Cởi bỏ\náp lực",
    subtitle:
      "Trang phục thoải mái, phong cách chuẩn mực. Giảm giá lên đến 50% cho bộ sưu tập chọn lọc.",
    label: "Sale",
  },
];

function LoadingOverlay({ size = 60 }: { size?: number }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-surface"
      style={{ zIndex: 1 }}
    >
      <span
        style={{ width: size, height: size, opacity: 0.6, display: "flex" }}
      >
        <LoadingIcon />
      </span>
    </div>
  );
}

function BannerImg({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full h-full">
      {!loaded && <LoadingOverlay size={80} />}
      <img
        src={src}
        alt={alt}
        className={className}
        onLoad={() => setLoaded(true)}
        style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.4s ease" }}
      />
    </div>
  );
}

function ThumbImg({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full h-full">
      {!loaded && <LoadingOverlay size={28} />}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        style={{
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.3s ease",
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
  );
}

export function BannerSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef<Slider>(null);

  const goToSlide = useCallback((index: number) => {
    sliderRef.current?.slickGoTo(index);
    setActiveIndex(index);
  }, []);

  const settings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    fade: true,
    beforeChange: (_: number, next: number) => setActiveIndex(next),
  };

  const activeSlide = BANNER_SLIDES[activeIndex];

  return (
    <div className="banner-slider-hero">
      {/* Main slider */}
      <div className="banner-slider-hero__main">
        <Slider ref={sliderRef} {...settings}>
          {BANNER_SLIDES.map((slide, i) => (
            <div key={i} className="banner-slider-hero__slide">
              <BannerImg
                src={slide.src}
                alt={slide.title}
                className="banner-slider-hero__img"
              />
              {/* Dark overlay */}
              <div className="banner-slider-hero__overlay" />
            </div>
          ))}
        </Slider>

        {/* Content overlay */}
        <div className="banner-slider-hero__content">
          {/* Tags */}
          <div className="banner-slider-hero__tags">
            {activeSlide.tag1 && (
              <span className="banner-slider-hero__tag banner-slider-hero__tag--solid">
                {activeSlide.tag1}
              </span>
            )}
            {activeSlide.tag2 && (
              <span className="banner-slider-hero__tag banner-slider-hero__tag--outline">
                {activeSlide.tag2}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="banner-slider-hero__title">
            {activeSlide.title.split("\n").map((line, i) => (
              <span key={i}>
                {line}
                {i < activeSlide.title.split("\n").length - 1 && <br />}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <p className="banner-slider-hero__subtitle">{activeSlide.subtitle}</p>

          {/* CTA buttons */}
          <div className="banner-slider-hero__ctas">
            <Link
              href="/san-pham"
              className="banner-slider-hero__btn banner-slider-hero__btn--primary"
            >
              Xem bộ sưu tập
            </Link>
            <Link
              href="/lien-he"
              className="banner-slider-hero__btn banner-slider-hero__btn--ghost"
            >
              Liên hệ
            </Link>
          </div>
        </div>

        {/* Thumbnail strip */}
        <div className="banner-slider-hero__thumbs">
          {BANNER_SLIDES.map((slide, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToSlide(i)}
              className={`banner-slider-hero__thumb ${i === activeIndex ? "banner-slider-hero__thumb--active" : ""}`}
              aria-label={`Slide ${i + 1}`}
            >
              <ThumbImg
                src={slide.thumb}
                alt={slide.label || `Slide ${i + 1}`}
              />
              {i === activeIndex && slide.label && (
                <span className="banner-slider-hero__thumb-label">
                  {slide.label}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
