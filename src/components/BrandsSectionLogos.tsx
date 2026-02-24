"use client";

import { ThemeAwareImg } from "./ThemeAwareImg";

const BRAND_ITEMS = [
  {
    darkSrc: "/logo/logo_white.png",
    lightSrc: "/logo/logo_black.png",
    title: "signature logo",
  },
  {
    darkSrc: "/logo/big_logo_white.png",
    lightSrc: "/logo/big_logo_black.png",
    title: "fts big logo",
  },
] as const;

export function BrandsSectionLogos() {
  return (
    <ul className="flex list-none flex-row flex-wrap items-stretch justify-center gap-4 p-0 m-0 sm:gap-8">
      {BRAND_ITEMS.map((brand) => (
        <li
          key={brand.title}
          className="flex min-w-0 flex-1 basis-0 items-center justify-center overflow-hidden"
        >
          <figure className="m-0 flex flex-col items-center justify-center p-4 sm:p-5">
            <div className="flex h-[min(18vh,140px)] w-full max-w-[min(45vw,280px)] items-center justify-center">
              <ThemeAwareImg
                darkSrc={brand.darkSrc}
                lightSrc={brand.lightSrc}
                alt={brand.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <figcaption className="font-display mt-3 text-center text-sm capitalize text-muted sm:text-base">
              {brand.title}
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
