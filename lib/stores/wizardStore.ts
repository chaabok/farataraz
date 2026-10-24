import { create } from 'zustand';

interface WizardState {
  wizards: Record<string, { currentStep: number; data: any }>;
  setStep: (wizardId: string, step: number) => void;
  setWizardData: (wizardId: string, data: Partial<any>) => void;
  clearWizard: (wizardId: string) => void;
}

export const useWizardStore = create<WizardState>((set, get) => ({
  wizards: {},
  setStep: (wizardId, step) => set((state) => ({
    wizards: {
      ...state.wizards,
      [wizardId]: {
        ...state.wizards[wizardId],
        currentStep: step,
        data: state.wizards[wizardId]?.data || {}
      }
    }
  })),
  setWizardData: (wizardId, data) => set((state) => ({
    wizards: {
      ...state.wizards,
      [wizardId]: {
        ...state.wizards[wizardId],
        currentStep: state.wizards[wizardId]?.currentStep || 0,
        data: { ...(state.wizards[wizardId]?.data || {}), ...data }
      }
    }
  })),
  clearWizard: (wizardId) => set((state) => {
    const newWizards = { ...state.wizards };
    delete newWizards[wizardId];
    return { wizards: newWizards };
  })
}));
