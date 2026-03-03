import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import type { Metadata } from "next";

interface Order {
  orderNumber: string;
  email: string;
  items: {
    name: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
    preOrder?: boolean;
  }[];
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city?: string;
  };
  subtotal: number;
  shippingFee: number;
  status: string;
}

async function getOrder(orderNumber: string): Promise<Order | null> {
  try {
    return await fetchApi<Order>(`/orders/${encodeURIComponent(orderNumber)}`);
  } catch {
    return null;
  }
}

type Props = { params: Promise<{ orderNumber: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orderNumber } = await params;
  return { title: `Đơn hàng ${orderNumber}` };
}

export default async function OrderDetailPage({ params }: Props) {
  const { orderNumber } = await params;
  const order = await getOrder(orderNumber);
  if (!order) notFound();

  const total = order.subtotal + order.shippingFee;
  const hasPreOrder = order.items.some((item) => item.preOrder);
  const depositAmount = hasPreOrder ? total / 2 : 0;

  return (
    <div className="mx-auto max-w-[640px] px-4 py-8 sm:px-6">
      <h1 className="font-display mb-2 text-2xl tracking-wide sm:text-3xl">
        ĐƠN HÀNG {order.orderNumber}
      </h1>
      <p className="mb-6 text-muted">
        Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ qua email {order.email}.
      </p>
      <div className="mb-6 rounded-lg bg-surface p-6">
        <h2 className="mb-3 text-base">Giao hàng đến</h2>
        <p className="m-0">
          {order.shippingAddress.fullName} · {order.shippingAddress.phone}
        </p>
        <p className="mt-1 text-muted">
          {order.shippingAddress.address}
          {order.shippingAddress.city ? `, ${order.shippingAddress.city}` : ""}
        </p>
      </div>
      <ul className="list-none p-0 m-0">
        {order.items.map((item, i) => (
          <li
            key={i}
            className="flex justify-between border-b border-border py-3"
          >
            <span>
              {item.name} × {item.quantity}
              {(item.size || item.color) && (
                <span className="text-sm text-muted">
                  {" "}
                  ({[item.size, item.color].filter(Boolean).join(" / ")})
                </span>
              )}
            </span>
            <span>
              {new Intl.NumberFormat("vi-VN").format(
                item.price * item.quantity,
              )}
              ₫
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 text-right">
        <p className="my-1 text-muted">
          Tạm tính: {new Intl.NumberFormat("vi-VN").format(order.subtotal)}₫
        </p>
        <p className="my-1 text-muted">
          Phí ship:{" "}
          {order.shippingFee === 0
            ? "Miễn phí"
            : `${new Intl.NumberFormat("vi-VN").format(order.shippingFee)}₫`}
        </p>
        <p className="mt-2 text-lg font-bold">
          Tổng: {new Intl.NumberFormat("vi-VN").format(total)}₫
        </p>
        {hasPreOrder && (
          <div className="mt-4 rounded-lg bg-accent/10 p-4 border border-accent/20 text-left">
            <h3 className="text-base font-bold text-accent mb-2">
              Thông tin thanh toán cọc Pre-order
            </h3>
            <p className="text-sm mb-2 text-text">
              Đơn hàng của bạn có chứa sản phẩm Pre-order. Vui lòng chuyển khoản
              tiền cọc <strong>50%</strong> theo thông tin dưới đây để chúng tôi
              tiến hành xử lý đơn hàng:
            </p>
            <p className="text-sm mb-1 text-text">
              Số tiền cọc:{" "}
              <strong className="text-base text-accent">
                {new Intl.NumberFormat("vi-VN").format(depositAmount)}₫
              </strong>
            </p>
            <p className="text-sm mb-1 text-text">
              Số tài khoản: <strong>0123456789</strong> (Ngân hàng VCB)
            </p>
            <p className="text-sm mb-0 text-text">
              Chủ tài khoản: <strong>STREETWEAR STORE</strong>
            </p>
            <p className="text-sm mt-2 text-text">
              Nội dung CK: <strong>{order.orderNumber} SĐT</strong> (VD:{" "}
              {order.orderNumber} 0987654321)
            </p>
          </div>
        )}
      </div>
      <p className="mt-6">
        <Link href="/san-pham" className="text-accent hover:underline">
          Tiếp tục mua sắm →
        </Link>
      </p>
    </div>
  );
}
