import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface DraftState {
  drafts: Record<string, any>;
  setDraft: (formId: string, data: any) => void;
  getDraft: (formId: string) => any;
  clearDraft: (formId: string) => void;
  clearAllDrafts: () => void;
}

export const useDraftStore = create<DraftState>()(
  persist(
    (set, get) => ({
      drafts: {},
      setDraft: (formId, data) => set((state) => ({
        drafts: { ...state.drafts, [formId]: data }
      })),
      getDraft: (formId) => get().drafts[formId],
      clearDraft: (formId) => set((state) => {
        const newDrafts = { ...state.drafts };
        delete newDrafts[formId];
        return { drafts: newDrafts };
      }),
      clearAllDrafts: () => set({ drafts: {} })
    }),
    {
      name: 'parsa-erp-form-drafts',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
