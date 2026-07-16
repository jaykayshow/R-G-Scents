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
  metaTitle?: string;
  metaDescription?: string;
  imageAlt?: string;
  tags?: string[];
}

export type ReviewStatus = "pending" | "approved" | "rejected";

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
  status: ReviewStatus;
  replies?: { author: string; content: string; date: string }[];
  photos?: string[];
}

export type CouponType = "percentage" | "fixed" | "free-shipping";

export interface Coupon {
  code: string;
  type: CouponType;
  value: number;
  description: string;
  minSubtotal?: number;
  active: boolean;
  usageLimit?: number;
  usageCount: number;
  expiresAt?: string;
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

// ---------------------------------------------------------------------------
// Admin domain types
// ---------------------------------------------------------------------------

export type AdminRole = "Super Admin" | "Admin" | "Support" | "Content Editor";

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  role: AdminRole;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface InventoryHistoryEntry {
  id: string;
  productId: string;
  productName: string;
  variantId: string;
  variantSize: string;
  sku: string;
  change: number;
  previousStock: number;
  newStock: number;
  reason: string;
  actor: string;
  date: string;
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  category: "Product" | "Order" | "Coupon" | "Review" | "Blog" | "Banner" | "User" | "Settings" | "Inventory" | "Customer";
  date: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  active: boolean;
  placement: "homepage-top" | "homepage-hero" | "campaign";
  startDate?: string;
  endDate?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface CollectionMeta {
  slug: CollectionSlug;
  name: string;
  description: string;
  heroImage: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  joinedAt: string;
  ordersCount: number;
  totalSpent: number;
  status: "Active" | "Suspended";
  notes?: string;
}

export interface SiteSettings {
  siteName: string;
  supportEmail: string;
  supportPhone: string;
  maintenanceMode: boolean;
  taxRatePercent: number;
  flatShippingRate: number;
  freeShippingThreshold: number;
  codEnabled: boolean;
  bankTransferEnabled: boolean;
  stripeEnabled: boolean;
  paystackEnabled: boolean;
  flutterwaveEnabled: boolean;
  paypalEnabled: boolean;
  metaTitle: string;
  metaDescription: string;
}
