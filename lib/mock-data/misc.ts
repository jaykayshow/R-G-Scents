import { Address, RewardTransaction, SupportTicket, User } from "@/types";

export interface Testimonial {
  id: string;
  name: string;
  rating: number;
  quote: string;
  location: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "t-1",
    name: "Adewale O.",
    rating: 5,
    quote:
      "R&G Scents doesn't just sell perfume — they sell presence. Legacy has become part of my identity.",
    location: "Lagos, Nigeria",
  },
  {
    id: "t-2",
    name: "James K.",
    rating: 5,
    quote: "The packaging alone feels like a Roja Parfums unboxing. The scent longevity backs it up completely.",
    location: "London, UK",
  },
  {
    id: "t-3",
    name: "Chidi E.",
    rating: 5,
    quote: "Royale got me more compliments in one evening than any designer fragrance I've owned.",
    location: "Abuja, Nigeria",
  },
  {
    id: "t-4",
    name: "Ronke A.",
    rating: 5,
    quote: "Elite is proof that R&G understands nuance, not just power. Beautifully balanced.",
    location: "Houston, USA",
  },
];

export interface GalleryPost {
  id: string;
  image: string;
  caption: string;
  likes: number;
}

export const galleryPosts: GalleryPost[] = [
  { id: "g-1", image: "/products/legacy.svg", caption: "Legacy, poured in gold light.", likes: 482 },
  { id: "g-2", image: "/products/noir.svg", caption: "Noir after dark.", likes: 611 },
  { id: "g-3", image: "/products/royale.svg", caption: "Royale — wear the crown.", likes: 356 },
  { id: "g-4", image: "/products/reserve.svg", caption: "Reserve, held back for a reason.", likes: 298 },
  { id: "g-5", image: "/products/elite.svg", caption: "Elite. For the inner circle.", likes: 402 },
  { id: "g-6", image: "/products/legacy.svg", caption: "The Billionaire Collection, in full.", likes: 733 },
];

export const mockUser: User = {
  id: "u-1",
  firstName: "Rita",
  lastName: "Green",
  email: "everhot247@gmail.com",
  phone: "+234 803 000 1122",
  emailVerified: true,
  createdAt: "2026-01-15",
  rewardPoints: 1280,
  referralCode: "RITAG-BILLION25",
};

export const mockAddresses: Address[] = [
  {
    id: "a-1",
    label: "Home",
    fullName: "Rita Green",
    line1: "14 Admiralty Way",
    line2: "Lekki Phase 1",
    city: "Lagos",
    state: "Lagos",
    country: "Nigeria",
    postalCode: "106104",
    phone: "+234 803 000 1122",
    isDefault: true,
  },
  {
    id: "a-2",
    label: "Office",
    fullName: "Rita Green",
    line1: "5 Banana Island Road",
    city: "Ikoyi",
    state: "Lagos",
    country: "Nigeria",
    postalCode: "101233",
    phone: "+234 803 000 1122",
    isDefault: false,
  },
];

export const mockSupportTickets: SupportTicket[] = [
  {
    id: "s-1",
    subject: "Question about longevity of Noir",
    category: "Product",
    status: "Resolved",
    createdAt: "2026-06-15",
    messages: [
      { author: "customer", content: "How long does Noir typically last on skin?", date: "2026-06-15" },
      {
        author: "support",
        content: "Noir is rated Eternal — most customers report 10-12 hours of wear with 2-3 sprays.",
        date: "2026-06-15",
      },
    ],
  },
  {
    id: "s-2",
    subject: "Order RG-100519 shipping delay",
    category: "Order",
    status: "Awaiting Reply",
    createdAt: "2026-07-12",
    messages: [
      { author: "customer", content: "My order shows shipped but tracking hasn't updated in 2 days.", date: "2026-07-12" },
      {
        author: "support",
        content: "Thanks for flagging — we've pinged the courier and will update you within 24 hours.",
        date: "2026-07-13",
      },
    ],
  },
];

export const mockRewardTransactions: RewardTransaction[] = [
  { id: "rw-1", type: "earn", points: 285, description: "Order RG-100234", date: "2026-07-01" },
  { id: "rw-2", type: "earn", points: 955, description: "Order RG-100519", date: "2026-07-10" },
  { id: "rw-3", type: "redeem", points: -200, description: "Redeemed for $10 off", date: "2026-07-11" },
  { id: "rw-4", type: "earn", points: 295, description: "Order RG-100822", date: "2026-07-14" },
];

export const faqs = [
  {
    question: "How long does shipping take?",
    answer:
      "Orders within Nigeria typically arrive within 2-4 business days. International orders arrive within 7-14 business days depending on destination.",
  },
  {
    question: "Are R&G Scents fragrances long-lasting?",
    answer:
      "Yes — every fragrance in The Billionaire Collection is formulated with a high concentration of premium oils for lasting projection, ranging from Moderate to Eternal depending on the scent.",
  },
  {
    question: "Do you offer gift wrapping?",
    answer: "Yes, gift wrapping is available as an option at checkout for all orders.",
  },
  {
    question: "What is your return policy?",
    answer:
      "Unopened, unused items may be returned within 14 days of delivery. Contact support to initiate a return.",
  },
];
