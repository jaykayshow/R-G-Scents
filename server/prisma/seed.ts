import { PrismaClient, AdminRole, CollectionSlug, Gender, Longevity, Projection, OrderStatus, PaymentMethod, ReviewStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

async function hash(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// ---------------------------------------------------------------------------
// Roles & Permissions
// ---------------------------------------------------------------------------

const NAV_SECTIONS: { key: string; label: string; roles: AdminRole[] }[] = [
  { key: "dashboard", label: "Dashboard", roles: ["SUPER_ADMIN", "ADMIN", "SUPPORT", "CONTENT_EDITOR"] },
  { key: "products", label: "Products", roles: ["SUPER_ADMIN", "ADMIN"] },
  { key: "inventory", label: "Inventory", roles: ["SUPER_ADMIN", "ADMIN"] },
  { key: "orders", label: "Orders", roles: ["SUPER_ADMIN", "ADMIN", "SUPPORT"] },
  { key: "customers", label: "Customers", roles: ["SUPER_ADMIN", "ADMIN", "SUPPORT"] },
  { key: "coupons", label: "Coupons", roles: ["SUPER_ADMIN", "ADMIN"] },
  { key: "collections", label: "Collections", roles: ["SUPER_ADMIN", "ADMIN", "CONTENT_EDITOR"] },
  { key: "categories", label: "Categories", roles: ["SUPER_ADMIN", "ADMIN", "CONTENT_EDITOR"] },
  { key: "reviews", label: "Reviews", roles: ["SUPER_ADMIN", "ADMIN", "SUPPORT", "CONTENT_EDITOR"] },
  { key: "blog", label: "Blog", roles: ["SUPER_ADMIN", "ADMIN", "CONTENT_EDITOR"] },
  { key: "banners", label: "Banners", roles: ["SUPER_ADMIN", "ADMIN", "CONTENT_EDITOR"] },
  { key: "analytics", label: "Analytics", roles: ["SUPER_ADMIN", "ADMIN"] },
  { key: "logs", label: "System Logs", roles: ["SUPER_ADMIN", "ADMIN"] },
  { key: "users", label: "Admin Users", roles: ["SUPER_ADMIN"] },
  { key: "settings", label: "Settings", roles: ["SUPER_ADMIN"] },
];

async function seedRolesAndPermissions() {
  const permissions = await Promise.all(
    NAV_SECTIONS.map((section) =>
      prisma.permission.upsert({
        where: { key: section.key },
        update: { label: section.label },
        create: { key: section.key, label: section.label },
      })
    )
  );

  const roles: Record<AdminRole, { id: string }> = {} as never;
  for (const roleName of ["SUPER_ADMIN", "ADMIN", "SUPPORT", "CONTENT_EDITOR"] as AdminRole[]) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
    roles[roleName] = role;

    const allowedPermissionIds = permissions
      .filter((_, i) => NAV_SECTIONS[i].roles.includes(roleName))
      .map((p) => p.id);

    for (const permissionId of allowedPermissionIds) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId } },
        update: {},
        create: { roleId: role.id, permissionId },
      });
    }
  }

  return roles;
}

async function seedAdminUsers(roles: Record<AdminRole, { id: string }>) {
  const admins = [
    { name: "Rita Green", email: "superadmin@rgscents.com", password: "Billionaire123!", role: "SUPER_ADMIN" as AdminRole },
    { name: "Tobi Adeyemi", email: "admin@rgscents.com", password: "Admin123!", role: "ADMIN" as AdminRole },
    { name: "Ngozi Bello", email: "support@rgscents.com", password: "Support123!", role: "SUPPORT" as AdminRole },
    { name: "Kunle Bassey", email: "editor@rgscents.com", password: "Editor123!", role: "CONTENT_EDITOR" as AdminRole },
  ];

  const created: Record<string, { id: string }> = {};
  for (const admin of admins) {
    const record = await prisma.adminUser.upsert({
      where: { email: admin.email },
      update: {},
      create: {
        name: admin.name,
        email: admin.email,
        passwordHash: await hash(admin.password),
        roleId: roles[admin.role].id,
        active: true,
      },
    });
    created[admin.email] = record;
  }
  return created;
}

// ---------------------------------------------------------------------------
// Collections & Categories
// ---------------------------------------------------------------------------

