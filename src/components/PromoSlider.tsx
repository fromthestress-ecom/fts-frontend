"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ImageWithSkeleton } from "@/components/ImageWithSkeleton";

export type PromoSlide = Readonly<{
  src: string;
  href: string;
  label: string;
  startDate?: string;
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

function CountdownOverlay({ startDate }: { startDate: string }) {
  const [remaining, setRemaining] = useState(() =>
    calcRemaining(new Date(startDate)),
  );

  useEffect(() => {
    const id = setInterval(() => {
      const r = calcRemaining(new Date(startDate));
      setRemaining(r);
      if (r.total <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [startDate]);

  if (remaining.total <= 0) return null;

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/50">
      <span className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/80 sm:text-sm">
        Sắp diễn ra
      </span>
      <div className="flex gap-2 sm:gap-3">
        {[
          { value: remaining.days, label: "Ngày" },
          { value: remaining.hours, label: "Giờ" },
          { value: remaining.minutes, label: "Phút" },
          { value: remaining.seconds, label: "Giây" },
        ].map((u) => (
          <div
            key={u.label}
            className="flex flex-col items-center rounded-lg bg-black/60 px-2.5 py-1.5 sm:px-4 sm:py-2"
          >
            <span className="text-lg font-bold text-white sm:text-2xl">
              {String(u.value).padStart(2, "0")}
            </span>
            <span className="text-[10px] text-white/70 sm:text-xs">
              {u.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function calcRemaining(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    total: diff,
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

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
        {slides.map((slide) => {
          const isUpcoming =
            slide.startDate && new Date(slide.startDate) > new Date();
          return (
            <div key={`${slide.href}|${slide.src}`}>
              <Link
                href={isUpcoming ? "#" : slide.href}
                aria-label={slide.label}
                className="block overflow-hidden rounded-xl border border-border bg-surface"
                onClick={isUpcoming ? (e) => e.preventDefault() : undefined}
              >
                <div className="relative w-full bg-border aspect-2/1">
                  <ImageWithSkeleton
                    src={slide.src}
                    alt={slide.label}
                    unoptimized={true}
                    quality={100}
                    priority={true}
                  />
                  {isUpcoming && slide.startDate && (
                    <CountdownOverlay startDate={slide.startDate} />
                  )}
                </div>
              </Link>
            </div>
          );
        })}
      </Slider>
    </div>
  );
}
