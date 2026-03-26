"use client";

import { useEffect, useState } from "react";
import type { TocEntry } from "@/lib/toc";

export function TableOfContents({ headings }: { headings: TocEntry[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings.map(h => document.getElementById(h.id)).filter(Boolean);
      const scrollPosition = window.scrollY + 140; // Offset for sticky header
      
      let currentId = "";
      for (const el of headingElements) {
        if (el && el.offsetTop <= scrollPosition) {
          currentId = el.id;
        }
      }
      
      // If we're at the very top, highlight the first item
      if (!currentId && headings.length > 0 && window.scrollY < 100) {
        currentId = headings[0].id;
      }
      
      setActiveId(currentId || (headings[0]?.id ?? ""));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run once on mount to set initial active item
    setTimeout(handleScroll, 100);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [headings]);

  if (headings.length === 0) return null;

  const minLevel = Math.min(...headings.map((h) => h.level));

  return (
    <div className="bg-surface rounded-xl p-6 border border-border">
      <h3 className="font-display text-xl uppercase tracking-wider mb-4">
        Mục Lục Bài Viết
      </h3>
      <nav className="flex flex-col gap-3">
        {headings.map((heading, index) => {
          const paddingLeft = `${(heading.level - minLevel) * 1 + 1}rem`;
          const isActive = activeId === heading.id;
          return (
            <a
              key={index}
              href={`#${heading.id}`}
              style={{ paddingLeft }}
              className={`block text-sm tracking-wide transition-all border-l-2 py-1.5 pr-3 ${
                isActive
                  ? "text-accent font-bold border-accent bg-accent/5 -mr-6"
                  : "text-muted hover:text-text border-border"
              }`}
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById(heading.id);
                if (element) {
                  const offset = 80; // sticky header offset
                  const bodyRect = document.body.getBoundingClientRect().top;
                  const elementRect = element.getBoundingClientRect().top;
                  const elementPosition = elementRect - bodyRect;
                  const offsetPosition = elementPosition - offset;

                  window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                  });
                }
              }}
            >
              {heading.text}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
