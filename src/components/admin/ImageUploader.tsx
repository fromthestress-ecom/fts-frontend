"use client";

/**
 * ImageUploader — smart reusable image upload component
 * Features: drag-drop, WebP convert, rename, canvas crop, media library picker
 *
 * Props:
 *   value       — current image URL
 *   onChange    — called with new URL after upload or library pick
 *   folder      — R2 folder: "products" | "blogs" | "media" | ...
 *   label       — field label
 *   maxWidth    — optional resize (px)
 *   aspectHint  — optional text like "16:9" shown as crop guide hint
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { getAdminKey } from "./AdminGuard";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Tab = "upload" | "library";

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

// ── Crop types ──────────────────────────────────────────────────────────────
type CropRect = { x: number; y: number; w: number; h: number };

function formatBytes(b?: number) {
  if (!b) return "";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

// ── Crop Presets ─────────────────────────────────────────────────────────────
const CROP_PRESETS = [
  { label: "Tự do", ratio: null },
  { label: "1:1", ratio: 1 },
  { label: "16:9", ratio: 16 / 9 },
  { label: "4:3", ratio: 4 / 3 },
  { label: "3:2", ratio: 3 / 2 },
  { label: "9:16", ratio: 9 / 16 },
  { label: "2:3", ratio: 2 / 3 },
];

// ── CSS Overlay Cropper ──────────────────────────────────────────────────────
type DragMode = "draw" | "move";

function CropEditor({
  src,
  onConfirm,
  onCancel,
}: {
  src: string;
  onConfirm: (crop: CropRect) => void;
  onCancel: () => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [crop, setCrop] = useState<CropRect | null>(null);
  const cropRef = useRef<CropRect | null>(null); // avoid stale closure in window listeners
  useEffect(() => { cropRef.current = crop; }, [crop]);

  const [dragging, setDragging] = useState(false);
  const [dragMode, setDragMode] = useState<DragMode>("draw");
  const [startPt, setStartPt] = useState<{ x: number; y: number } | null>(null);
  const [moveOffset, setMoveOffset] = useState<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const [lockedRatio, setLockedRatio] = useState<number | null>(null);
  const [activePreset, setActivePreset] = useState<string>("Tự do");
  const [cursor, setCursor] = useState<string>("crosshair");
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);

  const getPos = (e: React.MouseEvent | MouseEvent) => {
    const img = imgRef.current!;
    const rect = img.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(e.clientX - rect.left, rect.width)),
      y: Math.max(0, Math.min(e.clientY - rect.top, rect.height)),
    };
  };

  const isInsideCrop = (pt: { x: number; y: number }, c: CropRect) =>
    pt.x >= c.x && pt.x <= c.x + c.w && pt.y >= c.y && pt.y <= c.y + c.h;

  const applyPreset = (label: string, ratio: number | null) => {
    setActivePreset(label);
    setLockedRatio(ratio);
    if (!imgRef.current) return;
    const img = imgRef.current;
    const W = img.offsetWidth;
    const H = img.offsetHeight;
    if (ratio === null) { setCrop(null); return; }
    let w = W * 0.8;
    let h = w / ratio;
    if (h > H * 0.8) { h = H * 0.8; w = h * ratio; }
    setCrop({ x: (W - w) / 2, y: (H - h) / 2, w, h });
  };

  // Hover cursor feedback (not during drag)
  const handleCaptureMouseMove = (e: React.MouseEvent) => {
    if (dragging) return;
    const c = cropRef.current;
    if (!c) { setCursor("crosshair"); return; }
    setCursor(isInsideCrop(getPos(e), c) ? "move" : "crosshair");
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const pt = getPos(e);
    const c = cropRef.current;
    if (c && isInsideCrop(pt, c)) {
      // Move mode — drag the existing box
      setDragMode("move");
      setMoveOffset({ dx: pt.x - c.x, dy: pt.y - c.y });
    } else {
      // Draw mode — create new crop
      setDragMode("draw");
      setCrop(null);
    }
    setStartPt(pt);
    setDragging(true);
  };

  useEffect(() => {
    if (!dragging || !startPt) return;

    const handleMove = (e: MouseEvent) => {
      if (!imgRef.current) return;
      const img = imgRef.current;
      const W = img.offsetWidth;
      const H = img.offsetHeight;
      const rect = img.getBoundingClientRect();
      const cx = Math.max(0, Math.min(e.clientX - rect.left, W));
      const cy = Math.max(0, Math.min(e.clientY - rect.top, H));

      if (dragMode === "move") {
        const prev = cropRef.current;
        if (!prev) return;
        const nx = Math.max(0, Math.min(cx - moveOffset.dx, W - prev.w));
        const ny = Math.max(0, Math.min(cy - moveOffset.dy, H - prev.h));
        setCrop({ ...prev, x: nx, y: ny });
      } else {
        // draw
        let x = Math.min(startPt.x, cx);
        let y = Math.min(startPt.y, cy);
        let w = Math.abs(cx - startPt.x);
        let h = Math.abs(cy - startPt.y);
        if (lockedRatio !== null && w > 0) {
          h = w / lockedRatio;
          if (y + h > H) { h = H - y; w = h * lockedRatio; }
          if (x + w > W) { w = W - x; h = w / lockedRatio; }
        }
        if (w > 4 && h > 4) setCrop({ x, y, w, h });
      }
    };

    const handleUp = () => { setDragging(false); };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragging, dragMode, startPt, moveOffset, lockedRatio]);

  const handleConfirm = () => {
    if (!crop || !imgRef.current) return;
    const img = imgRef.current;
    const scaleX = img.naturalWidth / img.offsetWidth;
    const scaleY = img.naturalHeight / img.offsetHeight;
    onConfirm({
      x: Math.round(crop.x * scaleX),
      y: Math.round(crop.y * scaleY),
      w: Math.round(crop.w * scaleX),
      h: Math.round(crop.h * scaleY),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-surface border border-border rounded-2xl shadow-2xl flex flex-col gap-4 w-full max-w-3xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5">
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider">Crop ảnh</h3>
            {naturalSize && (
              <p className="text-[10px] text-muted mt-0.5">Gốc: {naturalSize.w} × {naturalSize.h} px</p>
            )}
          </div>
          <button onClick={onCancel} className="text-muted hover:text-text cursor-pointer text-xl leading-none">×</button>
        </div>

        {/* Preset buttons */}
        <div className="px-5 flex gap-2 flex-wrap">
          {CROP_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p.label, p.ratio)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                activePreset === p.label
                  ? "bg-accent text-bg border-accent"
                  : "border-border text-muted hover:border-accent hover:text-accent"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Image + overlay */}
        <div className="px-5 overflow-auto flex-1 min-h-0">
          <div
            ref={containerRef}
            className="relative inline-block select-none w-full"
            style={{ cursor }}
          >
            <img
              ref={imgRef}
              src={src}
              alt=""
              draggable={false}
              onLoad={(e) => {
                const img = e.currentTarget;
                setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
              }}
              className="block w-full h-auto max-h-[55vh] object-contain select-none"
              style={{ userSelect: "none" }}
            />

            {/* Capture layer — full overlay, handles draw & hover cursor */}
            <div
              className="absolute inset-0"
              style={{ cursor }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleCaptureMouseMove}
            />

            {crop && (
              <>
                {/* 4-sided dark mask */}
                <div className="absolute inset-x-0 top-0 bg-black/55 pointer-events-none" style={{ height: crop.y }} />
                <div className="absolute inset-x-0 bg-black/55 pointer-events-none" style={{ top: crop.y + crop.h, bottom: 0 }} />
                <div className="absolute bg-black/55 pointer-events-none" style={{ top: crop.y, width: crop.x, height: crop.h }} />
                <div className="absolute bg-black/55 pointer-events-none" style={{ top: crop.y, left: crop.x + crop.w, right: 0, height: crop.h }} />

                {/* Selection box — pointer-events-none so capture layer handles drag */}
                <div
                  className="absolute border-2 border-white pointer-events-none"
                  style={{ left: crop.x, top: crop.y, width: crop.w, height: crop.h }}
                >
                  {/* Rule-of-thirds */}
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="border border-white/20" />
                    ))}
                  </div>
                  {/* Corner handles */}
                  {[
                    "top-0 left-0 -translate-x-0.5 -translate-y-0.5",
                    "top-0 right-0 translate-x-0.5 -translate-y-0.5",
                    "bottom-0 left-0 -translate-x-0.5 translate-y-0.5",
                    "bottom-0 right-0 translate-x-0.5 translate-y-0.5",
                  ].map((cls, i) => (
                    <div key={i} className={`absolute w-3 h-3 bg-white rounded-sm shadow ${cls}`} />
                  ))}
                  {/* Size badge */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-mono select-none">
                      {Math.round(crop.w)} × {Math.round(crop.h)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-xs text-muted">
            {crop
              ? dragMode === "move" && dragging
                ? "Đang di chuyển khung crop..."
                : `${Math.round(crop.w)} × ${Math.round(crop.h)} px — kéo bên trong để di chuyển`
              : "Kéo để vẽ vùng crop, hoặc chọn tỉ lệ ở trên"}
          </p>
          <div className="flex gap-3">
            <button type="button" onClick={() => setCrop(null)} disabled={!crop}
              className="px-3 py-2 text-xs border border-border rounded text-muted hover:text-red-500 hover:border-red-500 cursor-pointer disabled:opacity-30 transition-colors">
              Xóa vùng chọn
            </button>
            <button type="button" onClick={onCancel}
              className="px-4 py-2 text-sm border border-border rounded hover:border-text cursor-pointer">
              Hủy
            </button>
            <button type="button" onClick={handleConfirm} disabled={!crop}
              className="px-4 py-2 text-sm bg-text text-bg rounded font-semibold disabled:opacity-40 cursor-pointer hover:bg-accent hover:text-white transition-colors">
              Xác nhận crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Media Library Picker ─────────────────────────────────────────────────────
type FolderInfo = { name: string; count: number };
type LibView = "library" | "upload";

function slugifyName(name: string) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export function MediaLibrary({
  onPick,
  onClose,
}: {
  onPick: (url: string) => void;
  onClose: () => void;
}) {
  // ── Library state ──
  const [view, setView] = useState<LibView>("library");
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFolder, setActiveFolder] = useState("");
  const [folders, setFolders] = useState<FolderInfo[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hovered, setHovered] = useState<string | null>(null);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderInput, setNewFolderInput] = useState("");

  // ── Upload state ──
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [customName, setCustomName] = useState("");
  const [uploadFolder, setUploadFolder] = useState("");
  const [cropMode, setCropMode] = useState(false);
  const [cropRect, setCropRect] = useState<CropRect | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Load ──
  const loadFolders = useCallback(async () => {
    const key = getAdminKey();
    const res = await fetch(`${API}/admin/media/folders`, { headers: { "x-admin-key": key ?? "" } });
    if (res.ok) {
      const d = await res.json();
      setFolders(d.folders ?? []);
      setTotal(d.total ?? 0);
    }
  }, []);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    const key = getAdminKey();
    const q = new URLSearchParams({ page: String(p), limit: "40" });
    if (search) q.set("search", search);
    if (activeFolder) q.set("folder", activeFolder);
    const res = await fetch(`${API}/admin/media?${q}`, { headers: { "x-admin-key": key ?? "" } });
    if (res.ok) {
      const data = await res.json();
      setAssets(data.assets);
      setTotalPages(data.totalPages);
      setPage(p);
    }
    setLoading(false);
  }, [search, activeFolder]);

  useEffect(() => { loadFolders(); }, [loadFolders]);
  useEffect(() => { load(1); }, [load]);

  // ── Upload handlers ──
  const resetUpload = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingFile(null);
    setPreviewUrl("");
    setCustomName("");
    setCropRect(null);
    setCropMode(false);
    setUploadError("");
    setUploadProgress(0);
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) { setUploadError("Chỉ chấp nhận file ảnh"); return; }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingFile(file);
    setCustomName(file.name.replace(/\.[^.]+$/, ""));
    setCropRect(null);
    setUploadError("");
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!pendingFile) return;
    setUploading(true);
    setUploadError("");
    setUploadProgress(15);
    try {
      const key = getAdminKey();
      const fd = new FormData();
      fd.append("file", pendingFile);
      const targetFolder = uploadFolder || activeFolder || "media";
      const params = new URLSearchParams({ folder: targetFolder });
      if (customName.trim()) params.set("customName", customName.trim());
      if (cropRect) params.set("crop", JSON.stringify(cropRect));
      setUploadProgress(40);
      const res = await fetch(`${API}/admin/upload?${params}`, {
        method: "POST",
        headers: { "x-admin-key": key ?? "" },
        body: fd,
      });
      setUploadProgress(85);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload thất bại");
      setUploadProgress(100);
      // Switch back to library, reload
      resetUpload();
      await Promise.all([loadFolders(), load(1)]);
      setActiveFolder(targetFolder);
      setView("library");
    } catch (err: any) {
      setUploadError(err.message);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateFolder = () => {
    const name = slugifyName(newFolderInput.trim());
    if (!name) return;
    setUploadFolder(name);
    setActiveFolder(name);
    setNewFolderInput("");
    setShowNewFolder(false);
    setView("upload");
  };

  const effectiveUploadFolder = uploadFolder || activeFolder || "media";

  return (
    <>
      {/* Crop editor renders on top of this modal */}
      {cropMode && previewUrl && (
        <CropEditor
          src={previewUrl}
          onConfirm={(r) => { setCropRect(r); setCropMode(false); }}
          onCancel={() => setCropMode(false)}
        />
      )}

      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-4">
        <div className="bg-surface border border-border rounded-2xl shadow-2xl flex w-full max-w-5xl max-h-[90vh] overflow-hidden">

          {/* ── Left: Folder sidebar ── */}
          <aside className="w-44 shrink-0 border-r border-border flex flex-col bg-bg">
            <div className="px-3 py-2.5 border-b border-border flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Folders</p>
              <button
                onClick={() => { setShowNewFolder(v => !v); }}
                className="text-muted hover:text-accent cursor-pointer transition-colors text-sm leading-none"
                title="Tạo folder mới"
              >+</button>
            </div>

            {showNewFolder && (
              <div className="px-2 py-2 border-b border-border bg-surface">
                <input
                  autoFocus
                  value={newFolderInput}
                  onChange={(e) => setNewFolderInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreateFolder(); if (e.key === "Escape") setShowNewFolder(false); }}
                  placeholder="ten-folder"
                  className="w-full rounded border border-border bg-bg px-2 py-1 text-xs text-text outline-none focus:border-accent"
                />
                <div className="flex gap-1 mt-1">
                  <button onClick={handleCreateFolder} className="flex-1 text-[10px] font-bold bg-accent text-bg rounded py-1 cursor-pointer">Tạo</button>
                  <button onClick={() => setShowNewFolder(false)} className="flex-1 text-[10px] text-muted border border-border rounded py-1 cursor-pointer">Hủy</button>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto py-1">
              <FolderBtn label="Tất cả" count={total} active={!activeFolder} onClick={() => { setActiveFolder(""); setUploadFolder(""); }} />
              {folders.map((f) => (
                <FolderBtn key={f.name} label={f.name} count={f.count}
                  active={activeFolder === f.name}
                  onClick={() => { setActiveFolder(f.name); setUploadFolder(f.name); }}
                />
              ))}
            </div>

            {/* Upload button in sidebar */}
            <div className="p-2 border-t border-border shrink-0">
              <button
                onClick={() => { setView(view === "upload" ? "library" : "upload"); if (view === "upload") resetUpload(); }}
                className={`w-full rounded-lg py-2 text-xs font-bold transition-colors cursor-pointer ${view === "upload" ? "bg-accent text-bg" : "border border-border text-muted hover:border-accent hover:text-accent"}`}
              >
                {view === "upload" ? "← Thư viện" : "+ Upload mới"}
              </button>
            </div>
          </aside>

          {/* ── Right: Main area ── */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header bar */}
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border shrink-0">
              {/* Tabs */}
              <div className="flex gap-0 rounded-lg border border-border overflow-hidden text-xs font-semibold">
                <button
                  onClick={() => { setView("library"); resetUpload(); }}
                  className={`px-3 py-1.5 cursor-pointer transition-colors ${view === "library" ? "bg-text text-bg" : "text-muted hover:text-text"}`}
                >
                  Thư viện
                </button>
                <button
                  onClick={() => setView("upload")}
                  className={`px-3 py-1.5 cursor-pointer transition-colors border-l border-border ${view === "upload" ? "bg-text text-bg" : "text-muted hover:text-text"}`}
                >
                  Upload mới
                </button>
              </div>

              {view === "library" && (
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm tên ảnh..."
                  className="flex-1 rounded border border-border bg-bg px-3 py-1.5 text-sm text-text outline-none focus:border-text"
                />
              )}

              {view === "upload" && (
                <p className="text-xs text-muted flex-1">
                  Folder: <span className="text-accent font-semibold">{effectiveUploadFolder}</span>
                </p>
              )}

              <button onClick={onClose} className="text-muted hover:text-text cursor-pointer text-xl leading-none shrink-0">×</button>
            </div>

            {/* ── View: Library ── */}
            {view === "library" && (
              <>
                <div className="flex-1 overflow-y-auto p-4 min-h-0">
                  {loading ? (
                    <div className="flex items-center justify-center h-48">
                      <div className="flex flex-col items-center gap-2 text-muted text-sm">
                        <div className="w-5 h-5 border-2 border-muted border-t-accent rounded-full animate-spin" />
                        Đang tải...
                      </div>
                    </div>
                  ) : assets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-muted text-sm gap-3">
                      <svg className="w-8 h-8 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <span>{search ? `Không khớp "${search}"` : "Chưa có ảnh trong folder này"}</span>
                      <button onClick={() => setView("upload")}
                        className="text-xs bg-accent text-bg px-3 py-1.5 rounded-lg font-semibold cursor-pointer hover:opacity-90">
                        + Upload ảnh
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
                      {assets.map((a) => (
                        <button
                          key={a._id}
                          onClick={() => onPick(a.url)}
                          onMouseEnter={() => setHovered(a._id)}
                          onMouseLeave={() => setHovered(null)}
                          className="group relative aspect-square rounded-lg overflow-hidden border border-border hover:border-accent transition-all cursor-pointer bg-bg hover:shadow-md hover:scale-[1.02]"
                        >
                          <img src={a.url} alt={a.customName} className="w-full h-full object-cover" loading="lazy" />
                          {hovered === a._id && (
                            <div className="absolute inset-0 bg-black/45 flex items-end">
                              <span className="text-white text-[9px] font-semibold px-1.5 pb-1.5 truncate w-full">{a.customName}</span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center gap-1.5 py-2.5 border-t border-border shrink-0">
                    <button onClick={() => load(Math.max(1, page - 1))} disabled={page === 1}
                      className="w-7 h-7 rounded border border-border text-xs text-muted cursor-pointer disabled:opacity-30">‹</button>
                    {Array.from({ length: Math.min(totalPages, 8) }).map((_, i) => (
                      <button key={i} onClick={() => load(i + 1)}
                        className={`w-7 h-7 rounded border text-xs font-semibold cursor-pointer transition-colors ${page === i + 1 ? "border-text bg-text text-bg" : "border-border text-muted hover:border-text"}`}>
                        {i + 1}
                      </button>
                    ))}
                    <button onClick={() => load(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                      className="w-7 h-7 rounded border border-border text-xs text-muted cursor-pointer disabled:opacity-30">›</button>
                  </div>
                )}
              </>
            )}

            {/* ── View: Upload ── */}
            {view === "upload" && (
              <div className="flex-1 overflow-y-auto p-5 min-h-0 flex flex-col gap-4">
                {/* Folder selector */}
                <div className="flex items-center gap-3">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted shrink-0">Upload vào folder</label>
                  <select
                    value={uploadFolder || activeFolder || "media"}
                    onChange={(e) => setUploadFolder(e.target.value)}
                    className="rounded border border-border bg-bg px-2.5 py-1.5 text-xs text-text outline-none focus:border-text"
                  >
                    <option value="media">media</option>
                    {folders.map((f) => <option key={f.name} value={f.name}>{f.name}</option>)}
                  </select>
                  <span className="text-muted text-[10px]">hoặc</span>
                  <input
                    placeholder="tạo folder mới..."
                    onKeyDown={(e) => { if (e.key === "Enter" && e.currentTarget.value.trim()) { setUploadFolder(slugifyName(e.currentTarget.value.trim())); e.currentTarget.value = ""; } }}
                    onBlur={(e) => { if (e.target.value.trim()) { setUploadFolder(slugifyName(e.target.value.trim())); e.target.value = ""; } }}
                    className="rounded border border-border bg-bg px-2.5 py-1.5 text-xs text-text outline-none focus:border-accent w-36"
                  />
                </div>

                {/* No file selected: drop zone */}
                {!pendingFile && (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex-1 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-all min-h-[260px] ${isDragging ? "border-accent bg-accent/5 scale-[1.01]" : "border-border hover:border-accent/50 hover:bg-surface"}`}
                  >
                    <svg className="w-10 h-10 text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <div className="text-center">
                      <p className="text-sm text-muted">Kéo ảnh vào đây hoặc <span className="text-accent font-semibold">click để chọn</span></p>
                      <p className="text-xs text-muted/50 mt-1">JPG, PNG, GIF, WebP, AVIF → tự động chuyển WebP</p>
                    </div>
                  </div>
                )}

                {/* File selected: preview + controls */}
                {pendingFile && previewUrl && (
                  <div className="flex gap-4 flex-1">
                    {/* Preview */}
                    <div className="relative w-56 shrink-0 rounded-xl overflow-hidden border border-border bg-bg self-start">
                      <img src={previewUrl} alt="" className="w-full h-auto object-contain max-h-52" />
                      {cropRect && (
                        <div className="absolute top-2 right-2 bg-accent text-bg text-[9px] font-bold px-2 py-0.5 rounded-full">CROPPED</div>
                      )}
                    </div>

                    {/* Controls */}
                    <div className="flex-1 flex flex-col gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">Tên file (lưu dạng .webp)</label>
                        <input
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          className="w-full rounded border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-text"
                          placeholder="ten-file-cua-ban"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button type="button" onClick={() => setCropMode(true)}
                          className={`text-sm px-3 py-2 rounded border cursor-pointer transition-colors font-medium ${cropRect ? "border-accent text-accent bg-accent/5" : "border-border text-muted hover:border-text hover:text-text"}`}>
                          {cropRect ? "✂ Crop lại" : "✂ Crop ảnh"}
                        </button>
                        {cropRect && (
                          <button type="button" onClick={() => setCropRect(null)}
                            className="text-sm px-3 py-2 rounded border border-border text-muted hover:text-red-500 hover:border-red-400 cursor-pointer transition-colors">
                            Bỏ crop
                          </button>
                        )}
                        <button type="button" onClick={() => { resetUpload(); fileInputRef.current?.click(); }}
                          className="text-sm px-3 py-2 rounded border border-border text-muted hover:border-text hover:text-text cursor-pointer transition-colors ml-auto">
                          Đổi ảnh
                        </button>
                      </div>

                      {/* Progress */}
                      {uploading && (
                        <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                          <div className="h-full bg-accent transition-all duration-300 rounded-full" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      )}

                      {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}

                      <div className="flex gap-2 mt-auto">
                        <button type="button" onClick={handleUpload} disabled={uploading}
                          className="flex-1 cursor-pointer rounded-lg bg-text text-bg px-4 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                          {uploading
                            ? <><span className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin inline-block" />Đang upload...</>
                            : "Upload → WebP"}
                        </button>
                        <button type="button" onClick={resetUpload}
                          className="px-4 py-2.5 text-sm border border-border rounded-lg text-muted hover:text-text cursor-pointer transition-colors">
                          Hủy
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {uploadError && !pendingFile && <p className="text-xs text-red-500">{uploadError}</p>}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); e.target.value = ""; }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function FolderBtn({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`w-full text-left px-3 py-2 text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${active ? "bg-accent/10 text-accent font-semibold border-r-2 border-accent" : "text-muted hover:bg-surface hover:text-text"}`}>
      <svg className="w-3 h-3 shrink-0 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
      </svg>
      <span className="flex-1 truncate">{label}</span>
      <span className="text-[10px] shrink-0 opacity-50">{count}</span>
    </button>
  );
}

// ── Main ImageUploader ────────────────────────────────────────────────────────
export function ImageUploader({
  value,
  onChange,
  folder: folderProp = "media",
  label,
  maxWidth,
  aspectHint,
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  maxWidth?: number;
  aspectHint?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Pending file state
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [customName, setCustomName] = useState("");
  const [cropMode, setCropMode] = useState(false);
  const [cropRect, setCropRect] = useState<CropRect | null>(null);

  // Modals
  const [showLibrary, setShowLibrary] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetPending = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingFile(null);
    setPreviewUrl("");
    setCustomName("");
    setCropRect(null);
    setCropMode(false);
    setError("");
    setUploadProgress(0);
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Chỉ chấp nhận file ảnh"); return; }
    setError("");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingFile(file);
    setCustomName(file.name.replace(/\.[^.]+$/, ""));
    setCropRect(null);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!pendingFile) return;
    setUploading(true);
    setError("");
    setUploadProgress(10);
    try {
      const key = getAdminKey();
      const formData = new FormData();
      formData.append("file", pendingFile);
      const params = new URLSearchParams({ folder: folderProp });
      if (customName.trim()) params.set("customName", customName.trim());
      if (maxWidth) params.set("maxWidth", String(maxWidth));
      if (cropRect) params.set("crop", JSON.stringify(cropRect));
      setUploadProgress(40);
      const res = await fetch(`${API}/admin/upload?${params}`, {
        method: "POST",
        headers: { "x-admin-key": key ?? "" },
        body: formData,
      });
      setUploadProgress(90);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload thất bại");
      setUploadProgress(100);
      onChange(data.url);
      resetPending();
    } catch (err: any) {
      setError(err.message);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  // ── STATE: has value ──
  if (value && !pendingFile) {
    return (
      <>
        {showLibrary && <MediaLibrary onPick={(url) => { onChange(url); setShowLibrary(false); }} onClose={() => setShowLibrary(false)} />}
        <div className="flex flex-col gap-1.5">
          {label && <label className="text-xs font-bold text-muted uppercase tracking-wider">{label}</label>}
          <div className="relative rounded-lg overflow-hidden border border-border bg-bg group aspect-video max-h-44">
            <img src={value} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="bg-white/90 text-black text-xs px-2.5 py-1.5 rounded-md font-semibold cursor-pointer hover:bg-white transition-colors">
                Đổi ảnh
              </button>
              <button type="button" onClick={() => setShowLibrary(true)}
                className="bg-white/90 text-black text-xs px-2.5 py-1.5 rounded-md font-semibold cursor-pointer hover:bg-white transition-colors">
                Thư viện
              </button>
              <button type="button" onClick={() => onChange("")}
                className="bg-red-500/90 text-white text-xs px-2.5 py-1.5 rounded-md font-semibold cursor-pointer hover:bg-red-500 transition-colors">
                Xóa
              </button>
            </div>
          </div>
          {aspectHint && <p className="text-[10px] text-muted">Gợi ý: {aspectHint}</p>}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); e.target.value = ""; }} />
        </div>
      </>
    );
  }

  // ── STATE: file selected, pending upload ──
  if (pendingFile && previewUrl) {
    return (
      <>
        {cropMode && <CropEditor src={previewUrl} onConfirm={(r) => { setCropRect(r); setCropMode(false); }} onCancel={() => setCropMode(false)} />}
        <div className="flex flex-col gap-1.5">
          {label && <label className="text-xs font-bold text-muted uppercase tracking-wider">{label}</label>}
          <div className="rounded-lg border border-accent/40 bg-bg overflow-hidden">
            {/* Image preview */}
            <div className="relative aspect-video max-h-44 bg-black/20">
              <img src={previewUrl} alt="" className="w-full h-full object-contain" />
              {cropRect && (
                <div className="absolute top-2 right-2 bg-accent text-bg text-[9px] font-bold px-2 py-0.5 rounded-full">
                  CROPPED
                </div>
              )}
            </div>
            {/* Controls */}
            <div className="p-3 flex flex-col gap-2.5">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-[10px] text-muted font-bold uppercase tracking-wider block mb-1">Tên file</label>
                  <input
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full rounded border border-border bg-surface px-2.5 py-1.5 text-xs text-text outline-none focus:border-text"
                    placeholder="ten-anh-cua-ban"
                  />
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button type="button" onClick={() => setCropMode(true)}
                    className={`text-xs px-2.5 py-1.5 rounded border cursor-pointer transition-colors font-medium ${cropRect ? "border-accent text-accent bg-accent/5" : "border-border text-muted hover:border-text hover:text-text"}`}>
                    {cropRect ? "Crop lại" : "✂ Crop"}
                  </button>
                  {cropRect && (
                    <button type="button" onClick={() => setCropRect(null)}
                      className="text-xs px-2 py-1.5 rounded border border-border text-muted hover:text-red-500 hover:border-red-400 cursor-pointer transition-colors">
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {aspectHint && <p className="text-[10px] text-muted">Gợi ý tỉ lệ: {aspectHint}</p>}

              {/* Upload progress bar */}
              {uploading && (
                <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-accent transition-all duration-300 rounded-full" style={{ width: `${uploadProgress}%` }} />
                </div>
              )}

              {error && <p className="text-xs text-red-500">{error}</p>}

              <div className="flex gap-2">
                <button type="button" onClick={handleUpload} disabled={uploading}
                  className="flex-1 cursor-pointer rounded border border-text bg-text px-3 py-2 text-xs font-bold uppercase tracking-wider text-bg hover:bg-bg hover:text-text transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
                  {uploading ? (
                    <><span className="inline-block w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />Đang upload...</>
                  ) : "Upload → WebP"}
                </button>
                <button type="button" onClick={resetPending}
                  className="px-3 py-2 text-xs border border-border rounded text-muted hover:text-text cursor-pointer transition-colors">
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── STATE: empty ──
  return (
    <>
      {showLibrary && <MediaLibrary onPick={(url) => { onChange(url); setShowLibrary(false); }} onClose={() => setShowLibrary(false)} />}
      <div className="flex flex-col gap-1.5">
        {label && <label className="text-xs font-bold text-muted uppercase tracking-wider">{label}</label>}

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1.5 py-6 cursor-pointer transition-all ${
            isDragging ? "border-accent bg-accent/5 scale-[1.01]" : "border-border hover:border-accent/50 hover:bg-surface"
          }`}
        >
          <svg className="w-7 h-7 text-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <p className="text-xs text-muted">Kéo ảnh vào đây hoặc <span className="text-accent font-semibold">click để chọn</span></p>
          <p className="text-[10px] text-muted/50">JPG, PNG, GIF, WebP, AVIF → chuyển WebP tự động</p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button type="button" onClick={() => fileInputRef.current?.click()}
            className="flex-1 text-xs border border-border rounded-md py-2 text-muted hover:border-text hover:text-text transition-colors cursor-pointer font-medium flex items-center justify-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Tải lên
          </button>
          <button type="button" onClick={() => setShowLibrary(true)}
            className="flex-1 text-xs border border-border rounded-md py-2 text-muted hover:border-accent hover:text-accent transition-colors cursor-pointer font-medium flex items-center justify-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2}/><circle cx="8.5" cy="8.5" r="1.5" strokeWidth={2}/><polyline points="21 15 16 10 5 21" strokeWidth={2}/>
            </svg>
            Thư viện
          </button>
        </div>

        {aspectHint && <p className="text-[10px] text-muted">Gợi ý: {aspectHint}</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); e.target.value = ""; }} />
      </div>
    </>
  );
}
