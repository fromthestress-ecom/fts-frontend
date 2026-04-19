"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getAdminKey } from "@/components/admin/AdminGuard";
import { ImageUploader } from "@/components/admin/ImageUploader";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type MediaAsset = {
  _id: string;
  url: string;
  customName: string;
  originalName: string;
  folder: string;
  width?: number;
  height?: number;
  size?: number;
  createdAt: string;
};

type FolderInfo = { name: string; count: number };

function formatBytes(b?: number) {
  if (!b) return "—";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

function slugFolder(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export default function MediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFolder, setActiveFolder] = useState("");
  const [folders, setFolders] = useState<FolderInfo[]>([]);
  const [totalAll, setTotalAll] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [selected, setSelected] = useState<MediaAsset | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Upload panel
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFolder, setUploadFolder] = useState("");
  const [uploadValue, setUploadValue] = useState("");

  // New folder creation
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const newFolderInputRef = useRef<HTMLInputElement>(null);

  const adminFetch = useCallback((path: string, init?: RequestInit) => {
    const key = getAdminKey();
    return fetch(`${API}${path}`, { ...init, headers: { "x-admin-key": key ?? "", ...init?.headers } });
  }, []);

  const loadFolders = useCallback(async () => {
    const res = await adminFetch("/admin/media/folders");
    if (res.ok) {
      const d = await res.json();
      setFolders(d.folders ?? []);
      setTotalAll(d.total ?? 0);
    }
  }, [adminFetch]);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    const q = new URLSearchParams({ page: String(p), limit: "40" });
    if (search) q.set("search", search);
    if (activeFolder) q.set("folder", activeFolder);
    const res = await adminFetch(`/admin/media?${q}`);
    if (res.ok) {
      const data = await res.json();
      setAssets(data.assets);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setPage(p);
    }
    setLoading(false);
  }, [search, activeFolder, adminFetch]);

  useEffect(() => { loadFolders(); }, [loadFolders]);
  useEffect(() => { load(1); }, [load]);

  // After upload, reload
  useEffect(() => {
    if (uploadValue) {
      setUploadValue("");
      setShowUpload(false);
      load(1);
      loadFolders();
    }
  }, [uploadValue, load, loadFolders]);

  const handleDelete = async (asset: MediaAsset) => {
    if (!confirm(`Xóa ảnh "${asset.customName}"?`)) return;
    setDeleting(true);
    const res = await adminFetch(`/admin/media/${asset._id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      if (selected?._id === asset._id) setSelected(null);
      load(page);
      loadFolders();
    } else {
      const d = await res.json().catch(() => ({}));
      alert(d.message || "Xóa thất bại");
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateFolder = () => {
    const name = slugFolder(newFolderName.trim());
    if (!name) return;
    setUploadFolder(name);
    setActiveFolder(name);
    setNewFolderName("");
    setShowNewFolder(false);
    setShowUpload(true); // auto open upload for this new folder
  };

  const handleFolderClick = (name: string) => {
    setActiveFolder(name);
    setSelected(null);
    setSearch("");
  };

  // Derived: upload folder defaults to active folder
  const effectiveUploadFolder = uploadFolder || activeFolder || "media";

  return (
    <div className="flex min-h-[calc(100svh-60px)] gap-0 -m-6 sm:-m-8">
      {/* ── Left: Folder sidebar ── */}
      <aside className="w-52 shrink-0 border-r border-border bg-bg flex flex-col" style={{ height: 'calc(100svh - 60px)' }}>
        <div className="px-4 py-4 border-b border-border flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Folders</span>
          <button
            type="button"
            onClick={() => { setShowNewFolder((v) => !v); setTimeout(() => newFolderInputRef.current?.focus(), 50); }}
            title="Tạo folder mới"
            className="text-muted hover:text-accent cursor-pointer transition-colors text-base leading-none"
          >
            +
          </button>
        </div>

        {/* New folder input */}
        {showNewFolder && (
          <div className="px-3 py-2.5 border-b border-border bg-surface">
            <input
              ref={newFolderInputRef}
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreateFolder(); if (e.key === "Escape") setShowNewFolder(false); }}
              placeholder="ten-folder-moi"
              className="w-full rounded border border-border bg-bg px-2 py-1.5 text-xs text-text outline-none focus:border-accent"
            />
            <div className="flex gap-1.5 mt-1.5">
              <button onClick={handleCreateFolder}
                className="flex-1 text-[10px] font-bold bg-accent text-bg rounded py-1 cursor-pointer hover:opacity-90">
                Tạo
              </button>
              <button onClick={() => setShowNewFolder(false)}
                className="flex-1 text-[10px] text-muted border border-border rounded py-1 cursor-pointer hover:text-text">
                Hủy
              </button>
            </div>
          </div>
        )}

        {/* Folder list */}
        <nav className="flex-1 overflow-y-auto py-1">
          <FolderItem
            name="Tất cả"
            count={totalAll}
            active={!activeFolder}
            onClick={() => handleFolderClick("")}
          />
          {folders.map((f) => (
            <FolderItem
              key={f.name}
              name={f.name}
              count={f.count}
              active={activeFolder === f.name}
              onClick={() => handleFolderClick(f.name)}
            />
          ))}
          {folders.length === 0 && !loading && (
            <p className="px-4 py-3 text-[10px] text-muted/60">Chưa có folder nào</p>
          )}
        </nav>
      </aside>

      {/* ── Center: Main content ── */}
      <div className="flex-1 flex flex-col min-w-0" style={{ height: 'calc(100svh - 60px)' }}>
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border shrink-0 bg-surface/50">
          <div className="flex-1">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={activeFolder ? `Tìm trong "${activeFolder}"...` : "Tìm tên ảnh..."}
              className="w-full max-w-xs rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-text transition-colors"
            />
          </div>
          <span className="text-xs text-muted shrink-0">{total} ảnh</span>
          <button
            type="button"
            onClick={() => { setShowUpload((v) => !v); setUploadFolder(activeFolder); }}
            className={`shrink-0 cursor-pointer rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${showUpload ? "border-accent bg-accent text-bg" : "border-text bg-text text-bg hover:bg-bg hover:text-text"}`}
          >
            {showUpload ? "✕ Đóng" : "+ Upload"}
          </button>
        </div>

        {/* Upload panel */}
        {showUpload && (
          <div className="border-b border-border bg-surface px-5 py-4 shrink-0">
            <div className="max-w-sm flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">Upload vào folder</label>
                  <div className="flex gap-2">
                    <select
                      value={uploadFolder}
                      onChange={(e) => setUploadFolder(e.target.value)}
                      className="flex-1 rounded border border-border bg-bg px-2.5 py-1.5 text-xs text-text outline-none focus:border-text"
                    >
                      <option value="media">media (mặc định)</option>
                      {folders.map((f) => <option key={f.name} value={f.name}>{f.name}</option>)}
                    </select>
                    <input
                      placeholder="hoặc nhập mới..."
                      onBlur={(e) => { if (e.target.value.trim()) setUploadFolder(slugFolder(e.target.value.trim())); }}
                      onKeyDown={(e) => { if (e.key === "Enter" && e.currentTarget.value.trim()) { setUploadFolder(slugFolder(e.currentTarget.value.trim())); e.currentTarget.value = ""; } }}
                      className="w-28 rounded border border-border bg-bg px-2.5 py-1.5 text-xs text-text outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>
              <ImageUploader
                value={uploadValue}
                onChange={(url) => setUploadValue(url)}
                folder={effectiveUploadFolder}
              />
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-5 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="flex flex-col items-center gap-2 text-muted text-sm">
                <div className="w-6 h-6 border-2 border-muted border-t-accent rounded-full animate-spin" />
                Đang tải...
              </div>
            </div>
          ) : assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted text-sm gap-3">
              <svg className="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
              <span>{search ? `Không có ảnh nào khớp "${search}"` : "Folder này chưa có ảnh nào"}</span>
              {search && <button onClick={() => setSearch("")} className="text-xs text-accent underline cursor-pointer">Xóa tìm kiếm</button>}
              {!showUpload && (
                <button onClick={() => setShowUpload(true)} className="text-xs bg-text text-bg px-3 py-1.5 rounded-lg font-semibold cursor-pointer hover:opacity-90">
                  + Upload ảnh
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
              {assets.map((a) => (
                <button
                  key={a._id}
                  type="button"
                  onClick={() => setSelected(selected?._id === a._id ? null : a)}
                  className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer bg-bg hover:shadow-md ${
                    selected?._id === a._id
                      ? "border-accent shadow-md shadow-accent/20"
                      : "border-border/60 hover:border-accent/50"
                  }`}
                >
                  <img src={a.url} alt={a.customName} className="w-full h-full object-cover" loading="lazy" />
                  {selected?._id === a._id && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-bg" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-[8px] truncate font-medium">{a.customName}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-1.5 mt-6">
              <button onClick={() => load(Math.max(1, page - 1))} disabled={page === 1}
                className="w-8 h-8 rounded border border-border text-xs text-muted hover:border-text cursor-pointer disabled:opacity-30">
                ‹
              </button>
              {Array.from({ length: Math.min(totalPages, 8) }).map((_, i) => (
                <button key={i} onClick={() => load(i + 1)}
                  className={`w-8 h-8 rounded border text-xs font-semibold cursor-pointer transition-colors ${page === i + 1 ? "border-text bg-text text-bg" : "border-border text-muted hover:border-text"}`}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => load(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                className="w-8 h-8 rounded border border-border text-xs text-muted hover:border-text cursor-pointer disabled:opacity-30">
                ›
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Detail panel ── */}
      {selected && (
        <aside className="w-60 shrink-0 border-l border-border bg-surface flex flex-col" style={{ height: 'calc(100svh - 60px)' }}>
          {/* Preview */}
          <div className="relative bg-bg border-b border-border">
            <img src={selected.url} alt={selected.customName} className="w-full aspect-square object-cover" />
            <button
              onClick={() => setSelected(null)}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center cursor-pointer hover:bg-black/70"
            >
              ×
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <InfoRow label="Tên" value={selected.customName} />
              <InfoRow label="File gốc" value={selected.originalName} />
              <InfoRow label="Folder" value={selected.folder} accent />
              {selected.width && selected.height && (
                <InfoRow label="Kích thước" value={`${selected.width} × ${selected.height}`} />
              )}
              <InfoRow label="Dung lượng" value={formatBytes(selected.size)} />
              <InfoRow label="Ngày upload" value={new Date(selected.createdAt).toLocaleDateString("vi-VN")} />
            </div>

            {/* URL */}
            <div className="rounded-lg bg-bg border border-border p-2">
              <p className="text-[9px] font-bold uppercase tracking-wider text-muted mb-1">URL</p>
              <p className="text-[10px] text-text break-all font-mono leading-relaxed line-clamp-3">{selected.url}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="p-3 border-t border-border flex flex-col gap-2">
            <button type="button" onClick={() => handleCopy(selected.url)}
              className="w-full text-xs font-bold rounded-lg border border-border py-2 hover:border-accent hover:text-accent transition-colors cursor-pointer flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
              {copied ? "Đã copy!" : "Copy URL"}
            </button>
            <button type="button" onClick={() => handleDelete(selected)} disabled={deleting}
              className="w-full text-xs font-bold rounded-lg border border-red-500/30 text-red-500 py-2 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {deleting ? "Đang xóa..." : "Xóa ảnh"}
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}

function FolderItem({ name, count, active, onClick }: { name: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-2 transition-colors cursor-pointer ${
        active ? "bg-accent/10 text-accent font-semibold border-r-2 border-accent" : "text-muted hover:bg-surface hover:text-text"
      }`}
    >
      <svg className="w-3.5 h-3.5 shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
      </svg>
      <span className="flex-1 truncate">{name}</span>
      <span className={`text-[10px] shrink-0 ${active ? "text-accent/70" : "text-muted/50"}`}>{count}</span>
    </button>
  );
}

function InfoRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <span className="text-[9px] font-bold uppercase tracking-wider text-muted block">{label}</span>
      <span className={`text-xs truncate block ${accent ? "text-accent font-medium" : "text-text"}`}>{value}</span>
    </div>
  );
}
