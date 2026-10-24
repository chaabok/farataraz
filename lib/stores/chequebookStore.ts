import { create } from 'zustand';

interface ChequebookState {
  values: any;
  setValues: (values: any | ((prev: any) => any)) => void;
  items: any[];
  setItems: (items: any[] | ((prev: any[]) => any[])) => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  selectedItems: any[];
  setSelectedItems: (items: any[]) => void;
  reset: () => void;
}

const initialState = {
  values: {
    bankAccountRef: null,
    bankAccount: null,
    series: "",
    leafCount: "",
    startSerial: "",
    isActive: true,
  },
  items: [],
  errors: {},
  selectedItems: [],
};

export const useChequebookStore = create<ChequebookState>((set) => ({
  ...initialState,
  setValues: (values) => set((state) => ({ values: typeof values === 'function' ? values(state.values) : values })),
  setItems: (items) => set((state) => ({ items: typeof items === 'function' ? items(state.items) : items })),
  setErrors: (errors) => set({ errors }),
  setSelectedItems: (items) => set({ selectedItems: items }),
  reset: () => set({ ...initialState }),
}));
