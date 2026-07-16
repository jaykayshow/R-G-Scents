export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  category: string;
  author: string;
  date: string;
  image: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "art-of-fragrance-layering",
    title: "The Art of Fragrance Layering",
    excerpt: "How to combine scents from The Billionaire Collection for a signature that's entirely your own.",
    content: [
      "Layering fragrance is the closest thing to bespoke perfumery without commissioning a private blend. The idea is simple: apply a base fragrance to pulse points, then layer a complementary scent on top of clothing or hair for added depth.",
      "Try Legacy on the wrists with a light mist of Reserve on the collar — the amber and tonka bean create a warmth that lasts well into the evening without overwhelming a room.",
      "The rule of thumb: layer light over heavy, never heavy over light. Noir, our most intense composition, should always be the base note in any pairing.",
    ],
    category: "Fragrance Tips",
    author: "R&G Scents Editorial",
    date: "2026-06-01",
    image: "/products/legacy.png",
  },
  {
    slug: "power-dressing-and-scent",
    title: "Power Dressing Starts With Scent",
    excerpt: "Why the world's most commanding men choose their fragrance before their suit.",
    content: [
      "Presence is built long before you walk into a room. Scent is the first impression that arrives ahead of you and lingers after you've left — which is exactly why the men who understand power dressing start with fragrance, not fabric.",
      "Royale was engineered for exactly this moment: the handshake, the negotiation, the entrance. Its blue lotus and iris opening reads as confidence without arrogance.",
    ],
    category: "Lifestyle",
    author: "R&G Scents Editorial",
    date: "2026-05-12",
    image: "/products/royale.png",
  },
  {
    slug: "inside-the-billionaire-collection",
    title: "Inside The Billionaire Collection: Our Sourcing Philosophy",
    excerpt: "A look at the rare ingredients and craftsmanship behind every R&G Scents bottle.",
    content: [
      "Every fragrance in The Billionaire Collection begins with sourcing, not formulation. We work with the same oud distillers and amber traders that supply the world's most storied fragrance houses.",
      "This is not luxury as marketing — it's luxury as material fact. From the aged Cambodian oud in Noir to the Turkish rose absolute in Elite, every note is chosen for rarity and lasting power, not cost efficiency.",
    ],
    category: "Brand Story",
    author: "R&G Scents Editorial",
    date: "2026-04-22",
    image: "/products/noir.png",
  },
];

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((p) => p.slug === slug);
}
