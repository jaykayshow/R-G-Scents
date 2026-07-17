import type {
  AdminRole,
  Address,
  AuditLogEntry,
  Banner,
  Category,
  CollectionMeta,
  CollectionSlug,
  Coupon,
  CouponType,
  Customer,
  Gender,
  Order,
  OrderStatus,
  Product,
  ProductVariant,
  Review,
  ReviewStatus,
  RewardTransaction,
  SiteSettings,
  SupportTicket,
  User,
} from "@/types";
import type { BlogPost } from "@/lib/mock-data/blog";

export interface AdminSession {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = Array.isArray(body?.message) ? body.message.join(" ") : body?.message ?? message;
    } catch {
      // response had no JSON body — keep statusText
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return text ? JSON.parse(text) : (undefined as T);
}

const http = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

// ---------------------------------------------------------------------------
// Enum shape adapters — backend Prisma enums <-> frontend display types
// ---------------------------------------------------------------------------

const GENDER_TO_FE: Record<string, Gender> = { MEN: "Men", WOMEN: "Women", UNISEX: "Unisex" };
const GENDER_TO_BE: Record<Gender, string> = { Men: "MEN", Women: "WOMEN", Unisex: "UNISEX" };

const LONGEVITY_TO_FE: Record<string, Product["longevity"]> = {
  MODERATE: "Moderate",
  LONG_LASTING: "Long Lasting",
  ETERNAL: "Eternal",
};
const LONGEVITY_TO_BE: Record<Product["longevity"], string> = {
  Moderate: "MODERATE",
  "Long Lasting": "LONG_LASTING",
  Eternal: "ETERNAL",
};

const PROJECTION_TO_FE: Record<string, Product["projection"]> = {
  INTIMATE: "Intimate",
  MODERATE: "Moderate",
  STRONG: "Strong",
  BEAST_MODE: "Beast Mode",
};
const PROJECTION_TO_BE: Record<Product["projection"], string> = {
  Intimate: "INTIMATE",
  Moderate: "MODERATE",
  Strong: "STRONG",
  "Beast Mode": "BEAST_MODE",
};

function toNumber(value: unknown): number {
  return value === null || value === undefined ? 0 : Number(value);
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

interface RawVariant {
  id: string;
  size: string;
  sku: string;
  barcode: string;
  price: string | number;
  stock: number;
}

interface RawProduct {
  id: string;
  slug: string;
  name: string;
  collectionSlug: string;
  tagline: string;
  shortDescription: string;
  longDescription: string;
  gender: string;
  price: string | number;
  compareAtPrice: string | number | null;
  images: string[];
  notesTop: string[];
  notesMiddle: string[];
  notesBase: string[];
  longevity: string;
  projection: string;
  occasion: string[];
  season: string[];
  ingredients: string[];
  rating: string | number;
  reviewCount: number;
  salesCount: number;
  isNew: boolean;
  isLimitedEdition: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  imageAlt: string | null;
  tags: string[];
  createdAt: string;
  variants: RawVariant[];
}

function adaptVariant(v: RawVariant): ProductVariant {
  return { id: v.id, size: v.size, sku: v.sku, barcode: v.barcode, price: toNumber(v.price), stock: v.stock };
}

function adaptProduct(raw: RawProduct): Product {
  const variants = raw.variants.map(adaptVariant);
  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    collection: raw.collectionSlug.toLowerCase() as CollectionSlug,
    tagline: raw.tagline,
    shortDescription: raw.shortDescription,
    longDescription: raw.longDescription,
    gender: GENDER_TO_FE[raw.gender] ?? "Unisex",
    price: toNumber(raw.price),
    compareAtPrice: raw.compareAtPrice === null ? undefined : toNumber(raw.compareAtPrice),
    images: raw.images,
    notes: { top: raw.notesTop, middle: raw.notesMiddle, base: raw.notesBase },
    longevity: LONGEVITY_TO_FE[raw.longevity] ?? "Moderate",
    projection: PROJECTION_TO_FE[raw.projection] ?? "Moderate",
    occasion: raw.occasion,
    season: raw.season,
    ingredients: raw.ingredients,
    rating: toNumber(raw.rating),
    reviewCount: raw.reviewCount,
    salesCount: raw.salesCount,
    isNew: raw.isNew,
    isLimitedEdition: raw.isLimitedEdition,
    createdAt: raw.createdAt,
    variants,
    stock: variants.reduce((sum, v) => sum + v.stock, 0),
    metaTitle: raw.metaTitle ?? undefined,
    metaDescription: raw.metaDescription ?? undefined,
    imageAlt: raw.imageAlt ?? undefined,
    tags: raw.tags,
  };
}

