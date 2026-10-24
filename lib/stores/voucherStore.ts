import { create } from 'zustand';

interface VoucherState {
  fetchedData: any;
  setFetchedData: (data: any) => void;
  selectedFiscalYear: string;
  setSelectedFiscalYear: (year: string) => void;
  detailedLevelsCount: number;
  setDetailedLevelsCount: (count: number) => void;
  showTrackingColumnsInVoucher: boolean;
  setShowTrackingColumnsInVoucher: (show: boolean) => void;
  requireTrackingInfoIfEnabled: boolean;
  setRequireTrackingInfoIfEnabled: (require: boolean) => void;
  showCurrencyColumnsInVoucher: boolean;
  setShowCurrencyColumnsInVoucher: (show: boolean) => void;
  colWidths: Record<string, number>;
  setColWidths: (widths: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => void;
  header: any;
  setHeader: (header: any | ((prev: any) => any)) => void;
  fiscalYearDetails: any | null;
  setFiscalYearDetails: (details: any | null) => void;
  voucherDateError: string;
  setVoucherDateError: (error: string) => void;
  voucherStatus: string | number;
  setVoucherStatus: (status: string | number) => void;
  isSaving: boolean;
  setIsSaving: (isSaving: boolean) => void;
  isVoucherNoAuto: boolean;
  setIsVoucherNoAuto: (isAuto: boolean) => void;
  isReferenceNoAuto: boolean;
  setIsReferenceNoAuto: (isAuto: boolean) => void;
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (isOpen: boolean) => void;
  deleteActionType: 'delete' | 'delete_and_new' | null;
  setDeleteActionType: (type: 'delete' | 'delete_and_new' | null) => void;
  hasSaved: boolean;
  setHasSaved: (hasSaved: boolean) => void;
  items: any[];
  setItems: (items: any[] | ((prev: any[]) => any[])) => void;
  selectedRowIndex: number | null;
  setSelectedRowIndex: (index: number | null) => void;
  focusedCell: { rowIndex: number; field: string } | null;
  setFocusedCell: (cell: { rowIndex: number; field: string } | null) => void;
  footer: any;
  setFooter: (footer: any | ((prev: any) => any)) => void;
}

export const useVoucherStore = create<VoucherState>((set) => ({
  fetchedData: null,
  setFetchedData: (data) => set({ fetchedData: data }),
  selectedFiscalYear: '',
  setSelectedFiscalYear: (year) => set({ selectedFiscalYear: year }),
  detailedLevelsCount: 10,
  setDetailedLevelsCount: (count) => set({ detailedLevelsCount: count }),
  showTrackingColumnsInVoucher: true,
  setShowTrackingColumnsInVoucher: (show) => set({ showTrackingColumnsInVoucher: show }),
  requireTrackingInfoIfEnabled: false,
  setRequireTrackingInfoIfEnabled: (require) => set({ requireTrackingInfoIfEnabled: require }),
  showCurrencyColumnsInVoucher: false,
  setShowCurrencyColumnsInVoucher: (show) => set({ showCurrencyColumnsInVoucher: show }),
  colWidths: {
    rowNumber: 40,
    accountInfo: 250,
    detailed1: 150,
    detailed2: 150,
    detailed3: 150,
    costCenter: 150,
    description: 300,
    debit: 150,
    credit: 150,
    referenceNo: 100,
    referenceDate: 120,
    trackingNo: 100,
    trackingDate: 120,
    currencyAmount: 150,
    currencyType: 120,
    exchangeRate: 100,
  },
  setColWidths: (widths) => set((state) => ({ colWidths: typeof widths === 'function' ? widths(state.colWidths) : widths })),
  header: {
    voucherNumber: '',
    referenceNumber: '',
    voucherDate: '',
    voucherType: null,
    description: '',
    dailyNumber: '',
    voucherNature: 'عادی',
    description2: '',
    subNumber: '',
    creatorName: '',
  },
  setHeader: (header) => set((state) => ({ header: typeof header === 'function' ? header(state.header) : header })),
  fiscalYearDetails: null,
  setFiscalYearDetails: (details) => set({ fiscalYearDetails: details }),
  voucherDateError: '',
  setVoucherDateError: (error) => set({ voucherDateError: error }),
  voucherStatus: '',
  setVoucherStatus: (status) => set({ voucherStatus: status }),
  isSaving: false,
  setIsSaving: (isSaving) => set({ isSaving: isSaving }),
  isVoucherNoAuto: false,
  setIsVoucherNoAuto: (isAuto) => set({ isVoucherNoAuto: isAuto }),
  isReferenceNoAuto: false,
  setIsReferenceNoAuto: (isAuto) => set({ isReferenceNoAuto: isAuto }),
  isDeleteModalOpen: false,
  setIsDeleteModalOpen: (isOpen) => set({ isDeleteModalOpen: isOpen }),
  deleteActionType: null,
  setDeleteActionType: (type) => set({ deleteActionType: type }),
  hasSaved: false,
  setHasSaved: (hasSaved) => set({ hasSaved: hasSaved }),
  items: [],
  setItems: (items) => set((state) => ({ items: typeof items === 'function' ? items(state.items) : items })),
  selectedRowIndex: null,
  setSelectedRowIndex: (index) => set({ selectedRowIndex: index }),
  focusedCell: null,
  setFocusedCell: (cell) => set({ focusedCell: cell }),
  footer: {
    totalDebit: 0,
    totalCredit: 0,
    totalCurrencyAmount: 0,
    difference: 0,
  },
  setFooter: (footer) => set((state) => ({ footer: typeof footer === 'function' ? footer(state.footer) : footer })),
}));
