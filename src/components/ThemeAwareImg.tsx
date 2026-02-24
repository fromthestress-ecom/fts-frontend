"use client";

import { useTheme } from "@/contexts/ThemeContext";

type ThemeAwareImgProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  darkSrc: string;
  lightSrc: string;
};

export function ThemeAwareImg({
  darkSrc,
  lightSrc,
  alt = "",
  ...rest
}: ThemeAwareImgProps) {
  const { theme } = useTheme();
  const src = theme === "dark" ? darkSrc : lightSrc;
  return <img src={src} alt={alt} {...rest} />;
}
