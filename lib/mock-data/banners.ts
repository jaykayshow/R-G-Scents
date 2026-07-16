import { Banner } from "@/types";

export const banners: Banner[] = [
  {
    id: "ban-1",
    title: "Free Worldwide Shipping This Week",
    subtitle: "On all orders over $200 — no code needed.",
    ctaLabel: "Shop Now",
    ctaHref: "/shop",
    active: true,
    placement: "homepage-top",
  },
  {
    id: "ban-2",
    title: "Noir — Limited Edition Restocked",
    subtitle: "Our most intense fragrance is back, while supplies last.",
    ctaLabel: "Shop Noir",
    ctaHref: "/shop/noir",
    active: false,
    placement: "homepage-top",
  },
];