async function seedCollections() {
  const collections: { slug: CollectionSlug; name: string; description: string; heroImage: string }[] = [
    {
      slug: "LEGACY",
      name: "Legacy",
      description: "The mark you leave behind — dark amber and smoked oud for men who build empires.",
      heroImage: "/products/legacy.png",
    },
    {
      slug: "RESERVE",
      name: "Reserve",
      description: "Held back for those who understand restraint — refined vanilla-tonka warmth.",
      heroImage: "/products/reserve.jpeg",
    },
    {
      slug: "ROYALE",
      name: "Royale",
      description: "Wear the crown — regal citrus-aromatic power dressing in a bottle.",
      heroImage: "/products/royale.png",
    },
    {
      slug: "ELITE",
      name: "Elite",
      description: "For the inner circle only — a luminous, unisex floral-fruit composition.",
      heroImage: "/products/elite.jpeg",
    },
    {
      slug: "NOIR",
      name: "Noir",
      description: "Power dressed in shadow — a dark gourmand for after-hours confidence.",
      heroImage: "/products/noir.png",
    },
  ];

  for (const c of collections) {
    await prisma.collection.upsert({ where: { slug: c.slug }, update: c, create: c });
  }
}

async function seedCategories() {
  const categories = [
    { name: "For Him", slug: "for-him", description: "Masculine-leaning fragrances." },
    { name: "For Her", slug: "for-her", description: "Feminine-leaning fragrances." },
    { name: "Unisex", slug: "unisex", description: "Gender-neutral compositions." },
    { name: "Limited Editions", slug: "limited-editions", description: "Rare, limited-run drops." },
    { name: "Gift Sets", slug: "gift-sets", description: "Curated bundles for gifting." },
    { name: "New Arrivals", slug: "new-arrivals", description: "Recently launched fragrances." },
  ];

  for (const c of categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: c, create: c });
  }
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

interface SeedProduct {
  slug: string;
  name: string;
  collectionSlug: CollectionSlug;
  tagline: string;
  shortDescription: string;
  longDescription: string;
  gender: Gender;
  price: number;
  compareAtPrice?: number;
  images: string[];
  notesTop: string[];
  notesMiddle: string[];
  notesBase: string[];
  longevity: Longevity;
  projection: Projection;
  occasion: string[];
  season: string[];
  ingredients: string[];
  rating: number;
  reviewCount: number;
  salesCount: number;
  isNew: boolean;
  isLimitedEdition: boolean;
  createdAt: Date;
  variants: { size: string; sku: string; barcode: string; price: number; stock: number }[];
}

