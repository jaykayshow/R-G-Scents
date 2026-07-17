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
  { id: "g-1", image: "/products/legacy.png", caption: "Legacy, poured in gold light.", likes: 482 },
  { id: "g-2", image: "/products/noir.png", caption: "Noir after dark.", likes: 611 },
  { id: "g-3", image: "/products/royale.png", caption: "Royale — wear the crown.", likes: 356 },
  { id: "g-4", image: "/products/reserve.jpeg", caption: "Reserve, held back for a reason.", likes: 298 },
  { id: "g-5", image: "/products/elite.jpeg", caption: "Elite. For the inner circle.", likes: 402 },
  { id: "g-6", image: "/products/legacy.png", caption: "The Billionaire Collection, in full.", likes: 733 },
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
