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
      <h1 className="affiliate-content__title">Hoa hồng</h1>

      {!data ? (
        <p className="text-muted">Đang tải...</p>
      ) : data.items.length === 0 ? (
        <p className="text-muted">
          Chưa có hoa hồng nào. Chia sẻ link sản phẩm để bắt đầu kiếm tiền!
        </p>
      ) : (
        <>
          <div className="affiliate-table-wrap">
            <table className="affiliate-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Hoa hồng %</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((c) => (
                  <tr key={c._id}>
                    <td>{c.orderNumber || "—"}</td>
                    <td>{c.rate}%</td>
                    <td>{formatVND(c.amount)}</td>
                    <td>
                      <span
                        className={`affiliate-badge affiliate-badge--${c.status}`}
                      >
                        {c.status === "pending" && "Chờ duyệt"}
                        {c.status === "approved" && "Đã duyệt"}
                        {c.status === "paid" && "Đã trả"}
                        {c.status === "rejected" && "Từ chối"}
                      </span>
                    </td>
                    <td>{new Date(c.createdAt).toLocaleDateString("vi-VN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.totalPages > 1 && (
            <div className="affiliate-pagination">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Trước
              </button>
              <span
                className="text-muted"
                style={{ padding: "0.4rem 0.5rem", fontSize: "0.8rem" }}
              >
                {page} / {data.totalPages}
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
