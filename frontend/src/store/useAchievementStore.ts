import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AchievementState {
  badges: any[];
  userProgress: {
    level: number;
    current_xp: number;
    next_level_xp: number;
    progress_percentage: number;
  } | null;
  
  setBadges: (badges: any[]) => void;
  setUserProgress: (progress: any) => void;
  unlockBadge: (badgeId: string) => void;
}

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set) => ({
      badges: [],
      userProgress: null,
      
      setBadges: (badges) => set({ badges }),
      
      setUserProgress: (progress) => set({ userProgress: progress }),
      
      unlockBadge: (id) => set((state) => ({
        badges: state.badges.map(b => 
          b.id === id ? { ...b, is_unlocked: true, unlocked_at: new Date().toISOString() } : b
        )
      })),
    }),
    {
      name: 'aquaprint-achievements',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
