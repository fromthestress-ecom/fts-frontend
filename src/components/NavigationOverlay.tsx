"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import LoadingIcon from "@/components/icons/LoadingIcon";

export function NavigationOverlay() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  // Turn off the loading overlay when the path or query changes
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  // Listen to all clicks to detect when a Next/Link is activated
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      const target = anchor.getAttribute("target");

      // Filter out links that do not result in a soft transition
      if (
        !href ||
        (!href.startsWith("/") && !href.startsWith("http")) ||
        target === "_blank" ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // External HTTP links won't trigger Next.js internal router, but if they do,
      // the browser unloads the page so the spinner stays until unload. That's fine.
      if (href.startsWith("http") && !href.includes(window.location.host)) {
        return; // Let external links just pass natively
      }

      if (href.startsWith("#")) return;

      // Extract raw path and search to compare
      const url = new URL(href, window.location.href);
      const destinationUrl = url.pathname + url.search;
      const currentUrl =
        pathname +
        (searchParams.toString() ? "?" + searchParams.toString() : "");

      if (destinationUrl === currentUrl) return;

      setIsNavigating(true);
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [pathname, searchParams]);

  if (!isNavigating) return null;

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-bg/50 backdrop-blur-[2px]">
      <div className="relative text-accent flex items-center justify-center w-24 h-24">
        {/* Outer spinning ring */}
        <div className="absolute inset-0 rounded-full border-[3px] border-accent/20 border-t-accent animate-spin"></div>
        {/* Static center logo */}
        <span className="block w-20 h-20">
          <LoadingIcon />
        </span>
      </div>
    </div>
  );
}
