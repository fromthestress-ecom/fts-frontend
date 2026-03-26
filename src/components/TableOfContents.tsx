"use client";

import { useEffect, useState } from "react";
import type { TocEntry } from "@/lib/toc";

export function TableOfContents({ headings }: { headings: TocEntry[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-10% 0% -80% 0%" }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
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
          const paddingLeft = `${(heading.level - minLevel) * 1}rem`;
          const isActive = activeId === heading.id;
          return (
            <a
              key={index}
              href={`#${heading.id}`}
              style={{ paddingLeft }}
              className={`text-sm tracking-wide transition-colors border-l-2 pl-3 ${
                isActive
                  ? "text-accent font-bold border-accent"
                  : "text-muted hover:text-text border-transparent"
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
