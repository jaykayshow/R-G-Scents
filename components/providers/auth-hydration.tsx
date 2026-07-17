"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useWishlistStore } from "@/lib/store/wishlist-store";

/**
 * Restores the customer session from the httpOnly cookie on load —
 * currentUser starts null until this resolves.
 */
export function AuthHydration() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);
  const clearWishlist = useWishlistStore((s) => s.clear);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (currentUser) {
      fetchWishlist();
    } else {
      clearWishlist();
    }
  }, [currentUser, fetchWishlist, clearWishlist]);

  return null;
}
