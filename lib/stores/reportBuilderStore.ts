import { create } from 'zustand';

interface ReportBuilderState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDesigning: boolean;
  setIsDesigning: (designing: boolean) => void;
  isPreviewing: boolean;
  setIsPreviewing: (previewing: boolean) => void;
  selectedSystemId: string | null;
  setSelectedSystemId: (id: string | null) => void;
  selectedTableId: string | null;
  setSelectedTableId: (id: string | null) => void;
  designerDirty: boolean;
  setDesignerDirty: (dirty: boolean) => void;
  designerPreviewLoading: boolean;
  setDesignerPreviewLoading: (loading: boolean) => void;
  showCloseConfirm: boolean;
  setShowCloseConfirm: (show: boolean) => void;
  closeTarget: 'designer' | 'builder' | null;
  setCloseTarget: (target: 'designer' | 'builder' | null) => void;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
  systemsTreeData: any | null;
  setSystemsTreeData: (data: any | null) => void;
  systemsTablesMap: Record<string, string[]>;
  setSystemsTablesMap: (map: Record<string, string[]>) => void;
  reportTitle: string;
  setReportTitle: (title: string) => void;
  reportGroupId: string;
  setReportGroupId: (id: string) => void;
  userGroups: any[];
  setUserGroups: (groups: any[]) => void;
  reportConfig: any;
  setReportConfig: (config: any | ((prev: any) => any)) => void;
  savedReportId: string | null;
  setSavedReportId: (id: string | null) => void;
  scriptContent: string;
  setScriptContent: (content: string) => void;
  hasStartedPreviewFetch: boolean;
  setHasStartedPreviewFetch: (fetch: boolean) => void;
  tableFields: any[];
  setTableFields: (fields: any[]) => void;
  selectedFields: any[];
  setSelectedFields: (fields: any[] | ((prev: any[]) => any[])) => void;
  relatedTables: any[];
  setRelatedTables: (tables: any[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  dbError: string | null;
  setDbError: (error: string | null) => void;
  groupedFields: any[];
  setGroupedFields: (fields: any[] | ((prev: any[]) => any[])) => void;
  formulas: {name: string, expression: string}[];
  setFormulas: (formulas: {name: string, expression: string}[] | ((prev: {name: string, expression: string}[]) => {name: string, expression: string}[])) => void;
  selectedAvailableGroupingNode: string | null;
  setSelectedAvailableGroupingNode: (node: string | null) => void;
  selectedGroupedNode: string | null;
  setSelectedGroupedNode: (node: string | null) => void;
  aggregates: any[];
  setAggregates: (aggregates: any[] | ((prev: any[]) => any[])) => void;
  selectedAvailableAggregateNode: string | null;
  setSelectedAvailableAggregateNode: (node: string | null) => void;
  selectedAggregateNode: string | null;
  setSelectedAggregateNode: (node: string | null) => void;
  isSigmaDropdownOpen: boolean;
  setIsSigmaDropdownOpen: (open: boolean) => void;
  selectedFormulaName: string | null;
  setSelectedFormulaName: (name: string | null) => void;
  showFormulaNameModal: boolean;
  setShowFormulaNameModal: (show: boolean) => void;
  formulaName: string;
  setFormulaName: (name: string) => void;
  formulaExpression: string;
  setFormulaExpression: (expression: string | ((prev: string) => string)) => void;
  showFormulaEditorModal: boolean;
  setShowFormulaEditorModal: (show: boolean) => void;
  // Report Structure Tab States
  structureItems: any[]; // Items dropped into bands
  setStructureItems: (items: any[] | ((prev: any[]) => any[])) => void;
  structureSelectedAvailableNode: string | null;
  setStructureSelectedAvailableNode: (node: string | null) => void;
  structureSelectedNode: string | null; // which band or item in band is selected
  setStructureSelectedNode: (node: string | null) => void;
  structureBandProperties: Record<string, any>;
  setStructureBandProperties: (props: Record<string, any> | ((prev: Record<string, any>) => Record<string, any>)) => void;
}

export const useReportBuilderStore = create<ReportBuilderState>((set) => ({
  activeTab: "tables",
  setActiveTab: (tab) => set({ activeTab: tab }),
  isDesigning: false,
  setIsDesigning: (designing) => set({ isDesigning: designing }),
  isPreviewing: false,
  setIsPreviewing: (previewing) => set({ isPreviewing: previewing }),
  selectedSystemId: null,
  setSelectedSystemId: (id) => set({ selectedSystemId: id }),
  selectedTableId: null,
  setSelectedTableId: (id) => set({ selectedTableId: id }),
  designerDirty: false,
  setDesignerDirty: (dirty) => set({ designerDirty: dirty }),
  designerPreviewLoading: false,
  setDesignerPreviewLoading: (loading) => set({ designerPreviewLoading: loading }),
  showCloseConfirm: false,
  setShowCloseConfirm: (show) => set({ showCloseConfirm: show }),
  closeTarget: null,
  setCloseTarget: (target) => set({ closeTarget: target }),
  isSaving: false,
  setIsSaving: (saving) => set({ isSaving: saving }),
  systemsTreeData: null,
  setSystemsTreeData: (data) => set({ systemsTreeData: data }),
  systemsTablesMap: {},
  setSystemsTablesMap: (map) => set({ systemsTablesMap: map }),
  reportTitle: "",
  setReportTitle: (title) => set({ reportTitle: title }),
  reportGroupId: "",
  setReportGroupId: (id) => set({ reportGroupId: id }),
  userGroups: [],
  setUserGroups: (groups) => set({ userGroups: groups }),
  reportConfig: { isPublic: true },
  setReportConfig: (config) => set((state) => ({ reportConfig: typeof config === 'function' ? config(state.reportConfig) : config })),
  savedReportId: null,
  setSavedReportId: (id) => set({ savedReportId: id }),
  scriptContent: "",
  setScriptContent: (content) => set({ scriptContent: content }),
  hasStartedPreviewFetch: false,
  setHasStartedPreviewFetch: (fetch) => set({ hasStartedPreviewFetch: fetch }),
  tableFields: [],
  setTableFields: (fields) => set({ tableFields: fields }),
  selectedFields: [],
  setSelectedFields: (fields) => set((state) => ({ selectedFields: typeof fields === 'function' ? fields(state.selectedFields) : fields })),
  relatedTables: [],
  setRelatedTables: (tables) => set({ relatedTables: tables }),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  dbError: null,
  setDbError: (error) => set({ dbError: error }),
  groupedFields: [],
  setGroupedFields: (fields) => set((state) => ({ groupedFields: typeof fields === 'function' ? fields(state.groupedFields) : fields })),
  formulas: [],
  setFormulas: (formulas) => set((state) => ({ formulas: typeof formulas === 'function' ? formulas(state.formulas) : formulas })),
  selectedAvailableGroupingNode: null,
  setSelectedAvailableGroupingNode: (node) => set({ selectedAvailableGroupingNode: node }),
  selectedGroupedNode: null,
  setSelectedGroupedNode: (node) => set({ selectedGroupedNode: node }),
  aggregates: [],
  setAggregates: (aggregates) => set((state) => ({ aggregates: typeof aggregates === 'function' ? aggregates(state.aggregates) : aggregates })),
  selectedAvailableAggregateNode: null,
  setSelectedAvailableAggregateNode: (node) => set({ selectedAvailableAggregateNode: node }),
  selectedAggregateNode: null,
  setSelectedAggregateNode: (node) => set({ selectedAggregateNode: node }),
  isSigmaDropdownOpen: false,
  setIsSigmaDropdownOpen: (open) => set({ isSigmaDropdownOpen: open }),
  selectedFormulaName: null,
  setSelectedFormulaName: (name) => set({ selectedFormulaName: name }),
  showFormulaNameModal: false,
  setShowFormulaNameModal: (show) => set({ showFormulaNameModal: show }),
  formulaName: "",
  setFormulaName: (name) => set({ formulaName: name }),
  formulaExpression: "",
  setFormulaExpression: (expression) => set((state) => ({ formulaExpression: typeof expression === 'function' ? expression(state.formulaExpression) : expression })),
  showFormulaEditorModal: false,
  setShowFormulaEditorModal: (show) => set({ showFormulaEditorModal: show }),
  structureItems: [],
  setStructureItems: (items) => set((state) => ({ structureItems: typeof items === 'function' ? items(state.structureItems) : items })),
  structureSelectedAvailableNode: null,
  setStructureSelectedAvailableNode: (node) => set({ structureSelectedAvailableNode: node }),
  structureSelectedNode: null,
  setStructureSelectedNode: (node) => set({ structureSelectedNode: node }),
  structureBandProperties: {},
  setStructureBandProperties: (props) => set((state) => ({ structureBandProperties: typeof props === 'function' ? props(state.structureBandProperties) : props })),
}));
