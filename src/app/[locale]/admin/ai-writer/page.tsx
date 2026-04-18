"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminKey } from "@/components/admin/AdminGuard";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type RelatedBlog = { anchor: string; path: string };

type AiWriterResult = {
  seoTitle: string;
  metaDescription: string;
  slug: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  featuredImageAlt: string;
  content: string;
  wordCount: number;
  keywordDensity: string;
  internalLinksCount: number;
};

const SEARCH_INTENTS = [
  { value: "informational", label: "Informational — người dùng muốn tìm hiểu" },
  { value: "commercial", label: "Commercial — người dùng đang cân nhắc mua" },
  { value: "navigational", label: "Navigational — người dùng tìm trang cụ thể" },
];

const WORD_COUNTS = [800, 1000, 1500];

export default function AiWriterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiWriterResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "html">("preview");

  const [form, setForm] = useState({
    keyword: "",
    searchIntent: "informational",
    targetReader: "",
    productToLink: "",
    wordCountTarget: 1000,
    specialNotes: "",
  });

  const [relatedBlogs, setRelatedBlogs] = useState<RelatedBlog[]>([
    { anchor: "", path: "" },
    { anchor: "", path: "" },
  ]);

  const updateRelated = (index: number, field: keyof RelatedBlog, value: string) => {
    setRelatedBlogs((prev) => prev.map((b, i) => (i === index ? { ...b, [field]: value } : b)));
  };

  const addRelated = () => {
    if (relatedBlogs.length < 5) setRelatedBlogs((prev) => [...prev, { anchor: "", path: "" }]);
  };

  const removeRelated = (index: number) => {
    setRelatedBlogs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.keyword.trim()) return;

    setLoading(true);
    setResult(null);
    setError("");

    try {
      const key = getAdminKey();
      const res = await fetch(`${API}/admin/ai-writer/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": key ?? "",
        },
        body: JSON.stringify({
          ...form,
          relatedBlogs: relatedBlogs.filter((b) => b.anchor && b.path),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Lỗi tạo bài viết");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyHtml = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseDraft = () => {
    if (!result) return;
    sessionStorage.setItem(
      "ai_writer_draft",
      JSON.stringify({
        title: result.seoTitle,
        slug: result.slug,
        excerpt: result.metaDescription,
        content: result.content,
        metaTitle: result.seoTitle,
        metaDescription: result.metaDescription,
      }),
    );
    router.push("/admin/blogs/create");
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-xl sm:text-2xl uppercase tracking-wider">
            AI Writer
          </h1>
          <p className="text-muted text-sm mt-1">
            Tạo bài blog SEO theo phong cách From the Stress bằng GPT-4o.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <form
          onSubmit={handleGenerate}
          className="lg:col-span-2 flex flex-col gap-5 bg-surface border border-border rounded-lg p-6 h-fit"
        >
          <div>
            <label className={labelClass}>
              Focus Keyword <span className="text-red-500">*</span>
            </label>
            <input
              value={form.keyword}
              onChange={(e) => setForm((f) => ({ ...f, keyword: e.target.value }))}
              required
              className={inputClass}
              placeholder="VD: áo thun oversize nam"
            />
            <p className="text-xs text-muted mt-1">Keyword chính để tối ưu SEO</p>
          </div>

          <div>
            <label className={labelClass}>Search Intent</label>
            <select
              value={form.searchIntent}
              onChange={(e) => setForm((f) => ({ ...f, searchIntent: e.target.value }))}
              className={inputClass}
            >
              {SEARCH_INTENTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Target Reader</label>
            <input
              value={form.targetReader}
              onChange={(e) => setForm((f) => ({ ...f, targetReader: e.target.value }))}
              className={inputClass}
              placeholder="VD: sinh viên TPHCM, thích mặc thoải mái đến trường"
            />
          </div>

          <div>
            <label className={labelClass}>Product to Link</label>
            <input
              value={form.productToLink}
              onChange={(e) => setForm((f) => ({ ...f, productToLink: e.target.value }))}
              className={inputClass}
              placeholder="VD: Áo Boxy Tee | /collections/ao-thun"
            />
            <p className="text-xs text-muted mt-1">Tên sản phẩm hoặc đường dẫn collection</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelClass}>Related Blogs (Internal Links)</label>
              {relatedBlogs.length < 5 && (
                <button
                  type="button"
                  onClick={addRelated}
                  className="text-xs text-accent hover:underline cursor-pointer"
                >
                  + Thêm
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {relatedBlogs.map((blog, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    value={blog.anchor}
                    onChange={(e) => updateRelated(i, "anchor", e.target.value)}
                    className={`${inputClass} flex-1`}
                    placeholder="Anchor text"
                  />
                  <input
                    value={blog.path}
                    onChange={(e) => updateRelated(i, "path", e.target.value)}
                    className={`${inputClass} flex-1`}
                    placeholder="/blog/slug"
                  />
                  <button
                    type="button"
                    onClick={() => removeRelated(i)}
                    className="text-muted hover:text-red-500 text-sm shrink-0 cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Word Count Target</label>
            <div className="flex gap-2">
              {WORD_COUNTS.map((wc) => (
                <button
                  key={wc}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, wordCountTarget: wc }))}
                  className={`flex-1 rounded border py-2 text-sm font-semibold transition-colors cursor-pointer ${
                    form.wordCountTarget === wc
                      ? "border-text bg-text text-bg"
                      : "border-border bg-bg text-muted hover:border-text hover:text-text"
                  }`}
                >
                  {wc}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Special Notes</label>
            <textarea
              value={form.specialNotes}
              onChange={(e) => setForm((f) => ({ ...f, specialNotes: e.target.value }))}
              rows={3}
              className={inputClass}
              placeholder="VD: đề cập thời tiết Sài Gòn mùa nóng, nhấn mạnh chất cotton..."
            />
          </div>

          <button
            type="submit"
            disabled={loading || !form.keyword.trim()}
            className="w-full cursor-pointer rounded border border-text bg-text px-4 py-3 font-bold uppercase tracking-widest text-bg hover:bg-bg hover:text-text transition-colors disabled:opacity-50"
          >
            {loading ? "Đang tạo bài viết..." : "Tạo bài viết với AI"}
          </button>

          {loading && (
            <p className="text-xs text-muted text-center">
              GPT-4o đang viết bài, có thể mất 20-40 giây...
            </p>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}
        </form>

        {/* Result */}
        <div className="lg:col-span-3">
          {!result && !loading && (
            <div className="flex items-center justify-center h-64 rounded-lg border border-dashed border-border text-muted text-sm">
              Điền form và nhấn "Tạo bài viết với AI" để bắt đầu
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center h-64 rounded-lg border border-border bg-surface">
              <div className="text-center">
                <div className="inline-block w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm text-muted">GPT-4o đang viết bài...</p>
              </div>
            </div>
          )}

          {result && (
            <div className="flex flex-col gap-4">
              {/* Meta info */}
              <div className="bg-surface border border-border rounded-lg p-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted mb-4 border-b border-border pb-2">
                  Thông tin SEO
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <MetaRow label="SEO Title" value={result.seoTitle} />
                  <MetaRow label="Slug" value={result.slug} mono />
                  <MetaRow label="Focus Keyword" value={result.focusKeyword} />
                  <MetaRow label="Featured Image Alt" value={result.featuredImageAlt} />
                  <div className="sm:col-span-2">
                    <MetaRow label="Meta Description" value={result.metaDescription} />
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-xs text-muted font-bold uppercase tracking-wider">Secondary Keywords</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {result.secondaryKeywords?.map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 bg-bg border border-border rounded text-xs">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 mt-4 pt-3 border-t border-border text-xs text-muted">
                  <span>~{result.wordCount} từ</span>
                  <span>Keyword density: {result.keywordDensity}</span>
                  <span>{result.internalLinksCount} internal links</span>
                </div>
              </div>

              {/* Content */}
              <div className="bg-surface border border-border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                  <div className="flex gap-1">
                    <TabBtn active={activeTab === "preview"} onClick={() => setActiveTab("preview")}>
                      Preview
                    </TabBtn>
                    <TabBtn active={activeTab === "html"} onClick={() => setActiveTab("html")}>
                      HTML
                    </TabBtn>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCopyHtml}
                      className="text-xs font-semibold text-muted hover:text-text border border-border rounded px-3 py-1.5 transition-colors cursor-pointer"
                    >
                      {copied ? "Đã copy!" : "Copy HTML"}
                    </button>
                    <button
                      type="button"
                      onClick={handleUseDraft}
                      className="text-xs font-bold bg-text text-bg border border-text rounded px-3 py-1.5 hover:bg-bg hover:text-text transition-colors cursor-pointer"
                    >
                      Dùng làm Draft
                    </button>
                  </div>
                </div>

                {activeTab === "preview" ? (
                  <div
                    className="p-6 prose prose-sm max-w-none text-text prose-headings:text-text prose-a:text-accent"
                    style={{ lineHeight: "1.75" }}
                    dangerouslySetInnerHTML={{ __html: result.content }}
                  />
                ) : (
                  <textarea
                    readOnly
                    value={result.content}
                    className="w-full h-96 p-4 bg-bg text-text text-xs font-mono resize-none outline-none border-none"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <span className="text-xs text-muted font-bold uppercase tracking-wider block mb-0.5">{label}</span>
      <span className={`text-sm text-text ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
        active ? "bg-text text-bg" : "text-muted hover:text-text"
      }`}
    >
      {children}
    </button>
  );
}

const labelClass = "mb-1.5 block text-xs font-bold text-muted uppercase tracking-wider";
const inputClass =
  "w-full rounded border border-border bg-bg px-3 py-2 text-text text-sm outline-none focus:border-text transition-colors";