function toProductPayload(product: Product) {
  return {
    name: product.name,
    slug: product.slug,
    collectionSlug: product.collection.toUpperCase(),
    tagline: product.tagline,
    shortDescription: product.shortDescription,
    longDescription: product.longDescription,
    gender: GENDER_TO_BE[product.gender],
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    images: product.images,
    notesTop: product.notes.top,
    notesMiddle: product.notes.middle,
    notesBase: product.notes.base,
    longevity: LONGEVITY_TO_BE[product.longevity],
    projection: PROJECTION_TO_BE[product.projection],
    occasion: product.occasion,
    season: product.season,
    ingredients: product.ingredients,
    isNew: product.isNew,
    isLimitedEdition: product.isLimitedEdition,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    imageAlt: product.imageAlt,
    tags: product.tags,
    variants: product.variants.map((v) => ({
      id: v.id.startsWith("v-") ? undefined : v.id,
      size: v.size,
      sku: v.sku,
      barcode: v.barcode,
      price: v.price,
      stock: v.stock,
    })),
  };
}

// ---------------------------------------------------------------------------
// Categories & Collections
// ---------------------------------------------------------------------------

function adaptCollection(raw: { slug: string; name: string; description: string; heroImage: string }): CollectionMeta {
  return {
    slug: raw.slug.toLowerCase() as CollectionSlug,
    name: raw.name,
    description: raw.description,
    heroImage: raw.heroImage,
  };
}

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------

interface RawInventoryHistoryEntry {
  id: string;
  productId: string;
  variantId: string;
  change: number;
  previousStock: number;
  newStock: number;
  reason: string;
  createdAt: string;
  product: { name: string };
  variant: { size: string; sku: string };
  actor: { name: string } | null;
}

function adaptInventoryHistory(raw: RawInventoryHistoryEntry) {
  return {
    id: raw.id,
    productId: raw.productId,
    productName: raw.product.name,
    variantId: raw.variantId,
    variantSize: raw.variant.size,
    sku: raw.variant.sku,
    change: raw.change,
    previousStock: raw.previousStock,
    newStock: raw.newStock,
    reason: raw.reason,
    actor: raw.actor?.name ?? "System",
    date: raw.createdAt,
  };
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

const ADMIN_ROLE_TO_FE: Record<string, AdminRole> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  SUPPORT: "Support",
  CONTENT_EDITOR: "Content Editor",
};

export interface NotificationPreferences {
  notifyOrderUpdates: boolean;
  notifyShippingAlerts: boolean;
  notifyPromotions: boolean;
  notifyVipEarlyAccess: boolean;
  notifyRestockAlerts: boolean;
  notifyReviewRequests: boolean;
}

interface RawUser extends NotificationPreferences {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  emailVerified: boolean;
  createdAt: string;
  rewardPoints: number;
  referralCode: string;
}

function adaptUser(raw: RawUser): User {
  return {
    id: raw.id,
    firstName: raw.firstName,
    lastName: raw.lastName,
    email: raw.email,
    phone: raw.phone ?? undefined,
    emailVerified: raw.emailVerified,
    createdAt: raw.createdAt,
    rewardPoints: raw.rewardPoints,
    referralCode: raw.referralCode,
    notifyOrderUpdates: raw.notifyOrderUpdates,
    notifyShippingAlerts: raw.notifyShippingAlerts,
    notifyPromotions: raw.notifyPromotions,
    notifyVipEarlyAccess: raw.notifyVipEarlyAccess,
    notifyRestockAlerts: raw.notifyRestockAlerts,
    notifyReviewRequests: raw.notifyReviewRequests,
  };
}

interface RawAdmin {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
  lastLogin: string | null;
}

function adaptAdmin(raw: RawAdmin): AdminSession {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    role: ADMIN_ROLE_TO_FE[raw.role] ?? "Support",
    active: raw.active,
    createdAt: raw.createdAt,
    lastLogin: raw.lastLogin ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

const ORDER_STATUS_TO_FE: Record<string, OrderStatus> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};
const ORDER_STATUS_TO_BE: Record<OrderStatus, string> = {
  Pending: "PENDING",
  Processing: "PROCESSING",
  Shipped: "SHIPPED",
  Delivered: "DELIVERED",
  Cancelled: "CANCELLED",
  Refunded: "REFUNDED",
};

const PAYMENT_METHOD_TO_BE: Record<string, string> = {
  card: "STRIPE",
  paystack: "PAYSTACK",
  flutterwave: "FLUTTERWAVE",
  paypal: "PAYPAL",
  "apple-pay": "APPLE_PAY",
  "google-pay": "GOOGLE_PAY",
  "bank-transfer": "BANK_TRANSFER",
  cod: "COD",
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  STRIPE: "Credit / Debit Card (Stripe)",
  PAYSTACK: "Paystack (Card, Bank Transfer, USSD)",
  FLUTTERWAVE: "Flutterwave (Mobile Money)",
  PAYPAL: "PayPal",
  APPLE_PAY: "Apple Pay",
  GOOGLE_PAY: "Google Pay",
  BANK_TRANSFER: "Bank Transfer (Manual Confirmation)",
  COD: "Cash on Delivery",
};

