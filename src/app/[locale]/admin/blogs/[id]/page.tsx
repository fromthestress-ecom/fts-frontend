"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAdminKey } from "@/components/admin/AdminGuard";
import type { BlogCategory, Author, BlogItem, Tag } from "@/lib/api";
import RichTextEditor from "@/components/RichTextEditor";

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

function adminUploadFile(
  file: File,
  folder?: string,
): Promise<{ url: string; key: string }> {
  const key = getAdminKey();
  const formData = new FormData();
  formData.append("file", file);
  const uploadUrl = folder
    ? `${API}/admin/upload?folder=${folder}`
    : `${API}/admin/upload`;
  return fetch(uploadUrl, {
    method: "POST",
    headers: { "x-admin-key": key ?? "" },
    body: formData,
  }).then((res) => {
    if (!res.ok)
      return res.json().then((data) => {
        throw new Error(data.message || "Upload thất bại");
      });
    return res.json();
  });
}

export default function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

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
    setLoading(true);
    Promise.all([
      adminFetch(`/admin/blogs/${id}`),
      adminFetch("/admin/blog-categories"),
      adminFetch("/admin/authors"),
      adminFetch("/admin/tags"),
    ])
      .then(async ([blogRes, catRes, authRes, tagRes]) => {
        if (catRes.ok) setCategories(await catRes.json());
        if (authRes.ok) setAuthors(await authRes.json());
        if (tagRes.ok) setAvailableTags(await tagRes.json());

        if (blogRes.ok) {
          const b = (await blogRes.json()) as BlogItem;
          setForm({
            title: b.title || "",
            slug: b.slug || "",
            excerpt: b.excerpt || "",
            content: b.content || "",
            thumbnail: b.thumbnail || "",
            bannerImage: b.bannerImage || "",
            categoryId:
              typeof b.categoryId === "object"
                ? (b.categoryId as any)._id
                : b.categoryId || "",
            authorId:
              typeof b.authorId === "object"
                ? (b.authorId as any)._id
                : b.authorId || "",
            tags: b.tags
              ? b.tags.map((t: any) => (typeof t === "object" ? t._id : t))
              : [],
            status: b.status || "draft",
            publishedAt: b.publishedAt
              ? new Date(b.publishedAt).toISOString().slice(0, 16)
              : "",
            showToc: typeof b.showToc === "boolean" ? b.showToc : true,
            metaTitle: b.metaTitle || "",
            metaDescription: b.metaDescription || "",
            ogImage: b.ogImage || "",
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        setMessage("Error loading data");
        setLoading(false);
      });
  }, [id]);

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "thumbnail" | "ogImage" | "bannerImage",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await adminUploadFile(file, "blogs");
      setForm((f) => ({ ...f, [field]: res.url }));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const payload = { ...form };
    if (!payload.categoryId) delete (payload as any).categoryId;
    if (!payload.authorId) delete (payload as any).authorId;
    if (!payload.publishedAt) delete (payload as any).publishedAt;
    else
      payload.publishedAt = new Date(payload.publishedAt).toISOString() as any;

    // Ensure tags is a clean array of actual ObjectId strings
    payload.tags = payload.tags.filter(t => t && typeof t === 'string' && t.trim() !== "" && t !== "[ '', '' ]" && !t.includes("''"));

    try {
      const res = await adminFetch(`/admin/blogs/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Lỗi cập nhật bài viết");
      setMessage("Đã cập nhật bài viết");
      // maybe router.push('/admin/blogs') instead?
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-muted p-4">Đang tải biểu mẫu...</p>;

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl sm:text-2xl uppercase tracking-wider flex items-center gap-3">
          Sửa bài viết
          {form.status === "published" && (
            <span className="bg-green-500/20 text-green-500 border border-green-500/30 text-[10px] px-2 py-1 rounded">
              PUBLISHED
            </span>
          )}
          {form.status === "draft" && (
            <span className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 text-[10px] px-2 py-1 rounded">
              DRAFT
            </span>
          )}
        </h1>
        <Link
          href="/admin/blogs"
          className="text-sm font-semibold text-muted hover:text-text transition-colors"
        >
          &larr; Quay lại
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col gap-6">
          <div className="bg-surface border border-border rounded-lg p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-border pb-2">
              Nội dung chính
            </h2>

            <div className="mb-4">
              <label className={labelClass}>Tiêu đề *</label>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                required
                className={inputClass}
              />
            </div>

            <div className="mb-4 text-xs font-mono text-muted flex items-center gap-2">
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
              />
            </div>

            <div className="mb-4 relative">
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
                  <label className="cursor-pointer text-xs font-bold bg-surface border border-accent text-accent px-3 py-1 rounded hover:bg-accent hover:text-bg transition-colors flex items-center gap-1">
                    {uploading ? (
                      "Đang tải..."
                    ) : (
                      <>
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        Upload Ảnh Trực Tiếp
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                         const file = e.target.files?.[0];
                         if (!file) return;
                         setUploading(true);
                         try {
                           const res = await adminUploadFile(file, "blogs");
                           const imgHtml = `<p><img src="${res.url}" alt="${file.name}" /></p>`;
                           setForm((f) => ({ ...f, content: f.content + imgHtml }));
                         } catch (err: any) {
                           alert("Lỗi upload ảnh chèn: " + err.message);
                         } finally {
                           setUploading(false);
                           e.target.value = "";
                         }
                      }}
                      disabled={uploading}
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
              <label className={labelClass}>Ảnh OpenGraph (OG Image)</label>
              <div className="flex gap-4 items-start">
                <input
                  type="file"
                  onChange={(e) => handleFileSelect(e, "ogImage")}
                  accept="image/*"
                  disabled={uploading}
                  className="text-sm text-muted mt-2"
                />
                {form.ogImage && (
                  <img
                    src={form.ogImage}
                    alt=""
                    className="h-16 w-32 object-cover border border-border rounded"
                  />
                )}
              </div>
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
                <option value="published">Đã xuất bản (Published)</option>
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
              <label className={labelClass}>Ảnh đại diện (Thumbnail)</label>
              <div className="border-2 border-dashed border-border p-3 rounded text-center mb-2 hover:border-accent transition-colors bg-bg">
                {form.thumbnail ? (
                  <div className="relative group">
                    <img src={form.thumbnail} alt="Thumbnail" className="w-full h-auto rounded" />
                    <button type="button" onClick={() => setForm((f) => ({ ...f, thumbnail: "" }))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">×</button>
                  </div>
                ) : (
                  <span className="text-muted text-xs">Chưa có ảnh</span>
                )}
              </div>
              <input type="file" onChange={(e) => handleFileSelect(e, "thumbnail")} accept="image/*" disabled={uploading}
                className="block w-full text-xs text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-text file:text-bg hover:file:opacity-90 cursor-pointer" />
            </div>

            {/* Ảnh Banner */}
            <div>
              <label className={labelClass}>Ảnh Banner</label>
              <div className="border-2 border-dashed border-border p-3 rounded text-center mb-2 hover:border-accent transition-colors bg-bg">
                {form.bannerImage ? (
                  <div className="relative group">
                    <img src={form.bannerImage} alt="Banner" className="w-full h-auto rounded" />
                    <button type="button" onClick={() => setForm((f) => ({ ...f, bannerImage: "" }))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">×</button>
                  </div>
                ) : (
                  <span className="text-muted text-xs">Chưa có ảnh banner</span>
                )}
              </div>
              <input type="file" onChange={(e) => handleFileSelect(e, "bannerImage")} accept="image/*" disabled={uploading}
                className="block w-full text-xs text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-text file:text-bg hover:file:opacity-90 cursor-pointer" />
            </div>

            {/* OG Image */}
            <div>
              <label className={labelClass}>Ảnh OpenGraph (OG Image)</label>
              <div className="flex gap-3 items-start">
                <input type="file" onChange={(e) => handleFileSelect(e, "ogImage")} accept="image/*" disabled={uploading} className="text-sm text-muted mt-2" />
                {form.ogImage && <img src={form.ogImage} alt="" className="h-14 w-24 object-cover border border-border rounded" />}
              </div>
            </div>

            {/* TOC + Preview + Submit */}
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
                <p className={`text-sm font-semibold p-3 border rounded ${message.includes("Lỗi") ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-green-500/10 text-green-500 border-green-500/20"}`}>
                  {message}
                </p>
              )}

              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="w-full cursor-pointer rounded border border-text bg-text px-4 py-3 font-bold uppercase tracking-widest text-bg hover:bg-bg hover:text-text transition-colors disabled:opacity-50"
                >
                  {saving ? "Đang cập nhật..." : "Lưu Thay Đổi"}
                </button>
                <a
                  href={`/blogs/${form.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-center text-muted hover:text-accent underline font-semibold tracking-wider"
                >
                  PREVIEW POST ↗
                </a>
              </div>
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
