import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface FavoritesState {
  favorites: string[]; // List of product IDs
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  setFavorites: (ids: string[]) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (id) => set((state) => ({ favorites: [...new Set([...state.favorites, id])] })),
      removeFavorite: (id) => set((state) => ({ favorites: state.favorites.filter(fid => fid !== id) })),
      isFavorite: (id) => get().favorites.includes(id),
      setFavorites: (ids) => set({ favorites: ids }),
    }),
    {
      name: 'aquaprint-favorites-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