interface RawOrderItem {
  productId: string | null;
  productName: string;
  productSlug: string;
  image: string;
  variantSize: string;
  quantity: number;
  unitPrice: string | number;
}

interface RawTrackingEvent {
  status: string;
  note: string;
  createdAt: string;
}

interface RawOrder {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: string | number;
  shipping: string | number;
  tax: string | number;
  discount: string | number;
  total: string | number;
  trackingNumber: string | null;
  paymentMethod: string;
  shippingFullName: string;
  shippingLine1: string;
  shippingLine2: string | null;
  shippingCity: string;
  shippingState: string;
  shippingCountry: string;
  shippingPostalCode: string;
  shippingPhone: string;
  createdAt: string;
  items: RawOrderItem[];
  trackingEvents: RawTrackingEvent[];
}

function adaptOrder(raw: RawOrder): Order {
  return {
    id: raw.id,
    orderNumber: raw.orderNumber,
    date: raw.createdAt,
    status: ORDER_STATUS_TO_FE[raw.status] ?? "Pending",
    items: raw.items.map((i) => ({
      productId: i.productId ?? "",
      productName: i.productName,
      productSlug: i.productSlug,
      image: i.image,
      variantSize: i.variantSize,
      quantity: i.quantity,
      unitPrice: toNumber(i.unitPrice),
    })),
    subtotal: toNumber(raw.subtotal),
    shipping: toNumber(raw.shipping),
    tax: toNumber(raw.tax),
    discount: toNumber(raw.discount),
    total: toNumber(raw.total),
    trackingNumber: raw.trackingNumber ?? undefined,
    trackingEvents: raw.trackingEvents.map((e) => ({
      status: ORDER_STATUS_TO_FE[e.status] ?? "Pending",
      date: e.createdAt,
      note: e.note,
    })),
    shippingAddress: {
      fullName: raw.shippingFullName,
      line1: raw.shippingLine1,
      line2: raw.shippingLine2 ?? undefined,
      city: raw.shippingCity,
      state: raw.shippingState,
      country: raw.shippingCountry,
      postalCode: raw.shippingPostalCode,
      phone: raw.shippingPhone,
    },
    paymentMethod: PAYMENT_METHOD_LABEL[raw.paymentMethod] ?? raw.paymentMethod,
  };
}

export interface CreateOrderInput {
  items: { variantId: string; quantity: number }[];
  guestEmail?: string;
  shipFullName: string;
  shipLine1: string;
  shipLine2?: string;
  shipCity: string;
  shipState: string;
  shipCountry: string;
  shipPostalCode: string;
  shipPhone: string;
  paymentMethod: string;
  giftWrap?: boolean;
  giftMessage?: string;
  couponCode?: string;
}

function toCreateOrderPayload(input: CreateOrderInput) {
  return {
    ...input,
    paymentMethod: PAYMENT_METHOD_TO_BE[input.paymentMethod] ?? input.paymentMethod,
  };
}

// ---------------------------------------------------------------------------
// Coupons
// ---------------------------------------------------------------------------

const COUPON_TYPE_TO_FE: Record<string, CouponType> = {
  PERCENTAGE: "percentage",
  FIXED: "fixed",
  FREE_SHIPPING: "free-shipping",
};
const COUPON_TYPE_TO_BE: Record<CouponType, string> = {
  percentage: "PERCENTAGE",
  fixed: "FIXED",
  "free-shipping": "FREE_SHIPPING",
};

interface RawCoupon {
  code: string;
  type: string;
  value: string | number;
  description: string;
  minSubtotal: string | number | null;
  active: boolean;
  usageLimit: number | null;
  usageCount: number;
  expiresAt: string | null;
}

function adaptCoupon(raw: RawCoupon): Coupon {
  return {
    code: raw.code,
    type: COUPON_TYPE_TO_FE[raw.type] ?? "percentage",
    value: toNumber(raw.value),
    description: raw.description,
    minSubtotal: raw.minSubtotal === null ? undefined : toNumber(raw.minSubtotal),
    active: raw.active,
    usageLimit: raw.usageLimit ?? undefined,
    usageCount: raw.usageCount,
    expiresAt: raw.expiresAt ?? undefined,
  };
}

function toCouponPayload(coupon: Partial<Coupon>) {
  return {
    code: coupon.code,
    type: coupon.type ? COUPON_TYPE_TO_BE[coupon.type] : undefined,
    value: coupon.value,
    description: coupon.description,
    minSubtotal: coupon.minSubtotal,
    active: coupon.active,
    usageLimit: coupon.usageLimit,
    expiresAt: coupon.expiresAt,
  };
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

const REVIEW_STATUS_TO_FE: Record<string, ReviewStatus> = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};
const REVIEW_STATUS_TO_BE: Record<ReviewStatus, string> = {
  pending: "PENDING",
  approved: "APPROVED",
  rejected: "REJECTED",
};

