"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="text-center">
        <p className="mb-4 text-red-500">
          Đường dẫn không hợp lệ hoặc đã hết hạn.
        </p>
        <Link href="/" className="text-accent hover:underline">
          Về trang chủ
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, newPassword: password }),
        },
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Có lỗi xảy ra");

      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold uppercase">Thành công</h2>
        <p className="mb-4 text-green-500">
          Đổi mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.
        </p>
        <p className="text-sm text-muted">Đang chuyển hướng về trang chủ...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md">
      <h2 className="mb-6 text-center text-2xl font-bold uppercase">
        Khôi phục mật khẩu
      </h2>

      {error && (
        <div className="mb-4 rounded bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium" htmlFor="password">
          Mật khẩu mới
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-transparent border border-border px-4 py-2 focus:border-accent focus:outline-none"
          placeholder="••••••••"
        />
      </div>

      <div className="mb-6">
        <label
          className="mb-2 block text-sm font-medium"
          htmlFor="confirmPassword"
        >
          Xác nhận mật khẩu mới
        </label>
        <input
          id="confirmPassword"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full bg-transparent border border-border px-4 py-2 focus:border-accent focus:outline-none"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-accent py-3 font-bold uppercase text-bg transition-colors hover:bg-accent/90 disabled:opacity-50"
      >
        {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="container py-20 px-4 min-h-[60vh] flex flex-col justify-center">
      <Suspense fallback={<div className="text-center">Đang tải...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
