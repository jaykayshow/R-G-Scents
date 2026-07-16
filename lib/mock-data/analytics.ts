// Seeded pseudo-random generator so the mock analytics dataset is
// deterministic across reloads instead of reshuffling every render.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);

export interface DailyMetric {
  date: string;
  revenue: number;
  orders: number;
  visitors: number;
}

const DAYS = 30;
const TODAY = new Date("2026-07-16");

function dateNDaysAgo(n: number) {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export const dailyMetrics: DailyMetric[] = Array.from({ length: DAYS }, (_, i) => {
  const dayIndex = DAYS - 1 - i;
  const weekday = new Date(dateNDaysAgo(dayIndex)).getDay();
  const weekendBoost = weekday === 5 || weekday === 6 ? 1.35 : 1;
  const growthTrend = 1 + (DAYS - dayIndex) * 0.012;
  const baseRevenue = 1800 * weekendBoost * growthTrend;
  const noise = 0.75 + rand() * 0.5;
  const revenue = Math.round(baseRevenue * noise);
  const orders = Math.max(3, Math.round((revenue / 310) * (0.85 + rand() * 0.3)));
  const visitors = Math.round(orders * (18 + rand() * 10));
  return { date: dateNDaysAgo(dayIndex), revenue, orders, visitors };
});

export function weeklyMetrics() {
  const weeks: { week: string; revenue: number; orders: number }[] = [];
  for (let i = 0; i < dailyMetrics.length; i += 7) {
    const chunk = dailyMetrics.slice(i, i + 7);
    if (chunk.length === 0) continue;
    weeks.push({
      week: `${chunk[0].date} – ${chunk[chunk.length - 1].date}`,
      revenue: chunk.reduce((sum, d) => sum + d.revenue, 0),
      orders: chunk.reduce((sum, d) => sum + d.orders, 0),
    });
  }
  return weeks;
}

export interface TopProductMetric {
  productSlug: string;
  productName: string;
  unitsSold: number;
  revenue: number;
}

export const topProducts: TopProductMetric[] = [
  { productSlug: "noir", productName: "Noir", unitsSold: 412, revenue: 127720 },
  { productSlug: "legacy", productName: "Legacy", unitsSold: 368, revenue: 104880 },
  { productSlug: "royale", productName: "Royale", unitsSold: 301, revenue: 88795 },
  { productSlug: "reserve", productName: "Reserve", unitsSold: 274, revenue: 72610 },
  { productSlug: "elite", productName: "Elite", unitsSold: 198, revenue: 50490 },
];

export interface TrafficSource {
  source: string;
  sessions: number;
  conversionRate: number;
}

export const trafficSources: TrafficSource[] = [
  { source: "Organic Search", sessions: 18420, conversionRate: 2.8 },
  { source: "Instagram", sessions: 12980, conversionRate: 3.4 },
  { source: "Direct", sessions: 9640, conversionRate: 4.1 },
  { source: "Referral", sessions: 4210, conversionRate: 2.2 },
  { source: "Email Campaign", sessions: 3105, conversionRate: 5.6 },
  { source: "Paid Social", sessions: 2870, conversionRate: 1.9 },
];

export const totals = {
  revenue: dailyMetrics.reduce((sum, d) => sum + d.revenue, 0),
  orders: dailyMetrics.reduce((sum, d) => sum + d.orders, 0),
  visitors: dailyMetrics.reduce((sum, d) => sum + d.visitors, 0),
};

export const conversionRate = Number(((totals.orders / totals.visitors) * 100).toFixed(2));

export function revenueTrendVsPreviousPeriod() {
  const half = Math.floor(dailyMetrics.length / 2);
  const firstHalf = dailyMetrics.slice(0, half).reduce((sum, d) => sum + d.revenue, 0);
  const secondHalf = dailyMetrics.slice(half).reduce((sum, d) => sum + d.revenue, 0);
  return Number((((secondHalf - firstHalf) / firstHalf) * 100).toFixed(1));
}

export function ordersTrendVsPreviousPeriod() {
  const half = Math.floor(dailyMetrics.length / 2);
  const firstHalf = dailyMetrics.slice(0, half).reduce((sum, d) => sum + d.orders, 0);
  const secondHalf = dailyMetrics.slice(half).reduce((sum, d) => sum + d.orders, 0);
  return Number((((secondHalf - firstHalf) / firstHalf) * 100).toFixed(1));
}
