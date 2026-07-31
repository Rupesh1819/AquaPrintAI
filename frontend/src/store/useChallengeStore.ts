import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ChallengeState {
  activeChallenges: any[];
  offlineQueue: any[]; // Stores events to sync
  
  setChallenges: (challenges: any[]) => void;
  updateProgress: (challengeId: string, progress: number) => void;
  completeChallenge: (challengeId: string) => void;
  queueOfflineAction: (action: any) => void;
  clearQueue: () => void;
}

export const useChallengeStore = create<ChallengeState>()(
  persist(
    (set) => ({
      activeChallenges: [],
      offlineQueue: [],
      
      setChallenges: (challenges) => set({ activeChallenges: challenges }),
      
      updateProgress: (id, progress) => set((state) => ({
        activeChallenges: state.activeChallenges.map(c => 
          c.id === id ? { ...c, progress_count: progress } : c
        )
      })),
      
      completeChallenge: (id) => set((state) => ({
        activeChallenges: state.activeChallenges.map(c => 
          c.id === id ? { ...c, is_completed: true, progress_count: c.target_count } : c
        )
      })),
      
      queueOfflineAction: (action) => set((state) => ({
        offlineQueue: [...state.offlineQueue, action]
      })),
      
      clearQueue: () => set({ offlineQueue: [] })
    }),
    {
      name: 'aquaprint-challenges',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
