"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/lib/api";

interface ReferralData {
  referralCode: string;
  referralLink: string;
  totalReferred: number;
}

export default function MaGioiThieuPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [loading, user, router]);

  useEffect(() => {
    if (token) {
      fetchApi<ReferralData>("/referrals/my-code", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(setData)
        .catch(() => {});
    }
  }, [token]);

  const copyCode = async () => {
    if (!data) return;
    await navigator.clipboard.writeText(data.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = async () => {
    if (!data) return;
    await navigator.clipboard.writeText(data.referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareFacebook = () => {
    if (!data) return;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.referralLink)}`,
      "_blank",
    );
  };

  const shareMessenger = () => {
    if (!data) return;
    window.open(
      `https://www.facebook.com/dialog/send?link=${encodeURIComponent(data.referralLink)}&app_id=0&redirect_uri=${encodeURIComponent(data.referralLink)}`,
      "_blank",
    );
  };

  const shareTwitter = () => {
    if (!data) return;
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(data.referralLink)}&text=Sử%20dụng%20mã%20giới%20thiệu%20của%20tôi%20để%20nhận%20ưu%20đãi!`,
      "_blank",
    );
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-accent"></div>
      </div>
    );
  }

  return (
    <div className="referral-page">
      <div className="referral-page__inner">
        <div className="referral-header">
          <div className="referral-header__icon">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16,6 12,2 8,6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </div>
          <h1 className="referral-title">Giới Thiệu Bạn Bè</h1>
          <p className="referral-subtitle">
            Chia sẻ mã giới thiệu cho bạn bè của bạn để họ nhận được ưu đãi giảm
            giá và bạn cũng nhận được hoa hồng khi họ mua hàng thành công.
          </p>
        </div>

        {data ? (
          <div className="referral-bento">
            {/* Box 1: Your Code */}
            <div className="referral-card referral-card--accent">
              <h2 className="referral-card__title">Mã Của Bạn</h2>
              <div className="referral-code-display">
                <span className="referral-code">{data.referralCode}</span>
                <button
                  type="button"
                  onClick={copyCode}
                  className={`referral-copy-btn ${copied ? "referral-copy-btn--success" : ""}`}
                >
                  {copied ? "Đã copy!" : "Copy mã"}
                </button>
              </div>
            </div>

            {/* Box 2: Stats */}
            <div className="referral-card referral-card--stats">
              <h2 className="referral-card__title">Thống kê</h2>
              <div className="referral-stat-bignum">
                <span className="referral-number">{data.totalReferred}</span>
                <span className="referral-label">Người đã dùng mã</span>
              </div>
            </div>

            {/* Box 3: Share Links */}
            <div className="referral-card referral-card--full">
              <h3 className="referral-card__title">Liên kết chia sẻ nhanh</h3>

              <div className="referral-link-box">
                <input
                  type="text"
                  readOnly
                  value={data.referralLink}
                  className="referral-link-input"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  type="button"
                  onClick={copyLink}
                  className="referral-link-copy"
                >
                  {copiedLink ? "Đã copy link" : "Sao chép link"}
                </button>
              </div>

              <div className="referral-socials">
                <span className="referral-socials-text">
                  Hoặc chia sẻ qua mạng xã hội:
                </span>
                <div className="referral-social-buttons">
                  <button
                    type="button"
                    onClick={shareFacebook}
                    className="social-btn social-btn--facebook"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                    </svg>
                    Facebook
                  </button>
                  <button
                    type="button"
                    onClick={shareMessenger}
                    className="social-btn social-btn--messenger"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.908 1.438 5.503 3.688 7.2V22l3.384-1.858A11.32 11.32 0 0012 20.486c5.523 0 10-4.145 10-9.243C22 6.145 17.523 2 12 2zm1.062 12.463l-2.55-2.723-4.977 2.723L10.39 9.55l2.613 2.723 4.914-2.723-4.855 4.913z" />
                    </svg>
                    Messenger
                  </button>
                  <button
                    type="button"
                    onClick={shareTwitter}
                    className="social-btn social-btn--twitter"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                    Twitter
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center text-muted">
            Không tìm thấy dữ liệu mã giới thiệu
          </div>
        )}

        <div className="referral-footer">
          <a href="/chinh-sach-gioi-thieu" className="referral-policy-link">
            Xem chi tiết Chính sách Giới thiệu ↗
          </a>
        </div>
      </div>
    </div>
  );
}
