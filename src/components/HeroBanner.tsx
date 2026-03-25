"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from 'next-intl';

type WordSpan = {
  text: string;
  from: "left" | "right" | "bottom";
  delay: number;
};

const LINE1_WORDS: WordSpan[] = [
  { text: "Welcome ", from: "left", delay: 0 },
  { text: "to", from: "bottom", delay: 0.15 },
];

const LINE2_WORDS: WordSpan[] = [
  { text: "From", from: "right", delay: 0.3 },
  { text: "the", from: "bottom", delay: 0.45 },
  { text: "Stress", from: "left", delay: 0.6 },
];

function getInitialTransform(from: "left" | "right" | "bottom") {
  switch (from) {
    case "left":
      return "translate3d(-80px, 0, 0)";
    case "right":
      return "translate3d(80px, 0, 0)";
    case "bottom":
      return "translate3d(0, 60px, 0)";
  }
}

export function HeroBanner() {
  const t = useTranslations('home');
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const show = revealed && !dismissed;

  function wordStyle(w: WordSpan) {
    const easing = "cubic-bezier(0.16, 1, 0.3, 1)";
    if (!revealed) {
      return {
        opacity: 0,
        transform: getInitialTransform(w.from),
        transition: `opacity 0.8s ${easing} ${w.delay}s, transform 0.8s ${easing} ${w.delay}s`,
      };
    }
    if (dismissed) {
      const reverseDelay = 0.6 - w.delay;
      return {
        opacity: 0,
        transform: getInitialTransform(w.from),
        transition: `opacity 0.6s ${easing} ${reverseDelay}s, transform 0.6s ${easing} ${reverseDelay}s`,
      };
    }
    return {
      opacity: 1,
      transform: "translate3d(0, 0, 0)",
      transition: `opacity 0.8s ${easing} ${w.delay}s, transform 0.8s ${easing} ${w.delay}s`,
    };
  }

  function fadeStyle(delay: number) {
    const easing = "cubic-bezier(0.16, 1, 0.3, 1)";
    if (!revealed) {
      return {
        opacity: 0,
        transform: "translate3d(0, 30px, 0)",
        transition: `opacity 0.8s ${easing} ${delay}s, transform 0.8s ${easing} ${delay}s`,
      };
    }
    if (dismissed) {
      const reverseDelay = 1.1 - delay;
      return {
        opacity: 0,
        transform: "translate3d(0, 30px, 0)",
        transition: `opacity 0.6s ${easing} ${Math.max(0, reverseDelay)}s, transform 0.6s ${easing} ${Math.max(0, reverseDelay)}s`,
      };
    }
    return {
      opacity: 1,
      transform: "translate3d(0, 0, 0)",
      transition: `opacity 0.8s ${easing} ${delay}s, transform 0.8s ${easing} ${delay}s`,
    };
  }

  return (
    <section className="hero-text-banner" ref={containerRef}>
      <img
        src="/images/HERO_BANNER.jpg"
        alt=""
        className="hero-text-banner__bg-img"
        loading="eager"
        fetchPriority="high"
      />
      <div
        className="hero-text-banner__bg"
        style={{
          opacity: show ? 1 : 0,
          transition: dismissed
            ? "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s"
            : "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />
      <div className="hero-text-banner__content">
        <div className="hero-text-banner__line">
          {LINE1_WORDS.map((w) => (
            <span
              key={w.text}
              className="hero-text-banner__word me-6"
              style={wordStyle(w)}
            >
              {w.text}
            </span>
          ))}
        </div>

        <div className="hero-text-banner__line hero-text-banner__line--accent">
          {LINE2_WORDS.map((w) => (
            <span
              key={w.text}
              className="hero-text-banner__word me-6"
              style={wordStyle(w)}
            >
              {w.text}
            </span>
          ))}
        </div>

        <p className="hero-text-banner__subtitle" style={fadeStyle(0.9)}>
          Less Stress - More Drip
        </p>

        <div
          className="hero-text-banner__ctas"
          style={{
            opacity: revealed ? 1 : 0,
            transform: revealed
              ? "translate3d(0,0,0)"
              : "translate3d(0,30px,0)",
            transition:
              "opacity 0.8s cubic-bezier(0.16,1,0.3,1) 1.1s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 1.1s",
          }}
        >
          <Link
            href="/san-pham"
            className="hero-text-banner__btn hero-text-banner__btn--primary"
            onMouseEnter={() => setDismissed(true)}
            onMouseLeave={() => setDismissed(false)}
          >
            {t('exploreNow')}
          </Link>
          <Link
            href="/lien-he"
            className="hero-text-banner__btn hero-text-banner__btn--ghost"
          >
            {t('contactUs')}
          </Link>
        </div>
      </div>
    </section>
  );
}
