"use client";

import { useEffect, useState } from "react";
import { getAdminKey } from "@/components/admin/AdminGuard";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type EventItem = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  bannerImage?: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
};

function adminFetch(path: string, init?: RequestInit) {
  const key = getAdminKey();
  return fetch(`${API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": key ?? "",
      ...init?.headers,
    },
  });
}

const inputClass =
  "rounded border border-border bg-bg px-3 py-2 text-text text-sm sm:text-base";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function toInputDate(d: string) {
  return new Date(d).toISOString().slice(0, 16);
}

function isEventActive(e: EventItem) {
  if (!e.isActive) return false;
  const now = new Date();
  return new Date(e.startDate) <= now && new Date(e.endDate) >= now;
}

const EMPTY_FORM = {
  name: "",
  slug: "",
  description: "",
  bannerImage: "",
  discountType: "percent" as "percent" | "fixed",
  discountValue: "",
  startDate: "",
  endDate: "",
  isActive: true,
};

export default function AdminEventsPage() {
  const [list, setList] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await adminFetch("/admin/events");
    if (res.ok) setList(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
  };

  const handleUploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const key = getAdminKey();
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API}/admin/upload?folder=events`, {
        method: "POST",
        headers: { "x-admin-key": key ?? "" },
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        setForm((f) => ({ ...f, bannerImage: data.url }));
      }
    } catch {
      setMessage("Upload ảnh thất bại");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || undefined,
      bannerImage: form.bannerImage.trim() || undefined,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      startDate: form.startDate,
      endDate: form.endDate,
      isActive: form.isActive,
    };

    if (editingId) {
      const res = await adminFetch(`/admin/events/${editingId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      setMessage(res.ok ? "Da cap nhat event." : (data.message ?? "Loi"));
      if (res.ok) {
        resetForm();
        load();
      }
    } else {
      const res = await adminFetch("/admin/events", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      setMessage(res.ok ? "Da tao event." : (data.message ?? "Loi"));
      if (res.ok) {
        resetForm();
        load();
      }
    }
    setSaving(false);
  };

  const startEdit = (ev: EventItem) => {
    setEditingId(ev._id);
    setForm({
      name: ev.name,
      slug: ev.slug,
      description: ev.description ?? "",
      bannerImage: ev.bannerImage ?? "",
      discountType: ev.discountType,
      discountValue: String(ev.discountValue),
      startDate: toInputDate(ev.startDate),
      endDate: toInputDate(ev.endDate),
      isActive: ev.isActive,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xoa event nay? San pham lien ket se bi go event.")) return;
    await adminFetch(`/admin/events/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <>
      <h1 className="font-display mb-4 text-xl sm:text-2xl">
        Quan ly Event / Khuyen mai
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mb-8 rounded-xl border border-border bg-surface p-6 shadow-sm"
      >
        <h2 className="mb-4 text-lg font-semibold">
          {editingId ? "Cap nhat Event" : "Tao Event moi"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="mb-1 block text-xs text-muted">Ten event *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="VD: Sale He 2025"
              required
              className={`${inputClass} w-full`}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Slug *</label>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="sale-he-2025"
              required
              className={`${inputClass} w-full`}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs text-muted">Mo ta</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Mo ta ngan cho event"
              className={`${inputClass} w-full`}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Loai giam gia *</label>
            <select
              value={form.discountType}
              onChange={(e) =>
                setForm({
                  ...form,
                  discountType: e.target.value as "percent" | "fixed",
                })
              }
              className={`${inputClass} w-full`}
            >
              <option value="percent">Phan tram (%)</option>
              <option value="fixed">So tien co dinh (VND)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">
              Gia tri giam *{" "}
              {form.discountType === "percent" ? "(0-100)" : "(VND)"}
            </label>
            <input
              type="number"
              value={form.discountValue}
              onChange={(e) =>
                setForm({ ...form, discountValue: e.target.value })
              }
              placeholder="20"
              required
              min="0"
              max={form.discountType === "percent" ? "100" : undefined}
              className={`${inputClass} w-full`}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Bat dau *</label>
            <input
              type="datetime-local"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
              className={`${inputClass} w-full`}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Ket thuc *</label>
            <input
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              required
              className={`${inputClass} w-full`}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs text-muted">
              Banner (anh quang cao cho trang chu)
            </label>
            <div className="flex items-center gap-3">
              <input
                value={form.bannerImage}
                onChange={(e) =>
                  setForm({ ...form, bannerImage: e.target.value })
                }
                placeholder="URL anh hoac upload..."
                className={`${inputClass} flex-1`}
              />
              <label className="cursor-pointer rounded border border-accent bg-accent/10 px-3 py-2 text-sm font-medium text-accent hover:bg-accent/20 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadBanner}
                  disabled={uploading}
                  className="hidden"
                />
                {uploading ? "Dang tai..." : "Upload"}
              </label>
            </div>
            {form.bannerImage && (
              <img
                src={form.bannerImage}
                alt="Preview"
                className="mt-2 h-24 rounded border border-border object-cover"
              />
            )}
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
                className="accent-accent"
              />
              <span className="text-sm">Kich hoat</span>
            </label>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="cursor-pointer rounded border-none bg-accent px-5 py-2 font-semibold text-bg"
          >
            {saving
              ? "Dang luu..."
              : editingId
                ? "Cap nhat"
                : "Tao Event"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="cursor-pointer rounded border border-border px-4 py-2 text-sm"
            >
              Huy
            </button>
          )}
          {message && (
            <span className="self-center text-sm text-muted">{message}</span>
          )}
        </div>
      </form>

      {loading ? (
        <p className="text-muted">Dang tai...</p>
      ) : list.length === 0 ? (
        <p className="text-muted">Chua co event nao.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-2">Ten</th>
                <th className="p-2">Giam gia</th>
                <th className="p-2">Thoi gian</th>
                <th className="p-2">Trang thai</th>
                <th className="p-2 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((ev) => (
                <tr key={ev._id} className="border-b border-border">
                  <td className="p-2">
                    <div className="font-medium">{ev.name}</div>
                    <div className="text-xs text-muted">{ev.slug}</div>
                  </td>
                  <td className="p-2">
                    {ev.discountType === "percent"
                      ? `${ev.discountValue}%`
                      : `${new Intl.NumberFormat("vi-VN").format(ev.discountValue)}₫`}
                  </td>
                  <td className="p-2 text-xs">
                    {formatDate(ev.startDate)} - {formatDate(ev.endDate)}
                  </td>
                  <td className="p-2">
                    {isEventActive(ev) ? (
                      <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                        Dang dien ra
                      </span>
                    ) : ev.isActive ? (
                      <span className="rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                        Chua bat dau / Het han
                      </span>
                    ) : (
                      <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                        Tat
                      </span>
                    )}
                  </td>
                  <td className="p-2 text-right">
                    <button
                      type="button"
                      onClick={() => startEdit(ev)}
                      title="Sua"
                      className="mr-2 inline-flex items-center justify-center rounded p-1.5 text-blue-500 hover:bg-blue-500/10 transition-colors"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(ev._id)}
                      title="Xoa"
                      className="inline-flex items-center justify-center rounded p-1.5 text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
