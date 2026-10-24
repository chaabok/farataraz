import { create } from 'zustand';

interface AccountsState {
  loading: boolean;
  setLoading: (val: boolean) => void;
  isSubmitting: boolean;
  setIsSubmitting: (val: boolean) => void;
  flatAccounts: any[];
  setFlatAccounts: (val: any[]) => void;
  treeData: any;
  setTreeData: (val: any | ((prev: any) => any)) => void;
  selectedNode: any;
  setSelectedNode: (val: any | ((prev: any) => any)) => void;
  nodeToDelete: any;
  setNodeToDelete: (val: any) => void;
  detailedTypes: any[];
  setDetailedTypes: (val: any[]) => void;
  selectingDetailedLevel: number | null;
  setSelectingDetailedLevel: (val: number | null) => void;
  usersList: any[];
  setUsersList: (val: any[]) => void;
  values: any;
  setValues: (val: any | ((prev: any) => any)) => void;
  errors: any;
  setErrors: (val: any | ((prev: any) => any)) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  activeSubTab: string;
  setActiveSubTab: (val: string) => void;
  activeDetailedLevel: number;
  setActiveDetailedLevel: (val: number) => void;
  accountingSettings: any;
  setAccountingSettings: (val: any) => void;
  exportModalVisible: boolean;
  setExportModalVisible: (val: boolean) => void;
  exportAction: 'pdf' | 'excel' | 'word' | 'print' | null;
  setExportAction: (val: 'pdf' | 'excel' | 'word' | 'print' | null) => void;
  exportLevels: { group: boolean; total: boolean; specific: boolean; detailed: boolean; };
  setExportLevels: (val: { group: boolean; total: boolean; specific: boolean; detailed: boolean; } | ((prev: { group: boolean; total: boolean; specific: boolean; detailed: boolean; }) => { group: boolean; total: boolean; specific: boolean; detailed: boolean; })) => void;
  reset: () => void;
}

const initialState = {
  loading: true,
  isSubmitting: false,
  flatAccounts: [],
  treeData: [],
  selectedNode: null,
  nodeToDelete: null,
  detailedTypes: [],
  selectingDetailedLevel: null,
  usersList: [],
  values: {},
  errors: {},
  searchQuery: '',
  activeSubTab: 'detailedLevels',
  activeDetailedLevel: 1,
  accountingSettings: null,
  exportModalVisible: false,
  exportAction: null as any,
  exportLevels: { group: true, total: true, specific: true, detailed: true },
};

export const useAccountsStore = create<AccountsState>((set) => ({
  ...initialState,
  setLoading: (loading) => set({ loading }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  setFlatAccounts: (flatAccounts) => set({ flatAccounts }),
  setTreeData: (val) => set((state) => ({ treeData: typeof val === 'function' ? val(state.treeData) : val })),
  setSelectedNode: (val) => set((state) => ({ selectedNode: typeof val === 'function' ? val(state.selectedNode) : val })),
  setNodeToDelete: (nodeToDelete) => set({ nodeToDelete }),
  setDetailedTypes: (detailedTypes) => set({ detailedTypes }),
  setSelectingDetailedLevel: (selectingDetailedLevel) => set({ selectingDetailedLevel }),
  setUsersList: (usersList) => set({ usersList }),
  setValues: (val) => set((state) => ({ values: typeof val === 'function' ? val(state.values) : val })),
  setErrors: (val) => set((state) => ({ errors: typeof val === 'function' ? val(state.errors) : val })),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setActiveSubTab: (activeSubTab) => set({ activeSubTab }),
  setActiveDetailedLevel: (activeDetailedLevel) => set({ activeDetailedLevel }),
  setAccountingSettings: (accountingSettings) => set({ accountingSettings }),
  setExportModalVisible: (exportModalVisible) => set({ exportModalVisible }),
  setExportAction: (exportAction) => set({ exportAction }),
  setExportLevels: (val) => set((state) => ({ 
    exportLevels: typeof val === 'function' ? val(state.exportLevels) : val 
  })),
  reset: () => set(initialState),
}));
