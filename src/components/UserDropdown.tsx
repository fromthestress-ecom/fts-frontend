"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export function UserDropdown() {
  const { user, isAffiliate, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!user) return null;

  const initial = user.fullName?.charAt(0)?.toUpperCase() || "U";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 group text-left max-md:user-dropdown__trigger"
        aria-label="Menu tài khoản"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-bg text-sm font-bold shrink-0">
          {initial}
        </div>
        <div className="flex flex-col text-sm leading-tight max-md:hidden">
          <span className="text-muted text-xs">Xin chào</span>
          <span className="font-semibold text-text flex items-center gap-1">
            {user.fullName || "Tài khoản"}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </div>
      </button>

      {open && (
        <div className="user-dropdown__menu">
          <div className="user-dropdown__header">
            <p className="user-dropdown__name">{user.fullName}</p>
            <p className="user-dropdown__email">{user.email}</p>
          </div>

          <div className="user-dropdown__divider" />

          <Link
            href="/tai-khoan"
            className="user-dropdown__item"
            onClick={() => setOpen(false)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Tài khoản
          </Link>

          <Link
            href="/don-hang"
            className="user-dropdown__item"
            onClick={() => setOpen(false)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            Đơn hàng
          </Link>

          <Link
            href="/ma-gioi-thieu"
            className="user-dropdown__item"
            onClick={() => setOpen(false)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16,6 12,2 8,6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            Mã giới thiệu
          </Link>

          <div className="user-dropdown__divider" />

          {isAffiliate ? (
            <Link
              href="/doi-tac/dashboard"
              className="user-dropdown__item"
              onClick={() => setOpen(false)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              Dashboard Đối tác
            </Link>
          ) : (
            <Link
              href="/doi-tac"
              className="user-dropdown__item user-dropdown__item--accent"
              onClick={() => setOpen(false)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Trở thành Đối tác
            </Link>
          )}

          <div className="user-dropdown__divider" />

          <button
            type="button"
            className="user-dropdown__item user-dropdown__item--danger"
            onClick={() => {
              logout();
              setOpen(false);
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
