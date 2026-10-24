import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface DashboardState {
  layouts: Record<string, any>;
  widgets: Record<string, boolean>;
  setLayouts: (layouts: Record<string, any>) => void;
  toggleWidget: (widgetId: string, isVisible: boolean) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      layouts: {},
      widgets: {},
      setLayouts: (layouts) => set({ layouts }),
      toggleWidget: (widgetId, isVisible) => set((state) => ({
        widgets: { ...state.widgets, [widgetId]: isVisible }
      }))
    }),
    {
      name: 'parsa-erp-dashboard',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
