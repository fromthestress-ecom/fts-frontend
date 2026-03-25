"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/lib/api";

export default function DoiTacPage() {
  const { user, token, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [affiliateStatus, setAffiliateStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
      return;
    }
    if (token) {
      fetchApi<{ isAffiliate: boolean; status: string | null }>(
        "/affiliates/status",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
        .then((res) => {
          setAffiliateStatus(res.status);
          if (res.status === "active") {
            router.push("/doi-tac/dashboard");
          }
        })
        .catch(() => {})
        .finally(() => setCheckingStatus(false));
    } else {
      setCheckingStatus(false);
    }
  }, [loading, user, token, router]);

  const handleRegister = async () => {
    if (!token) return;
    setSubmitting(true);
    try {
      await fetchApi("/affiliates/register", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setAffiliateStatus("pending");
      await refreshUser();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || checkingStatus) {
    return (
      <div className="partner-landing">
        <div className="partner-landing__inner">
          <p className="text-muted">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="partner-landing">
      <div className="partner-landing__inner">
        <h1 className="partner-landing__title">Trở thành đối tác liên kết</h1>
        <p className="partner-landing__subtitle">
          Kiếm hoa hồng khi giới thiệu sản phẩm FROM THE STRESS đến bạn bè và
          người theo dõi của bạn. Chia sẻ link, nhận tiền — đơn giản vậy thôi.
        </p>

        <div className="partner-landing__benefits">
          <div className="partner-landing__benefit">
            <div className="partner-landing__benefit-icon">💰</div>
            <p className="partner-landing__benefit-title">Hoa hồng hấp dẫn</p>
            <p className="partner-landing__benefit-desc">
              Nhận đến 20% hoa hồng cho mỗi đơn hàng từ link giới thiệu của bạn.
            </p>
          </div>
          <div className="partner-landing__benefit">
            <div className="partner-landing__benefit-icon">📊</div>
            <p className="partner-landing__benefit-title">
              Dashboard thời gian thực
            </p>
            <p className="partner-landing__benefit-desc">
              Theo dõi doanh thu, đơn hàng và hoa hồng mọi lúc trên dashboard
              chuyên nghiệp.
            </p>
          </div>
          <div className="partner-landing__benefit">
            <div className="partner-landing__benefit-icon">🔗</div>
            <p className="partner-landing__benefit-title">Link dễ chia sẻ</p>
            <p className="partner-landing__benefit-desc">
              Tạo link affiliate riêng cho từng sản phẩm, chia sẻ qua mạng xã
              hội dễ dàng.
            </p>
          </div>
        </div>

        {affiliateStatus === "pending" ? (
          <div className="partner-landing__status">
            ⏳ Đơn đăng ký đối tác của bạn đang chờ phê duyệt. Chúng tôi sẽ
            thông báo khi hoàn tất!
          </div>
        ) : affiliateStatus === "suspended" ? (
          <div className="partner-landing__status">
            ⚠️ Tài khoản đối tác của bạn đã bị tạm ngừng. Vui lòng liên hệ hỗ
            trợ.
          </div>
        ) : (
          <button
            type="button"
            onClick={handleRegister}
            className="partner-landing__cta"
            disabled={submitting}
          >
            {submitting ? "Đang xử lý..." : "Đăng ký làm Đối tác"}
          </button>
        )}
      </div>
    </div>
  );
}
