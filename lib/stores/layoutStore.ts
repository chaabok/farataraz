import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LayoutState {
  isSidebarPinned: boolean;
  openMenuId: string | null;
  searchQuery: string;
  setSidebarPinned: (pinned: boolean) => void;
  setOpenMenuId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      isSidebarPinned: true,
      openMenuId: 'financial_group',
      searchQuery: '',
      setSidebarPinned: (pinned) => set({ isSidebarPinned: pinned }),
      setOpenMenuId: (id) => set({ openMenuId: id }),
      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    {
      name: 'parsa-layout-storage',
      partialize: (state) => ({ 
        isSidebarPinned: state.isSidebarPinned,
        openMenuId: state.openMenuId,
      }), // only persist UI view state, not search query
    }
  )
);
