import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UserPrefsState {
  density: 'compact' | 'comfortable' | 'spacious';
  setDensity: (density: 'compact' | 'comfortable' | 'spacious') => void;
  animationsEnabled: boolean;
  setAnimationsEnabled: (enabled: boolean) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
}

export const useUserPrefsStore = create<UserPrefsState>()(
  persist(
    (set) => ({
      density: 'compact',
      setDensity: (density) => set({ density }),
      animationsEnabled: true,
      setAnimationsEnabled: (animationsEnabled) => set({ animationsEnabled }),
      fontSize: 14,
      setFontSize: (fontSize) => set({ fontSize })
    }),
    {
      name: 'parsa-erp-user-prefs',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
