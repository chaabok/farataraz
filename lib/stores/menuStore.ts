import { create } from 'zustand';
import { apiFetch } from '@/lib/utils';

export interface CustomMainMenu {
  id: string;
  title: string;
  titleEn?: string;
  groupId: string;
  priority: number;
  icon?: string;
  color?: string;
  iconColor?: string;
}

export interface CustomSubMenu {
  id: string;
  groupId: string;
  menuTitle: string;
  title: string;
  titleEn?: string;
  icon?: string;
  priority?: number;
}

interface MenuState {
  customMainMenus: CustomMainMenu[];
  customSubMenus: CustomSubMenu[];
  hiddenMenus: string[];
  dynamicForms: any[];
  isLoaded: boolean;

  loadFromStorage: () => Promise<void>;
  setCustomMainMenus: (menus: CustomMainMenu[]) => void;
  setCustomSubMenus: (subMenus: CustomSubMenu[]) => void;
  setHiddenMenus: (hidden: string[]) => void;
  setDynamicForms: (forms: any[]) => void;

  addCustomMainMenu: (menu: CustomMainMenu) => void;
  updateCustomMainMenu: (menu: CustomMainMenu) => void;
  deleteCustomMainMenuNode: (node: any) => void;

  addCustomSubMenu: (subMenu: CustomSubMenu) => void;
  updateCustomSubMenu: (subMenu: CustomSubMenu) => void;
  deleteCustomSubMenuNode: (node: any) => void;

  hideMenuKeys: (keys: string[]) => void;
  syncWithDatabase: () => Promise<void>;
}

const STORAGE_KEY_MAIN = 'parsa_dfb_custom_main_menus';
const STORAGE_KEY_SUB = 'parsa_dfb_custom_sub_menus';
const STORAGE_KEY_HIDDEN = 'parsa_dfb_hidden_menus';

const notifyUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('parsa_custom_menus_updated'));
  }
};

