import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface LeaderboardState {
  globalRanking: any[];
  lastUpdated: string | null;
  
  setGlobalRanking: (ranking: any[]) => void;
}

export const useLeaderboardStore = create<LeaderboardState>()(
  persist(
    (set) => ({
      globalRanking: [],
      lastUpdated: null,
      
      setGlobalRanking: (ranking) => set({ 
        globalRanking: ranking, 
        lastUpdated: new Date().toISOString() 
      }),
    }),
    {
      name: 'aquaprint-leaderboard',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
