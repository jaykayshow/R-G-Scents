import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

const WINDOW_DAYS = 30;

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const since = new Date();
    since.setDate(since.getDate() - (WINDOW_DAYS - 1));
    since.setHours(0, 0, 0, 0);

    const orders = await this.prisma.order.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, total: true, status: true },
    });

    const byDay = new Map<string, { revenue: number; orders: number }>();
    for (let i = 0; i < WINDOW_DAYS; i++) {
      const d = new Date(since);
      d.setDate(d.getDate() + i);
      byDay.set(isoDate(d), { revenue: 0, orders: 0 });
    }

    for (const order of orders) {
      const key = isoDate(order.createdAt);
      const bucket = byDay.get(key);
      if (!bucket) continue;
      bucket.orders += 1;
      if (order.status !== "CANCELLED") {
        bucket.revenue += Number(order.total);
      }
    }

    const dailyMetrics = Array.from(byDay.entries()).map(([date, v]) => ({
      date,
      revenue: Math.round(v.revenue * 100) / 100,
      orders: v.orders,
    }));

    const totalRevenue = dailyMetrics.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrders = dailyMetrics.reduce((sum, d) => sum + d.orders, 0);

    const half = Math.floor(dailyMetrics.length / 2);
    const firstHalfRevenue = dailyMetrics.slice(0, half).reduce((sum, d) => sum + d.revenue, 0);
    const secondHalfRevenue = dailyMetrics.slice(half).reduce((sum, d) => sum + d.revenue, 0);
    const firstHalfOrders = dailyMetrics.slice(0, half).reduce((sum, d) => sum + d.orders, 0);
    const secondHalfOrders = dailyMetrics.slice(half).reduce((sum, d) => sum + d.orders, 0);

    const revenueTrendVsPreviousPeriod =
      firstHalfRevenue === 0 ? 0 : Number((((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100).toFixed(1));
    const ordersTrendVsPreviousPeriod =
      firstHalfOrders === 0 ? 0 : Number((((secondHalfOrders - firstHalfOrders) / firstHalfOrders) * 100).toFixed(1));

    const items = await this.prisma.orderItem.findMany({
      where: { order: { createdAt: { gte: since } } },
      select: { productSlug: true, productName: true, quantity: true, unitPrice: true },
    });

    const byProduct = new Map<string, { productName: string; unitsSold: number; revenue: number }>();
    for (const item of items) {
      const existing = byProduct.get(item.productSlug) ?? { productName: item.productName, unitsSold: 0, revenue: 0 };
      existing.unitsSold += item.quantity;
      existing.revenue += item.quantity * Number(item.unitPrice);
      byProduct.set(item.productSlug, existing);
    }

    const topProducts = Array.from(byProduct.entries())
      .map(([productSlug, v]) => ({ productSlug, ...v, revenue: Math.round(v.revenue * 100) / 100 }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const totalCustomers = await this.prisma.user.count();

    return {
      dailyMetrics,
      topProducts,
      totals: { revenue: Math.round(totalRevenue * 100) / 100, orders: totalOrders },
      averageOrderValue: totalOrders === 0 ? 0 : Math.round((totalRevenue / totalOrders) * 100) / 100,
      totalCustomers,
      revenueTrendVsPreviousPeriod,
      ordersTrendVsPreviousPeriod,
    };
  }
}
