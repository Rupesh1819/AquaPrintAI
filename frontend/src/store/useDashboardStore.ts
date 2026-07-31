import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface DashboardState {
  summary: any;
  charts: any;
  insights: any[];
  recommendations: any[];
  recentScans: any[];
  goals: any[];
  
  setSummary: (data: any) => void;
  setCharts: (data: any) => void;
  setInsights: (data: any[]) => void;
  setRecommendations: (data: any[]) => void;
  setRecentScans: (data: any[]) => void;
  setGoals: (data: any[]) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      summary: null,
      charts: null,
      insights: [],
      recommendations: [],
      recentScans: [],
      goals: [],

      setSummary: (summary) => set({ summary }),
      setCharts: (charts) => set({ charts }),
      setInsights: (insights) => set({ insights }),
      setRecommendations: (recommendations) => set({ recommendations }),
      setRecentScans: (recentScans) => set({ recentScans }),
      setGoals: (goals) => set({ goals })
    }),
    {
      name: 'aquaprint-dashboard-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
