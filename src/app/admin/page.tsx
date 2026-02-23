import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <>
      <h1 className="font-display mb-4 text-xl sm:text-2xl">Dashboard</h1>
      <p className="mb-6 text-muted">
        Chọn chức năng bên trái để quản lý nội dung.
      </p>
      <div className="flex flex-wrap gap-4">
        <Link
          href="/admin/categories"
          className="block min-w-[160px] rounded-lg border border-border bg-bg p-4 sm:p-5"
        >
          <strong>Danh mục</strong>
          <p className="mt-1 text-sm text-muted">
            Thêm, sửa, xóa danh mục
          </p>
        </Link>
        <Link
          href="/admin/products"
          className="block min-w-[160px] rounded-lg border border-border bg-bg p-4 sm:p-5"
        >
          <strong>Sản phẩm</strong>
          <p className="mt-1 text-sm text-muted">
            Thêm, sửa, xóa sản phẩm
          </p>
        </Link>
      </div>
    </>
  );
}
