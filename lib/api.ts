import { products, getProductBySlug, getRelatedProducts, getBestSellers } from "@/lib/mock-data/products";
import { reviews, getReviewsForProduct } from "@/lib/mock-data/reviews";
import { coupons, validateCouponAgainst, calculateDiscount } from "@/lib/mock-data/coupons";
import { orders, getOrderByNumber } from "@/lib/mock-data/orders";
import {
  testimonials,
  galleryPosts,
  mockUser,
  mockAddresses,
  mockSupportTickets,
  mockRewardTransactions,
  faqs,
} from "@/lib/mock-data/misc";

/**
 * Thin data-access layer. Every page/component reads through this module
 * instead of importing mock files directly, so swapping mocks for real
 * API/fetch calls later only requires editing this file.
 */
export const api = {
  products: {
    all: async () => products,
    bySlug: async (slug: string) => getProductBySlug(slug),
    related: async (slug: string, count = 4) => {
      const product = getProductBySlug(slug);
      return product ? getRelatedProducts(product, count) : [];
    },
    bestSellers: async (count = 5) => getBestSellers(count),
  },
  reviews: {
    forProduct: async (productId: string) => getReviewsForProduct(productId),
    all: async () => reviews,
  },
  coupons: {
    validate: async (code: string, subtotal: number) => validateCouponAgainst(coupons, code, subtotal),
    discountFor: (coupon: (typeof coupons)[number], subtotal: number, shipping: number) =>
      calculateDiscount(coupon, subtotal, shipping),
  },
  orders: {
    all: async () => orders,
    byNumber: async (orderNumber: string) => getOrderByNumber(orderNumber),
  },
  testimonials: {
    all: async () => testimonials,
  },
  gallery: {
    all: async () => galleryPosts,
  },
  user: {
    current: async () => mockUser,
  },
  addresses: {
    all: async () => mockAddresses,
  },
  support: {
    all: async () => mockSupportTickets,
  },
  rewards: {
    ledger: async () => mockRewardTransactions,
  },
  faqs: {
    all: async () => faqs,
  },
};
