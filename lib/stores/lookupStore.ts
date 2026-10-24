import { create } from 'zustand';
import { apiFetch } from '@/lib/utils';

interface LookupData {
  data: any[];
  timestamp: number;
  loading: boolean;
}

interface LookupState {
  cache: Record<string, LookupData>;
  fetchLookup: (key: string, endpoint: string, maxAgeMs?: number) => Promise<any[]>;
  invalidate: (key: string) => void;
  invalidateAll: () => void;
}

export const useLookupStore = create<LookupState>((set, get) => ({
  cache: {},
  fetchLookup: async (key, endpoint, maxAgeMs = 5 * 60 * 1000) => {
    const state = get();
    const existing = state.cache[key];
    const now = Date.now();

    // Return cached if valid and not currently loading
    if (existing && !existing.loading && (now - existing.timestamp < maxAgeMs)) {
      return existing.data;
    }

    // Set loading state
    set((s) => ({
      cache: { ...s.cache, [key]: { ...(s.cache[key] || { data: [], timestamp: 0 }), loading: true } }
    }));

    try {
      const response = await apiFetch(endpoint);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      
      let data = result;
      if (result && Array.isArray(result.data)) {
          data = result.data; 
      } else if (result && result.data) {
          data = result.data;
      }
      
      // Ensure data is array if it's supposed to be (fallback)
      if (!Array.isArray(data)) {
         data = [];
      }

      set((s) => ({
         cache: { ...s.cache, [key]: { data, timestamp: Date.now(), loading: false } }
      }));
      return data;
    } catch (error) {
      console.error(`Failed to fetch lookup ${key}:`, error);
      set((s) => ({
        cache: { ...s.cache, [key]: { ...(s.cache[key] || { data: [], timestamp: 0 }), loading: false } }
      }));
      return existing?.data || [];
    }
  },
  invalidate: (key) => set((s) => {
    const newCache = { ...s.cache };
    delete newCache[key];
    return { cache: newCache };
  }),
  invalidateAll: () => set({ cache: {} })
}));