interface RawReviewReply {
  author: string;
  content: string;
  createdAt: string;
}

interface RawReview {
  id: string;
  productId: string;
  author: string;
  rating: number;
  title: string;
  content: string;
  verified: boolean;
  status: string;
  createdAt: string;
  replies: RawReviewReply[];
}

function adaptReview(raw: RawReview): Review {
  return {
    id: raw.id,
    productId: raw.productId,
    author: raw.author,
    rating: raw.rating,
    title: raw.title,
    content: raw.content,
    date: raw.createdAt,
    verified: raw.verified,
    status: REVIEW_STATUS_TO_FE[raw.status] ?? "pending",
    replies: raw.replies.map((r) => ({ author: r.author, content: r.content, date: r.createdAt })),
  };
}

// ---------------------------------------------------------------------------
// Addresses
// ---------------------------------------------------------------------------

interface RawAddress {
  id: string;
  label: string;
  fullName: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
}

function adaptAddress(raw: RawAddress): Address {
  return {
    id: raw.id,
    label: raw.label,
    fullName: raw.fullName,
    line1: raw.line1,
    line2: raw.line2 ?? undefined,
    city: raw.city,
    state: raw.state,
    country: raw.country,
    postalCode: raw.postalCode,
    phone: raw.phone,
    isDefault: raw.isDefault,
  };
}

// ---------------------------------------------------------------------------
// Support Tickets
// ---------------------------------------------------------------------------

const TICKET_STATUS_TO_FE: Record<string, SupportTicket["status"]> = {
  OPEN: "Open",
  AWAITING_REPLY: "Awaiting Reply",
  RESOLVED: "Resolved",
};

interface RawTicketMessage {
  author: string;
  content: string;
  createdAt: string;
}

interface RawTicket {
  id: string;
  subject: string;
  category: string;
  status: string;
  createdAt: string;
  messages: RawTicketMessage[];
}

function adaptTicket(raw: RawTicket): SupportTicket {
  return {
    id: raw.id,
    subject: raw.subject,
    category: raw.category,
    status: TICKET_STATUS_TO_FE[raw.status] ?? "Open",
    createdAt: raw.createdAt,
    messages: raw.messages.map((m) => ({
      author: m.author === "SUPPORT" ? "support" : "customer",
      content: m.content,
      date: m.createdAt,
    })),
  };
}

// ---------------------------------------------------------------------------
// Rewards & Referrals
// ---------------------------------------------------------------------------

interface RawRewardTransaction {
  id: string;
  type: string;
  points: number;
  description: string;
  createdAt: string;
}

function adaptRewardTransaction(raw: RawRewardTransaction): RewardTransaction {
  return {
    id: raw.id,
    type: raw.type === "EARN" ? "earn" : "redeem",
    points: raw.points,
    description: raw.description,
    date: raw.createdAt,
  };
}

export interface ReferralEntry {
  name: string;
  joinedAt: string;
  status: string;
  reward: string;
}

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

interface RawBlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  category: string;
  author: string;
  image: string;
  published: boolean;
  publishAt: string;
}

function adaptBlogPost(raw: RawBlogPost): BlogPost {
  return {
    slug: raw.slug,
    title: raw.title,
    excerpt: raw.excerpt,
    content: raw.content,
    category: raw.category,
    author: raw.author,
    date: raw.publishAt,
    image: raw.image,
    published: raw.published,
  };
}

function toBlogPostPayload(post: Partial<BlogPost>) {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    author: post.author,
    image: post.image,
    published: post.published,
    publishAt: post.date,
  };
}

// ---------------------------------------------------------------------------
// Banners
// ---------------------------------------------------------------------------

const BANNER_PLACEMENT_TO_FE: Record<string, Banner["placement"]> = {
  HOMEPAGE_TOP: "homepage-top",
  HOMEPAGE_HERO: "homepage-hero",
  CAMPAIGN: "campaign",
};
const BANNER_PLACEMENT_TO_BE: Record<Banner["placement"], string> = {
  "homepage-top": "HOMEPAGE_TOP",
  "homepage-hero": "HOMEPAGE_HERO",
  campaign: "CAMPAIGN",
};

interface RawBanner {
  id: string;
  title: string;
  subtitle: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  active: boolean;
  placement: string;
}

function adaptBanner(raw: RawBanner): Banner {
  return {
    id: raw.id,
    title: raw.title,
    subtitle: raw.subtitle ?? undefined,
    ctaLabel: raw.ctaLabel ?? undefined,
    ctaHref: raw.ctaHref ?? undefined,
    active: raw.active,
    placement: BANNER_PLACEMENT_TO_FE[raw.placement] ?? "homepage-top",
  };
}

