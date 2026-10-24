import { create } from 'zustand';

interface ReportDesignerState {
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  showBorderToolbar: boolean;
  setShowBorderToolbar: (show: boolean) => void;
  previewData: any[];
  setPreviewData: (data: any[]) => void;
  previewError: string;
  setPreviewError: (error: string) => void;
  previewLoading: boolean;
  setPreviewLoading: (loading: boolean) => void;
  elements: any[];
  setElements: (elements: any[] | ((prev: any[]) => any[])) => void;
  selectedElementIds: string[];
  setSelectedElementIds: (ids: string[] | ((prev: string[]) => string[])) => void;
  showPropertiesPane: boolean;
  setShowPropertiesPane: (show: boolean) => void;
  showParamsModal: boolean;
  setShowParamsModal: (show: boolean) => void;
  paramValues: Record<string, any>;
  setParamValues: (values: Record<string, any> | ((prev: Record<string, any>) => Record<string, any>)) => void;
  canUndo: boolean;
  setCanUndo: (can: boolean) => void;
  canRedo: boolean;
  setCanRedo: (can: boolean) => void;
  formulaToDelete: string | null;
  setFormulaToDelete: (f: string | null) => void;
}

export const useReportDesignerStore = create<ReportDesignerState>((set) => ({
  showPreview: false,
  setShowPreview: (show) => set({ showPreview: show }),
  showBorderToolbar: false,
  setShowBorderToolbar: (show) => set({ showBorderToolbar: show }),
  previewData: [],
  setPreviewData: (data) => set({ previewData: data }),
  previewError: '',
  setPreviewError: (error) => set({ previewError: error }),
  previewLoading: false,
  setPreviewLoading: (loading) => set({ previewLoading: loading }),
  elements: [],
  setElements: (elements) => set((state) => ({ elements: typeof elements === 'function' ? elements(state.elements) : elements })),
  selectedElementIds: [],
  setSelectedElementIds: (ids) => set((state) => ({ selectedElementIds: typeof ids === 'function' ? ids(state.selectedElementIds) : ids })),
  showPropertiesPane: false,
  setShowPropertiesPane: (show) => set({ showPropertiesPane: show }),
  showParamsModal: false,
  setShowParamsModal: (show) => set({ showParamsModal: show }),
  paramValues: {},
  setParamValues: (values) => set((state) => ({ paramValues: typeof values === 'function' ? values(state.paramValues) : values })),
  canUndo: false,
  setCanUndo: (can) => set({ canUndo: can }),
  canRedo: false,
  setCanRedo: (can) => set({ canRedo: can }),
  formulaToDelete: null,
  setFormulaToDelete: (f) => set({ formulaToDelete: f }),
}));
