const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
  const mergedInit: RequestInit = {
    next: { revalidate: 60 },
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  };
  const res = await fetch(`${BASE}${path}`, mergedInit);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export async function fetchBestSellingProducts(limit = 8): Promise<Product[]> {
  return fetchApi<Product[]>(`/products/best-selling?limit=${limit}`);
}

export interface Category {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  order: number;
  navGroup?: string;
  groupOrder?: number;
}

export interface ProductTemplate {
  _id: string;
  name: string;
  description?: string;
  sizeChart?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  bannerImage?: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventDiscount {
  eventId: string;
  eventName: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  originalPrice: number;
  status: 'active' | 'upcoming';
  startDate?: string;
  discountedPrice?: number;
}

export interface Product {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  finalPrice?: number;
  eventDiscount?: EventDiscount | null;
  eventId?: EventItem | string;
  images: string[];
  sizeChart?: string;
  categoryId: Category | string;
  templateId?: ProductTemplate | string;
  inStock: boolean;
  stockQuantity: number;
  sizes: string[];
  colors: string[];
  order: number;
  preOrder?: boolean;
  isSoldOut?: boolean;
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
  preOrder?: boolean;
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

export interface BlogCategory {
  _id: string;
  name: string;
  slug: string;
}

export interface Author {
  _id: string;
  name: string;
  avatar?: string;
  bio?: string;
}

export interface Tag {
  _id: string;
  name: string;
  slug: string;
}

export interface BlogItem {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail?: string;
  categoryId?: BlogCategory | string;
  authorId?: Author | string;
  status: "draft" | "published";
  publishedAt?: string;
  createdAt: string;
  readingTime: number;
  tags?: Tag[];
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  email: string;
  items: OrderItemDto[];
  shippingAddress: ShippingAddressDto;
  subtotal: number;
  shippingFee: number;
  discount?: number;
  referralCode?: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderListResult {
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
}
