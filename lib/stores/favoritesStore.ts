import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface FavoriteItem {
  id: string;
  title: string;
  path: string;
}

interface FavoritesState {
  favorites: FavoriteItem[];
  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (item) => set((state) => ({
        favorites: state.favorites.find(f => f.id === item.id) 
          ? state.favorites 
          : [...state.favorites, item]
      })),
      removeFavorite: (id) => set((state) => ({
        favorites: state.favorites.filter((f) => f.id !== id)
      })),
      isFavorite: (id) => get().favorites.some((f) => f.id === id)
    }),
    {
      name: 'parsa-erp-favorites',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