const SEED_PRODUCTS: SeedProduct[] = [
  {
    slug: "legacy",
    name: "Legacy",
    collectionSlug: "LEGACY",
    tagline: "The mark you leave behind.",
    shortDescription: "A commanding blend of dark amber and smoked oud, built for the man who builds empires.",
    longDescription:
      "Legacy opens with a sharp, confident burst of bergamot and black pepper before settling into a heart of smoked oud and leather. The base is pure gravity: amber, dark woods, and a whisper of tobacco that lingers long after the room has emptied. This is the scent of decisions made in boardrooms and remembered for years.",
    gender: "MEN",
    price: 430000,
    compareAtPrice: 510000,
    images: ["/products/legacy.png"],
    notesTop: ["Bergamot", "Black Pepper", "Cardamom"],
    notesMiddle: ["Smoked Oud", "Leather", "Saffron"],
    notesBase: ["Amber", "Dark Woods", "Tobacco Leaf"],
    longevity: "ETERNAL",
    projection: "BEAST_MODE",
    occasion: ["Evening", "Formal", "Boardroom"],
    season: ["Autumn", "Winter"],
    ingredients: ["Alcohol Denat.", "Parfum (Fragrance)", "Aqua", "Oud Extract", "Amber Accord", "Leather Accord"],
    rating: 4.9,
    reviewCount: 214,
    salesCount: 1820,
    isNew: false,
    isLimitedEdition: false,
    createdAt: new Date("2025-01-10"),
    variants: [
      { size: "50ml", sku: "RG-LEG-50", barcode: "6920100050", price: 430000, stock: 42 },
      { size: "100ml", sku: "RG-LEG-100", barcode: "6920100100", price: 615000, stock: 27 },
    ],
  },
  {
    slug: "reserve",
    name: "Reserve",
    collectionSlug: "RESERVE",
    tagline: "Held back for those who understand restraint.",
    shortDescription: "A refined vanilla-tonka composition wrapped in soft cashmere musk and golden spice.",
    longDescription:
      "Reserve is quiet confidence in a bottle. Cardamom and pink pepper open into a heart of tonka bean and iris, resting on a base of vanilla, cashmere musk, and sandalwood. Understated, warm, and unmistakably expensive — the fragrance equivalent of a well-cut suit.",
    gender: "MEN",
    price: 400000,
    images: ["/products/reserve.jpeg"],
    notesTop: ["Pink Pepper", "Cardamom", "Bitter Orange"],
    notesMiddle: ["Tonka Bean", "Iris", "Cedarwood"],
    notesBase: ["Vanilla", "Cashmere Musk", "Sandalwood"],
    longevity: "LONG_LASTING",
    projection: "MODERATE",
    occasion: ["Office", "Daytime", "Dinner"],
    season: ["Spring", "Autumn"],
    ingredients: ["Alcohol Denat.", "Parfum (Fragrance)", "Aqua", "Tonka Bean Absolute", "Vanilla Extract", "Musk Accord"],
    rating: 4.7,
    reviewCount: 168,
    salesCount: 1340,
    isNew: false,
    isLimitedEdition: false,
    createdAt: new Date("2025-02-18"),
    variants: [
      { size: "50ml", sku: "RG-RES-50", barcode: "6920200050", price: 400000, stock: 55 },
      { size: "100ml", sku: "RG-RES-100", barcode: "6920200100", price: 580000, stock: 31 },
    ],
  },
  {
    slug: "royale",
    name: "Royale",
    collectionSlug: "ROYALE",
    tagline: "Wear the crown.",
    shortDescription: "A regal citrus-aromatic opening over a heart of iris and blue lotus, finished in noble woods.",
    longDescription:
      "Royale is crisp authority — bergamot, bright neroli, and a sliver of blue lotus over an aromatic heart of iris and lavender. The base settles into vetiver, ambergris, and soft musk, giving it the polish of ceremony without ever feeling heavy. Built for the man who enters a room, not the one who waits to be noticed.",
    gender: "MEN",
    price: 445000,
    images: ["/products/royale.png"],
    notesTop: ["Bergamot", "Neroli", "Blue Lotus"],
    notesMiddle: ["Iris", "Lavender", "Violet Leaf"],
    notesBase: ["Vetiver", "Ambergris", "White Musk"],
    longevity: "LONG_LASTING",
    projection: "STRONG",
    occasion: ["Formal", "Ceremony", "Evening"],
    season: ["Spring", "Summer"],
    ingredients: ["Alcohol Denat.", "Parfum (Fragrance)", "Aqua", "Iris Concrete", "Ambergris Accord", "Vetiver Oil"],
    rating: 4.8,
    reviewCount: 189,
    salesCount: 1590,
    isNew: true,
    isLimitedEdition: false,
    createdAt: new Date("2026-04-02"),
    variants: [
      { size: "50ml", sku: "RG-ROY-50", barcode: "6920300050", price: 445000, stock: 38 },
      { size: "100ml", sku: "RG-ROY-100", barcode: "6920300100", price: 630000, stock: 19 },
    ],
  },
  {
    slug: "elite",
    name: "Elite",
    collectionSlug: "ELITE",
    tagline: "For the inner circle only.",
    shortDescription: "A luminous floral-fruit composition with rose, pink pepper, and creamy sandalwood.",
    longDescription:
      "Elite is the unexpected one — bright pink pepper and juicy fig lead into a heart of Turkish rose and jasmine sambac, before melting into creamy sandalwood and soft musk. Unisex by design, it's worn by those who don't need to follow the rules to belong at the table.",
    gender: "UNISEX",
    price: 385000,
    images: ["/products/elite.jpeg"],
    notesTop: ["Pink Pepper", "Fig", "Mandarin"],
    notesMiddle: ["Turkish Rose", "Jasmine Sambac", "Peony"],
    notesBase: ["Sandalwood", "White Musk", "Soft Amber"],
    longevity: "MODERATE",
    projection: "MODERATE",
    occasion: ["Daytime", "Casual", "Dinner"],
    season: ["Spring", "Summer"],
    ingredients: ["Alcohol Denat.", "Parfum (Fragrance)", "Aqua", "Rose Absolute", "Jasmine Extract", "Sandalwood Oil"],
    rating: 4.6,
    reviewCount: 121,
    salesCount: 980,
    isNew: true,
    isLimitedEdition: false,
    createdAt: new Date("2026-05-20"),
    variants: [
      { size: "50ml", sku: "RG-ELI-50", barcode: "6920400050", price: 385000, stock: 47 },
      { size: "100ml", sku: "RG-ELI-100", barcode: "6920400100", price: 550000, stock: 22 },
    ],
  },
  {
    slug: "noir",
    name: "Noir",
    collectionSlug: "NOIR",
    tagline: "Power dressed in shadow.",
    shortDescription: "A dark, smoky gourmand of espresso, dark chocolate, and incense for after-hours confidence.",
    longDescription:
      "Noir is a late-night fragrance for men who own the room after midnight. Espresso and dark cacao intertwine with a heart of incense and black leather, resting on a base of patchouli, oud, and dark musk. Intense, magnetic, and deliberately unforgettable.",
    gender: "MEN",
    price: 465000,
    images: ["/products/noir.png"],
    notesTop: ["Espresso", "Dark Cacao", "Pink Pepper"],
    notesMiddle: ["Incense", "Black Leather", "Clove"],
    notesBase: ["Patchouli", "Dark Oud", "Black Musk"],
    longevity: "ETERNAL",
    projection: "BEAST_MODE",
    occasion: ["Evening", "Nightlife", "Formal"],
    season: ["Autumn", "Winter"],
    ingredients: ["Alcohol Denat.", "Parfum (Fragrance)", "Aqua", "Oud Extract", "Patchouli Oil", "Incense Resin"],
    rating: 4.9,
    reviewCount: 256,
    salesCount: 2010,
    isNew: false,
    isLimitedEdition: true,
    createdAt: new Date("2024-11-05"),
    variants: [
      { size: "50ml", sku: "RG-NOI-50", barcode: "6920500050", price: 465000, stock: 21 },
      { size: "100ml", sku: "RG-NOI-100", barcode: "6920500100", price: 670000, stock: 12 },
    ],
  },
];

