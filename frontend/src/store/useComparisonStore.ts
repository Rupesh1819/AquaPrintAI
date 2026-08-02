import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ComparisonState {
  selectedProductIds: string[];
  history: string[]; // List of session IDs
  
  addProduct: (id: string) => void;
  removeProduct: (id: string) => void;
  clearSelection: () => void;
  addHistory: (sessionId: string) => void;
}

export const useComparisonStore = create<ComparisonState>()(
  persist(
    (set) => ({
      selectedProductIds: [],
      history: [],
      
      addProduct: (id) => set((state) => {
        if (state.selectedProductIds.includes(id)) return state;
        // Limit to 4 products max for comparison
        if (state.selectedProductIds.length >= 4) return state;
        return { selectedProductIds: [...state.selectedProductIds, id] };
      }),
      
      removeProduct: (id) => set((state) => ({
        selectedProductIds: state.selectedProductIds.filter(pid => pid !== id)
      })),
      
      clearSelection: () => set({ selectedProductIds: [] }),
      
      addHistory: (sessionId) => set((state) => ({
        history: [sessionId, ...state.history.filter(s => s !== sessionId)].slice(0, 10)
      }))
    }),
    {
      name: 'aquaprint-comparison-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
