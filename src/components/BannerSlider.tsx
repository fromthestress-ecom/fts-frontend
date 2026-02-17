'use client';

import Link from 'next/link';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const BANNER_IMAGES = [
  'https://pub-74aaef109f0d41358e5610e57268bc04.r2.dev/pages/banner/co%CC%9B%CC%89i%20bo%CC%89%20a%CC%81p%20lu%CC%9B%CC%A3c%20(640%20x%20360%20px)%20(1).png',
  'https://pub-74aaef109f0d41358e5610e57268bc04.r2.dev/pages/banner/1.png',
  'https://pub-74aaef109f0d41358e5610e57268bc04.r2.dev/pages/banner/2.png',
];

const SLICK_SETTINGS = {
  dots: false,
  arrows: false,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 4000,
  fade: true,
};

function HeroSlide({ src }: { src: string }) {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '4rem 1.5rem',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--surface)',
          zIndex: 0,
        }}
      >
        <img
          src={src}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(10,10,10,0.5) 0%, rgba(10,10,10,0.7) 100%)',
          zIndex: 1,
        }}
        aria-hidden
      />
      <div
        style={{
          position: 'relative',
          zIndex: 2,
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3rem, 10vw, 5rem)',
            letterSpacing: '0.08em',
            margin: 0,
            lineHeight: 1,
          }}
        >
          STREETWEAR
        </h1>
        <p
          style={{
            marginTop: '1rem',
            color: 'var(--muted)',
            fontSize: '1.125rem',
            maxWidth: 480,
          }}
        >
          Thời trang đường phố cao cấp. Hoodie, tee, jogger, sneaker.
        </p>
        <Link
          href="/san-pham"
          style={{
            marginTop: '2rem',
            display: 'inline-block',
            padding: '0.875rem 2rem',
            background: 'var(--accent)',
            color: 'var(--bg)',
            fontWeight: 700,
            borderRadius: 4,
          }}
        >
          Xem sản phẩm
        </Link>
      </div>
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
