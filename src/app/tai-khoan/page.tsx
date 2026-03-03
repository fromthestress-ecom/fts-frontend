"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function TaiKhoanPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="account-page">
        <div className="account-page__inner">
          <p className="text-muted">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const referralCode = user.referralCode;
  const canCopyReferral = Boolean(referralCode);

  const handleCopyReferral = async () => {
    if (!referralCode) return;
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="account-page">
      <div className="account-page__inner">
        <h1 className="account-page__title">TÀI KHOẢN CỦA TÔI</h1>

        <div className="account-page__card">
          <div className="account-page__avatar">
            {user.fullName?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="account-page__info">
            <h2 className="account-page__name">{user.fullName}</h2>
            <p className="account-page__email">{user.email}</p>
            {user.phone && <p className="account-page__phone">{user.phone}</p>}
            <p className="account-page__joined">
              Thành viên từ{" "}
              {new Date(user.createdAt || "").toLocaleDateString("vi-VN")}
            </p>
            {canCopyReferral && (
              <div className="account-page__referral-row">
                <span className="account-page__referral-label">
                  Mã giới thiệu:{"  "}
                </span>
                <span className="account-page__referral-code">
                  {referralCode}{" "}
                </span>
                <button
                  type="button"
                  onClick={handleCopyReferral}
                  className="account-page__referral-copy"
                >
                  {copied ? "Đã copy" : "Copy"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="account-page__grid">
          <a href="/don-hang" className="account-page__action-card">
            <svg
              width="24"
              height="24"
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
            <span>Đơn hàng</span>
          </a>

          <a href="/ma-gioi-thieu" className="account-page__action-card">
            <svg
              width="24"
              height="24"
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
            <span>Mã giới thiệu</span>
          </a>

          <a href="/doi-tac" className="account-page__action-card">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>Đối tác liên kết</span>
          </a>
        </div>

        <button type="button" className="account-page__logout" onClick={logout}>
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
