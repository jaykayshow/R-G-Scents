"use client";

import Link from "next/link";
import Image from "next/image";
import { Package, Heart, Gift, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/store/auth-store";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { useOrdersStore } from "@/lib/store/orders-store";
import { useProductsStore } from "@/lib/store/products-store";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AccountOverviewPage() {
  const user = useAuthStore((s) => s.currentUser);
  const wishlistIds = useWishlistStore((s) => s.productIds);
  const products = useProductsStore((s) => s.products);
  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));
  const orders = useOrdersStore((s) => s.orders);
  const recentOrders = orders.slice(0, 3);

  if (!user) return null;

  return (
    <div className="space-y-10">
      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="p-6">
          <Package className="text-gold" size={22} />
          <p className="mt-4 font-serif text-3xl text-fg">{orders.length}</p>
          <p className="mt-1 text-xs uppercase tracking-widest text-overlay/50">Total Orders</p>
        </Card>
        <Card className="p-6">
          <Gift className="text-gold" size={22} />
          <p className="mt-4 font-serif text-3xl text-fg">{user.rewardPoints.toLocaleString()}</p>
          <p className="mt-1 text-xs uppercase tracking-widest text-overlay/50">Reward Points</p>
        </Card>
        <Card className="p-6">
          <Heart className="text-gold" size={22} />
          <p className="mt-4 font-serif text-3xl text-fg">{wishlistProducts.length}</p>
          <p className="mt-1 text-xs uppercase tracking-widest text-overlay/50">Wishlist Items</p>
        </Card>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl text-fg">Recent Orders</h2>
          <Link href="/account/orders" className="flex items-center gap-1 text-xs text-gold hover:underline">
            View All <ArrowRight size={12} />
          </Link>
        </div>
        <div className="space-y-4">
          {recentOrders.map((order) => (
            <Card key={order.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-fg">{order.orderNumber}</p>
                <p className="text-xs text-overlay/40">{formatDate(order.date)} · {order.items.length} item(s)</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={order.status === "Delivered" ? "gold" : "outline"}>{order.status}</Badge>
                <span className="font-serif text-fg">{formatCurrency(order.total)}</span>
                <Link href={`/account/orders/${order.orderNumber}`} className="text-xs text-gold hover:underline">
                  Details
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl text-fg">Wishlist Snapshot</h2>
          <Link href="/account/wishlist" className="flex items-center gap-1 text-xs text-gold hover:underline">
            View All <ArrowRight size={12} />
          </Link>
        </div>
        {wishlistProducts.length === 0 ? (
          <Card className="p-6 text-sm text-overlay/50">
            Your wishlist is empty. <Link href="/shop" className="text-gold hover:underline">Browse the collection.</Link>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {wishlistProducts.slice(0, 4).map((product) => (
              <Link key={product.id} href={`/shop/${product.slug}`}>
                <Card className="p-4">
                  <div className="relative aspect-square overflow-hidden rounded-sm bg-overlay/5">
                    <Image src={product.images[0]} alt={product.name} fill className="object-contain p-4" />
                  </div>
                  <p className="mt-3 font-serif text-sm text-fg">{product.name}</p>
                  <StarRating rating={product.rating} className="mt-1" />
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