async function seedProducts() {
  const products: Record<string, { id: string; variants: { id: string; size: string }[] }> = {};

  for (const p of SEED_PRODUCTS) {
    const { variants, ...productData } = p;
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: productData,
    });

    const createdVariants = [];
    for (const v of variants) {
      const variant = await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {},
        create: { ...v, productId: product.id },
      });
      createdVariants.push(variant);
    }

    products[p.slug] = { id: product.id, variants: createdVariants };
  }

  return products;
}

// ---------------------------------------------------------------------------
// Coupons
// ---------------------------------------------------------------------------

async function seedCoupons() {
  const coupons = [
    { code: "BILLIONAIRE10", type: "PERCENTAGE" as const, value: 10, description: "10% off your order", active: true, usageCount: 142 },
    { code: "WELCOME20", type: "PERCENTAGE" as const, value: 20, description: "20% off your first order", minSubtotal: 150000, active: true, usageCount: 89, usageLimit: 500 },
    { code: "FREESHIP", type: "FREE_SHIPPING" as const, value: 0, description: "Free shipping on this order", active: true, usageCount: 211 },
    { code: "LEGACY50", type: "FIXED" as const, value: 75000, description: "₦75,000 off orders over ₦375,000", minSubtotal: 375000, active: true, usageCount: 34, usageLimit: 100 },
    { code: "SUMMER25", type: "PERCENTAGE" as const, value: 25, description: "Summer promo — expired", active: false, usageCount: 78, expiresAt: new Date("2026-06-30") },
  ];

  for (const c of coupons) {
    await prisma.coupon.upsert({ where: { code: c.code }, update: {}, create: c });
  }
}

// ---------------------------------------------------------------------------
// Blog, Banners, Settings
// ---------------------------------------------------------------------------

async function seedBlog() {
  const posts = [
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
      image: "/products/legacy.png",
      published: true,
      publishAt: new Date("2026-06-01"),
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
      image: "/products/royale.png",
      published: true,
      publishAt: new Date("2026-05-12"),
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
      image: "/products/noir.png",
      published: true,
      publishAt: new Date("2026-04-22"),
    },
  ];

  for (const post of posts) {
    await prisma.blogPost.upsert({ where: { slug: post.slug }, update: {}, create: post });
  }
}

async function seedBanners() {
  const banners = [
    {
      title: "Free Worldwide Shipping This Week",
      subtitle: "On all orders over ₦300,000 — no code needed.",
      ctaLabel: "Shop Now",
      ctaHref: "/shop",
      active: true,
      placement: "HOMEPAGE_TOP" as const,
    },
    {
      title: "Noir — Limited Edition Restocked",
      subtitle: "Our most intense fragrance is back, while supplies last.",
      ctaLabel: "Shop Noir",
      ctaHref: "/shop/noir",
      active: false,
      placement: "HOMEPAGE_TOP" as const,
    },
  ];

  for (const banner of banners) {
    const existing = await prisma.banner.findFirst({ where: { title: banner.title } });
    if (!existing) {
      await prisma.banner.create({ data: banner });
    }
  }
}

async function seedSettings() {
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      siteName: "R&G Scents",
      supportEmail: "concierge@rgscents.com",
      supportPhone: "+234 803 000 1122",
      maintenanceMode: false,
      taxRatePercent: 5,
      flatShippingRate: 22500,
      freeShippingThreshold: 300000,
      codEnabled: true,
      bankTransferEnabled: true,
      stripeEnabled: true,
      paystackEnabled: true,
      flutterwaveEnabled: true,
      paypalEnabled: true,
      metaTitle: "R&G Scents | The Billionaire Collection",
      metaDescription:
        "Luxury is not worn. It is remembered. Discover The Billionaire Collection by R&G Scents — timeless fragrances crafted for men who leave a legacy.",
    },
  });
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

