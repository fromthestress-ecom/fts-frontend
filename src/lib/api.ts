const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export interface Category {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  order: number;
}

export interface Product {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  categoryId: Category | string;
  inStock: boolean;
  stockQuantity: number;
  sizes: string[];
  colors: string[];
  order: number;
}

export interface ProductListResult {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CartItem {
  productId: Product;
  quantity: number;
  size?: string;
  color?: string;
}

export interface Cart {
  _id: string;
  items: CartItem[];
}

export interface OrderItemDto {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
}

export interface ShippingAddressDto {
  fullName: string;
  phone: string;
  address: string;
  city?: string;
  district?: string;
  ward?: string;
}

export interface CreateOrderDto {
  email: string;
  items: OrderItemDto[];
  shippingAddress: ShippingAddressDto;
  note?: string;
}
