import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Tab = {
  id: string;
  title: string;
  groupId: string;
  icon?: React.ReactNode;
  componentName?: string;
  props?: any;
};

export type AddTabOptions = {
  id?: string;
  title: string;
  groupId?: string;
  icon?: React.ReactNode;
  componentName?: string;
  props?: any;
  closable?: boolean;
};

interface TabsState {
  tabs: Tab[];
  activeTabId: string | null;
  dirtyTabs: Record<string, boolean>;
  addTab: (
    titleOrOptions: string | AddTabOptions,
    groupId?: string,
    icon?: React.ReactNode,
    componentName?: string,
    props?: any
  ) => void;
  removeTab: (id: string, e?: React.MouseEvent) => void;
  setActiveTabId: (id: string | null) => void;
  setTabDirty: (id: string, isDirty: boolean) => void;
  removeAllTabs: () => void;
}

// ---------------------------------------------------------------------------
// Persistence (Task 5-c): only serializable tab metadata survives a refresh.
// - `icon` is a React node (non-serializable) and is stripped.
// - `props` are plain data objects at every addTab() call site (ids, formCode…);
//   any non-serializable value would be dropped naturally by JSON storage.
// - Restored tabs are capped at the MAX_PERSISTED_TABS most recent; they
//   re-materialize through the PageContainer componentName mapping when
//   activated. `dirtyTabs` stays transient (in-memory only).
// ---------------------------------------------------------------------------
export const TABS_STORAGE_KEY = 'parsa-tabs-storage';
export const TABS_STORAGE_VERSION = 1;
export const MAX_PERSISTED_TABS = 15;

type PersistedTab = Omit<Tab, 'icon'>;

function toSerializableTab(tab: Tab): PersistedTab {
  const { icon, ...serializable } = tab;
  return serializable;
}

interface PersistedTabsShape {
  tabs: PersistedTab[];
  activeTabId: string | null;
}

function capTabs(tabs: PersistedTab[]): PersistedTab[] {
  return Array.isArray(tabs) ? tabs.slice(-MAX_PERSISTED_TABS) : [];
}

export const useTabsStore = create<TabsState>()(
  persist(
    (set) => ({
      tabs: [],
      activeTabId: null,
      dirtyTabs: {},

      addTab: (titleOrOptions, groupId, icon, componentName, props) => {
        let title = '';
        let finalGroupId = groupId || 'general_group';
        let finalIcon = icon;
        let finalComponentName = componentName;
        let finalProps = props;
        let customId: string | undefined = undefined;

        if (typeof titleOrOptions === 'object' && titleOrOptions !== null) {
          title = titleOrOptions.title || '';
          finalGroupId = titleOrOptions.groupId || 'general_group';
          finalIcon = titleOrOptions.icon;
          finalComponentName = titleOrOptions.componentName;
          finalProps = titleOrOptions.props;
          customId = titleOrOptions.id;
        } else {
          title = String(titleOrOptions || '');
        }

        set((state) => {
          // Check if tab with customId already exists, if so activate it instead of duplicating
          if (customId) {
            const existing = state.tabs.find((t) => t.id === customId);
            if (existing) {
              return { activeTabId: customId };
            }
          }

          const id = customId || (Date.now().toString() + Math.random().toString(36).substr(2, 9));
          return {
            tabs: [...state.tabs, { id, title, groupId: finalGroupId, icon: finalIcon, componentName: finalComponentName, props: finalProps }],
            activeTabId: id,
          };
        });
      },

      removeTab: (id, e?) => {
        if (e) {
          e.stopPropagation();
        }
        set((state) => {
          const newTabs = state.tabs.filter((t) => t.id !== id);
          let newActiveId = state.activeTabId;
          if (state.activeTabId === id) {
            newActiveId = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;
          }

          const newDirtyTabs = { ...state.dirtyTabs };
          delete newDirtyTabs[id];

          return {
            tabs: newTabs,
            activeTabId: newActiveId,
            dirtyTabs: newDirtyTabs,
          };
        });
      },

      setActiveTabId: (id) => set({ activeTabId: id }),

      setTabDirty: (id, isDirty) => set((state) => {
        if (!!state.dirtyTabs[id] === isDirty) return state;
        const newDirtyTabs = { ...state.dirtyTabs };
        if (isDirty) {
          newDirtyTabs[id] = true;
        } else {
          delete newDirtyTabs[id];
        }
        return { dirtyTabs: newDirtyTabs };
      }),

      removeAllTabs: () => set({ tabs: [], activeTabId: null, dirtyTabs: {} }),
    }),
    {
      name: TABS_STORAGE_KEY,
      version: TABS_STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedTabsShape => {
        const tabs = capTabs(state.tabs.map(toSerializableTab));
        const activeTabId =
          state.activeTabId !== null && tabs.some((t) => t.id === state.activeTabId)
            ? state.activeTabId
            : null;
        return { tabs, activeTabId };
      },
      merge: (persisted, current): TabsState => {
        const p = (persisted && typeof persisted === 'object' ? persisted : {}) as Partial<PersistedTabsShape>;
        const restored = capTabs((p.tabs || []).map((t) => ({ ...t, icon: undefined })));
        const activeTabId =
          p.activeTabId != null && restored.some((t) => t.id === p.activeTabId) ? p.activeTabId : null;
        return { ...current, tabs: restored, activeTabId };
      },
    }
  )
);
