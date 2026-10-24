'use client';

import React from 'react';
import { useTabsStore, Tab as StoreTab } from '../lib/stores/tabsStore';
import { useShallow } from 'zustand/react/shallow';

export type Tab = StoreTab; // Re-export type

export function TabsProvider({ children }: { children: React.ReactNode }) {
  // We no longer need Context, so we just return children.
  // The Zustand store handles state independently.
  return <>{children}</>;
}

export function useTabs() {
  return useTabsStore(useShallow(state => ({
    tabs: state.tabs,
    activeTabId: state.activeTabId,
    dirtyTabs: state.dirtyTabs,
    addTab: state.addTab,
    removeTab: state.removeTab,
    setActiveTabId: state.setActiveTabId,
    setTabDirty: state.setTabDirty,
    removeAllTabs: state.removeAllTabs,
  })));
}

export function useOptionalTabs() {
  return useTabs();
}

