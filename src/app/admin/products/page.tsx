'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getAdminKey } from '@/components/admin/AdminGuard';
import type { Category } from '@/lib/api';
import type Sortable from 'sortablejs';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type Product = {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  categoryId?: Category | null;
  inStock: boolean;
  stockQuantity: number;
  sizes: string[];
  colors: string[];
  order: number;
};

function adminFetch(path: string, init?: RequestInit) {
  const key = getAdminKey();
  return fetch(`${API}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': key ?? '',
      ...init?.headers,
    },
  });
}

function adminUploadFile(file: File): Promise<{ url: string; key: string }> {
  const key = getAdminKey();
  const formData = new FormData();
  formData.append('file', file);
  return fetch(`${API}/admin/upload`, {
    method: 'POST',
    headers: {
      'x-admin-key': key ?? '',
    },
    body: formData,
  }).then((res) => {
    if (!res.ok) {
      return res.json().then((data) => {
        throw new Error(data.message || 'Upload thất bại');
      });
    }
    return res.json();
  });
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [orderDirty, setOrderDirty] = useState(false);
  const [orderSaving, setOrderSaving] = useState(false);
  const [form, setForm] = useState({
    slug: '',
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    categoryId: '',
    images: [] as string[],
    sizes: '',
    colors: '',
    stockQuantity: '0',
    inStock: true,
  });
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const imagesContainerRef = useRef<HTMLDivElement>(null);
  const sortableInstanceRef = useRef<Sortable | null>(null);
  const productsTbodyRef = useRef<HTMLTableSectionElement>(null);
  const productsSortableRef = useRef<Sortable | null>(null);

  const productIdSet = useMemo(() => new Set(products.map((p) => p._id)), [products]);

  const load = async () => {
    setLoading(true);
    const [resP, resC] = await Promise.all([
      adminFetch('/admin/products'),
      adminFetch('/admin/categories'),
    ]);
    if (resP.ok) setProducts(await resP.json());
    if (resC.ok) setCategories(await resC.json());
    setLoading(false);
    setOrderDirty(false);
  };

  useEffect(() => {
    load();
  }, []);

  // Initialize SortableJS for image reordering
  useEffect(() => {
    if (typeof window === 'undefined' || !imagesContainerRef.current || form.images.length === 0) {
      if (sortableInstanceRef.current) {
        sortableInstanceRef.current.destroy();
        sortableInstanceRef.current = null;
      }
      return;
    }
    
    // Dynamically import SortableJS
    import('sortablejs').then((SortableModule) => {
      const Sortable = SortableModule.default || SortableModule;
      if (sortableInstanceRef.current) {
        sortableInstanceRef.current.destroy();
      }
      if (imagesContainerRef.current) {
        sortableInstanceRef.current = new Sortable(imagesContainerRef.current, {
          animation: 150,
          ghostClass: 'sortable-ghost',
          dragClass: 'sortable-drag',
          onEnd: () => {
            const items = Array.from(imagesContainerRef.current?.children || []);
            const newOrder = items.map((item) => {
              const div = item as HTMLElement;
              return div.getAttribute('data-url') || '';
            }).filter(Boolean);
            if (newOrder.length === form.images.length) {
              setForm((f) => ({ ...f, images: newOrder }));
            }
          },
        });
      }
    });

    return () => {
      if (sortableInstanceRef.current) {
        sortableInstanceRef.current.destroy();
        sortableInstanceRef.current = null;
      }
    };
  }, [form.images]);

  // Initialize SortableJS for product row reordering
  useEffect(() => {
    if (typeof window === 'undefined' || !productsTbodyRef.current || products.length === 0) {
      if (productsSortableRef.current) {
        productsSortableRef.current.destroy();
        productsSortableRef.current = null;
      }
      return;
    }

    import('sortablejs').then((SortableModule) => {
      const SortableCtor = (SortableModule.default ?? SortableModule) as unknown as new (
        el: HTMLElement,
        options: Record<string, unknown>
      ) => Sortable;

      if (productsSortableRef.current) productsSortableRef.current.destroy();

      if (!productsTbodyRef.current) return;
      productsSortableRef.current = new SortableCtor(productsTbodyRef.current, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        handle: '.drag-handle',
        onEnd: () => {
          const rows = Array.from(productsTbodyRef.current?.querySelectorAll('tr[data-id]') ?? []);
          const ids = rows
            .map((r) => (r as HTMLElement).getAttribute('data-id') ?? '')
            .filter(Boolean);
          if (ids.length !== products.length) return;
          if (!ids.every((id) => productIdSet.has(id))) return;
          setProducts((prev) => {
            const byId = new Map(prev.map((p) => [p._id, p]));
            return ids.map((id) => byId.get(id)).filter(Boolean) as Product[];
          });
          setOrderDirty(true);
        },
      });
    });

    return () => {
      if (productsSortableRef.current) {
        productsSortableRef.current.destroy();
        productsSortableRef.current = null;
      }
    };
  }, [products.length, productIdSet]);

  const saveProductOrder = async () => {
    setMessage('');
    setOrderSaving(true);
    try {
      const items = products.map((p, index) => ({ id: p._id, order: index }));
      const res = await adminFetch('/admin/products/reorder', {
        method: 'PUT',
        body: JSON.stringify({ items }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? 'Lỗi lưu thứ tự');
      setOrderDirty(false);
      setMessage('Đã lưu thứ tự sản phẩm.');
      // reload to ensure consistent ordering
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Lỗi lưu thứ tự');
    } finally {
      setOrderSaving(false);
    }
  };

  const resetForm = () => {
    setForm({
      slug: '',
      name: '',
      description: '',
      price: '',
      compareAtPrice: '',
      categoryId: '',
      images: [],
      sizes: '',
      colors: '',
      stockQuantity: '0',
      inStock: true,
    });
    setEditingId(null);
  };

  const handleEdit = (p: Product) => {
    setEditingId(p._id);
    setForm({
      slug: p.slug,
      name: p.name,
      description: p.description ?? '',
      price: String(p.price),
      compareAtPrice: p.compareAtPrice != null ? String(p.compareAtPrice) : '',
      categoryId: p.categoryId && typeof p.categoryId === 'object' ? p.categoryId._id : '',
      images: p.images ?? [],
      sizes: (p.sizes ?? []).join(', '),
      colors: (p.colors ?? []).join(', '),
      stockQuantity: String(p.stockQuantity ?? 0),
      inStock: p.inStock ?? true,
    });
    setMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setSaving(true);
    const payload = {
      slug: form.slug.trim(),
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      price: Number(form.price) || 0,
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : 0,
      categoryId: form.categoryId || undefined,
      images: form.images,
      sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      colors: form.colors.split(',').map((s) => s.trim()).filter(Boolean),
      stockQuantity: Number(form.stockQuantity) || 0,
      inStock: form.inStock,
    };
    const isEdit = Boolean(editingId);
    const res = await adminFetch(
      isEdit ? `/admin/products/${editingId}` : '/admin/products',
      {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json().catch(() => ({}));
    setMessage(res.ok ? (isEdit ? 'Đã cập nhật.' : 'Đã thêm sản phẩm.') : (data.message ?? 'Lỗi'));
    setSaving(false);
    if (res.ok) {
      resetForm();
      load();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa sản phẩm này?')) return;
    await adminFetch(`/admin/products/${id}`, { method: 'DELETE' });
    load();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploads = Array.from(files).map((file) => adminUploadFile(file));
      const results = await Promise.all(uploads);
      const urls = results.map((r) => r.url);
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
      e.target.value = '';
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Upload thất bại');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  };

  return (
    <>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: '1rem' }}>
        Sản phẩm
      </h1>
      {editingId && (
        <p style={{ marginBottom: '1rem', color: 'var(--accent)', fontSize: '0.875rem' }}>
          Đang sửa sản phẩm. <button type="button" onClick={resetForm} style={{ ...btnPrimary, background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)' }}>Hủy</button>
        </p>
      )}
      <form
        onSubmit={handleSubmit}
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>Slug *</label>
            <input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="hoodie-black"
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Tên *</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Hoodie Black"
              required
              style={inputStyle}
            />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>Giá (VNĐ) *</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              placeholder="450000"
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Giá so sánh (VNĐ)</label>
            <input
              type="number"
              value={form.compareAtPrice}
              onChange={(e) => setForm((f) => ({ ...f, compareAtPrice: e.target.value }))}
              placeholder="550000"
              style={inputStyle}
            />
          </div>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Danh mục</label>
          <select
            value={form.categoryId}
            onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            style={inputStyle}
          >
            <option value="">-- Chọn --</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Mô tả</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={2}
            style={{ ...inputStyle, width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Ảnh</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              onChange={handleFileSelect}
              disabled={uploading}
              style={{ fontSize: '0.875rem' }}
            />
            {uploading && <span style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Đang upload...</span>}
          </div>
          {form.images.length > 0 && (
            <>
              <p style={{ color: 'var(--accent)', fontSize: '0.75rem', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
                💡 Kéo thả ảnh để sắp xếp thứ tự
              </p>
              <div
                ref={imagesContainerRef}
                style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}
              >
                {form.images.map((url, idx) => (
                  <div
                    key={`${url}-${idx}`}
                    data-url={url}
                    style={{
                      position: 'relative',
                      width: 100,
                      height: 100,
                      border: '2px solid var(--border)',
                      borderRadius: 4,
                      overflow: 'hidden',
                      background: 'var(--surface)',
                      cursor: 'move',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                    }}
                  >
                    <img
                      src={url}
                      alt=""
                      data-url={url}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: 2,
                        left: 2,
                        background: 'rgba(0,0,0,0.8)',
                        color: '#fff',
                        borderRadius: 4,
                        padding: '2px 4px',
                        fontSize: '10px',
                        pointerEvents: 'none',
                        userSelect: 'none',
                      }}
                    >
                      ⋮⋮
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(idx);
                      }}
                      style={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        width: 24,
                        height: 24,
                        background: 'rgba(220,38,38,0.9)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>Size (cách nhau dấu phẩy)</label>
            <input
              value={form.sizes}
              onChange={(e) => setForm((f) => ({ ...f, sizes: e.target.value }))}
              placeholder="S,M,L,XL"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Màu (cách nhau dấu phẩy)</label>
            <input
              value={form.colors}
              onChange={(e) => setForm((f) => ({ ...f, colors: e.target.value }))}
              placeholder="Đen,Trắng"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Tồn kho</label>
            <input
              type="number"
              value={form.stockQuantity}
              onChange={(e) => setForm((f) => ({ ...f, stockQuantity: e.target.value }))}
              style={{ ...inputStyle, width: 100 }}
            />
          </div>
        </div>
        <button type="submit" disabled={saving} style={btnPrimary}>
          {saving ? (editingId ? 'Đang cập nhật...' : 'Đang thêm...') : (editingId ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm')}
        </button>
        {message && <span style={{ marginLeft: '1rem', color: 'var(--muted)', fontSize: '0.875rem' }}>{message}</span>}
      </form>
      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Đang tải...</p>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
              💡 Kéo biểu tượng ↕ để sắp xếp thứ tự sản phẩm
            </span>
            <button
              type="button"
              disabled={!orderDirty || orderSaving}
              onClick={saveProductOrder}
              style={{
                ...btnPrimary,
                background: orderDirty ? 'var(--accent)' : 'var(--border)',
                cursor: orderDirty ? 'pointer' : 'not-allowed',
                opacity: orderSaving ? 0.8 : 1,
              }}
            >
              {orderSaving ? 'Đang lưu...' : 'Lưu thứ tự'}
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ width: 44, padding: '0.5rem' }}></th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Slug</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Tên</th>
              <th style={{ textAlign: 'right', padding: '0.5rem' }}>Giá</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Danh mục</th>
              <th style={{ textAlign: 'right', padding: '0.5rem' }}></th>
            </tr>
          </thead>
          <tbody ref={productsTbodyRef}>
            {products.map((p) => (
              <tr key={p._id} data-id={p._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.5rem' }}>
                  <span
                    className="drag-handle"
                    title="Kéo để sắp xếp"
                    style={{
                      display: 'inline-flex',
                      width: 28,
                      height: 28,
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--border)',
                      borderRadius: 6,
                      color: 'var(--muted)',
                      cursor: 'grab',
                      userSelect: 'none',
                      background: 'var(--bg)',
                    }}
                  >
                    ↕
                  </span>
                </td>
                <td style={{ padding: '0.5rem' }}>{p.slug}</td>
                <td style={{ padding: '0.5rem' }}>{p.name}</td>
                <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                  {new Intl.NumberFormat('vi-VN').format(p.price)}₫
                </td>
                <td style={{ padding: '0.5rem' }}>
                  {p.categoryId && typeof p.categoryId === 'object' ? p.categoryId.name : '-'}
                </td>
                <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={() => handleEdit(p)}
                    style={{ ...btnPrimary, marginRight: '0.5rem' }}
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p._id)}
                    style={{ ...btnPrimary, background: '#dc2626', color: '#fff' }}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </>
      )}
    </>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.75rem',
  color: 'var(--muted)',
  marginBottom: '0.25rem',
};
const inputStyle: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text)',
  width: '100%',
};
const btnPrimary: React.CSSProperties = {
  padding: '0.5rem 1rem',
  background: 'var(--accent)',
  color: 'var(--bg)',
  fontWeight: 600,
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
};
