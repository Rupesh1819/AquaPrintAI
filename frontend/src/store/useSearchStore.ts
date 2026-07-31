import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface SearchState {
  query: string;
  category: string | null;
  manufacturer: string | null;
  minScore: number | null;
  recentSearches: string[];
  
  setQuery: (q: string) => void;
  setCategory: (c: string | null) => void;
  setManufacturer: (m: string | null) => void;
  setMinScore: (s: number | null) => void;
  addRecentSearch: (q: string) => void;
  clearRecentSearches: () => void;
  clearFilters: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      query: '',
      category: null,
      manufacturer: null,
      minScore: null,
      recentSearches: [],
      
      setQuery: (q) => set({ query: q }),
      setCategory: (c) => set({ category: c }),
      setManufacturer: (m) => set({ manufacturer: m }),
      setMinScore: (s) => set({ minScore: s }),
      
      addRecentSearch: (q) => set((state) => {
        if (!q.trim()) return state;
        const recent = [q, ...state.recentSearches.filter(item => item !== q)].slice(0, 10);
        return { recentSearches: recent };
      }),
      
      clearRecentSearches: () => set({ recentSearches: [] }),
      
      clearFilters: () => set({ 
        category: null, 
        manufacturer: null, 
        minScore: null 
      })
    }),
    {
      name: 'aquaprint-search-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
