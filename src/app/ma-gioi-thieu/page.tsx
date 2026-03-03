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

  if (loading || !user) {
    return (
      <div className="referral-page">
        <div className="referral-page__inner">
          <p className="text-muted">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="referral-page">
      <div className="referral-page__inner">
        <h1 className="referral-page__title">MÃ GIỚI THIỆU CỦA BẠN</h1>
        <p className="referral-page__subtitle">
          Chia sẻ mã giới thiệu để bạn bè nhận được ưu đãi đặc biệt khi mua
          hàng!
        </p>

        {data && (
          <>
            {/* Big Code Display */}
            <div className="referral-page__code-card">
              <p className="referral-page__code-label">Mã giới thiệu</p>
              <p className="referral-page__code">{data.referralCode}</p>
              <button
                type="button"
                onClick={copyCode}
                className="referral-page__copy-btn"
              >
                {copied ? "✓ Đã sao chép!" : "Sao chép mã"}
              </button>
            </div>

            {/* Share Link */}
            <div className="referral-page__link-card">
              <p className="referral-page__link-label">Link giới thiệu</p>
              <div className="referral-page__link-row">
                <input
                  type="text"
                  readOnly
                  value={data.referralLink}
                  className="referral-page__link-input"
                />
                <button
                  type="button"
                  onClick={copyLink}
                  className="referral-page__link-copy"
                >
                  {copiedLink ? "✓" : "Copy"}
                </button>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="referral-page__share">
              <p className="referral-page__share-label">Chia sẻ qua</p>
              <div className="referral-page__share-buttons">
                <button
                  type="button"
                  onClick={shareFacebook}
                  className="referral-page__share-btn referral-page__share-btn--fb"
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
                  className="referral-page__share-btn referral-page__share-btn--msg"
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
              </div>
            </div>

            {/* Stats */}
            <div className="referral-page__stats">
              <div className="referral-page__stat">
                <span className="referral-page__stat-value">
                  {data.totalReferred}
                </span>
                <span className="referral-page__stat-label">
                  Bạn bè đã giới thiệu
                </span>
              </div>
            </div>
          </>
        )}

        {/* Policy Link */}
        <a href="/chinh-sach-gioi-thieu" className="referral-page__policy-link">
          Xem chính sách giới thiệu →
        </a>
      </div>
    </div>
  );
}
