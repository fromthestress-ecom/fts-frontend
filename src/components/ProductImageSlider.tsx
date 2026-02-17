"use client";

import { useState, useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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
      <div
        style={{
          aspectRatio: "1",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          overflow: "hidden",
        }}
      />
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
      {/* Main slider */}
      <div
        className="product-image-slider__main"
        style={{
          aspectRatio: "1",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          overflow: "hidden",
          marginBottom: "1rem",
          maxWidth: 500,
        }}
      >
        <Slider ref={mainSliderRef} {...mainSliderSettings}>
          {images.map((src, index) => (
            <div key={index} className="product-image-slider__slide">
              <img
                src={src}
                alt={`${productName} - Ảnh ${index + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
          ))}
        </Slider>
      </div>

      {/* Thumbnail navigation */}
      {images.length > 1 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(images.length, MAX_THUMBNAILS)}, 1fr)`,
            gap: "0.5rem",
          }}
        >
          {visibleThumbnails.map((src, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleThumbnailClick(index)}
              style={{
                aspectRatio: "1",
                background: "var(--surface)",
                border: `2px solid ${currentSlide === index ? "var(--accent)" : "var(--border)"}`,
                borderRadius: 4,
                overflow: "hidden",
                cursor: "pointer",
                padding: 0,
                position: "relative",
              }}
              aria-label={`Xem ảnh ${index + 1}`}
            >
              <img
                src={src}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              {index === MAX_THUMBNAILS - 1 && remainingCount > 0 && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0, 0, 0, 0.6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text)",
                    fontWeight: 700,
                    fontSize: "1rem",
                  }}
                >
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
