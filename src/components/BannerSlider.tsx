"use client";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const BANNER_IMAGES = [
  "https://pub-74aaef109f0d41358e5610e57268bc04.r2.dev/pages/banner/co%CC%9B%CC%89i%20bo%CC%89%20a%CC%81p%20lu%CC%9B%CC%A3c%20(640%20x%20360%20px)%20(1).png",
  "https://pub-74aaef109f0d41358e5610e57268bc04.r2.dev/pages/banner/1.png",
  "https://pub-74aaef109f0d41358e5610e57268bc04.r2.dev/pages/banner/2.png",
];

const SLICK_SETTINGS = {
  dots: false,
  arrows: false,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: false,
  autoplaySpeed: 4000,
  fade: true,
};

function HeroSlide({ src }: { src: string }) {
  return (
    <div className="relative overflow-hidden">
      <img
        src={src}
        alt=""
        className="block w-full h-auto align-middle"
      />
    </div>
  );
}

export function BannerSlider() {
  return (
    <div className="banner-slider banner-slider--hero">
      <Slider {...SLICK_SETTINGS}>
        {BANNER_IMAGES.map((src, index) => (
          <HeroSlide key={index} src={src} />
        ))}
      </Slider>
    </div>
  );
}
