import { create } from 'zustand';

interface PaymentNotificationState {
  values: Record<string, any>;
  setValues: (values: Record<string, any> | ((prev: Record<string, any>) => Record<string, any>)) => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  printCheckData: any;
  setPrintCheckData: (data: any) => void;
  isPrintDialogOpen: boolean;
  setIsPrintDialogOpen: (isOpen: boolean) => void;
  activeRowData: any;
  setActiveRowData: (data: any) => void;
  reset: () => void;
}

const initialState = {
  values: {
    baseType: "بدون مبنا",
    number: "",
    date: "", // Initialized in component with moment
    partyRef: null,
    party: null,
    paymentType: "تسویه تعهدات",
    isSettlement: false,
    baseNumber: "",
    status: 2,
    currency: "",
    description: "",
    cheques: [],
    cashes: [],
    withdrawals: [],
  },
  errors: {},
  printCheckData: null,
  isPrintDialogOpen: false,
  activeRowData: null,
};

export const usePaymentNotificationStore = create<PaymentNotificationState>((set) => ({
  ...initialState,
  setValues: (values) => set((state) => ({ values: typeof values === 'function' ? values(state.values) : values })),
  setErrors: (errors) => set({ errors }),
  setPrintCheckData: (data) => set({ printCheckData: data }),
  setIsPrintDialogOpen: (isOpen) => set({ isPrintDialogOpen: isOpen }),
  setActiveRowData: (data) => set({ activeRowData: data }),
  reset: () => set({ ...initialState }),
}));
