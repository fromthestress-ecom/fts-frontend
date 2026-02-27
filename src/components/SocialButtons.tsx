"use client";

import { useState } from "react";

type SocialItem = {
  id: string;
  label: string;
  href: string;
  color: string;
  hoverColor: string;
  icon: React.ReactNode;
};

const SOCIALS: SocialItem[] = [
  // {
  //   id: "tiktok",
  //   label: "TikTok",
  //   href: "https://tiktok.com/@fromthestress",
  //   color: "#010101",
  //   hoverColor: "#2b2b2b",
  //   icon: (
  //     <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
  //       <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.81a8.18 8.18 0 004.78 1.52V6.88a4.85 4.85 0 01-1.01-.19z" />
  //     </svg>
  //   ),
  // },

  {
    id: "facebook",
    label: "Facebook",
    href: "https://facebook.com/fromthestress",
    color: "#1877f2",
    hoverColor: "#1464d8",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
      </svg>
    ),
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/fromthestress.official/",
    color: "#e1306c",
    hoverColor: "#c2185b",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
];

export function SocialButtons() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "20px",
        zIndex: 9998,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "10px",
      }}
    >
      {SOCIALS.map((item, i) => (
        <a
          key={item.id}
          href={item.href}
          target={item.id !== "phone" ? "_blank" : undefined}
          rel="noopener noreferrer"
          aria-label={item.label}
          onMouseEnter={() => setHovered(item.id)}
          onMouseLeave={() => setHovered(null)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            animation: `socialBtnIn 0.4s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.07}s both`,
          }}
        >
          {/* Tooltip label */}
          <span
            style={{
              background: "var(--surface)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 600,
              whiteSpace: "nowrap",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              opacity: hovered === item.id ? 1 : 0,
              transform:
                hovered === item.id ? "translateX(0)" : "translateX(6px)",
              transition: "opacity 0.2s ease, transform 0.2s ease",
              pointerEvents: "none",
            }}
          >
            {item.label}
          </span>

          {/* Icon button */}
          <div
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "50%",
              background: hovered === item.id ? item.hoverColor : item.color,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                hovered === item.id
                  ? `0 6px 20px ${item.color}80, 0 2px 8px rgba(0,0,0,0.25)`
                  : "0 3px 12px rgba(0,0,0,0.3)",
              transform: hovered === item.id ? "scale(1.12)" : "scale(1)",
              transition:
                "background 0.2s ease, box-shadow 0.2s ease, transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
              flexShrink: 0,
            }}
          >
            {item.icon}
          </div>
        </a>
      ))}

      <style>{`
        @keyframes socialBtnIn {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
