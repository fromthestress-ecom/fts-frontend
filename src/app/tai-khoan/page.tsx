"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function ProfilePage() {
  const { user, loading, logout, isAffiliate } = useAuth();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  // Protect route
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-accent"></div>
      </div>
    );
  }

  const handleCopyHash = () => {
    if (user.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const initial = user.fullName?.charAt(0)?.toUpperCase() || "U";
  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("vi-VN")
    : "Chưa cập nhật";

  return (
    <div className="profile-page">
      <div className="profile-page__header">
        <h1 className="profile-page__title">Tài khoản của tôi</h1>
        <p className="profile-page__subtitle">
          Quản lý thông tin cá nhân và cài đặt bảo mật
        </p>
      </div>

      <div className="profile-page__layout">
        {/* Sidebar/Avatar Card */}
        <div className="profile-card profile-card--sidebar">
          <div className="profile-avatar__container">
            <div className="profile-avatar">{initial}</div>
          </div>
          <h2 className="profile-name">{user.fullName}</h2>
          <p className="profile-email">{user.email}</p>
          <div className="profile-badge">Thành viên từ {joinDate}</div>

          <div className="profile-nav">
            <Link href="/don-hang" className="profile-nav__link">
              <svg
                width="18"
                height="18"
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
              Lịch sử đơn hàng
            </Link>
            {isAffiliate ? (
              <Link href="/doi-tac/dashboard" className="profile-nav__link">
                <svg
                  width="18"
                  height="18"
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
                className="profile-nav__link profile-nav__link--accent"
              >
                <svg
                  width="18"
                  height="18"
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
            <button
              onClick={handleLogout}
              className="profile-nav__link profile-nav__link--danger"
            >
              <svg
                width="18"
                height="18"
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
        </div>

        {/* Main Content Info */}
        <div className="profile-content">
          <div className="profile-card">
            <h3 className="profile-card__title">Thông tin liên hệ</h3>
            <div className="profile-info-grid">
              <div className="profile-info-group">
                <label>Họ và tên</label>
                <div className="profile-info-value">{user.fullName}</div>
              </div>
              <div className="profile-info-group">
                <label>Email</label>
                <div className="profile-info-value">{user.email}</div>
              </div>
              <div className="profile-info-group">
                <label>Số điện thoại</label>
                <div className="profile-info-value">
                  {user.phone || "Chưa cập nhật"}
                </div>
              </div>
              <div className="profile-info-group">
                <label>Vai trò</label>
                <div className="profile-info-value uppercase text-accent font-semibold">
                  {user.role}
                </div>
              </div>
            </div>
          </div>

          <div className="profile-card">
            <h3 className="profile-card__title">Giới thiệu bạn bè</h3>
            <p className="profile-card__desc">
              Chia sẻ mã giới thiệu của bạn để nhận phần thưởng khi bạn bè mua
              hàng bằng mã này nhé!
            </p>
            <div className="profile-referral-box">
              <div className="profile-referral-code">
                {user.referralCode || "Đang tạo mã..."}
              </div>
              <button
                onClick={handleCopyHash}
                className="profile-referral-copy"
                disabled={!user.referralCode}
              >
                {copied ? "Đã chép!" : "Sao chép mã"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
