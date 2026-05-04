"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAdminKey, getAdminProfile } from "@/components/admin/AdminGuard";
import type { BlogCategory, Author, Tag } from "@/lib/api";
import RichTextEditor from "@/components/RichTextEditor";
import { ImageUploader, MediaLibrary } from "@/components/admin/ImageUploader";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

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

export default function CreateBlogPage() {
  const router = useRouter();
  const adminProfile = getAdminProfile();
  const isMarketing = adminProfile?.role === "marketing";
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [fromAi, setFromAi] = useState(false);
  const [showInlineLibrary, setShowInlineLibrary] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    thumbnail: "",
    bannerImage: "",
    categoryId: "",
    authorId: "",
    tags: [] as string[],
    status: "draft",
    publishedAt: "",
    showToc: true,
    metaTitle: "",
    metaDescription: "",
    ogImage: "",
  });

  useEffect(() => {
    // Pre-fill from AI Writer if available
    const aiDraft = sessionStorage.getItem("ai_writer_draft");
    if (aiDraft) {
      try {
        const parsed = JSON.parse(aiDraft);
        setForm((f) => ({ ...f, ...parsed }));
        setFromAi(true);
      } catch {}
      sessionStorage.removeItem("ai_writer_draft");
    }

    Promise.all([
      adminFetch("/admin/blog-categories"),
      ...(isMarketing ? [] : [adminFetch("/admin/authors")]),
      adminFetch("/admin/tags"),
    ]).then(async (responses) => {
      const [catRes, maybeAuthRes, tagRes] = responses;
      if (catRes.ok) setCategories(await catRes.json());
      if (maybeAuthRes?.ok) setAuthors(await maybeAuthRes.json());
      if (tagRes.ok) setAvailableTags(await tagRes.json());
    });
  }, [isMarketing]);

  // Basic slug auto-gen from title if slug is empty
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setForm((f) => {
      const isSlugEmptyOrAuto =
        f.slug === "" || f.slug === generateSlug(f.title);
      return {
        ...f,
        title,
        slug: isSlugEmptyOrAuto ? generateSlug(title) : f.slug,
      };
    });
  };

  const generateSlug = (text: string) => {
    return text
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const payload = { ...form };
    // Sanitize Quill's &nbsp; to prevent word-wrap bugs on frontend
    payload.content = payload.content.replace(/&nbsp;/g, " ");
    if (!payload.categoryId) delete (payload as any).categoryId;
    if (!payload.authorId || isMarketing) delete (payload as any).authorId;
    if (!payload.publishedAt) delete (payload as any).publishedAt;
    else
      payload.publishedAt = new Date(payload.publishedAt).toISOString() as any;
    
    // Ensure tags is a clean array of actual ObjectId strings
    payload.tags = payload.tags.filter(t => t && t.trim() !== "" && t !== "[ '', '' ]" && !t.includes("''"));

    if (!payload.metaTitle) payload.metaTitle = payload.title;
    if (!payload.metaDescription) payload.metaDescription = payload.excerpt;
    if (!payload.ogImage) payload.ogImage = payload.thumbnail;
    if (!payload.bannerImage) payload.bannerImage = payload.thumbnail;

    try {
      const res = await adminFetch("/admin/blogs", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Lỗi lưu bài viết");
      router.push("/admin/blogs");
    } catch (err: any) {
      setMessage(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl sm:text-2xl uppercase tracking-wider">
          Viết bài mới
        </h1>
        <Link
          href="/admin/blogs"
          className="text-sm font-semibold text-muted hover:text-text transition-colors"
        >
          &larr; Quay lại
        </Link>
      </div>

      {fromAi && (
        <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400 flex items-center justify-between">
          <span>Nội dung được tạo từ AI Writer. Kiểm tra lại trước khi xuất bản.</span>
          <button
            type="button"
            onClick={() => setFromAi(false)}
            className="text-green-400/60 hover:text-green-400 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col gap-6">
          {/* Main Content Info */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-border pb-2">
              Nội dung chính
            </h2>

            <div className="mb-4">
              <label className={labelClass}>Tiêu đề *</label>
              <input
                value={form.title}
                onChange={handleTitleChange}
                required
                className={inputClass}
                placeholder="The future of streetwear..."
              />
            </div>

            <div className="mb-4 text-xs font-mono text-muted flex gap-2">
              <span>Đường dẫn (Slug): </span>
              <input
                value={form.slug}
                onChange={(e) =>
                  setForm((f) => ({ ...f, slug: e.target.value }))
                }
                className="bg-transparent border-b border-border outline-none min-w-[300px] text-text"
              />
            </div>

            <div className="mb-4">
              <label className={labelClass}>Đoạn trích (Excerpt) *</label>
              <textarea
                value={form.excerpt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, excerpt: e.target.value }))
                }
                required
                rows={3}
                className={inputClass}
                placeholder="Tóm tắt ngắn gọn bài viết..."
              />
            </div>

            <div className="mb-4 relative">
              {showInlineLibrary && (
                <MediaLibrary
                  onPick={(url) => {
                    const imgHtml = `<p><img src="${url}" alt="" /></p>`;
                    setForm((f) => ({ ...f, content: f.content + imgHtml }));
                    setShowInlineLibrary(false);
                  }}
                  onClose={() => setShowInlineLibrary(false)}
                />
              )}
              <div className="flex justify-between items-end mb-1.5 flex-wrap gap-2">
                <label className="text-xs font-bold text-muted uppercase tracking-wider block">
                  Nội dung bài *
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const slug = prompt("Nhập slug của sản phẩm (VD: ao-thun-nam):");
                      if (!slug) return;
                      const mdProduct = `<p>::product{slug="${slug}"}</p>`;
                      setForm(f => ({ ...f, content: f.content + mdProduct }));
                    }}
                    className="cursor-pointer text-xs font-bold bg-surface border border-border text-text px-3 py-1 rounded hover:border-accent hover:text-accent transition-colors"
                  >
                    Mã Sản Phẩm
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInlineLibrary(true)}
                    className="cursor-pointer text-xs font-bold bg-surface border border-border text-muted px-3 py-1 rounded hover:border-accent hover:text-accent transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2}/><circle cx="8.5" cy="8.5" r="1.5" strokeWidth={2}/><polyline points="21 15 16 10 5 21" strokeWidth={2}/>
                    </svg>
                    Thư viện
                  </button>
                  <label className="cursor-pointer text-xs font-bold bg-surface border border-accent text-accent px-3 py-1 rounded hover:bg-accent hover:text-bg transition-colors flex items-center gap-1">
                    <>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Upload Ảnh
                    </>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const key = getAdminKey();
                          const fd = new FormData();
                          fd.append("file", file);
                          const r = await fetch(`${API}/admin/upload?folder=blogs`, {
                            method: "POST", headers: { "x-admin-key": key ?? "" }, body: fd,
                          });
                          const d = await r.json();
                          if (!r.ok) throw new Error(d.message);
                          const imgHtml = `<p><img src="${d.url}" alt="${file.name}" /></p>`;
                          setForm((f) => ({ ...f, content: f.content + imgHtml }));
                        } catch (err: any) {
                          alert("Lỗi upload ảnh chèn: " + err.message);
                        } finally { e.target.value = ""; }
                      }}
                    />
                  </label>
                </div>
              </div>
              <RichTextEditor
                value={form.content}
                onChange={(val) => setForm((f) => ({ ...f, content: val }))}
              />
            </div>
          </div>

          {/* SEO Info */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-border pb-2">
              Tối ưu máy chủ chìm (SEO)
            </h2>

            <div className="mb-4">
              <label className={labelClass}>Meta Title</label>
              <input
                value={form.metaTitle}
                onChange={(e) =>
                  setForm((f) => ({ ...f, metaTitle: e.target.value }))
                }
                className={inputClass}
                placeholder="Mặc định lấy từ Tiêu đề"
              />
            </div>

            <div className="mb-4">
              <label className={labelClass}>Meta Description</label>
              <textarea
                value={form.metaDescription}
                onChange={(e) =>
                  setForm((f) => ({ ...f, metaDescription: e.target.value }))
                }
                rows={2}
                className={inputClass}
                placeholder="Mặc định lấy từ Đoạn trích"
              />
            </div>

            <div className="mb-4">
              <ImageUploader
                label="Ảnh OpenGraph (OG Image)"
                value={form.ogImage}
                onChange={(url) => setForm((f) => ({ ...f, ogImage: url }))}
                folder="blogs"
                aspectHint="1200×630"
              />
            </div>
          </div>
        </div>

        {/* ── Cài đặt xuất bản (nằm ngang bên dưới) ── */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-5 border-b border-border pb-2">
            Cài đặt xuất bản
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

            {/* Trạng thái */}
            <div>
              <label className={labelClass}>Trạng thái</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className={inputClass}
              >
                <option value="draft">Bản nháp (Draft)</option>
                <option value="published">Xuất bản (Published)</option>
              </select>
              {form.status === "published" && (
                <div className="mt-3">
                  <label className={labelClass}>Lên lịch đăng</label>
                  <input
                    type="datetime-local"
                    value={form.publishedAt}
                    onChange={(e) => setForm((f) => ({ ...f, publishedAt: e.target.value }))}
                    className={inputClass}
                  />
                  <p className="text-xs text-muted mt-1">Để trống = đăng ngay.</p>
                </div>
              )}
            </div>

            {/* Tác giả */}
            <div>
              <label className={labelClass}>Tác giả</label>
              {isMarketing ? (
                <div className="w-full rounded border border-border bg-bg px-4 py-2.5 text-sm text-text">
                  {adminProfile?.fullName || "Tài khoản marketing hiện tại"}
                </div>
              ) : (
                <select
                  value={form.authorId}
                  onChange={(e) => setForm((f) => ({ ...f, authorId: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">-- Chọn tác giả --</option>
                  {authors.map((a) => (
                    <option key={a._id} value={a._id}>{a.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Danh mục */}
            <div>
              <label className={labelClass}>Danh mục</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                className={inputClass}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className={labelClass}>Tags</label>
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value && !form.tags.includes(e.target.value)) {
                    setForm((f) => ({ ...f, tags: [...f.tags, e.target.value] }));
                  }
                }}
                className={inputClass}
              >
                <option value="">+ Thêm Tag</option>
                {availableTags.filter((t) => !form.tags.includes(t._id)).map((t) => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.tags.map((tagId) => {
                  const tag = availableTags.find((t) => t._id === tagId);
                  if (!tag) return null;
                  return (
                    <span key={tag._id} className="px-2 py-0.5 bg-bg border border-border rounded text-xs tracking-wider uppercase flex items-center gap-1.5">
                      {tag.name}
                      <button type="button" onClick={() => setForm((f) => ({ ...f, tags: f.tags.filter((id) => id !== tagId) }))} className="text-muted hover:text-red-500">×</button>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Ảnh Thumbnail */}
            <div>
              <ImageUploader
                label="Ảnh đại diện (Thumbnail)"
                value={form.thumbnail}
                onChange={(url) => setForm((f) => ({ ...f, thumbnail: url }))}
                folder="blogs"
                aspectHint="16:9"
              />
            </div>

            {/* Ảnh Banner */}
            <div>
              <ImageUploader
                label="Ảnh Banner"
                value={form.bannerImage}
                onChange={(url) => setForm((f) => ({ ...f, bannerImage: url }))}
                folder="blogs"
                aspectHint="16:9 — rộng hơn thumbnail"
              />
            </div>

            {/* OG Image */}
            <div>
              <ImageUploader
                label="Ảnh OpenGraph (OG Image)"
                value={form.ogImage}
                onChange={(url) => setForm((f) => ({ ...f, ogImage: url }))}
                folder="blogs"
                aspectHint="1200×630"
              />
            </div>

            {/* TOC + Submit */}
            <div className="flex flex-col justify-between gap-4">
              <div>
                <label className={labelClass}>Tùy chọn</label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="checkbox" id="showToc" checked={form.showToc}
                    onChange={(e) => setForm(f => ({ ...f, showToc: e.target.checked }))}
                    className="w-4 h-4 cursor-pointer accent-accent" />
                  <label htmlFor="showToc" className="text-sm font-semibold cursor-pointer">Hiển thị Mục Lục (TOC)</label>
                </div>
              </div>

              {message && (
                <p className="text-sm text-red-500 font-semibold">{message}</p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full cursor-pointer rounded border border-text bg-text px-4 py-3 font-bold uppercase tracking-widest text-bg hover:bg-bg hover:text-text transition-colors disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : form.status === "published" ? "Xuất bản bài viết" : "Lưu bản nháp"}
              </button>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}

const labelClass =
  "mb-1.5 block text-xs font-bold text-muted uppercase tracking-wider";
const inputClass =
  "w-full rounded border border-border bg-bg px-4 py-2.5 text-text text-sm sm:text-base outline-none focus:border-text transition-colors";
