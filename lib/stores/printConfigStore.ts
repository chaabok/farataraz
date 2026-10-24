import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface PrintConfig {
  paperSize: 'A4' | 'A5' | 'Letter';
  orientation: 'portrait' | 'landscape';
  showHeaders: boolean;
  showFooters: boolean;
  fontSize: 'small' | 'medium' | 'large';
  showDate?: boolean;
  showCompanyName?: boolean;
  companyName?: string;
  [key: string]: any; // Allow indexing
}

const defaultConfig: PrintConfig = {
  paperSize: 'A4',
  orientation: 'portrait',
  showHeaders: true,
  showFooters: true,
  fontSize: 'medium',
  showDate: true,
  showCompanyName: true,
  companyName: "شرکت نمونه"
};

interface PrintConfigState {
  configs: Record<string, PrintConfig>;
  getConfig: (formId: string) => PrintConfig;
  setConfig: (formId: string, config: Partial<PrintConfig>) => void;
}

export const usePrintConfigStore = create<PrintConfigState>()(
  persist(
    (set, get) => ({
      configs: {},
      getConfig: (formId) => get().configs[formId] || defaultConfig,
      setConfig: (formId, config) => set((state) => ({
        configs: { ...state.configs, [formId]: { ...(state.configs[formId] || defaultConfig), ...config } }
      }))
    }),
    {
      name: 'parsa-erp-print-config',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
