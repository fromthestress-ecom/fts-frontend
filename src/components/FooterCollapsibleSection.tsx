"use client";

import { useState } from "react";

type FooterCollapsibleSectionProps = {
  title: string;
  children: React.ReactNode;
};

export function FooterCollapsibleSection({
  title,
  children,
}: FooterCollapsibleSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-b-0 md:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 py-3 text-left md:pointer-events-none md:py-0 md:pb-3"
        aria-expanded={open}
      >
        <h3 className="text-sm font-semibold sm:text-base">{title}</h3>
        <svg
          className={`size-5 shrink-0 text-muted transition-transform md:hidden ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-[height] md:block ${open ? "block" : "hidden md:block"}`}
      >
        <nav className="flex flex-col gap-2 pb-3 md:pb-0">{children}</nav>
      </div>
    </div>
  );
}
