"use client";

import { useTheme } from "@/contexts/ThemeContext";

export function AboutLogoBackground() {
  const { theme } = useTheme();
  const src =
    theme === "dark" ? "/logo/logo_white.png" : "/logo/logo_black.png";
  return (
    <div
      className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-[0.07]"
      style={{ backgroundImage: `url('${src}')` }}
      aria-hidden
    />
  );
}