export const useMenuStore = create<MenuState>((set, get) => ({
  customMainMenus: [],
  customSubMenus: [],
  hiddenMenus: [],
  dynamicForms: [],
  isLoaded: false,

  loadFromStorage: async () => {
    if (typeof window === 'undefined') return;

    // 1. Load instantly from local storage for fast render
    try {
      const savedMain = localStorage.getItem(STORAGE_KEY_MAIN);
      const mainMenus: CustomMainMenu[] = savedMain ? JSON.parse(savedMain) : [];

      const savedSub = localStorage.getItem(STORAGE_KEY_SUB);
      const subMenus: CustomSubMenu[] = savedSub ? JSON.parse(savedSub) : [];

      const activeCustomKeys = new Set([
        ...mainMenus.map((m: any) => m.id),
        ...mainMenus.map((m: any) => m.title),
        ...subMenus.map((s: any) => s.id),
        ...subMenus.map((s: any) => s.title),
        ...subMenus.map((s: any) => `sub_${s.groupId}_${s.menuTitle}_${s.title}`),
      ]);

      const savedHidden = localStorage.getItem(STORAGE_KEY_HIDDEN);
      const rawHidden = savedHidden ? JSON.parse(savedHidden) : [];
      const hidden = Array.isArray(rawHidden) ? rawHidden.filter((k: string) => 
        k && 
        !activeCustomKeys.has(k) &&
        k !== 'اطلاعات پایه' && k !== 'عملیات' && k !== 'گزارشات' && k !== 'فهرست‌ها' && k !== 'پایان سال مالی' && k !== 'درخواست' &&
        k !== 'basic_info_accounting' && k !== 'accounting' && k !== 'financial_group' && k !== 'requests_warehouse' && k !== 'supply_requests_warehouse' && k !== 'purchase_invoice_warehouse'
      ) : [];

      set({
        customMainMenus: mainMenus,
        customSubMenus: subMenus,
        hiddenMenus: hidden,
        isLoaded: true,
      });
    } catch (e) {
      console.error('Error loading menus from storage:', e);
    }

    // 2. Fetch from Database and sync
    try {
      const res = await apiFetch('/api/dfb/menus');
      if (res.ok) {
        const json = await res.json();
        const dbData = json.data || {};
        const dbMain = dbData.customMainMenus || [];
        const dbSub = dbData.customSubMenus || [];
        const dbHidden = dbData.hiddenMenus || [];

        // Merge DB data with local state without discarding newly added local items
        const currentMain = get().customMainMenus;
        const currentSub = get().customSubMenus;
        const currentHidden = get().hiddenMenus;

        const mergedMainMap = new Map<string, CustomMainMenu>();
        dbMain.forEach((m: CustomMainMenu) => { if (m?.id) mergedMainMap.set(m.id, m); });
        currentMain.forEach((m: CustomMainMenu) => { if (m?.id) mergedMainMap.set(m.id, m); });
        const mergedMain = Array.from(mergedMainMap.values());

        const mergedSubMap = new Map<string, CustomSubMenu>();
        dbSub.forEach((s: CustomSubMenu) => {
          const key = s.id || `${s.groupId}_${s.menuTitle}_${s.title}`;
          if (key) mergedSubMap.set(key, s);
        });
        currentSub.forEach((s: CustomSubMenu) => {
          const key = s.id || `${s.groupId}_${s.menuTitle}_${s.title}`;
          if (key) mergedSubMap.set(key, s);
        });
        const mergedSub = Array.from(mergedSubMap.values());

        const activeMergedKeys = new Set([
          ...mergedMain.map((m: any) => m.id),
          ...mergedMain.map((m: any) => m.title),
          ...mergedSub.map((s: any) => s.id),
          ...mergedSub.map((s: any) => s.title),
          ...mergedSub.map((s: any) => `sub_${s.groupId}_${s.menuTitle}_${s.title}`),
        ]);

        const mergedHiddenRaw = Array.from(new Set([...dbHidden, ...currentHidden]));
        const mergedHidden = mergedHiddenRaw.filter((k: string) => 
          k && 
          !activeMergedKeys.has(k) &&
          k !== 'اطلاعات پایه' && k !== 'عملیات' && k !== 'گزارشات' && k !== 'فهرست‌ها' && k !== 'پایان سال مالی' && k !== 'درخواست' &&
          k !== 'basic_info_accounting' && k !== 'accounting' && k !== 'financial_group' && k !== 'requests_warehouse' && k !== 'supply_requests_warehouse' && k !== 'purchase_invoice_warehouse'
        );

        set({
          customMainMenus: mergedMain,
          customSubMenus: mergedSub,
          hiddenMenus: mergedHidden,
          isLoaded: true,
        });

        localStorage.setItem(STORAGE_KEY_MAIN, JSON.stringify(mergedMain));
        localStorage.setItem(STORAGE_KEY_SUB, JSON.stringify(mergedSub));
        localStorage.setItem(STORAGE_KEY_HIDDEN, JSON.stringify(mergedHidden));

        // If merged state contains items not yet in DB, sync merged state back to DB
        if (mergedMain.length > dbMain.length || mergedSub.length > dbSub.length) {
          get().syncWithDatabase();
        }
      }
    } catch (e) {
      console.warn('Could not fetch custom menus from database:', e);
    }
  },

  syncWithDatabase: async () => {
    try {
      const { customMainMenus, customSubMenus, hiddenMenus } = get();
      await apiFetch('/api/dfb/menus/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customMainMenus,
          customSubMenus,
          hiddenMenus,
        }),
      });
    } catch (e) {
      console.warn('Error syncing menus to database:', e);
    }
  },

  setCustomMainMenus: (menus) => {
    set({ customMainMenus: menus });
    try {
      localStorage.setItem(STORAGE_KEY_MAIN, JSON.stringify(menus));
    } catch (e) {
      console.error(e);
    }
    notifyUpdate();
    get().syncWithDatabase();
  },

  setCustomSubMenus: (subMenus) => {
    set({ customSubMenus: subMenus });
    try {
      localStorage.setItem(STORAGE_KEY_SUB, JSON.stringify(subMenus));
    } catch (e) {
      console.error(e);
    }
    notifyUpdate();
    get().syncWithDatabase();
  },

  setHiddenMenus: (hidden) => {
    set({ hiddenMenus: hidden });
    try {
      localStorage.setItem(STORAGE_KEY_HIDDEN, JSON.stringify(hidden));
    } catch (e) {
      console.error(e);
    }
    notifyUpdate();
    get().syncWithDatabase();
  },

  setDynamicForms: (forms) => {
    set({ dynamicForms: forms });
  },

  addCustomMainMenu: (menu) => {
    const current = get().customMainMenus;
    const updated = [...current, menu];
    get().setCustomMainMenus(updated);
  },

  updateCustomMainMenu: (menu) => {
    const current = get().customMainMenus;
    const updated = current.map((m) => (m.id === menu.id ? menu : m));
    get().setCustomMainMenus(updated);
  },

  deleteCustomMainMenuNode: async (node) => {
    const current = get().customMainMenus;
    const updatedMain = current.filter(
      (m) =>
        m.id !== node.groupId &&
        m.id !== node.id &&
        m.title !== node.title &&
        `group_${m.id}` !== node.id &&
        `menu_${m.groupId}_${m.title}` !== node.id
    );
    get().setCustomMainMenus(updatedMain);

    const keysToAdd = [node.id].filter(Boolean);
    get().hideMenuKeys(keysToAdd);

    // Delete key from DB
    if (node.id) {
      try {
        await apiFetch(`/api/dfb/menus/${node.id}`, { method: 'DELETE' });
      } catch (e) {
        console.warn('Error deleting menu key from DB:', e);
      }
    }
  },

  addCustomSubMenu: (subMenu) => {
    const current = get().customSubMenus;
    const updated = [...current, subMenu];
    get().setCustomSubMenus(updated);
  },

  updateCustomSubMenu: (subMenu) => {
    const current = get().customSubMenus;
    const updated = current.map((s) => (s.id === subMenu.id ? subMenu : s));
    get().setCustomSubMenus(updated);
  },

  deleteCustomSubMenuNode: async (node) => {
    const current = get().customSubMenus;
    const updatedSub = current.filter(
      (s) => s.id !== node.id && s.title !== node.title && `submenu_${s.id}` !== node.id
    );
    get().setCustomSubMenus(updatedSub);

    const keysToAdd = [node.id].filter(Boolean);
    get().hideMenuKeys(keysToAdd);

    // Delete key from DB
    if (node.id) {
      try {
        await apiFetch(`/api/dfb/menus/${node.id}`, { method: 'DELETE' });
      } catch (e) {
        console.warn('Error deleting sub menu key from DB:', e);
      }
    }
  },

  hideMenuKeys: (keys) => {
    const currentHidden = get().hiddenMenus;
    const updatedHidden = Array.from(new Set([...currentHidden, ...keys]));
    get().setHiddenMenus(updatedHidden);
  },
}));
