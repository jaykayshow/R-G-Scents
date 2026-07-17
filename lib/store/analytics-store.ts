import { create } from "zustand";
import { apiClient, AnalyticsOverview } from "@/lib/api-client";

interface AnalyticsState {
  overview: AnalyticsOverview | null;
  loading: boolean;
  fetchOverview: () => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>()((set) => ({
  overview: null,
  loading: false,

  fetchOverview: async () => {
    set({ loading: true });
    try {
      const overview = await apiClient.analytics.overview();
      set({ overview, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));

export function weeklyMetrics(overview: AnalyticsOverview | null) {
  if (!overview) return [];
  const weeks: { week: string; revenue: number; orders: number }[] = [];
  const daily = overview.dailyMetrics;
  for (let i = 0; i < daily.length; i += 7) {
    const chunk = daily.slice(i, i + 7);
    if (chunk.length === 0) continue;
    weeks.push({
      week: `${chunk[0].date} – ${chunk[chunk.length - 1].date}`,
      revenue: chunk.reduce((sum, d) => sum + d.revenue, 0),
      orders: chunk.reduce((sum, d) => sum + d.orders, 0),
    });
  }
  return weeks;
}
