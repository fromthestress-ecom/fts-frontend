"use client";

import { useState } from "react";
import { getAdminKey } from "@/components/admin/AdminGuard";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type CrawlResult = {
  created: number;
  skipped: number;
  errors: string[];
};

export default function BlogCrawlPage() {
  const [limit, setLimit] = useState(3);
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CrawlResult | null>(null);
  const [error, setError] = useState("");

  const handleCrawl = async () => {
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const key = getAdminKey();
      const res = await fetch(`${API}/admin/blog-crawl`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": key ?? "",
        },
        body: JSON.stringify({ limit, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Crawl failed");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Co loi xay ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="font-display mb-4 text-xl sm:text-2xl">
        Auto Crawl Blog
      </h1>
      <p className="text-muted mb-6">
        Crawl bai viet tu Hypebeast, Highsnobiety va dung AI viet lai thanh bai
        blog tieng Viet.
      </p>

      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm mb-6">
        <div className="flex flex-wrap gap-4 items-end mb-4">
          <div>
            <label className="mb-1 block text-xs text-muted">
              So bai moi nguon
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value) || 3)}
              className="rounded border border-border bg-bg px-3 py-2 text-text text-sm w-20"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">
              Trang thai bai viet
            </label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "draft" | "published")
              }
              className="rounded border border-border bg-bg px-3 py-2 text-text text-sm"
            >
              <option value="draft">Draft (can duyet)</option>
              <option value="published">Published (dang ngay)</option>
            </select>
          </div>
          <button
            onClick={handleCrawl}
            disabled={loading}
            className="cursor-pointer rounded border-none bg-accent px-5 py-2 font-semibold text-bg disabled:opacity-50"
          >
            {loading ? "Dang crawl..." : "Bat dau Crawl"}
          </button>
        </div>

        {loading && (
          <p className="text-muted text-sm">
            Dang crawl RSS va viet lai bang AI, co the mat 30-60 giay...
          </p>
        )}

        {result && (
          <div className="mt-4 rounded-lg bg-bg p-4 border border-border">
            <p className="text-sm">
              <span className="font-semibold text-green-500">
                {result.created} bai da tao
              </span>
              {" · "}
              <span className="text-muted">
                {result.skipped} bai da ton tai (bo qua)
              </span>
            </p>
            {result.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-red-500 font-semibold">Loi:</p>
                {result.errors.map((e, i) => (
                  <p key={i} className="text-xs text-red-400">
                    {e}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </div>

      <div className="text-sm text-muted">
        <p className="mb-1">
          <strong>Nguon RSS:</strong> Hypebeast, Highsnobiety
        </p>
        <p className="mb-1">
          <strong>AI Model:</strong> GPT-4o-mini
        </p>
        <p>
          <strong>Chi phi:</strong> ~500d/bai
        </p>
      </div>
    </>
  );
}