function toBannerPayload(banner: Partial<Banner>) {
  return {
    title: banner.title,
    subtitle: banner.subtitle,
    ctaLabel: banner.ctaLabel,
    ctaHref: banner.ctaHref,
    active: banner.active,
    placement: banner.placement ? BANNER_PLACEMENT_TO_BE[banner.placement] : undefined,
  };
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

interface RawSettings {
  siteName: string;
  supportEmail: string;
  supportPhone: string;
  maintenanceMode: boolean;
  taxRatePercent: string | number;
  flatShippingRate: string | number;
  freeShippingThreshold: string | number;
  codEnabled: boolean;
  bankTransferEnabled: boolean;
  stripeEnabled: boolean;
  paystackEnabled: boolean;
  flutterwaveEnabled: boolean;
  paypalEnabled: boolean;
  metaTitle: string;
  metaDescription: string;
}

function adaptSettings(raw: RawSettings): SiteSettings {
  return {
    siteName: raw.siteName,
    supportEmail: raw.supportEmail,
    supportPhone: raw.supportPhone,
    maintenanceMode: raw.maintenanceMode,
    taxRatePercent: toNumber(raw.taxRatePercent),
    flatShippingRate: toNumber(raw.flatShippingRate),
    freeShippingThreshold: toNumber(raw.freeShippingThreshold),
    codEnabled: raw.codEnabled,
    bankTransferEnabled: raw.bankTransferEnabled,
    stripeEnabled: raw.stripeEnabled,
    paystackEnabled: raw.paystackEnabled,
    flutterwaveEnabled: raw.flutterwaveEnabled,
    paypalEnabled: raw.paypalEnabled,
    metaTitle: raw.metaTitle,
    metaDescription: raw.metaDescription,
  };
}

// ---------------------------------------------------------------------------
// Admin Users
// ---------------------------------------------------------------------------

export interface CreateAdminUserInput {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
}

const ADMIN_ROLE_TO_BE: Record<AdminRole, string> = {
  "Super Admin": "SUPER_ADMIN",
  Admin: "ADMIN",
  Support: "SUPPORT",
  "Content Editor": "CONTENT_EDITOR",
};

// ---------------------------------------------------------------------------
// Audit Logs
// ---------------------------------------------------------------------------

const AUDIT_CATEGORY_TO_FE: Record<string, AuditLogEntry["category"]> = {
  PRODUCT: "Product",
  ORDER: "Order",
  COUPON: "Coupon",
  REVIEW: "Review",
  BLOG: "Blog",
  BANNER: "Banner",
  USER: "User",
  SETTINGS: "Settings",
  INVENTORY: "Inventory",
  CUSTOMER: "Customer",
};

interface RawAuditLog {
  id: string;
  actorName: string;
  action: string;
  target: string;
  category: string;
  createdAt: string;
}

function adaptAuditLog(raw: RawAuditLog): AuditLogEntry {
  return {
    id: raw.id,
    actor: raw.actorName,
    action: raw.action,
    target: raw.target,
    category: AUDIT_CATEGORY_TO_FE[raw.category] ?? "User",
    date: raw.createdAt,
  };
}

// ---------------------------------------------------------------------------
// Admin Customers
// ---------------------------------------------------------------------------

interface RawCustomer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  joinedAt: string;
  ordersCount: number;
  totalSpent: number;
  status: string;
  notes: string | null;
}

