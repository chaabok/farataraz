import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SearchHistoryState {
  recentSearches: string[];
  addSearch: (query: string) => void;
  clearSearches: () => void;
}

export const useSearchHistoryStore = create<SearchHistoryState>()(
  persist(
    (set, get) => ({
      recentSearches: [],
      addSearch: (query) => {
        const current = get().recentSearches;
        const updated = [query, ...current.filter(q => q !== query)].slice(0, 10);
        set({ recentSearches: updated });
      },
      clearSearches: () => set({ recentSearches: [] })
    }),
    {
      name: 'parsa-erp-search-history',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
