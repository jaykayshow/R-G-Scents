import { Product } from "@/types";

export const products: Product[] = [
  {
    id: "p-legacy",
    slug: "legacy",
    name: "Legacy",
    collection: "legacy",
    tagline: "The mark you leave behind.",
    shortDescription:
      "A commanding blend of dark amber and smoked oud, built for the man who builds empires.",
    longDescription:
      "Legacy opens with a sharp, confident burst of bergamot and black pepper before settling into a heart of smoked oud and leather. The base is pure gravity: amber, dark woods, and a whisper of tobacco that lingers long after the room has emptied. This is the scent of decisions made in boardrooms and remembered for years.",
    gender: "Men",
    price: 285,
    compareAtPrice: 340,
    images: ["/products/legacy.svg"],
    notes: {
      top: ["Bergamot", "Black Pepper", "Cardamom"],
      middle: ["Smoked Oud", "Leather", "Saffron"],
      base: ["Amber", "Dark Woods", "Tobacco Leaf"],
    },
    longevity: "Eternal",
    projection: "Beast Mode",
    occasion: ["Evening", "Formal", "Boardroom"],
    season: ["Autumn", "Winter"],
    ingredients: [
      "Alcohol Denat.",
      "Parfum (Fragrance)",
      "Aqua",
      "Oud Extract",
      "Amber Accord",
      "Leather Accord",
    ],
    rating: 4.9,
    reviewCount: 214,
    salesCount: 1820,
    isNew: false,
    isLimitedEdition: false,
    createdAt: "2025-01-10",
    variants: [
      { id: "v-legacy-50", size: "50ml", sku: "RG-LEG-50", barcode: "6920100050", price: 285, stock: 42 },
      { id: "v-legacy-100", size: "100ml", sku: "RG-LEG-100", barcode: "6920100100", price: 410, stock: 27 },
    ],
    stock: 69,
  },
  {
    id: "p-reserve",
    slug: "reserve",
    name: "Reserve",
    collection: "reserve",
    tagline: "Held back for those who understand restraint.",
    shortDescription:
      "A refined vanilla-tonka composition wrapped in soft cashmere musk and golden spice.",
    longDescription:
      "Reserve is quiet confidence in a bottle. Cardamom and pink pepper open into a heart of tonka bean and iris, resting on a base of vanilla, cashmere musk, and sandalwood. Understated, warm, and unmistakably expensive — the fragrance equivalent of a well-cut suit.",
    gender: "Men",
    price: 265,
    images: ["/products/reserve.svg"],
    notes: {
      top: ["Pink Pepper", "Cardamom", "Bitter Orange"],
      middle: ["Tonka Bean", "Iris", "Cedarwood"],
      base: ["Vanilla", "Cashmere Musk", "Sandalwood"],
    },
    longevity: "Long Lasting",
    projection: "Moderate",
    occasion: ["Office", "Daytime", "Dinner"],
    season: ["Spring", "Autumn"],
    ingredients: [
      "Alcohol Denat.",
      "Parfum (Fragrance)",
      "Aqua",
      "Tonka Bean Absolute",
      "Vanilla Extract",
      "Musk Accord",
    ],
    rating: 4.7,
    reviewCount: 168,
    salesCount: 1340,
    isNew: false,
    isLimitedEdition: false,
    createdAt: "2025-02-18",
    variants: [
      { id: "v-reserve-50", size: "50ml", sku: "RG-RES-50", barcode: "6920200050", price: 265, stock: 55 },
      { id: "v-reserve-100", size: "100ml", sku: "RG-RES-100", barcode: "6920200100", price: 385, stock: 31 },
    ],
    stock: 86,
  },
  {
    id: "p-royale",
    slug: "royale",
    name: "Royale",
    collection: "royale",
    tagline: "Wear the crown.",
    shortDescription:
      "A regal citrus-aromatic opening over a heart of iris and blue lotus, finished in noble woods.",
    longDescription:
      "Royale is crisp authority — bergamot, bright neroli, and a sliver of blue lotus over an aromatic heart of iris and lavender. The base settles into vetiver, ambergris, and soft musk, giving it the polish of ceremony without ever feeling heavy. Built for the man who enters a room, not the one who waits to be noticed.",
    gender: "Men",
    price: 295,
    images: ["/products/royale.svg"],
    notes: {
      top: ["Bergamot", "Neroli", "Blue Lotus"],
      middle: ["Iris", "Lavender", "Violet Leaf"],
      base: ["Vetiver", "Ambergris", "White Musk"],
    },
    longevity: "Long Lasting",
    projection: "Strong",
    occasion: ["Formal", "Ceremony", "Evening"],
    season: ["Spring", "Summer"],
    ingredients: [
      "Alcohol Denat.",
      "Parfum (Fragrance)",
      "Aqua",
      "Iris Concrete",
      "Ambergris Accord",
      "Vetiver Oil",
    ],
    rating: 4.8,
    reviewCount: 189,
    salesCount: 1590,
    isNew: true,
    isLimitedEdition: false,
    createdAt: "2026-04-02",
    variants: [
      { id: "v-royale-50", size: "50ml", sku: "RG-ROY-50", barcode: "6920300050", price: 295, stock: 38 },
      { id: "v-royale-100", size: "100ml", sku: "RG-ROY-100", barcode: "6920300100", price: 420, stock: 19 },
    ],
    stock: 57,
  },
  {
    id: "p-elite",
    slug: "elite",
    name: "Elite",
    collection: "elite",
    tagline: "For the inner circle only.",
    shortDescription:
      "A luminous floral-fruit composition with rose, pink pepper, and creamy sandalwood.",
    longDescription:
      "Elite is the unexpected one — bright pink pepper and juicy fig lead into a heart of Turkish rose and jasmine sambac, before melting into creamy sandalwood and soft musk. Unisex by design, it's worn by those who don't need to follow the rules to belong at the table.",
    gender: "Unisex",
    price: 255,
    images: ["/products/elite.svg"],
    notes: {
      top: ["Pink Pepper", "Fig", "Mandarin"],
      middle: ["Turkish Rose", "Jasmine Sambac", "Peony"],
      base: ["Sandalwood", "White Musk", "Soft Amber"],
    },
    longevity: "Moderate",
    projection: "Moderate",
    occasion: ["Daytime", "Casual", "Dinner"],
    season: ["Spring", "Summer"],
    ingredients: [
      "Alcohol Denat.",
      "Parfum (Fragrance)",
      "Aqua",
      "Rose Absolute",
      "Jasmine Extract",
      "Sandalwood Oil",
    ],
    rating: 4.6,
    reviewCount: 121,
    salesCount: 980,
    isNew: true,
    isLimitedEdition: false,
    createdAt: "2026-05-20",
    variants: [
      { id: "v-elite-50", size: "50ml", sku: "RG-ELI-50", barcode: "6920400050", price: 255, stock: 47 },
      { id: "v-elite-100", size: "100ml", sku: "RG-ELI-100", barcode: "6920400100", price: 365, stock: 22 },
    ],
    stock: 69,
  },
  {
    id: "p-noir",
    slug: "noir",
    name: "Noir",
    collection: "noir",
    tagline: "Power dressed in shadow.",
    shortDescription:
      "A dark, smoky gourmand of espresso, dark chocolate, and incense for after-hours confidence.",
    longDescription:
      "Noir is a late-night fragrance for men who own the room after midnight. Espresso and dark cacao intertwine with a heart of incense and black leather, resting on a base of patchouli, oud, and dark musk. Intense, magnetic, and deliberately unforgettable.",
    gender: "Men",
    price: 310,
    images: ["/products/noir.svg"],
    notes: {
      top: ["Espresso", "Dark Cacao", "Pink Pepper"],
      middle: ["Incense", "Black Leather", "Clove"],
      base: ["Patchouli", "Dark Oud", "Black Musk"],
    },
    longevity: "Eternal",
    projection: "Beast Mode",
    occasion: ["Evening", "Nightlife", "Formal"],
    season: ["Autumn", "Winter"],
    ingredients: [
      "Alcohol Denat.",
      "Parfum (Fragrance)",
      "Aqua",
      "Oud Extract",
      "Patchouli Oil",
      "Incense Resin",
    ],
    rating: 4.9,
    reviewCount: 256,
    salesCount: 2010,
    isNew: false,
    isLimitedEdition: true,
    createdAt: "2024-11-05",
    variants: [
      { id: "v-noir-50", size: "50ml", sku: "RG-NOI-50", barcode: "6920500050", price: 310, stock: 21 },
      { id: "v-noir-100", size: "100ml", sku: "RG-NOI-100", barcode: "6920500100", price: 445, stock: 12 },
    ],
    stock: 33,
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getRelatedProducts(product: Product, count = 4): Product[] {
  return products.filter((p) => p.id !== product.id).slice(0, count);
}

export function getBestSellers(count = 5): Product[] {
  return [...products].sort((a, b) => b.salesCount - a.salesCount).slice(0, count);
}
