"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/lib/api";

interface Commission {
  _id: string;
  orderNumber: string;
  rate: number;
  amount: number;
  status: string;
  createdAt: string;
}

interface CommissionResult {
  items: Commission[];
  total: number;
  page: number;
  totalPages: number;
}

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

export default function HoaHongPage() {
  const { token } = useAuth();
  const [data, setData] = useState<CommissionResult | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!token) return;
    fetchApi<CommissionResult>(
      `/affiliates/commissions?page=${page}&limit=15`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
      .then(setData)
      .catch(() => {});
  }, [token, page]);

  return (
    <>
      <h1 className="affiliate-content__title">Lịch Sử Hoa Hồng</h1>

      {!data ? (
        <p className="text-muted">Đang tải...</p>
      ) : data.items.length === 0 ? (
        <div className="p-8 border border-dashed border-border rounded-xl text-center">
          <p className="text-muted">
            Chưa có hoa hồng nào. Chia sẻ link sản phẩm để bắt đầu kiếm tiền!
          </p>
        </div>
      ) : (
        <>
          <div className="affiliate-table-wrapper">
            <table className="affiliate-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Tỷ lệ %</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày ghi nhận</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((c) => (
                  <tr key={c._id}>
                    <td className="font-semibold">{c.orderNumber || "—"}</td>
                    <td>{c.rate}%</td>
                    <td className="font-semibold text-accent">
                      {formatVND(c.amount)}
                    </td>
                    <td>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          c.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30"
                            : c.status === "approved"
                              ? "bg-blue-500/20 text-blue-500 border border-blue-500/30"
                              : c.status === "paid"
                                ? "bg-green-500/20 text-green-500 border border-green-500/30"
                                : "bg-red-500/20 text-red-500 border border-red-500/30"
                        }`}
                      >
                        {c.status === "pending" && "Chờ duyệt"}
                        {c.status === "approved" && "Đã duyệt"}
                        {c.status === "paid" && "Đã trả"}
                        {c.status === "rejected" && "Từ chối"}
                      </span>
                    </td>
                    <td className="text-muted">
                      {new Date(c.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.totalPages > 1 && (
            <div className="affiliate-pagination mt-6">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Trước
              </button>
              <span className="text-muted px-4 py-2 text-sm">
                Trang {page} / {data.totalPages}
              </span>
              <button
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
