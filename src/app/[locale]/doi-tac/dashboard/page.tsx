"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/lib/api";

interface DashboardData {
  totalEarned: number;
  pendingBalance: number;
  walletBalance: number;
  totalReferrals: number;
  totalOrders: number;
  conversionRate: number | string;
  commissionRate: number;
}

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

export default function AffiliateDashboardPage() {
  const { token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchApi<DashboardData>("/affiliates/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(setData)
      .catch(() => {});
  }, [token]);

  if (!data) {
    return <p className="text-muted">Đang tải...</p>;
  }

  const stats = [
    {
      label: "Tổng thu nhập",
      value: formatVND(data.totalEarned),
      accent: true,
    },
    { label: "Hoa hồng chờ", value: formatVND(data.pendingBalance) },
    { label: "Có thể rút", value: formatVND(data.walletBalance), accent: true },
    { label: "Lượt giới thiệu", value: String(data.totalReferrals) },
    { label: "Đơn hàng", value: String(data.totalOrders) },
    { label: "Tỷ lệ chuyển đổi", value: `${data.conversionRate}%` },
  ];

  return (
    <>
      <h1 className="partner-content__title">Tổng quan</h1>

      <div className="partner-grid">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`partner-stat-card ${s.accent ? "partner-stat-card--accent" : ""}`}
          >
            <p className="partner-stat-card__label">{s.label}</p>
            <p className="partner-stat-card__value">{s.value}</p>
          </div>
        ))}
        <div className="partner-stat-card">
          <p className="partner-stat-card__label">Tỷ lệ hoa hồng của bạn</p>
          <p className="partner-stat-card__value text-accent">
            {data.commissionRate}%
          </p>
        </div>
      </div>
    </>
  );
}
