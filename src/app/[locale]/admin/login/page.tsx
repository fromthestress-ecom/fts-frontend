"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setAdminKey } from "@/components/admin/AdminGuard";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function AdminLoginPage() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/auth/verify`, {
        method: "POST",
        headers: { "x-admin-key": key },
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
      };
      if (res.ok && data.ok) {
        setAdminKey(key);
        router.replace("/admin");
        return;
      }
      setError(data.message ?? "Sai API Key");
    } catch {
      setError("Không kết nối được server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[400px] px-8 py-8 sm:py-16">
      <h1 className="font-display mb-2 text-xl sm:text-2xl">
        Admin đăng nhập
      </h1>
      <p className="mb-6 text-sm text-muted">
        Nhập Admin API Key (cấu hình trong backend .env: ADMIN_API_KEY)
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Admin API Key"
          required
          className="mb-4 w-full rounded-lg border border-border bg-surface px-3 py-3 text-text"
        />
        {error && (
          <p className="mb-4 text-sm text-red-500">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg border-none bg-accent py-3 font-bold text-bg disabled:opacity-70"
        >
          {loading ? "Đang kiểm tra..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}
