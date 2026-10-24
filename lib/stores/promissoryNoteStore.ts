import { create } from 'zustand';

interface PromissoryNoteState {
  values: any;
  setValues: (val: any | ((prev: any) => any)) => void;
  items: any[];
  setItems: (val: any[] | ((prev: any[]) => any[])) => void;
  errors: any;
  setErrors: (val: any | ((prev: any) => any)) => void;
  maxLeaves: number;
  setMaxLeaves: (val: number) => void;
  isGenerating: boolean;
  setIsGenerating: (val: boolean) => void;
  isDeleting: boolean;
  setIsDeleting: (val: boolean) => void;
  reset: () => void;
}

const initialState = {
  values: {
    cashRef: null,
    cash: null,
    series: "",
    leafCount: "",
    startSerial: "",
    valueEach: "",
    status: 2,
  },
  items: [],
  errors: {},
  maxLeaves: 500,
  isGenerating: false,
  isDeleting: false,
};

export const usePromissoryNoteStore = create<PromissoryNoteState>((set) => ({
  ...initialState,
  setValues: (val) => set((state) => ({
    values: typeof val === 'function' ? val(state.values) : val
  })),
  setItems: (val) => set((state) => ({
    items: typeof val === 'function' ? val(state.items) : val
  })),
  setErrors: (val) => set((state) => ({
    errors: typeof val === 'function' ? val(state.errors) : val
  })),
  setMaxLeaves: (maxLeaves) => set({ maxLeaves }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setIsDeleting: (isDeleting) => set({ isDeleting }),
  reset: () => set({ ...initialState, values: { ...initialState.values }, items: [], errors: {} }),
}));
