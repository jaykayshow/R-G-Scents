export type CollectionSlug = "legacy" | "reserve" | "royale" | "elite" | "noir";

export type Gender = "Men" | "Women" | "Unisex";

export interface NotesPyramid {
  top: string[];
  middle: string[];
  base: string[];
}

export interface ProductVariant {
  id: string;
  size: string; // e.g. "50ml"
  sku: string;
  barcode: string;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  collection: CollectionSlug;
  tagline: string;
  shortDescription: string;
  longDescription: string;
  gender: Gender;
  price: number;
  compareAtPrice?: number;
  images: string[];
  notes: NotesPyramid;
  longevity: "Moderate" | "Long Lasting" | "Eternal";
  projection: "Intimate" | "Moderate" | "Strong" | "Beast Mode";
  occasion: string[];
  season: string[];
  ingredients: string[];
  rating: number;
  reviewCount: number;
  salesCount: number;
  isNew: boolean;
  isLimitedEdition: boolean;
  createdAt: string;
  variants: ProductVariant[];
  stock: number;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  avatar?: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  verified: boolean;
  photos?: string[];
}

export type CouponType = "percentage" | "fixed" | "free-shipping";

export interface Coupon {
  code: string;
  type: CouponType;
  value: number;
  description: string;
  minSubtotal?: number;
}

export interface Address {
  id: string;
  label: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
}

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Refunded";

export interface OrderItem {
  productId: string;
  productName: string;
  productSlug: string;
  image: string;
  variantSize: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderTrackingEvent {
  status: OrderStatus;
  date: string;
  note: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  trackingNumber?: string;
  trackingEvents: OrderTrackingEvent[];
  shippingAddress: Omit<Address, "id" | "label" | "isDefault">;
  paymentMethod: string;
}

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  image: string;
  size: string;
  price: number;
  quantity: number;
  stock: number;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  status: "Open" | "Awaiting Reply" | "Resolved";
  createdAt: string;
  messages: { author: "customer" | "support"; content: string; date: string }[];
}

export interface RewardTransaction {
  id: string;
  type: "earn" | "redeem";
  points: number;
  description: string;
  date: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  emailVerified: boolean;
  createdAt: string;
  rewardPoints: number;
  referralCode: string;
}
