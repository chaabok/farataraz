import { create } from 'zustand';

interface LicenseState {
  modules: string[];
  setModules: (modules: string[]) => void;
  hasModule: (module: string) => boolean;
}

export const useLicenseStore = create<LicenseState>((set, get) => ({
  modules: [],
  setModules: (modules: string[]) => set({ modules }),
  hasModule: (module: string) => true, // Bypassed for development
}));
