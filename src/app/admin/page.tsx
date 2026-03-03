import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <>
      <h1 className="font-display mb-4 text-xl sm:text-2xl">Dashboard</h1>
      <p className="mb-6 text-muted">
        Chọn chức năng bên trái hoặc các khối bên dưới để quản lý nội dung.
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
        <Link
          href="/admin/users"
          className="block min-w-[160px] rounded-lg border border-border bg-bg p-4 sm:p-5"
        >
          <strong>Người dùng</strong>
          <p className="mt-1 text-sm text-muted">
            Xem danh sách, vai trò, mã giới thiệu
          </p>
        </Link>
        <Link
          href="/admin/affiliates"
          className="block min-w-[160px] rounded-lg border border-border bg-bg p-4 sm:p-5"
        >
          <strong>Affiliate</strong>
          <p className="mt-1 text-sm text-muted">
            Quản lý đối tác affiliate, hoa hồng
          </p>
        </Link>
      </div>
    </>
  );
}
