"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { fetchApi } from "@/lib/api";

const AdminBarChart = dynamic(
  () => import("@/components/admin/AdminBarChart").then((m) => m.AdminBarChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-accent" />
      </div>
    ),
  },
);

interface BestSeller {
  _id: string;
  name: string;
  totalQuantity: number;
  revenue: number;
}

interface TopBuyer {
  _id: string;
  fullName: string;
  totalOrders: number;
  totalSpent: number;
}

export default function AdminDashboardPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bestSellers, setBestSellers] = useState<BestSeller[]>([]);
  const [topBuyers, setTopBuyers] = useState<TopBuyer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let urlBestSellers = "/admin/stats/best-sellers?";
    let urlTopBuyers = "/admin/stats/top-buyers?";

    if (startDate) {
      urlBestSellers += `startDate=${startDate}&`;
      urlTopBuyers += `startDate=${startDate}&`;
    }
    if (endDate) {
      urlBestSellers += `endDate=${endDate}&`;
      urlTopBuyers += `endDate=${endDate}&`;
    }

    setLoading(true);
    Promise.all([
      fetchApi<BestSeller[]>(urlBestSellers),
      fetchApi<TopBuyer[]>(urlTopBuyers),
    ])
      .then(([bs, tb]) => {
        setBestSellers(bs);
        setTopBuyers(tb);
      })
      .catch((err) => console.error("Error fetching stats:", err))
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  const bestSellersData = {
    labels: bestSellers.map((bs) =>
      bs.name.length > 20 ? bs.name.substring(0, 20) + "..." : bs.name,
    ),
    datasets: [
      {
        label: "Số lượng bán ra",
        data: bestSellers.map((bs) => bs.totalQuantity),
        backgroundColor: "rgba(59, 130, 246, 0.8)", // Tailwind Blue-500
      },
    ],
  };

  const topBuyersData = {
    labels: topBuyers.map((tb) => tb.fullName || tb._id), // Use fullName or email
    datasets: [
      {
        label: "Tổng tiền đã tiêu (VNĐ)",
        data: topBuyers.map((tb) => tb.totalSpent),
        backgroundColor: "rgba(16, 185, 129, 0.8)", // Tailwind Emerald-500
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
    },
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display mb-2 text-xl sm:text-2xl">Dashboard</h1>
        <p className="text-muted">
          Tổng quan số liệu bán hàng và quản lý cửa hàng.
        </p>
      </div>

      {/* Date Filters */}
      <div className="flex flex-wrap gap-4 items-end bg-surface p-4 rounded-xl border border-border">
        <div>
          <label className="block text-sm text-muted mb-1">Từ ngày</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm focus:border-text focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">Đến ngày</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm focus:border-text focus:outline-none"
          />
        </div>
        <button
          onClick={() => {
            setStartDate("");
            setEndDate("");
          }}
          className="text-sm px-4 py-2 bg-bg border border-border hover:bg-border transition-colors rounded-md font-medium"
        >
          Xóa bộ lọc
        </button>
      </div>

      {/* Charts */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-surface">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-accent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-surface border border-border rounded-xl p-4 sm:p-6 flex flex-col h-[400px]">
            <h2 className="font-semibold text-lg mb-4 text-center">
              Top 10 Sản phẩm bán chạy nhất
            </h2>
            <div className="flex-1 min-h-0">
              <AdminBarChart options={chartOptions} data={bestSellersData} />
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4 sm:p-6 flex flex-col h-[400px]">
            <h2 className="font-semibold text-lg mb-4 text-center">
              Top 10 Khách hàng chi tiêu nhiều nhất
            </h2>
            <div className="flex-1 min-h-0">
              <AdminBarChart options={chartOptions} data={topBuyersData} />
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div>
        <h2 className="font-semibold mb-4 text-lg">Truy cập nhanh</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/categories"
            className="group block min-w-[160px] flex-1 rounded-xl border border-border bg-surface p-4 sm:p-5 transition hover:border-text"
          >
            <strong className="group-hover:text-accent transition-colors">
              Danh mục
            </strong>
            <p className="mt-1 text-sm text-muted">Quản lý danh mục sản phẩm</p>
          </Link>
          <Link
            href="/admin/products"
            className="group block min-w-[160px] flex-1 rounded-xl border border-border bg-surface p-4 sm:p-5 transition hover:border-text"
          >
            <strong className="group-hover:text-accent transition-colors">
              Sản phẩm
            </strong>
            <p className="mt-1 text-sm text-muted">Thêm, sửa, xóa sản phẩm</p>
          </Link>
          <Link
            href="/admin/users"
            className="group block min-w-[160px] flex-1 rounded-xl border border-border bg-surface p-4 sm:p-5 transition hover:border-text"
          >
            <strong className="group-hover:text-accent transition-colors">
              Người dùng
            </strong>
            <p className="mt-1 text-sm text-muted">Xem danh sách và vai trò</p>
          </Link>
          <Link
            href="/admin/affiliates"
            className="group block min-w-[160px] flex-1 rounded-xl border border-border bg-surface p-4 sm:p-5 transition hover:border-text"
          >
            <strong className="group-hover:text-accent transition-colors">
              Đối tác
            </strong>
            <p className="mt-1 text-sm text-muted">
              Quản lý affiliate, duyệt lệnh rút tiền
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
