import { create } from 'zustand';

interface PartyState {
  values: Record<string, any>;
  setValues: (values: Record<string, any> | ((prev: Record<string, any>) => Record<string, any>)) => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

export const usePartyStore = create<PartyState>((set) => ({
  values: {
    nature: 'real_person',
    isActive: true,
    PartyRelatedPersons: [],
    PartyAddresses: [],
    PartyPhones: [],
    PartyMoreDetail: {
      isSupplier: false,
      balance: '',
      balanceStatus: '',
      isCustomer: false,
      customerBalance: '',
      customerBalanceStatus: '',
    },
  },
  setValues: (values) => set((state) => ({
    values: typeof values === 'function' ? values(state.values) : values
  })),
  errors: {},
  setErrors: (errors) => set({ errors }),
  isSubmitting: false,
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
}));