function adaptCustomer(raw: RawCustomer): Customer {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    phone: raw.phone ?? undefined,
    joinedAt: raw.joinedAt,
    ordersCount: raw.ordersCount,
    totalSpent: raw.totalSpent,
    status: raw.status === "SUSPENDED" ? "Suspended" : "Active",
    notes: raw.notes ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Public API surface
// ---------------------------------------------------------------------------

export const apiClient = {
  auth: {
    register: async (data: { firstName: string; lastName: string; email: string; password: string }) => {
      const raw = await http.post<{ user: RawUser; devVerificationToken?: string }>("/auth/register", data);
      return { user: adaptUser(raw.user), devVerificationToken: raw.devVerificationToken };
    },
    login: async (email: string, password: string) => {
      const raw = await http.post<{ user: RawUser }>("/auth/login", { email, password });
      return adaptUser(raw.user);
    },
    logout: async () => {
      await http.post("/auth/logout");
    },
    me: async () => {
      const raw = await http.get<RawUser>("/auth/me");
      return adaptUser(raw);
    },
    forgotPassword: async (email: string) =>
      http.post<{ message: string; devResetToken?: string }>("/auth/forgot-password", { email }),
    resetPassword: async (token: string, newPassword: string) =>
      http.post<{ message: string }>("/auth/reset-password", { token, newPassword }),
    verifyEmail: async (token: string) => http.post<{ message: string }>("/auth/verify-email", { token }),
    resendVerification: async (email: string) =>
      http.post<{ message: string }>("/auth/resend-verification", { email }),
    updateProfile: async (data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
    }) => {
      const raw = await http.patch<RawUser>("/auth/profile", data);
      return adaptUser(raw);
    },
    changePassword: async (currentPassword: string, newPassword: string) =>
      http.patch<{ message: string }>("/auth/password", { currentPassword, newPassword }),
    deleteAccount: async () => http.delete<{ message: string }>("/auth/account"),
  },
  adminAuth: {
    login: async (email: string, password: string) => {
      const raw = await http.post<{ admin: RawAdmin }>("/admin/auth/login", { email, password });
      return adaptAdmin(raw.admin);
    },
    logout: async () => {
      await http.post("/admin/auth/logout");
    },
    me: async () => {
      const raw = await http.get<RawAdmin>("/admin/auth/me");
      return adaptAdmin(raw);
    },
  },
  products: {
    list: async (): Promise<Product[]> => {
      const raw = await http.get<RawProduct[]>("/products");
      return raw.map(adaptProduct);
    },
    bySlug: async (slug: string): Promise<Product> => {
      const raw = await http.get<RawProduct>(`/products/${slug}`);
      return adaptProduct(raw);
    },
    create: async (product: Product): Promise<Product> => {
      const raw = await http.post<RawProduct>("/admin/products", toProductPayload(product));
      return adaptProduct(raw);
    },
    update: async (id: string, product: Product): Promise<Product> => {
      const raw = await http.patch<RawProduct>(`/admin/products/${id}`, toProductPayload(product));
      return adaptProduct(raw);
    },
    delete: async (id: string): Promise<void> => {
      await http.delete(`/admin/products/${id}`);
    },
    bulkDelete: async (ids: string[]): Promise<void> => {
      await http.post(`/admin/products/bulk-delete`, { ids });
    },
    adjustStock: async (productId: string, variantId: string, newStock: number, reason: string) => {
      await http.patch(`/admin/products/${productId}/variants/${variantId}/stock`, { newStock, reason });
    },
  },
  categories: {
    list: async (): Promise<Category[]> => http.get<Category[]>("/categories"),
    create: async (name: string, description?: string): Promise<Category> =>
      http.post<Category>("/admin/categories", { name, description }),
    update: async (id: string, patch: Partial<Category>): Promise<Category> =>
      http.patch<Category>(`/admin/categories/${id}`, patch),
    delete: async (id: string): Promise<void> => {
      await http.delete(`/admin/categories/${id}`);
    },
  },
  collections: {
    list: async (): Promise<CollectionMeta[]> => {
      const raw = await http.get<{ slug: string; name: string; description: string; heroImage: string }[]>(
        "/collections"
      );
      return raw.map(adaptCollection);
    },
    update: async (slug: CollectionSlug, patch: Partial<CollectionMeta>): Promise<CollectionMeta> => {
      const raw = await http.patch<{ slug: string; name: string; description: string; heroImage: string }>(
        `/admin/collections/${slug.toUpperCase()}`,
        { name: patch.name, description: patch.description, heroImage: patch.heroImage }
      );
      return adaptCollection(raw);
    },
  },
  inventory: {
    history: async () => {
      const raw = await http.get<RawInventoryHistoryEntry[]>("/admin/inventory/history");
      return raw.map(adaptInventoryHistory);
    },
  },
  orders: {
    create: async (input: CreateOrderInput): Promise<Order> => {
      const raw = await http.post<RawOrder>("/orders", toCreateOrderPayload(input));
      return adaptOrder(raw);
    },
    listMine: async (): Promise<Order[]> => {
      const raw = await http.get<RawOrder[]>("/orders");
      return raw.map(adaptOrder);
    },
    byNumber: async (orderNumber: string): Promise<Order> => {
      const raw = await http.get<RawOrder>(`/orders/${orderNumber}`);
      return adaptOrder(raw);
    },
  },
  adminOrders: {
    list: async (): Promise<Order[]> => {
      const raw = await http.get<RawOrder[]>("/admin/orders");
      return raw.map(adaptOrder);
    },
    byNumber: async (orderNumber: string): Promise<Order> => {
      const raw = await http.get<RawOrder>(`/admin/orders/${orderNumber}`);
      return adaptOrder(raw);
    },
    updateStatus: async (orderNumber: string, status: OrderStatus): Promise<Order> => {
      const raw = await http.patch<RawOrder>(`/admin/orders/${orderNumber}/status`, {
        status: ORDER_STATUS_TO_BE[status],
      });
      return adaptOrder(raw);
    },
    updateTracking: async (orderNumber: string, trackingNumber: string): Promise<Order> => {
      const raw = await http.patch<RawOrder>(`/admin/orders/${orderNumber}/tracking`, { trackingNumber });
      return adaptOrder(raw);
    },
  },
  coupons: {
    validate: async (
      code: string,
      subtotal: number
    ): Promise<{ valid: boolean; coupon?: Coupon; message: string }> => {
      const raw = await http.post<{ valid: boolean; coupon?: RawCoupon; message: string }>("/coupons/validate", {
        code,
        subtotal,
      });
      return { valid: raw.valid, coupon: raw.coupon ? adaptCoupon(raw.coupon) : undefined, message: raw.message };
    },
  },
  adminCoupons: {
    list: async (): Promise<Coupon[]> => {
      const raw = await http.get<RawCoupon[]>("/admin/coupons");
      return raw.map(adaptCoupon);
    },
    create: async (coupon: Coupon): Promise<Coupon> => {
      const raw = await http.post<RawCoupon>("/admin/coupons", toCouponPayload(coupon));
      return adaptCoupon(raw);
    },
    update: async (code: string, patch: Partial<Coupon>): Promise<Coupon> => {
      const raw = await http.patch<RawCoupon>(`/admin/coupons/${code}`, toCouponPayload(patch));
      return adaptCoupon(raw);
    },
    delete: async (code: string): Promise<void> => {
      await http.delete(`/admin/coupons/${code}`);
    },
  },
  reviews: {
    listApproved: async (): Promise<Review[]> => {
      const raw = await http.get<RawReview[]>("/reviews");
      return raw.map(adaptReview);
    },
    create: async (input: { productId: string; rating: number; title: string; content: string }): Promise<Review> => {
      const raw = await http.post<RawReview>("/reviews", input);
      return adaptReview(raw);
    },
  },
  adminReviews: {
    list: async (): Promise<Review[]> => {
      const raw = await http.get<RawReview[]>("/admin/reviews");
      return raw.map(adaptReview);
    },
    updateStatus: async (id: string, status: ReviewStatus): Promise<Review> => {
      const raw = await http.patch<RawReview>(`/admin/reviews/${id}/status`, { status: REVIEW_STATUS_TO_BE[status] });
      return adaptReview(raw);
    },
    reply: async (id: string, content: string): Promise<Review> => {
      const raw = await http.post<RawReview>(`/admin/reviews/${id}/reply`, { content });
      return adaptReview(raw);
    },
  },
  wishlist: {
    list: async (): Promise<string[]> => http.get<string[]>("/wishlist"),
    add: async (productId: string): Promise<string[]> => http.post<string[]>(`/wishlist/${productId}`),
    remove: async (productId: string): Promise<string[]> => http.delete<string[]>(`/wishlist/${productId}`),
  },
  addresses: {
    list: async (): Promise<Address[]> => {
      const raw = await http.get<RawAddress[]>("/addresses");
      return raw.map(adaptAddress);
    },
    create: async (input: Omit<Address, "id" | "isDefault">): Promise<Address> => {
      const raw = await http.post<RawAddress>("/addresses", input);
      return adaptAddress(raw);
    },
    update: async (id: string, patch: Partial<Address>): Promise<Address> => {
      const raw = await http.patch<RawAddress>(`/addresses/${id}`, patch);
      return adaptAddress(raw);
    },
    delete: async (id: string): Promise<void> => {
      await http.delete(`/addresses/${id}`);
    },
    setDefault: async (id: string): Promise<Address[]> => {
      const raw = await http.patch<RawAddress[]>(`/addresses/${id}/default`);
      return raw.map(adaptAddress);
    },
  },
  supportTickets: {
    list: async (): Promise<SupportTicket[]> => {
      const raw = await http.get<RawTicket[]>("/support-tickets");
      return raw.map(adaptTicket);
    },
    byId: async (id: string): Promise<SupportTicket> => {
      const raw = await http.get<RawTicket>(`/support-tickets/${id}`);
      return adaptTicket(raw);
    },
    create: async (input: { category: string; subject: string; message: string }): Promise<SupportTicket> => {
      const raw = await http.post<RawTicket>("/support-tickets", input);
      return adaptTicket(raw);
    },
    reply: async (id: string, content: string): Promise<SupportTicket> => {
      const raw = await http.post<RawTicket>(`/support-tickets/${id}/messages`, { content });
      return adaptTicket(raw);
    },
  },
  rewards: {
    transactions: async (): Promise<RewardTransaction[]> => {
      const raw = await http.get<RawRewardTransaction[]>("/rewards/transactions");
      return raw.map(adaptRewardTransaction);
    },
  },
  referrals: {
    list: async (): Promise<ReferralEntry[]> => http.get<ReferralEntry[]>("/referrals"),
  },
  notificationPreferences: {
    update: async (patch: Partial<NotificationPreferences>): Promise<User> => {
      const raw = await http.patch<RawUser>("/auth/notification-preferences", patch);
      return adaptUser(raw);
    },
  },
  blog: {
    list: async (): Promise<BlogPost[]> => {
      const raw = await http.get<RawBlogPost[]>("/blog");
      return raw.map(adaptBlogPost);
    },
    bySlug: async (slug: string): Promise<BlogPost> => {
      const raw = await http.get<RawBlogPost>(`/blog/${slug}`);
      return adaptBlogPost(raw);
    },
  },
  adminBlog: {
    list: async (): Promise<BlogPost[]> => {
      const raw = await http.get<RawBlogPost[]>("/admin/blog");
      return raw.map(adaptBlogPost);
    },
    create: async (post: BlogPost): Promise<BlogPost> => {
      const raw = await http.post<RawBlogPost>("/admin/blog", toBlogPostPayload(post));
      return adaptBlogPost(raw);
    },
    update: async (slug: string, post: BlogPost): Promise<BlogPost> => {
      const raw = await http.patch<RawBlogPost>(`/admin/blog/${slug}`, toBlogPostPayload(post));
      return adaptBlogPost(raw);
    },
    delete: async (slug: string): Promise<void> => {
      await http.delete(`/admin/blog/${slug}`);
    },
  },
  banners: {
    list: async (): Promise<Banner[]> => {
      const raw = await http.get<RawBanner[]>("/banners");
      return raw.map(adaptBanner);
    },
  },
  adminBanners: {
    create: async (banner: Banner): Promise<Banner> => {
      const raw = await http.post<RawBanner>("/admin/banners", toBannerPayload(banner));
      return adaptBanner(raw);
    },
    update: async (id: string, patch: Partial<Banner>): Promise<Banner> => {
      const raw = await http.patch<RawBanner>(`/admin/banners/${id}`, toBannerPayload(patch));
      return adaptBanner(raw);
    },
    toggleActive: async (id: string): Promise<Banner> => {
      const raw = await http.patch<RawBanner>(`/admin/banners/${id}/toggle`);
      return adaptBanner(raw);
    },
    delete: async (id: string): Promise<void> => {
      await http.delete(`/admin/banners/${id}`);
    },
  },
  settings: {
    get: async (): Promise<SiteSettings> => {
      const raw = await http.get<RawSettings>("/settings");
      return adaptSettings(raw);
    },
  },
  adminSettings: {
    update: async (patch: Partial<SiteSettings>, section: string): Promise<SiteSettings> => {
      const raw = await http.patch<RawSettings>(
        `/admin/settings?section=${encodeURIComponent(section)}`,
        patch
      );
      return adaptSettings(raw);
    },
  },
  newsletter: {
    subscribe: async (email: string): Promise<{ message: string }> =>
      http.post<{ message: string }>("/newsletter/subscribe", { email }),
  },
  adminUsers: {
    list: async (): Promise<AdminSession[]> => {
      const raw = await http.get<RawAdmin[]>("/admin/users");
      return raw.map(adaptAdmin);
    },
    create: async (input: CreateAdminUserInput): Promise<AdminSession> => {
      const raw = await http.post<RawAdmin>("/admin/users", { ...input, role: ADMIN_ROLE_TO_BE[input.role] });
      return adaptAdmin(raw);
    },
    updateRole: async (id: string, role: AdminRole): Promise<AdminSession> => {
      const raw = await http.patch<RawAdmin>(`/admin/users/${id}`, { role: ADMIN_ROLE_TO_BE[role] });
      return adaptAdmin(raw);
    },
    toggleActive: async (id: string): Promise<AdminSession> => {
      const raw = await http.patch<RawAdmin>(`/admin/users/${id}/toggle`);
      return adaptAdmin(raw);
    },
  },
  auditLogs: {
    list: async (): Promise<AuditLogEntry[]> => {
      const raw = await http.get<RawAuditLog[]>("/admin/audit-logs");
      return raw.map(adaptAuditLog);
    },
  },
  adminCustomers: {
    list: async (): Promise<Customer[]> => {
      const raw = await http.get<RawCustomer[]>("/admin/customers");
      return raw.map(adaptCustomer);
    },
    byId: async (id: string): Promise<Customer> => {
      const raw = await http.get<RawCustomer>(`/admin/customers/${id}`);
      return adaptCustomer(raw);
    },
    toggleStatus: async (id: string): Promise<Customer> => {
      const raw = await http.patch<RawCustomer>(`/admin/customers/${id}/status`);
      return adaptCustomer(raw);
    },
    updateNotes: async (id: string, notes: string): Promise<Customer> => {
      const raw = await http.patch<RawCustomer>(`/admin/customers/${id}/notes`, { notes });
      return adaptCustomer(raw);
    },
  },
  analytics: {
    overview: async (): Promise<AnalyticsOverview> => http.get<AnalyticsOverview>("/admin/analytics"),
  },
};

export interface AnalyticsDailyMetric {
  date: string;
  revenue: number;
  orders: number;
}

export interface AnalyticsTopProduct {
  productSlug: string;
  productName: string;
  unitsSold: number;
  revenue: number;
}

export interface AnalyticsOverview {
  dailyMetrics: AnalyticsDailyMetric[];
  topProducts: AnalyticsTopProduct[];
  totals: { revenue: number; orders: number };
  averageOrderValue: number;
  totalCustomers: number;
  revenueTrendVsPreviousPeriod: number;
  ordersTrendVsPreviousPeriod: number;
}
