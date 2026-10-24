import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SortingState, ColumnFiltersState, ColumnOrderState } from '@tanstack/react-table';

interface GridPreferences {
  columnVisibility?: Record<string, boolean>;
  columnWidths?: Record<string, number>;
  sorting?: SortingState;
  filters?: ColumnFiltersState;
  columnOrder?: ColumnOrderState;
}

interface GridState {
  preferences: Record<string, GridPreferences>;
  setPreferences: (gridId: string, prefs: Partial<GridPreferences>) => void;
  getPreferences: (gridId: string) => GridPreferences | undefined;
  clearPreferences: (gridId: string) => void;
}

export const useGridStore = create<GridState>()(
  persist(
    (set, get) => ({
      preferences: {},
      setPreferences: (gridId, prefs) => set((state) => {
        const existing = state.preferences[gridId] || {};
        return {
          preferences: {
            ...state.preferences,
            [gridId]: { ...existing, ...prefs }
          }
        };
      }),
      getPreferences: (gridId) => get().preferences[gridId],
      clearPreferences: (gridId) => set((state) => {
        const newPrefs = { ...state.preferences };
        delete newPrefs[gridId];
        return { preferences: newPrefs };
      })
    }),
    {
      name: 'parsa-erp-grid-prefs',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
