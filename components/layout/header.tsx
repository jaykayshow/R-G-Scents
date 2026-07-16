"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Search, Heart, User, ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCartStore } from "@/lib/store/cart-store";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Journal" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const cartCount = useCartStore((s) => s.count());
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const currentUser = useAuthStore((s) => s.currentUser);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  }

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 border-b transition-colors duration-300",
          scrolled
            ? "border-white/10 bg-matte-black/90 backdrop-blur-md"
            : "border-transparent bg-matte-black/40 backdrop-blur-sm"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button
            className="lg:hidden text-brand-white"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>

          <Link href="/" className="flex flex-col items-center lg:items-start">
            <span className="font-serif text-xl font-bold tracking-wide text-brand-white sm:text-2xl">
              R&amp;G <span className="text-gold">SCENTS</span>
            </span>
            <span className="hidden text-[9px] uppercase tracking-[0.35em] text-white/40 sm:block">
              The Billionaire Collection
            </span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-xs font-medium uppercase tracking-widest transition-colors hover:text-gold",
                  pathname === link.href ? "text-gold" : "text-white/70"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 sm:gap-5">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search"
              className="text-brand-white/80 transition-colors hover:text-gold"
            >
              <Search size={19} />
            </button>
            <Link
              href="/account/wishlist"
              aria-label="Wishlist"
              className="relative text-brand-white/80 transition-colors hover:text-gold"
            >
              <Heart size={19} />
              {hydrated && wishlistCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-matte-black">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              href={currentUser ? "/account" : "/auth/login"}
              aria-label="Account"
              className="hidden text-brand-white/80 transition-colors hover:text-gold sm:block"
            >
              <User size={19} />
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              aria-label="Cart"
              className="relative text-brand-white/80 transition-colors hover:text-gold"
            >
              <ShoppingBag size={19} />
              {hydrated && cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-matte-black">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-white/10 bg-matte-black/95"
            >
              <form onSubmit={handleSearchSubmit} className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search fragrances, collections, notes..."
                  className="w-full border-b border-white/20 bg-transparent py-2 text-lg text-brand-white placeholder:text-white/30 focus:border-gold focus:outline-none"
                />
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[110] bg-black/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-0 top-0 z-[111] h-full w-72 bg-charcoal p-6"
            >
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="mb-8 text-brand-white"
              >
                <X size={24} />
              </button>
              <nav className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="font-serif text-xl text-brand-white hover:text-gold"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href={currentUser ? "/account" : "/auth/login"}
                  className="font-serif text-xl text-brand-white hover:text-gold"
                >
                  {currentUser ? "My Account" : "Login / Register"}
                </Link>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
