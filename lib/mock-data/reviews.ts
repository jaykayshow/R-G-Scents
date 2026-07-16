import { Review } from "@/types";

export const reviews: Review[] = [
  {
    id: "r-1",
    productId: "p-legacy",
    author: "Adewale O.",
    rating: 5,
    title: "This is a statement, not a fragrance",
    content:
      "Walked into a client meeting wearing this and got asked about it before we even sat down. Longevity is genuinely all-day. Worth every naira.",
    date: "2026-06-02",
    verified: true,
  },
  {
    id: "r-2",
    productId: "p-legacy",
    author: "James K.",
    rating: 5,
    title: "Boardroom approved",
    content: "Deep, smoky, and it doesn't scream for attention — it commands it. My new signature scent.",
    date: "2026-05-14",
    verified: true,
  },
  {
    id: "r-3",
    productId: "p-reserve",
    author: "Michael T.",
    rating: 4,
    title: "Elegant and understated",
    content: "Perfect for the office. Not overpowering, but people definitely notice it. Packaging feels genuinely premium.",
    date: "2026-04-28",
    verified: true,
  },
  {
    id: "r-4",
    productId: "p-royale",
    author: "Chidi E.",
    rating: 5,
    title: "Feels ceremonial",
    content: "Wore this to my introduction and it held up for 10+ hours. Compliments all night.",
    date: "2026-06-20",
    verified: true,
  },
  {
    id: "r-5",
    productId: "p-elite",
    author: "Ronke A.",
    rating: 5,
    title: "Bought for my husband, kept it for myself",
    content: "The rose and sandalwood combo is addictive. We now both wear it — genuinely unisex.",
    date: "2026-06-11",
    verified: true,
  },
  {
    id: "r-6",
    productId: "p-noir",
    author: "David S.",
    rating: 5,
    title: "Best night-out scent I own",
    content: "The espresso and oud combination is unreal. Limited edition means I bought two bottles just in case.",
    date: "2026-05-30",
    verified: true,
  },
  {
    id: "r-7",
    productId: "p-noir",
    author: "Tunde B.",
    rating: 4,
    title: "Intense but incredible",
    content: "Two sprays is plenty. This projects for hours. Not for the faint of heart.",
    date: "2026-06-08",
    verified: true,
  },
];

export function getReviewsForProduct(productId: string): Review[] {
  return reviews.filter((r) => r.productId === productId);
}
