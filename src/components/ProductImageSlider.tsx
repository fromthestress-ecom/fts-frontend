"use client";

import { useState, useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ImageWithSkeleton } from "@/components/ImageWithSkeleton";

type ProductImageSliderProps = {
  images: string[];
  productName: string;
};

const MAX_THUMBNAILS = 4;

export function ProductImageSlider({
  images,
  productName,
}: ProductImageSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const mainSliderRef = useRef<Slider>(null);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square overflow-hidden rounded-lg border border-border bg-surface" />
    );
  }

  const mainSliderSettings = {
    dots: false,
    arrows: images.length > 1,
    infinite: false,
    speed: 300,
    slidesToShow: 1,
    slidesToScroll: 1,
    beforeChange: (_: number, next: number) => setCurrentSlide(next),
  };

  const visibleThumbnails = images.slice(0, MAX_THUMBNAILS);
  const remainingCount = images.length - MAX_THUMBNAILS;

  const handleThumbnailClick = (index: number) => {
    if (mainSliderRef.current) {
      mainSliderRef.current.slickGoTo(index);
    }
  };

  return (
    <div className="product-image-slider">
      <div className="product-image-slider__main mb-4 max-w-[500px] aspect-square overflow-hidden rounded-lg border border-border bg-surface">
        <Slider ref={mainSliderRef} {...mainSliderSettings}>
          {images.map((src, index) => (
            <div key={index} className="product-image-slider__slide">
              <ImageWithSkeleton
                src={src}
                alt={`${productName} - Ảnh ${index + 1}`}
              />
            </div>
          ))}
        </Slider>
      </div>

      {images.length > 1 && (
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${Math.min(images.length, MAX_THUMBNAILS)}, 1fr)`,
          }}
        >
          {visibleThumbnails.map((src, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleThumbnailClick(index)}
              className={`relative aspect-square cursor-pointer overflow-hidden rounded border-2 p-0 ${
                currentSlide === index
                  ? "border-accent bg-surface"
                  : "border-border bg-surface"
              }`}
              aria-label={`Xem ảnh ${index + 1}`}
            >
              <ImageWithSkeleton src={src} alt="" />
              {index === MAX_THUMBNAILS - 1 && remainingCount > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 font-bold text-text">
                  +{remainingCount}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