async function seedReviews(products: Record<string, { id: string }>) {
  const reviews: {
    productSlug: string;
    author: string;
    rating: number;
    title: string;
    content: string;
    date: Date;
    verified: boolean;
    status: ReviewStatus;
  }[] = [
    { productSlug: "legacy", author: "Adewale O.", rating: 5, title: "This is a statement, not a fragrance", content: "Walked into a client meeting wearing this and got asked about it before we even sat down. Longevity is genuinely all-day. Worth every naira.", date: new Date("2026-06-02"), verified: true, status: "APPROVED" },
    { productSlug: "legacy", author: "James K.", rating: 5, title: "Boardroom approved", content: "Deep, smoky, and it doesn't scream for attention — it commands it. My new signature scent.", date: new Date("2026-05-14"), verified: true, status: "APPROVED" },
    { productSlug: "reserve", author: "Michael T.", rating: 4, title: "Elegant and understated", content: "Perfect for the office. Not overpowering, but people definitely notice it. Packaging feels genuinely premium.", date: new Date("2026-04-28"), verified: true, status: "APPROVED" },
    { productSlug: "royale", author: "Chidi E.", rating: 5, title: "Feels ceremonial", content: "Wore this to my introduction and it held up for 10+ hours. Compliments all night.", date: new Date("2026-06-20"), verified: true, status: "APPROVED" },
    { productSlug: "elite", author: "Ronke A.", rating: 5, title: "Bought for my husband, kept it for myself", content: "The rose and sandalwood combo is addictive. We now both wear it — genuinely unisex.", date: new Date("2026-06-11"), verified: true, status: "APPROVED" },
    { productSlug: "noir", author: "David S.", rating: 5, title: "Best night-out scent I own", content: "The espresso and oud combination is unreal. Limited edition means I bought two bottles just in case.", date: new Date("2026-05-30"), verified: true, status: "APPROVED" },
    { productSlug: "noir", author: "Tunde B.", rating: 4, title: "Intense but incredible", content: "Two sprays is plenty. This projects for hours. Not for the faint of heart.", date: new Date("2026-06-08"), verified: true, status: "APPROVED" },
    { productSlug: "noir", author: "Femi A.", rating: 3, title: "Good but overpriced?", content: "It's a nice scent but I'm not sure it justifies the price tag compared to niche alternatives.", date: new Date("2026-07-10"), verified: true, status: "PENDING" },
    { productSlug: "reserve", author: "Anonymous123", rating: 1, title: "buy my product instead", content: "check out my website for cheaper perfume alternatives, link in bio!!!", date: new Date("2026-07-12"), verified: false, status: "PENDING" },
  ];

  for (const r of reviews) {
    const existing = await prisma.review.findFirst({ where: { author: r.author, title: r.title } });
    if (!existing) {
      await prisma.review.create({
        data: {
          productId: products[r.productSlug].id,
          author: r.author,
          rating: r.rating,
          title: r.title,
          content: r.content,
          verified: r.verified,
          status: r.status,
          createdAt: r.date,
        },
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Inventory history
// ---------------------------------------------------------------------------

async function seedInventoryHistory(
  products: Record<string, { id: string; variants: { id: string; size: string }[] }>,
  adminUsers: Record<string, { id: string }>
) {
  const noirVariant50 = products.noir.variants.find((v) => v.size === "50ml")!;
  const noirVariant100 = products.noir.variants.find((v) => v.size === "100ml")!;
  const royaleVariant100 = products.royale.variants.find((v) => v.size === "100ml")!;

  const entries = [
    { productId: products.noir.id, variantId: noirVariant50.id, change: -12, previousStock: 33, newStock: 21, reason: "Sale fulfillment", actorId: null, createdAt: new Date("2026-07-10T10:00:00Z") },
    { productId: products.noir.id, variantId: noirVariant100.id, change: 12, previousStock: 0, newStock: 12, reason: "Restock from supplier", actorId: adminUsers["superadmin@rgscents.com"].id, createdAt: new Date("2026-07-14T09:12:00Z") },
    { productId: products.royale.id, variantId: royaleVariant100.id, change: -8, previousStock: 27, newStock: 19, reason: "Sale fulfillment", actorId: null, createdAt: new Date("2026-07-11T15:30:00Z") },
  ];

  for (const entry of entries) {
    const existing = await prisma.inventoryHistory.findFirst({
      where: { variantId: entry.variantId, createdAt: entry.createdAt },
    });
    if (!existing) {
      await prisma.inventoryHistory.create({ data: entry });
    }
  }
}

// ---------------------------------------------------------------------------
// Audit logs
// ---------------------------------------------------------------------------

async function seedAuditLogs(adminUsers: Record<string, { id: string }>) {
  const entries = [
    { actorId: adminUsers["superadmin@rgscents.com"].id, actorName: "Rita Green", action: "Updated stock", target: "Noir — 50ml (RG-NOI-50)", category: "INVENTORY" as const, createdAt: new Date("2026-07-14T09:12:00Z") },
    { actorId: adminUsers["admin@rgscents.com"].id, actorName: "Tobi Adeyemi", action: "Changed order status to Shipped", target: "RG-100519", category: "ORDER" as const, createdAt: new Date("2026-07-12T14:30:00Z") },
    { actorId: adminUsers["editor@rgscents.com"].id, actorName: "Kunle Bassey", action: "Published blog post", target: "Inside The Billionaire Collection: Our Sourcing Philosophy", category: "BLOG" as const, createdAt: new Date("2026-07-10T11:05:00Z") },
    { actorId: adminUsers["support@rgscents.com"].id, actorName: "Ngozi Bello", action: "Approved review", target: "Review by Adewale O. on Legacy", category: "REVIEW" as const, createdAt: new Date("2026-07-09T16:45:00Z") },
    { actorId: adminUsers["superadmin@rgscents.com"].id, actorName: "Rita Green", action: "Created coupon", target: "WELCOME20", category: "COUPON" as const, createdAt: new Date("2026-06-28T08:20:00Z") },
  ];

  for (const entry of entries) {
    const existing = await prisma.auditLog.findFirst({ where: { target: entry.target, action: entry.action } });
    if (!existing) {
      await prisma.auditLog.create({ data: entry });
    }
  }
}

// ---------------------------------------------------------------------------
// Demo customer + orders/reviews/wishlist/support/rewards
// ---------------------------------------------------------------------------

async function seedDemoCustomer(products: Record<string, { id: string; variants: { id: string; size: string; price?: number }[] }>) {
  const user = await prisma.user.upsert({
    where: { email: "everhot247@gmail.com" },
    update: {},
    create: {
      firstName: "Rita",
      lastName: "Green",
      email: "everhot247@gmail.com",
      passwordHash: await hash("Billionaire123!"),
      phone: "+234 803 000 1122",
      emailVerified: true,
      rewardPoints: 1280,
      referralCode: "RITAG-BILLION25",
      createdAt: new Date("2026-01-15"),
    },
  });

  // Addresses
  const existingAddresses = await prisma.address.findMany({ where: { userId: user.id } });
  if (existingAddresses.length === 0) {
    await prisma.address.createMany({
      data: [
        {
          userId: user.id,
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
          userId: user.id,
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
      ],
    });
  }

  const shippingAddress = {
    shippingFullName: "Rita Green",
    shippingLine1: "14 Admiralty Way",
    shippingLine2: "Lekki Phase 1",
    shippingCity: "Lagos",
    shippingState: "Lagos",
    shippingCountry: "Nigeria",
    shippingPostalCode: "106104",
    shippingPhone: "+234 803 000 1122",
  };

  // Orders
  const orderDefs: {
    orderNumber: string;
    date: Date;
    status: OrderStatus;
    items: { productSlug: string; size: string; quantity: number; unitPrice: number }[];
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
    trackingNumber?: string;
    paymentMethod: PaymentMethod;
    events: { status: OrderStatus; note: string; date: Date }[];
  }[] = [
    {
      orderNumber: "RG-100234",
      date: new Date("2026-07-01"),
      status: "DELIVERED",
      items: [{ productSlug: "legacy", size: "50ml", quantity: 1, unitPrice: 285 }],
      subtotal: 285,
      shipping: 15,
      tax: 14.25,
      discount: 0,
      total: 314.25,
      trackingNumber: "RG-TRK-88213",
      paymentMethod: "PAYSTACK",
      events: [
        { status: "PENDING", note: "Order placed", date: new Date("2026-07-01") },
        { status: "PROCESSING", note: "Payment confirmed, preparing order", date: new Date("2026-07-01") },
        { status: "SHIPPED", note: "Handed to courier", date: new Date("2026-07-02") },
        { status: "DELIVERED", note: "Delivered to recipient", date: new Date("2026-07-04") },
      ],
    },
    {
      orderNumber: "RG-100519",
      date: new Date("2026-07-10"),
      status: "SHIPPED",
      items: [
        { productSlug: "noir", size: "100ml", quantity: 1, unitPrice: 445 },
        { productSlug: "elite", size: "50ml", quantity: 2, unitPrice: 255 },
      ],
      subtotal: 955,
      shipping: 0,
      tax: 47.75,
      discount: 95.5,
      total: 907.25,
      trackingNumber: "RG-TRK-90144",
      paymentMethod: "STRIPE",
      events: [
        { status: "PENDING", note: "Order placed", date: new Date("2026-07-10") },
        { status: "PROCESSING", note: "Payment confirmed, preparing order", date: new Date("2026-07-10") },
        { status: "SHIPPED", note: "Handed to courier", date: new Date("2026-07-12") },
      ],
    },
    {
      orderNumber: "RG-100822",
      date: new Date("2026-07-14"),
      status: "PROCESSING",
      items: [{ productSlug: "royale", size: "50ml", quantity: 1, unitPrice: 295 }],
      subtotal: 295,
      shipping: 15,
      tax: 14.75,
      discount: 0,
      total: 324.75,
      paymentMethod: "BANK_TRANSFER",
      events: [
        { status: "PENDING", note: "Order placed", date: new Date("2026-07-14") },
        { status: "PROCESSING", note: "Payment confirmed, preparing order", date: new Date("2026-07-14") },
      ],
    },
  ];

  for (const orderDef of orderDefs) {
    const existing = await prisma.order.findUnique({ where: { orderNumber: orderDef.orderNumber } });
    if (existing) continue;

    const product = (slug: string) => products[slug];
    const variantFor = (slug: string, size: string) => product(slug).variants.find((v) => v.size === size)!;

    const order = await prisma.order.create({
      data: {
        orderNumber: orderDef.orderNumber,
        userId: user.id,
        status: orderDef.status,
        subtotal: orderDef.subtotal,
        shipping: orderDef.shipping,
        tax: orderDef.tax,
        discount: orderDef.discount,
        total: orderDef.total,
        trackingNumber: orderDef.trackingNumber,
        paymentMethod: orderDef.paymentMethod,
        createdAt: orderDef.date,
        ...shippingAddress,
        items: {
          create: orderDef.items.map((item) => {
            const p = product(item.productSlug);
            const v = variantFor(item.productSlug, item.size);
            return {
              productId: p.id,
              variantId: v.id,
              productName: item.productSlug.charAt(0).toUpperCase() + item.productSlug.slice(1),
              productSlug: item.productSlug,
              image: `/products/${item.productSlug === "elite" || item.productSlug === "reserve" ? item.productSlug + ".jpeg" : item.productSlug + ".png"}`,
              variantSize: item.size,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            };
          }),
        },
        trackingEvents: {
          create: orderDef.events.map((e) => ({ status: e.status, note: e.note, createdAt: e.date })),
        },
        payment: {
          create: {
            method: orderDef.paymentMethod,
            status: orderDef.status === "PROCESSING" ? "PENDING_PAYMENT" : "PAID",
            amount: orderDef.total,
          },
        },
      },
    });

    void order;
  }

  // Wishlist
  const wishlistTargets = ["royale", "elite"];
  for (const slug of wishlistTargets) {
    await prisma.wishlistItem.upsert({
      where: { userId_productId: { userId: user.id, productId: products[slug].id } },
      update: {},
      create: { userId: user.id, productId: products[slug].id },
    });
  }

  // Support tickets
  const existingTickets = await prisma.supportTicket.findMany({ where: { userId: user.id } });
  if (existingTickets.length === 0) {
    await prisma.supportTicket.create({
      data: {
        userId: user.id,
        subject: "Question about longevity of Noir",
        category: "Product",
        status: "RESOLVED",
        createdAt: new Date("2026-06-15"),
        messages: {
          create: [
            { author: "CUSTOMER", content: "How long does Noir typically last on skin?", createdAt: new Date("2026-06-15") },
            { author: "SUPPORT", content: "Noir is rated Eternal — most customers report 10-12 hours of wear with 2-3 sprays.", createdAt: new Date("2026-06-15") },
          ],
        },
      },
    });
    await prisma.supportTicket.create({
      data: {
        userId: user.id,
        subject: "Order RG-100519 shipping delay",
        category: "Order",
        status: "AWAITING_REPLY",
        createdAt: new Date("2026-07-12"),
        messages: {
          create: [
            { author: "CUSTOMER", content: "My order shows shipped but tracking hasn't updated in 2 days.", createdAt: new Date("2026-07-12") },
            { author: "SUPPORT", content: "Thanks for flagging — we've pinged the courier and will update you within 24 hours.", createdAt: new Date("2026-07-13") },
          ],
        },
      },
    });
  }

  // Reward transactions
  const existingRewards = await prisma.rewardTransaction.findMany({ where: { userId: user.id } });
  if (existingRewards.length === 0) {
    await prisma.rewardTransaction.createMany({
      data: [
        { userId: user.id, type: "EARN", points: 285, description: "Order RG-100234", createdAt: new Date("2026-07-01") },
        { userId: user.id, type: "EARN", points: 955, description: "Order RG-100519", createdAt: new Date("2026-07-10") },
        { userId: user.id, type: "REDEEM", points: -200, description: "Redeemed for ₦15,000 off", createdAt: new Date("2026-07-11") },
        { userId: user.id, type: "EARN", points: 295, description: "Order RG-100822", createdAt: new Date("2026-07-14") },
      ],
    });
  }

  return user;
}

// ---------------------------------------------------------------------------
// Additional customers (for Admin > Customers demo data)
// ---------------------------------------------------------------------------

async function seedOtherCustomers(products: Record<string, { id: string; variants: { id: string; size: string; price?: number }[] }>) {
  const customers = [
    { name: "Adewale O.", email: "adewale.o@example.com", phone: "+234 802 555 0142", joinedAt: new Date("2026-02-02"), ordersCount: 4, totalSpent: 1120.0, status: "ACTIVE" as const },
    { name: "James K.", email: "james.k@example.com", phone: "+44 7700 900123", joinedAt: new Date("2026-02-20"), ordersCount: 2, totalSpent: 640.0, status: "ACTIVE" as const },
    { name: "Chidi E.", email: "chidi.e@example.com", phone: "+234 809 222 3344", joinedAt: new Date("2026-03-11"), ordersCount: 1, totalSpent: 295.0, status: "ACTIVE" as const },
    { name: "Ronke A.", email: "ronke.a@example.com", phone: "+1 713 555 0199", joinedAt: new Date("2026-03-28"), ordersCount: 5, totalSpent: 1875.5, status: "ACTIVE" as const },
    { name: "David S.", email: "david.s@example.com", phone: "+1 646 555 0110", joinedAt: new Date("2026-04-05"), ordersCount: 2, totalSpent: 890.0, status: "ACTIVE" as const },
    { name: "Tunde B.", email: "tunde.b@example.com", phone: "+234 810 444 5566", joinedAt: new Date("2026-04-18"), ordersCount: 1, totalSpent: 310.0, status: "SUSPENDED" as const, adminNotes: "Multiple chargebacks reported — flagged by finance team." },
    { name: "Michael T.", email: "michael.t@example.com", phone: "+1 212 555 0177", joinedAt: new Date("2026-05-01"), ordersCount: 1, totalSpent: 265.0, status: "ACTIVE" as const },
  ];

  const productSlugs = Object.keys(products);
  let orderSeq = 200000;

  for (const c of customers) {
    const [firstName, ...rest] = c.name.replace(".", "").split(" ");
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        firstName,
        lastName: rest.join(" ") || "Customer",
        email: c.email,
        passwordHash: await hash("Password123!"),
        phone: c.phone,
        emailVerified: true,
        status: c.status,
        adminNotes: c.adminNotes,
        referralCode: `${firstName.toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        createdAt: c.joinedAt,
      },
    });

    const existingOrders = await prisma.order.count({ where: { userId: user.id } });
    if (existingOrders > 0) continue;

    const perOrderAmount = Math.round((c.totalSpent / c.ordersCount) * 100) / 100;
    for (let i = 0; i < c.ordersCount; i++) {
      orderSeq += 1;
      const slug = productSlugs[(orderSeq + i) % productSlugs.length];
      const p = products[slug];
      const variant = p.variants[0];
      await prisma.order.create({
        data: {
          orderNumber: `RG-${orderSeq}`,
          userId: user.id,
          status: "DELIVERED",
          subtotal: perOrderAmount,
          shipping: 0,
          tax: 0,
          discount: 0,
          total: perOrderAmount,
          paymentMethod: "STRIPE",
          createdAt: c.joinedAt,
          shippingFullName: c.name,
          shippingLine1: "1 Demo Street",
          shippingCity: "Lagos",
          shippingState: "Lagos",
          shippingCountry: "Nigeria",
          shippingPostalCode: "100001",
          shippingPhone: c.phone,
          items: {
            create: [
              {
                productId: p.id,
                variantId: variant.id,
                productName: slug.charAt(0).toUpperCase() + slug.slice(1),
                productSlug: slug,
                image: `/products/${slug}.${slug === "elite" || slug === "reserve" ? "jpeg" : "png"}`,
                variantSize: variant.size,
                quantity: 1,
                unitPrice: perOrderAmount,
              },
            ],
          },
          trackingEvents: {
            create: [{ status: "DELIVERED", note: "Delivered to recipient", createdAt: c.joinedAt }],
          },
          payment: { create: { method: "STRIPE", status: "PAID", amount: perOrderAmount } },
        },
      });
    }
  }
}

async function main() {
  console.log("Seeding roles & permissions...");
  const roles = await seedRolesAndPermissions();

  console.log("Seeding admin users...");
  const adminUsers = await seedAdminUsers(roles);

  console.log("Seeding collections & categories...");
  await seedCollections();
  await seedCategories();

  console.log("Seeding products...");
  const products = await seedProducts();

  console.log("Seeding coupons...");
  await seedCoupons();

  console.log("Seeding blog, banners, settings...");
  await seedBlog();
  await seedBanners();
  await seedSettings();

  console.log("Seeding reviews...");
  await seedReviews(products);

  console.log("Seeding inventory history...");
  await seedInventoryHistory(products, adminUsers);

  console.log("Seeding audit logs...");
  await seedAuditLogs(adminUsers);

  console.log("Seeding demo customer (Rita Green)...");
  await seedDemoCustomer(products);

  console.log("Seeding additional customers for admin demo data...");
  await seedOtherCustomers(products);

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
