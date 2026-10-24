"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { SimpleFormTwoRowTabbed } from "../SimpleFormTwoRowTabbed";
import { FieldConfig } from "../SimpleFormTwoRow";
import { SingleSelectDropDown, SingleSelectColumn } from "@/components/inputs/SingleSelectDropDown";
import { NumberInput } from "@/components/inputs/NumberInput";
import { TextInput } from "@/components/inputs/TextInput";
import { TextArea } from "@/components/inputs/TextArea";
import { DateInput, getTodayFormattedDate } from "@/components/inputs/DateInput";
import { Select } from "@/components/inputs/Select";
import { StateListInput, DocumentState, DocumentStateLabels, isStatusApprovedOrReviewed } from "@/components/inputs/StateListInput";
import { useTabs } from "@/components/TabsProvider";
import { useToast } from "@/components/ToastProvider";
import { apiFetch } from "@/lib/utils";
import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import { useFiscalYearCheck } from "@/hooks/useFiscalYearCheck";
import { TrackingFactorModal, TrackingFactorItem } from "./TrackingFactorModal";
import { SubUnitModal, SubUnitItem } from "@/components/inputs/SubUnitModal";
import { AmountInput } from "@/components/inputs/AmountInput";
import { MainDataGrid, DataGridColumn } from "@/components/ui/MainDataGrid";
import { StocktakingDiscrepancyButtons } from "@/components/buttons/StocktakingDiscrepancyButtons";
import { StocktakingSurplusModal } from "./StocktakingSurplusModal";
import { StocktakingShortageModal } from "./StocktakingShortageModal";
import { Layers, Plus, ClipboardList, Warehouse as WarehouseIcon, FileText, CheckCircle2 } from "lucide-react";

interface StocktakingFormProps {
  id?: number | string;
  tabId?: string;
  onClose?: () => void;
  onSaved?: () => void;
}

export interface StocktakingItemGridRow {
  RowNumber: number;
  StocktakingTagDetailID?: number;
  ItemRef: number;
  ItemCode: string;
  ItemTitle: string;
  MeasurementUnitName: string;
  TagNumber: string;
  CountedQuantity: number;
  Description: string;
  hasTrackingFactors?: boolean;
  trackingFactors?: TrackingFactorItem[];
  savedTrackingFactorValues?: any[];
  savedTrackingFactorArray?: any[];
  hasSubUnits?: boolean;
  subUnits?: SubUnitItem[];
  selectedSubUnitName?: string;
  SubQuantity?: number;
}

// Helper to format tracking factors for backend DTO validation
function formatTrackingFactorsForBackend(item: StocktakingItemGridRow): Array<{
  StocktakingCountTrackingFactorID?: number;
  TrackingFactorRef: number;
  FactorValue: string;
  CountedQuantity: number;
}> {
  // 1. If normalized array was already prepared from modal save
  if (Array.isArray(item.savedTrackingFactorArray) && item.savedTrackingFactorArray.length > 0) {
    const validList = item.savedTrackingFactorArray
      .filter((tf: any) => tf && tf.TrackingFactorRef && !isNaN(Number(tf.TrackingFactorRef)) && Number(tf.TrackingFactorRef) > 0)
      .map((tf: any) => ({
        ...(tf.StocktakingCountTrackingFactorID ? { StocktakingCountTrackingFactorID: Number(tf.StocktakingCountTrackingFactorID) } : {}),
        TrackingFactorRef: Number(tf.TrackingFactorRef),
        FactorValue: String(tf.FactorValue ?? ''),
        CountedQuantity: Number(tf.CountedQuantity !== undefined && tf.CountedQuantity !== null ? tf.CountedQuantity : (item.CountedQuantity || 0)),
      }));
    if (validList.length > 0) return validList;
  }

  // 2. If savedTrackingFactorValues is present
  if (Array.isArray(item.savedTrackingFactorValues) && item.savedTrackingFactorValues.length > 0) {
    // Check if it's already DB entity format (e.g. loaded from backend)
    const isDbFormat = item.savedTrackingFactorValues.some(
      (tf: any) => tf && typeof tf === 'object' && (tf.TrackingFactorRef || tf.TrackingFactorID)
    );

    if (isDbFormat) {
      const validDbList = item.savedTrackingFactorValues
        .filter((tf: any) => tf && (tf.TrackingFactorRef || tf.TrackingFactorID) && !isNaN(Number(tf.TrackingFactorRef || tf.TrackingFactorID)) && Number(tf.TrackingFactorRef || tf.TrackingFactorID) > 0)
        .map((tf: any) => ({
          ...(tf.StocktakingCountTrackingFactorID ? { StocktakingCountTrackingFactorID: Number(tf.StocktakingCountTrackingFactorID) } : {}),
          TrackingFactorRef: Number(tf.TrackingFactorRef || tf.TrackingFactorID),
          FactorValue: String(tf.FactorValue ?? tf.factorValue ?? tf.value ?? ''),
          CountedQuantity: Number(tf.CountedQuantity !== undefined && tf.CountedQuantity !== null ? tf.CountedQuantity : (item.CountedQuantity || 0)),
        }));
      if (validDbList.length > 0) return validDbList;
    }

    // Otherwise, parse modal grid row keys
    const result: Array<{ TrackingFactorRef: number; FactorValue: string; CountedQuantity: number }> = [];
    item.savedTrackingFactorValues.forEach((r: any) => {
      if (!r || typeof r !== 'object') return;
      const rowQty = Number(r.Quantity !== undefined && r.Quantity !== null && r.Quantity !== '' ? r.Quantity : (item.CountedQuantity || 0));
      const processedFactors = new Set<string>();

      Object.keys(r).forEach((key) => {
        if (key === '_id' || key === 'id' || key === 'Quantity' || key === 'quantity') return;

        if (key.endsWith('_Start') || key.endsWith('_End')) {
          const baseKey = key.replace('_Start', '').replace('_End', '');
          if (processedFactors.has(baseKey)) return;
          processedFactors.add(baseKey);

          const startVal = r[`${baseKey}_Start`] || '';
          const endVal = r[`${baseKey}_End`] || '';
          let factorVal = '';
          if (startVal && endVal) {
            factorVal = `${startVal}-${endVal}`;
          } else {
            factorVal = startVal || endVal || '';
          }

          const tfRefNum = Number(baseKey);
          if (factorVal && !isNaN(tfRefNum) && tfRefNum > 0) {
            result.push({
              TrackingFactorRef: tfRefNum,
              FactorValue: factorVal,
              CountedQuantity: rowQty,
            });
          }
        } else if (!key.includes('_')) {
          const val = r[key];
          const tfRefNum = Number(key);
          if (val !== undefined && val !== null && String(val).trim() !== '' && !isNaN(tfRefNum) && tfRefNum > 0) {
            result.push({
              TrackingFactorRef: tfRefNum,
              FactorValue: String(val).trim(),
              CountedQuantity: rowQty,
            });
          }
        }
      });
    });

    if (result.length > 0) return result;
  }

  return [];
}

// Helper function to format numbers with thousands separators (3 digits separated by comma)
function formatWithCommas(val: string | number): string {
  if (val === undefined || val === null || val === "") return "";
  const str = String(val).replace(/,/g, "");
  if (str === "") return "";
  const parts = str.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

// Optimized cell input component for CountedQuantity with fast keyboard navigation and auto-selection
const CountedQuantityCell = React.memo(function CountedQuantityCell({
  rowIndex,
  value,
  disabled,
  onChange,
}: {
  rowIndex: number;
  value: number;
  disabled?: boolean;
  onChange: (rowIndex: number, val: number) => void;
}) {
  const [localStr, setLocalStr] = useState<string>(
    value !== undefined && value !== null ? formatWithCommas(value) : "0"
  );
  const isEditingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const latestOnChangeRef = useRef(onChange);
  const latestValueRef = useRef(value);

  useEffect(() => {
    latestOnChangeRef.current = onChange;
  });

  useEffect(() => {
    latestValueRef.current = value;
    if (!isEditingRef.current) {
      const formattedProp = value !== undefined && value !== null ? formatWithCommas(value) : "0";
      setLocalStr(formattedProp);
    }
  }, [value]);

  const commitValue = useCallback((strVal: string) => {
    const cleanStr = strVal.replace(/,/g, "");
    const parsed = parseFloat(cleanStr);
    const finalNum = isNaN(parsed) ? 0 : parsed;

    // Only update parent state if the numerical value actually changed
    if (finalNum !== latestValueRef.current) {
      latestValueRef.current = finalNum;
      latestOnChangeRef.current(rowIndex, finalNum);
    }
  }, [rowIndex]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const rawVal = e.target.value.replace(/[^0-9.]/g, "");
    const formatted = formatWithCommas(rawVal);
    // Instant local state update, NO parent re-renders while typing!
    setLocalStr(formatted);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    isEditingRef.current = true;
    // Auto-select text on focus so user can instantly type a new number
    e.target.select();
  };

  const handleBlur = () => {
    isEditingRef.current = false;
    const cleanStr = localStr.replace(/,/g, "");
    const parsed = parseFloat(cleanStr);
    const finalNum = isNaN(parsed) ? 0 : parsed;
    setLocalStr(formatWithCommas(finalNum));
    commitValue(cleanStr);
  };

  const focusTargetInput = (targetIndex: number) => {
    let nextIdx = targetIndex;
    let attempts = 0;
    while (nextIdx >= 0 && attempts < 100) {
      attempts++;
      const targetEl = document.querySelector<HTMLInputElement>(`input[data-count-input="${nextIdx}"]`);
      if (targetEl) {
        if (!targetEl.disabled) {
          targetEl.focus();
          targetEl.select();
          break;
        } else {
          if (targetIndex > rowIndex) nextIdx++;
          else nextIdx--;
        }
      } else {
        break;
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      commitValue(localStr);
      focusTargetInput(rowIndex + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      commitValue(localStr);
      if (rowIndex > 0) {
        focusTargetInput(rowIndex - 1);
      }
    } else if (e.key === "Tab") {
      commitValue(localStr);
      if (!e.shiftKey) {
        const nextEl = document.querySelector<HTMLInputElement>(`input[data-count-input="${rowIndex + 1}"]`);
        if (nextEl && !nextEl.disabled) {
          e.preventDefault();
          nextEl.focus();
          nextEl.select();
        }
      } else {
        if (rowIndex > 0) {
          const prevEl = document.querySelector<HTMLInputElement>(`input[data-count-input="${rowIndex - 1}"]`);
          if (prevEl && !prevEl.disabled) {
            e.preventDefault();
            prevEl.focus();
            prevEl.select();
          }
        }
      }
    }
  };

  return (
    <input
      ref={inputRef}
      data-count-input={rowIndex}
      type="text"
      value={localStr}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      placeholder="0"
      className={`w-full text-left font-mono text-xs px-2 h-[26px] rounded border transition-colors ${
        disabled
          ? "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold cursor-not-allowed border-slate-300 dark:border-slate-600"
          : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold shadow-2xs"
      }`}
      dir="ltr"
    />
  );
});

// Optimized cell input component for Description
const DescriptionCell = React.memo(function DescriptionCell({
  rowIndex,
  value,
  disabled,
  onChange,
}: {
  rowIndex: number;
  value: string;
  disabled?: boolean;
  onChange: (rowIndex: number, val: string) => void;
}) {
  const [localStr, setLocalStr] = useState<string>(value || "");
  const isEditingRef = useRef(false);
  const latestOnChangeRef = useRef(onChange);
  const latestValueRef = useRef(value);

  useEffect(() => {
    latestOnChangeRef.current = onChange;
  });

  useEffect(() => {
    latestValueRef.current = value;
    if (!isEditingRef.current && (value || "") !== localStr) {
      setLocalStr(value || "");
    }
  }, [value]);

  const commitValue = useCallback((strVal: string) => {
    if (strVal !== (latestValueRef.current || "")) {
      latestValueRef.current = strVal;
      latestOnChangeRef.current(rowIndex, strVal);
    }
  }, [rowIndex]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setLocalStr(text);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    isEditingRef.current = true;
    e.target.select();
  };

  const handleBlur = () => {
    isEditingRef.current = false;
    commitValue(localStr);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Tab") {
      commitValue(localStr);
    }
  };

  return (
    <input
      type="text"
      value={localStr}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      placeholder="توضیحات ردیف..."
      className="w-full text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
    />
  );
});

export function StocktakingForm({ id, tabId, onClose, onSaved }: StocktakingFormProps) {
  const { showToast } = useToast();
  const { addTab, removeTab, activeTabId } = useTabs();
  const currentTabId = tabId || activeTabId || 'stocktaking-form';
  const { isCurrentYearClosed } = useFiscalYearCheck();

  const [loading, setLoading] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(id ? Number(id) : null);
  const { isUsed, isChecking } = useFormUsageCheck("StocktakingCounts", currentId);

  // Form values
  const [values, setValues] = useState<Record<string, any>>({
    StocktakingCountID: id ? Number(id) : null,
    StocktakingTagHeaderRef: null,
    WarehouseRef: null,
    StocktakingDate: getTodayFormattedDate('fa'),
    StocktakingNumber: "",
    CountRound: 1,
    Status: DocumentState.InitialRegistration,
    Description: "",
    FiscalYearRef: typeof window !== "undefined" ? (localStorage.getItem("app-fiscal-year") ? Number(localStorage.getItem("app-fiscal-year")) : null) : null,
    // Readonly helper fields from selected period
    PeriodTitle: "",
    MethodNameReadOnly: "",
    TagNumberReadOnly: "",
    TagDateReadOnly: "",
    OfficerPartyTitleReadOnly: "",
    CountTimes: 1,
    CountWithTrackingFactors: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dropdown options
  const [periods, setPeriods] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [items, setItems] = useState<StocktakingItemGridRow[]>([]);
  const [existingWarehouseCounts, setExistingWarehouseCounts] = useState<any[]>([]);

  // Fetch existing counts for the warehouse and period to determine which rounds are already taken
  const fetchWarehouseCountStatus = useCallback(async (tagHeaderId: number, warehouseId: number, countIdToExclude?: number | null) => {
    try {
      const res = await apiFetch(`/api/inv/stocktaking-counts/warehouse-count-info?tagHeaderId=${tagHeaderId}&warehouseId=${warehouseId}`);
      if (res && res.ok) {
        const info = await res.json();
        const counts = Array.isArray(info?.existingCounts) ? info.existingCounts : [];
        setExistingWarehouseCounts(counts);
        return counts;
      }
    } catch (e) {
      console.error("Error fetching warehouse count info:", e);
    }
    return [];
  }, []);

  // Entity numbering setting
  const [numberingSetting, setNumberingSetting] = useState<{
    numberingMethod: string;
    numberingType: string;
    startNumber: number;
    fixedChar: string;
  }>({ numberingMethod: '2', numberingType: '1', startNumber: 1, fixedChar: '' });

  useEffect(() => {
    async function loadNumberingSetting() {
      try {
        const res = await apiFetch('/api/common/entity-numbering/stocktaking_count');
        if (res && res.ok) {
          const rawData = await res.json();
          const data = rawData?.data || rawData;
          if (data) {
            let itemsList: any[] = [];
            if (Array.isArray(data.items)) {
              itemsList = data.items;
            } else if (data.items && typeof data.items === 'object') {
              if (Array.isArray(data.items.fiscalYears)) {
                itemsList = data.items.fiscalYears;
              } else {
                Object.values(data.items).forEach((val) => {
                  if (Array.isArray(val)) itemsList.push(...val);
                });
              }
            }
            let startNum = 1;
            let fixedChar = '';
            if (itemsList.length > 0) {
              if (itemsList[0]?.startNumber) {
                const parsed = parseInt(String(itemsList[0].startNumber), 10);
                if (!isNaN(parsed) && parsed > 0) startNum = parsed;
              }
              if (itemsList[0]?.fixedChar) {
                fixedChar = String(itemsList[0].fixedChar).trim();
              }
            }
            setNumberingSetting({
              numberingMethod: data.numberingMethod || '2',
              numberingType: data.numberingType || '1',
              startNumber: startNum,
              fixedChar,
            });
          }
        }
      } catch (e) {
        console.error('Failed to load stocktaking_count numbering setting:', e);
      }
    }
    loadNumberingSetting();
  }, []);

  // Tracking factor modal state
  const [tfModalOpen, setTfModalOpen] = useState(false);
  const [selectedTfItemRowIndex, setSelectedTfItemRowIndex] = useState<number | null>(null);

  // Sub unit modal state
  const [subUnitModalState, setSubUnitModalState] = useState<{
    isOpen: boolean;
    rowIndex: number | null;
    itemId?: number;
    itemCode?: string;
    itemTitle?: string;
    primaryUnitName?: string;
    subUnits: SubUnitItem[];
    selectedSubUnitId?: any;
    initialSubQuantity?: number | string;
    initialMainQuantity?: number | string;
  }>({
    isOpen: false,
    rowIndex: null,
    subUnits: [],
  });

  // Stocktaking surplus & shortage modal state
  const [isSurplusModalOpen, setIsSurplusModalOpen] = useState(false);
  const [isShortageModalOpen, setIsShortageModalOpen] = useState(false);

  const isFormReadOnly = isUsed || isCurrentYearClosed;

  // Helper function to check if document status is InitialRegistration (ثبت اولیه)
  const isStatusInitialRegistration = useCallback((status: any): boolean => {
    if (status === null || status === undefined || status === "") return false;
    const num = Number(status);
    if (!isNaN(num)) {
      return num === DocumentState.InitialRegistration || num === 2;
    }
    const str = String(status).trim();
    return str === "2" || str === "ثبت اولیه" || str.includes("ثبت اولیه");
  }, []);

  const isCountEditingDisabled = isFormReadOnly || !isStatusInitialRegistration(values.Status);

  // Load periods on mount
  const fetchPeriods = useCallback(async () => {
    try {
      // Ensure tables exist
      try {
        await apiFetch('/api/db-init');
      } catch (e) {}

      const fyId = values.FiscalYearRef;
      const url = fyId ? `/api/inv/stocktaking-counts/periods?fiscalYearId=${fyId}` : `/api/inv/stocktaking-counts/periods`;
      const res = await apiFetch(url);
      if (res && res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setPeriods(data);
        }
      }
    } catch (err) {
      console.error("Error loading stocktaking periods:", err);
    }
  }, [values.FiscalYearRef]);

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  // Fetch next number if new form
  const fetchNextNumber = useCallback(async (overrideFyId?: number | null, overrideWhId?: number | null, forceFetch = false) => {
    if (currentId && !forceFetch) return;
    try {
      let fyId = overrideFyId;
      if (fyId === undefined) {
        fyId = values.FiscalYearRef;
      }
      let whId = overrideWhId;
      if (whId === undefined) {
        whId = values.WarehouseRef;
      }

      let url = '/api/inv/stocktaking-counts/next-number';
      const params = new URLSearchParams();
      if (fyId) params.append('fiscalYearId', String(fyId));
      if (whId) params.append('warehouseId', String(whId));
      const q = params.toString();
      if (q) url += `?${q}`;

      const res = await apiFetch(url);
      if (res && res.ok) {
        const nextNum = await res.json();
        if (nextNum !== undefined && nextNum !== null && nextNum !== "") {
          const parsed = typeof nextNum === "number" ? nextNum : (!isNaN(Number(nextNum)) ? Number(nextNum) : nextNum);
          setValues(prev => ({ ...prev, StocktakingNumber: parsed }));
        }
      }
    } catch (err) {
      console.error("Error fetching next stocktaking number:", err);
    }
  }, [currentId, values.FiscalYearRef, values.WarehouseRef]);

  useEffect(() => {
    async function initFiscalYear() {
      if (!values.FiscalYearRef && !currentId) {
        try {
          const res = await apiFetch('/api/common/fiscalyear');
          if (res && res.ok) {
            const data = await res.json();
            const items = Array.isArray(data) ? data : (data?.items || []);
            if (items.length > 0) {
              const savedFy = typeof window !== "undefined" ? localStorage.getItem('app-fiscal-year') : null;
              const activeFy = items.find((f: any) => String(f.fiscalYearID || f.id) === String(savedFy)) || items.find((f: any) => f.isActive) || items[0];
              const fyId = Number(activeFy?.fiscalYearID || activeFy?.id);
              if (fyId) {
                setValues(prev => ({ ...prev, FiscalYearRef: fyId }));
              }
            }
          }
        } catch (e) {
          console.error("Error initializing fiscal year:", e);
        }
      }
    }
    initFiscalYear();
  }, [currentId, values.FiscalYearRef]);

  // Load existing record if ID provided
  const loadCountRecord = useCallback(async (countId: number) => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/inv/stocktaking-counts/${countId}`);
      if (res && res.ok) {
        const data = await res.json();
        if (data) {
          const tagHeader = data.tagHeader;
          const countTimes = tagHeader?.stocktakingSetting?.CountTimes || 1;
          let countMethodTitle = tagHeader?.stocktakingSetting?.MethodName || '';
          if (!countMethodTitle) {
            if (countTimes === 1) countMethodTitle = 'تک شمارشی';
            else if (countTimes === 2) countMethodTitle = 'دو شمارشی';
            else if (countTimes === 3) countMethodTitle = 'سه شمارشی';
          }

          setValues({
            StocktakingCountID: Number(data.StocktakingCountID),
            StocktakingTagHeaderRef: Number(data.StocktakingTagHeaderRef),
            WarehouseRef: Number(data.WarehouseRef),
            StocktakingDate: data.StocktakingDate,
            StocktakingNumber: Number(data.StocktakingNumber),
            CountRound: Number(data.CountRound || 1),
            Status: Number(data.Status || DocumentState.InitialRegistration),
            Description: data.Description || "",
            FiscalYearRef: data.FiscalYearRef ? Number(data.FiscalYearRef) : null,
            PeriodTitle: tagHeader?.StocktakingPeriod || `دوره شماره ${tagHeader?.StocktakingNumber || ''}`,
            MethodNameReadOnly: countMethodTitle,
            TagNumberReadOnly: String(tagHeader?.StocktakingNumber || ''),
            TagDateReadOnly: tagHeader?.StocktakingDate || '',
            OfficerPartyTitleReadOnly: tagHeader?.officerParty?.title || tagHeader?.officerParty?.name || '',
            CountTimes: countTimes,
            CountWithTrackingFactors: Boolean(tagHeader?.stocktakingSetting?.CountWithTrackingFactors),
          });

          // Load warehouses for this header
          const whsRes = await apiFetch(`/api/inv/stocktaking-counts/warehouses?tagHeaderId=${data.StocktakingTagHeaderRef}&excludeCompleted=true&currentCountId=${countId}`);
          if (whsRes && whsRes.ok) {
            const whs = await whsRes.json();
            setWarehouses(Array.isArray(whs) ? whs : []);
          }

          // Load items with details
          const itmsRes = await apiFetch(
            `/api/inv/stocktaking-counts/items?tagHeaderId=${data.StocktakingTagHeaderRef}&warehouseId=${data.WarehouseRef}&countId=${countId}`
          );
          if (itmsRes && itmsRes.ok) {
            const loadedItems = await itmsRes.json();
            setItems(Array.isArray(loadedItems) ? loadedItems : []);
          }

          // Fetch warehouse count status to know registered rounds
          await fetchWarehouseCountStatus(Number(data.StocktakingTagHeaderRef), Number(data.WarehouseRef), countId);
        }
      }
    } catch (err) {
      console.error("Error loading stocktaking count:", err);
      showToast("خطا در بارگذاری اطلاعات شمارش انبارگردانی", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast, fetchWarehouseCountStatus]);

  useEffect(() => {
    if (currentId) {
      loadCountRecord(currentId);
    }
  }, [currentId, loadCountRecord]);

  // Handle period change
  const handlePeriodChange = async (itemOrId: any, selectedVal?: any) => {
    let selectedTagHeaderId: number | null = null;
    let periodObj: any = null;

    if (itemOrId && typeof itemOrId === 'object') {
      periodObj = itemOrId;
      const rawId = itemOrId.StocktakingTagHeaderID ?? selectedVal ?? itemOrId.id;
      selectedTagHeaderId = (rawId !== undefined && rawId !== null && !isNaN(Number(rawId))) ? Number(rawId) : null;
    } else if (itemOrId !== undefined && itemOrId !== null && !isNaN(Number(itemOrId))) {
      selectedTagHeaderId = Number(itemOrId);
      periodObj = periods.find(p => Number(p.StocktakingTagHeaderID) === selectedTagHeaderId);
    } else if (selectedVal !== undefined && selectedVal !== null && !isNaN(Number(selectedVal))) {
      selectedTagHeaderId = Number(selectedVal);
      periodObj = periods.find(p => Number(p.StocktakingTagHeaderID) === selectedTagHeaderId);
    }
    
    const periodFyId = periodObj?.FiscalYearRef ? Number(periodObj.FiscalYearRef) : values.FiscalYearRef;

    setValues(prev => ({
      ...prev,
      StocktakingTagHeaderRef: selectedTagHeaderId,
      WarehouseRef: null,
      FiscalYearRef: periodFyId,
      PeriodTitle: periodObj?.StocktakingPeriod || "",
      MethodNameReadOnly: periodObj?.MethodName || "",
      TagNumberReadOnly: periodObj?.StocktakingNumber ? String(periodObj.StocktakingNumber) : "",
      TagDateReadOnly: periodObj?.StocktakingDate || "",
      OfficerPartyTitleReadOnly: periodObj?.OfficerPartyTitle || "",
      CountTimes: periodObj?.CountTimes || 1,
      CountWithTrackingFactors: Boolean(periodObj?.CountWithTrackingFactors),
    }));

    setItems([]);
    setWarehouses([]);
    setExistingWarehouseCounts([]);

    if (errors.StocktakingTagHeaderRef) {
      setErrors(prev => ({ ...prev, StocktakingTagHeaderRef: "" }));
    }

    if (selectedTagHeaderId) {
      try {
        const whUrl = `/api/inv/stocktaking-counts/warehouses?tagHeaderId=${selectedTagHeaderId}&excludeCompleted=true${currentId ? `&currentCountId=${currentId}` : ''}`;
        const whRes = await apiFetch(whUrl);
        if (whRes && whRes.ok) {
          const whs = await whRes.json();
          setWarehouses(Array.isArray(whs) ? whs : []);
        }
      } catch (err) {
        console.error("Error loading warehouses for period:", err);
      }
    }
  };

  // Handle warehouse change
  const handleWarehouseChange = async (itemOrId: any, selectedVal?: any) => {
    let selectedWarehouseId: number | null = null;

    if (itemOrId && typeof itemOrId === 'object') {
      const rawId = itemOrId.WarehouseID ?? selectedVal ?? itemOrId.id;
      selectedWarehouseId = (rawId !== undefined && rawId !== null && !isNaN(Number(rawId))) ? Number(rawId) : null;
    } else if (itemOrId !== undefined && itemOrId !== null && !isNaN(Number(itemOrId))) {
      selectedWarehouseId = Number(itemOrId);
    } else if (selectedVal !== undefined && selectedVal !== null && !isNaN(Number(selectedVal))) {
      selectedWarehouseId = Number(selectedVal);
    }

    if (errors.WarehouseRef) {
      setErrors(prev => ({ ...prev, WarehouseRef: "", CountRound: "" }));
    }

    if (values.StocktakingTagHeaderRef && selectedWarehouseId) {
      try {
        setLoading(true);

        // 1. Fetch registered rounds for this warehouse in this period
        const counts = await fetchWarehouseCountStatus(Number(values.StocktakingTagHeaderRef), selectedWarehouseId, currentId);

        // 2. Determine sequential next available round
        const registeredRounds = new Set(
          (counts || [])
            .filter((c: any) => !currentId || Number(c.StocktakingCountID) !== Number(currentId))
            .map((c: any) => Number(c.CountRound || 1))
        );

        const totalTimes = values.CountTimes || 1;
        let nextRound: number | null = null;
        for (let r = 1; r <= totalTimes; r++) {
          if (!registeredRounds.has(r)) {
            nextRound = r;
            break;
          }
        }

        let targetRound = Number(values.CountRound || 1);
        if (!currentId) {
          if (nextRound !== null) {
            targetRound = nextRound;
          } else {
            showToast("تمامی نوبت‌های شمارش برای این انبار در این دوره قبلاً ثبت شده است.", "warning");
          }
        }

        setValues(prev => ({
          ...prev,
          WarehouseRef: selectedWarehouseId,
          CountRound: targetRound,
        }));

        // 3. Load items for targetRound
        if (nextRound !== null || currentId) {
          const itmsRes = await apiFetch(
            `/api/inv/stocktaking-counts/items?tagHeaderId=${values.StocktakingTagHeaderRef}&warehouseId=${selectedWarehouseId}&round=${targetRound}&countId=${currentId || ''}`
          );
          if (itmsRes && itmsRes.ok) {
            const itms = await itmsRes.json();
            setItems(Array.isArray(itms) ? itms : []);
          }
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error("Error loading items for warehouse count:", err);
      } finally {
        setLoading(false);
      }
    } else {
      setValues(prev => ({
        ...prev,
        WarehouseRef: selectedWarehouseId,
      }));
      setExistingWarehouseCounts([]);
      setItems([]);
    }
  };

  // Dynamic tab label calculation
  const dynamicTabTitle = useMemo(() => {
    const times = values.CountTimes || 1;
    if (times <= 1) {
      return "جزئیات انبارگردانی";
    }
    const round = Number(values.CountRound || 1);
    let roundLabel = "شمارش اول";
    if (round === 2) roundLabel = "شمارش دوم";
    else if (round === 3) roundLabel = "شمارش سوم";

    return `جزئیات انبارگردانی [${roundLabel}]`;
  }, [values.CountTimes, values.CountRound]);

  // Round options for Select:
  // Shows ONLY the single current sequential round (e.g. "شمارش اول" first, then "شمارش دوم" after count 1 is registered, then "شمارش سوم" after count 2 is registered).
  const roundOptions = useMemo(() => {
    const totalTimes = values.CountTimes || 1;
    const allPossibleRounds = [
      { id: 1, title: "شمارش اول", value: 1, label: "شمارش اول" },
      { id: 2, title: "شمارش دوم", value: 2, label: "شمارش دوم" },
      { id: 3, title: "شمارش سوم", value: 3, label: "شمارش سوم" },
    ].slice(0, totalTimes);

    // In edit mode for a saved record, display its saved round
    if (currentId) {
      const savedRound = Number(values.CountRound || 1);
      const matched = allPossibleRounds.find(opt => opt.value === savedRound) || {
        id: savedRound,
        title: `شمارش ${savedRound === 1 ? 'اول' : savedRound === 2 ? 'دوم' : 'سوم'}`,
        value: savedRound,
        label: `شمارش ${savedRound === 1 ? 'اول' : savedRound === 2 ? 'دوم' : 'سوم'}`,
      };
      return [matched];
    }

    // In insert mode when warehouse & tag header are selected:
    if (values.WarehouseRef && values.StocktakingTagHeaderRef) {
      const registeredRounds = new Set(
        (existingWarehouseCounts || [])
          .map((c: any) => Number(c.CountRound || 1))
      );

      // Find the FIRST unregistered round sequentially (1, then 2, then 3)
      let nextRound: number | null = null;
      for (let r = 1; r <= totalTimes; r++) {
        if (!registeredRounds.has(r)) {
          nextRound = r;
          break;
        }
      }

      if (nextRound === null) {
        return [{ id: 0, title: "تمامی شمارش‌ها ثبت شده است", value: 0, label: "تمامی شمارش‌ها ثبت شده است" }];
      }

      const matched = allPossibleRounds.find(opt => opt.value === nextRound);
      return matched ? [matched] : [{ id: 0, title: "تمامی شمارش‌ها ثبت شده است", value: 0, label: "تمامی شمارش‌ها ثبت شده است" }];
    }

    // Default before warehouse selection: show only "شمارش اول"
    return [allPossibleRounds[0] || { id: 1, title: "شمارش اول", value: 1, label: "شمارش اول" }];
  }, [values.CountTimes, values.WarehouseRef, values.StocktakingTagHeaderRef, existingWarehouseCounts, currentId, values.CountRound]);

  // Dropdown columns
  const periodColumns: SingleSelectColumn[] = useMemo(() => [
    { key: "StocktakingPeriod", label: "دوره انبارگردانی", width: 160 },
    { key: "MethodName", label: "روش انبارگردانی", width: 120 },
    { key: "StocktakingNumber", label: "شماره", width: 80 },
    { key: "StocktakingDate", label: "تاریخ انبارگردانی", width: 110 },
    { key: "OfficerPartyTitle", label: "مسئول انبارگردانی", width: 140 },
  ], []);

  const warehouseColumns: SingleSelectColumn[] = useMemo(() => [
    { key: "WarehouseCode", label: "کد انبار", width: 100 },
    { key: "WarehouseName", label: "نام انبار", width: 200 },
  ], []);

  // Update item row
  const handleItemRowChange = useCallback((index: number, field: keyof StocktakingItemGridRow, value: any) => {
    setItems(prev => {
      if (prev[index] && prev[index][field] === value) return prev;
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  }, []);

  // Open Tracking Factor modal for a specific row
  const handleOpenTfModal = useCallback((index: number) => {
    if (isFormReadOnly || isCountEditingDisabled) return;
    setSelectedTfItemRowIndex(index);
    setTfModalOpen(true);
  }, [isFormReadOnly, isCountEditingDisabled]);

  // Save Tracking Factor modal values
  const handleSaveTfModal = (tfValues: any, totalQty?: any) => {
    if (selectedTfItemRowIndex === null) return;
    const finalQty = totalQty !== undefined ? Number(totalQty) : 0;
    
    // Normalize grid rows to backend tracking factor objects list
    const gridRowsList = Array.isArray(tfValues) ? tfValues : [tfValues];
    const backendTfList: any[] = [];

    gridRowsList.forEach((r) => {
      const rowQty = Number(r.Quantity || finalQty || 1);
      const processedFactors = new Set<string>();

      Object.keys(r).forEach((key) => {
        if (key === "_id" || key === "id" || key === "Quantity" || key === "quantity") return;

        if (key.endsWith("_Start") || key.endsWith("_End")) {
          const baseKey = key.replace("_Start", "").replace("_End", "");
          if (processedFactors.has(baseKey)) return;
          processedFactors.add(baseKey);

          const startVal = r[`${baseKey}_Start`] || "";
          const endVal = r[`${baseKey}_End`] || "";
          let factorVal = "";
          if (startVal && endVal) {
            factorVal = `${startVal}-${endVal}`;
          } else {
            factorVal = startVal || endVal || "";
          }

          if (factorVal) {
            backendTfList.push({
              TrackingFactorRef: Number(baseKey),
              FactorValue: factorVal,
              CountedQuantity: rowQty,
            });
          }
        } else if (!key.includes("_")) {
          const val = r[key];
          if (val !== undefined && val !== null && String(val).trim() !== "") {
            backendTfList.push({
              TrackingFactorRef: Number(key),
              FactorValue: String(val).trim(),
              CountedQuantity: rowQty,
            });
          }
        }
      });
    });

    setItems(prev => {
      const updated = [...prev];
      updated[selectedTfItemRowIndex] = {
        ...updated[selectedTfItemRowIndex],
        CountedQuantity: finalQty,
        savedTrackingFactorValues: gridRowsList,
        savedTrackingFactorArray: backendTfList,
      };
      return updated;
    });

    setTfModalOpen(false);
    setSelectedTfItemRowIndex(null);
  };

  // Open Sub Unit modal for a specific row
  const handleOpenSubUnitModal = useCallback((rowIndex: number) => {
    if (isFormReadOnly || isCountEditingDisabled) return;
    setSubUnitModalState(prev => {
      const row = items[rowIndex];
      if (!row) return prev;
      return {
        isOpen: true,
        rowIndex,
        itemId: row.ItemRef,
        itemCode: row.ItemCode,
        itemTitle: row.ItemTitle,
        primaryUnitName: row.MeasurementUnitName || "عدد",
        subUnits: row.subUnits || [],
        selectedSubUnitId: row.selectedSubUnitName || row.MeasurementUnitName,
        initialSubQuantity: row.SubQuantity || row.CountedQuantity || 1,
        initialMainQuantity: row.CountedQuantity || 0,
      };
    });
  }, [isFormReadOnly, isCountEditingDisabled, items]);

  // Confirm Sub Unit selection
  const handleConfirmSubUnit = (result: {
    subUnit: SubUnitItem;
    subQuantity: number;
    mainQuantity: number;
    fixedMainQuantity: number;
    ratioUsed: number;
    isVariable: boolean;
  }) => {
    if (subUnitModalState.rowIndex === null) return;
    const idx = subUnitModalState.rowIndex;
    const finalQty = result.fixedMainQuantity !== undefined && !isNaN(result.fixedMainQuantity)
      ? result.fixedMainQuantity
      : result.mainQuantity;

    setItems(prev => {
      const updated = [...prev];
      if (updated[idx]) {
        updated[idx] = {
          ...updated[idx],
          CountedQuantity: finalQty,
          SubQuantity: result.subQuantity,
          selectedSubUnitName: result.subUnit.SubUnitName,
        };
      }
      return updated;
    });

    setSubUnitModalState(prev => ({ ...prev, isOpen: false, rowIndex: null }));
  };

  // Primary unit selection fallback in SubUnitModal
  const handleSelectPrimaryUnit = (result?: any) => {
    if (subUnitModalState.rowIndex === null) return;
    const idx = subUnitModalState.rowIndex;
    if (result && result.fixedMainQuantity !== undefined) {
      setItems(prev => {
        const updated = [...prev];
        if (updated[idx]) {
          updated[idx] = {
            ...updated[idx],
            CountedQuantity: result.fixedMainQuantity,
            selectedSubUnitName: undefined,
            SubQuantity: undefined,
          };
        }
        return updated;
      });
    }
    setSubUnitModalState(prev => ({ ...prev, isOpen: false, rowIndex: null }));
  };

  // Stable callbacks for row updates to maintain React.memo optimization
  const handleCountedQuantityChange = useCallback((rowIndex: number, newVal: number) => {
    handleItemRowChange(rowIndex, "CountedQuantity", newVal);
  }, [handleItemRowChange]);

  const handleDescriptionChange = useCallback((rowIndex: number, newVal: string) => {
    handleItemRowChange(rowIndex, "Description", newVal);
  }, [handleItemRowChange]);

  // DataGrid Columns for Counting Items
  const gridColumns: DataGridColumn[] = useMemo(() => [
    {
      key: "RowNumber",
      label: "ردیف",
      width: "60px",
      align: "center",
      cell: ({ row }) => row.index + 1,
      render: (val, row, idx) => (idx !== undefined ? idx + 1 : row.RowNumber),
    },
    {
      key: "ItemCode",
      label: "کد کالا",
      width: "120px",
      align: "right",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
          {row.original.ItemCode}
        </span>
      ),
      render: (val, row) => (
        <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
          {row.ItemCode}
        </span>
      ),
    },
    {
      key: "ItemTitle",
      label: "عنوان کالا",
      width: "220px",
      align: "right",
      cell: ({ row }) => (
        <span className="text-xs font-medium text-slate-900 dark:text-slate-100 line-clamp-1">
          {row.original.ItemTitle}
        </span>
      ),
      render: (val, row) => (
        <span className="text-xs font-medium text-slate-900 dark:text-slate-100 line-clamp-1">
          {row.ItemTitle}
        </span>
      ),
    },
    {
      key: "MeasurementUnitName",
      label: "واحد سنجش",
      width: "120px",
      align: "center",
      cell: ({ row }) => {
        const rowIndex = row.index;
        const r = row.original;
        const currentUnitDisplay = r.selectedSubUnitName || r.MeasurementUnitName || "عدد";
        const canOpenSubModal = Boolean(r.hasSubUnits || (Array.isArray(r.subUnits) && r.subUnits.length > 0));

        return (
          <div className="flex items-center justify-between w-full h-[25px] px-1 gap-1">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={currentUnitDisplay}>
              {currentUnitDisplay}
            </span>
            {canOpenSubModal && (
              <button
                type="button"
                disabled={isFormReadOnly || isCountEditingDisabled}
                onClick={() => handleOpenSubUnitModal(rowIndex)}
                className="p-1 flex items-center justify-center rounded bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800 cursor-pointer h-[22px] px-1.5 shrink-0 gap-0.5 text-[10px] font-bold shadow-2xs transition-colors"
                title="انتخاب واحد فرعی / ضریب تبدیل"
              >
                <Plus className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              </button>
            )}
          </div>
        );
      },
      render: (val, row, idx) => {
        const rowIndex = idx !== undefined ? idx : row.RowNumber - 1;
        const currentUnitDisplay = row.selectedSubUnitName || row.MeasurementUnitName || "عدد";
        const canOpenSubModal = Boolean(row.hasSubUnits || (Array.isArray(row.subUnits) && row.subUnits.length > 0));

        return (
          <div className="flex items-center justify-between w-full h-[25px] px-1 gap-1">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={currentUnitDisplay}>
              {currentUnitDisplay}
            </span>
            {canOpenSubModal && (
              <button
                type="button"
                disabled={isFormReadOnly || isCountEditingDisabled}
                onClick={() => handleOpenSubUnitModal(rowIndex)}
                className="p-1 flex items-center justify-center rounded bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800 cursor-pointer h-[22px] px-1.5 shrink-0 gap-0.5 text-[10px] font-bold shadow-2xs transition-colors"
                title="انتخاب واحد فرعی / ضریب تبدیل"
              >
                <Plus className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              </button>
            )}
          </div>
        );
      },
    },
    {
      key: "TagNumber",
      label: "شماره تگ",
      width: "100px",
      align: "center",
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          {row.original.TagNumber || "—"}
        </span>
      ),
      render: (val, row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          {row.TagNumber || "—"}
        </span>
      ),
    },
    {
      key: "CountedQuantity",
      label: "مقدار شمارش شده *",
      width: "170px",
      align: "right",
      cell: ({ row }) => {
        const rowIndex = row.index;
        const r = row.original;
        const isTfItem = Boolean(r.hasTrackingFactors) || Boolean(values.CountWithTrackingFactors) || (Array.isArray(r.trackingFactors) && r.trackingFactors.length > 0);
        const hasEnteredTf = Array.isArray(r.savedTrackingFactorValues) && r.savedTrackingFactorValues.length > 0;
        const isInputDisabled = isFormReadOnly || isCountEditingDisabled || isTfItem;

        return (
          <div className="flex items-center gap-1.5 w-full">
            <CountedQuantityCell
              rowIndex={rowIndex}
              value={r.CountedQuantity ?? 0}
              onChange={handleCountedQuantityChange}
              disabled={isInputDisabled}
            />
            {isTfItem && (
              <button
                type="button"
                onClick={() => handleOpenTfModal(rowIndex)}
                disabled={isFormReadOnly || isCountEditingDisabled}
                title="ثبت عامل‌های ردیابی"
                className={`p-1 flex items-center justify-center rounded border transition-colors shrink-0 h-[26px] w-[26px] ${
                  hasEnteredTf
                    ? "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700 font-bold"
                    : "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      },
      render: (val, row, idx) => {
        const rowIndex = idx !== undefined ? idx : row.RowNumber - 1;
        const isTfItem = Boolean(row.hasTrackingFactors) || Boolean(values.CountWithTrackingFactors) || (Array.isArray(row.trackingFactors) && row.trackingFactors.length > 0);
        const hasEnteredTf = Array.isArray(row.savedTrackingFactorValues) && row.savedTrackingFactorValues.length > 0;
        const isInputDisabled = isFormReadOnly || isCountEditingDisabled || isTfItem;

        return (
          <div className="flex items-center gap-1.5 w-full">
            <CountedQuantityCell
              rowIndex={rowIndex}
              value={row.CountedQuantity ?? 0}
              onChange={handleCountedQuantityChange}
              disabled={isInputDisabled}
            />
            {isTfItem && (
              <button
                type="button"
                onClick={() => handleOpenTfModal(rowIndex)}
                disabled={isFormReadOnly || isCountEditingDisabled}
                title="ثبت عامل‌های ردیابی"
                className={`p-1 flex items-center justify-center rounded border transition-colors shrink-0 h-[26px] w-[26px] ${
                  hasEnteredTf
                    ? "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700 font-bold"
                    : "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      },
    },
    {
      key: "Description",
      label: "توضیحات",
      width: "200px",
      align: "right",
      cell: ({ row }) => {
        const rowIndex = row.index;
        const r = row.original;
        return (
          <DescriptionCell
            rowIndex={rowIndex}
            value={r.Description || ""}
            onChange={handleDescriptionChange}
            disabled={isFormReadOnly || isCountEditingDisabled}
          />
        );
      },
      render: (val, row, idx) => {
        const rowIndex = idx !== undefined ? idx : row.RowNumber - 1;
        return (
          <DescriptionCell
            rowIndex={rowIndex}
            value={row.Description || ""}
            onChange={handleDescriptionChange}
            disabled={isFormReadOnly || isCountEditingDisabled}
          />
        );
      },
    },
  ], [values.CountWithTrackingFactors, isFormReadOnly, isCountEditingDisabled, handleCountedQuantityChange, handleDescriptionChange, handleOpenTfModal, handleOpenSubUnitModal]);

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!values.StocktakingTagHeaderRef) {
      newErrors.StocktakingTagHeaderRef = "انتخاب دوره انبارگردانی الزامی است.";
    }
    if (!values.WarehouseRef) {
      newErrors.WarehouseRef = "انتخاب انبار شمارش شده الزامی است.";
    }
    if (!values.StocktakingDate) {
      newErrors.StocktakingDate = "ورود تاریخ شمارش الزامی است.";
    }
    if (currentId || numberingSetting.numberingMethod === '1') {
      if (!values.StocktakingNumber || Number(values.StocktakingNumber) <= 0) {
        newErrors.StocktakingNumber = "ورود شماره الزامی است.";
      }
    }
    if (!values.Status) {
      newErrors.Status = "انتخاب وضعیت الزامی است.";
    }

    if (!values.CountRound || Number(values.CountRound) <= 0) {
      newErrors.CountRound = "انتخاب نوبت شمارش معتبر الزامی است.";
    } else if (values.WarehouseRef && values.StocktakingTagHeaderRef) {
      const registeredRounds = new Set(
        (existingWarehouseCounts || [])
          .filter((c: any) => !currentId || Number(c.StocktakingCountID) !== Number(currentId))
          .map((c: any) => Number(c.CountRound || 1))
      );
      if (registeredRounds.has(Number(values.CountRound))) {
        newErrors.CountRound = `شمارش شماره ${values.CountRound} برای این انبار در این دوره قبلاً ثبت شده است.`;
      }
    }

    if (items.length === 0) {
      newErrors.items = "هیچ کالای تگ‌خورده‌ای برای انبار انتخاب‌شده وجود ندارد.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save handler
  const handleSave = async (closeAfter = false, newAfter = false) => {
    if (!validateForm()) {
      showToast("لطفاً فیلدهای اجباری مشخص‌شده با ستاره را تکمیل نمایید.", "error");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        StocktakingTagHeaderRef: Number(values.StocktakingTagHeaderRef),
        WarehouseRef: Number(values.WarehouseRef),
        StocktakingDate: values.StocktakingDate,
        ...(values.StocktakingNumber && Number(values.StocktakingNumber) > 0
          ? { StocktakingNumber: Number(values.StocktakingNumber) }
          : {}),
        CountRound: Number(values.CountRound || 1),
        Status: Number(values.Status || DocumentState.InitialRegistration),
        Description: values.Description || "",
        FiscalYearRef: values.FiscalYearRef ? Number(values.FiscalYearRef) : null,
        details: items.map((item, idx) => {
          const tfList = formatTrackingFactorsForBackend(item);
          return {
            RowNumber: idx + 1,
            ItemRef: Number(item.ItemRef),
            TagNumber: item.TagNumber || "",
            CountedQuantity: Number(item.CountedQuantity || 0),
            Description: item.Description || "",
            trackingFactors: tfList,
          };
        }),
      };

      if (currentId) {
        const response = await apiFetch(`/api/inv/stocktaking-counts/${currentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || "خطا در به‌روزرسانی اطلاعات شمارش انبارگردانی");
        }
        showToast("اطلاعات شمارش انبارگردانی با موفقیت به‌روزرسانی شد.", "success");
        await fetchWarehouseCountStatus(Number(values.StocktakingTagHeaderRef), Number(values.WarehouseRef), currentId);
      } else {
        const response = await apiFetch(`/api/inv/stocktaking-counts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || "خطا در ثبت اطلاعات شمارش انبارگردانی");
        }
        const result = await response.json();
        showToast("اطلاعات شمارش انبارگردانی با موفقیت ثبت گردید.", "success");
        if (result && result.StocktakingCountID) {
          const newCreatedId = Number(result.StocktakingCountID);
          setCurrentId(newCreatedId);
          if (result.StocktakingNumber) {
            setValues(prev => ({ ...prev, StocktakingNumber: Number(result.StocktakingNumber) }));
          }
          await fetchWarehouseCountStatus(Number(values.StocktakingTagHeaderRef), Number(values.WarehouseRef), newCreatedId);
        }
      }

      onSaved?.();

      if (closeAfter) {
        onClose ? onClose() : removeTab(currentTabId);
      } else if (newAfter) {
        handleNew();
      }
    } catch (err: any) {
      console.error("Error saving stocktaking count:", err);
      showToast(err?.message || "خطا در ذخیره اطلاعات شمارش انبارگردانی", "error");
    } finally {
      setLoading(false);
    }
  };

  // New handler
  const handleNew = () => {
    setCurrentId(null);
    setExistingWarehouseCounts([]);
    const defaultFyId = typeof window !== "undefined" ? (localStorage.getItem("app-fiscal-year") ? Number(localStorage.getItem("app-fiscal-year")) : null) : null;
    setValues({
      StocktakingCountID: null,
      StocktakingTagHeaderRef: null,
      WarehouseRef: null,
      StocktakingDate: getTodayFormattedDate('fa'),
      StocktakingNumber: "",
      CountRound: 1,
      Status: DocumentState.InitialRegistration,
      Description: "",
      FiscalYearRef: defaultFyId,
      PeriodTitle: "",
      MethodNameReadOnly: "",
      TagNumberReadOnly: "",
      TagDateReadOnly: "",
      OfficerPartyTitleReadOnly: "",
      CountTimes: 1,
      CountWithTrackingFactors: false,
    });
    setErrors({});
    setItems([]);
    setWarehouses([]);
  };

  // Delete handler
  const handleDelete = async () => {
    if (!currentId) return;
    try {
      setLoading(true);
      await apiFetch(`/api/inv/stocktaking-counts/${currentId}`, {
        method: "DELETE",
      });
      showToast("برگه شمارش انبارگردانی با موفقیت حذف گردید.", "success");
      handleNew();
    } catch (err: any) {
      console.error("Error deleting stocktaking count:", err);
      showToast(err?.message || "خطا در حذف شمارش انبارگردانی", "error");
    } finally {
      setLoading(false);
    }
  };

  // List opener
  const handleList = () => {
    addTab({
      id: "StocktakingList",
      title: "فهرست شمارش‌های انبارگردانی",
      componentName: "StocktakingList",
      closable: true,
    });
  };

  // Bands Definition for Three-Row layout with 50% Right & 50% Left split
  const bands = useMemo(() => [
    { id: "row1_right", title: "", width: "50%", layout: "flex" as const, className: "gap-3" },
    { id: "row1_left", title: "", width: "50%", layout: "flex" as const, className: "gap-3" },
    { id: "row2_right", title: "", width: "50%", layout: "flex" as const, className: "gap-3" },
    { id: "row2_left", title: "", width: "50%", layout: "flex" as const, className: "gap-3" },
    { id: "row3", title: "", width: "100%", layout: "flex" as const },
  ], []);

  // Header Field Configurations for SimpleFormTwoRowTabbed
  const fields: FieldConfig[] = useMemo(() => [
    // ROW 1 - RIGHT (50% of row): Period, Warehouse
    {
      name: "StocktakingTagHeaderRef",
      label: "دوره انبارگردانی *",
      type: "custom",
      noWrapper: true,
      bandId: "row1_right",
      containerClassName: "flex-1 min-w-0",
      row: 1,
      order: 1,
      render: () => (
        <SingleSelectDropDown
          label="دوره انبارگردانی *"
          value={values.StocktakingTagHeaderRef}
          onChange={(item, val) => handlePeriodChange(item, val)}
          options={periods}
          columns={periodColumns}
          displayKey="StocktakingPeriod"
          valueKey="StocktakingTagHeaderID"
          placeholder="انتخاب دوره انبارگردانی..."
          required
          disabled={isFormReadOnly || isCountEditingDisabled}
          error={errors.StocktakingTagHeaderRef}
        />
      ),
    },
    {
      name: "WarehouseRef",
      label: "انبار شمارش شده *",
      type: "custom",
      noWrapper: true,
      bandId: "row1_right",
      containerClassName: "flex-1 min-w-0",
      row: 1,
      order: 2,
      render: () => (
        <SingleSelectDropDown
          label="انبار شمارش شده *"
          value={values.WarehouseRef}
          onChange={(item, val) => handleWarehouseChange(item, val)}
          options={warehouses}
          columns={warehouseColumns}
          displayKey="WarehouseName"
          valueKey="WarehouseID"
          placeholder={
            values.StocktakingTagHeaderRef
              ? (warehouses.length > 0 ? "انتخاب انبار تگ‌خورده..." : "تمامی انبارهای این دوره شمارش شده‌اند")
              : "ابتدا دوره را انتخاب کنید"
          }
          required
          disabled={isFormReadOnly || isCountEditingDisabled || !values.StocktakingTagHeaderRef || warehouses.length === 0}
          error={errors.WarehouseRef}
        />
      ),
    },

    // ROW 1 - LEFT (50% of row): Number, Date
    {
      name: "StocktakingNumber",
      label: "شماره *",
      type: "custom",
      noWrapper: true,
      bandId: "row1_left",
      containerClassName: "flex-1 min-w-0",
      row: 1,
      order: 1,
      render: () => (
        <NumberInput
          label="شماره *"
          value={values.StocktakingNumber ?? ""}
          onChange={(val) => {
            setValues(prev => ({ ...prev, StocktakingNumber: val }));
            if (errors.StocktakingNumber) setErrors(prev => ({ ...prev, StocktakingNumber: "" }));
          }}
          required={Boolean(currentId || numberingSetting.numberingMethod === '1')}
          disabled={isFormReadOnly || isCountEditingDisabled || (numberingSetting.numberingMethod === '2' && !currentId)}
          error={errors.StocktakingNumber}
        />
      ),
    },
    {
      name: "StocktakingDate",
      label: "تاریخ *",
      type: "custom",
      noWrapper: true,
      bandId: "row1_left",
      containerClassName: "flex-1 min-w-0",
      row: 1,
      order: 2,
      render: () => (
        <DateInput
          label="تاریخ *"
          value={values.StocktakingDate}
          onChange={(val) => {
            setValues(prev => ({ ...prev, StocktakingDate: val }));
            if (errors.StocktakingDate) setErrors(prev => ({ ...prev, StocktakingDate: "" }));
          }}
          required
          disabled={isFormReadOnly || isCountEditingDisabled}
          error={errors.StocktakingDate}
        />
      ),
    },

    // ROW 2 - RIGHT (50% of row): Method, Officer, [Round]
    {
      name: "MethodNameReadOnly",
      label: "روش انبارگردانی",
      type: "custom",
      noWrapper: true,
      bandId: "row2_right",
      containerClassName: "flex-1 min-w-0",
      row: 2,
      order: 1,
      render: () => (
        <TextInput
          label="روش انبارگردانی"
          value={values.MethodNameReadOnly || "—"}
          onChange={() => {}}
          disabled
          readOnly
        />
      ),
    },
    {
      name: "OfficerPartyTitleReadOnly",
      label: "مسئول انبارگردانی",
      type: "custom",
      noWrapper: true,
      bandId: "row2_right",
      containerClassName: "flex-1 min-w-0",
      row: 2,
      order: 2,
      render: () => (
        <TextInput
          label="مسئول انبارگردانی"
          value={values.OfficerPartyTitleReadOnly || "—"}
          onChange={() => {}}
          disabled
          readOnly
        />
      ),
    },
    // ROW 2 - LEFT (50% of row): CountRound and Status side by side (Status width reduced by 50%)
    {
      name: "CountRound",
      label: "نوبت شمارش *",
      type: "custom" as const,
      noWrapper: true,
      bandId: "row2_left",
      containerClassName: "flex-1 min-w-0",
      row: 2,
      order: 1,
      render: () => (
        <Select
          label="نوبت شمارش *"
          value={values.CountRound || (roundOptions[0]?.value ?? 1)}
          onChange={async (val) => {
            const newRound = Number(val);
            if (newRound <= 0) return;
            setValues(prev => ({ ...prev, CountRound: newRound }));
            if (!currentId && values.StocktakingTagHeaderRef && values.WarehouseRef) {
              try {
                setLoading(true);
                const itmsRes = await apiFetch(
                  `/api/inv/stocktaking-counts/items?tagHeaderId=${values.StocktakingTagHeaderRef}&warehouseId=${values.WarehouseRef}&round=${newRound}`
                );
                if (itmsRes && itmsRes.ok) {
                  const itms = await itmsRes.json();
                  setItems(Array.isArray(itms) ? itms : []);
                }
              } catch (e) {
                console.error("Error reloading items for selected round:", e);
              } finally {
                setLoading(false);
              }
            }
          }}
          options={roundOptions}
          disabled={isFormReadOnly || isCountEditingDisabled || (roundOptions.length <= 1)}
        />
      ),
    },
    {
      name: "Status",
      label: "وضعیت *",
      type: "custom",
      noWrapper: true,
      bandId: "row2_left",
      containerClassName: "flex-1 min-w-0",
      row: 2,
      order: 2,
      render: () => (
        <StateListInput
          label="وضعیت *"
          value={values.Status}
          onChange={(val) => {
            setValues(prev => ({ ...prev, Status: val }));
            if (errors.Status) setErrors(prev => ({ ...prev, Status: "" }));
          }}
          required
          disabled={isFormReadOnly}
          error={errors.Status}
        />
      ),
    },

    // ROW 3: Full Width Description
    {
      name: "Description",
      label: "توضیحات",
      type: "custom",
      noWrapper: true,
      bandId: "row3",
      containerClassName: "w-full",
      row: 3,
      order: 1,
      render: () => (
        <TextArea
          label="توضیحات"
          value={values.Description || ""}
          onChange={(e) => setValues(prev => ({ ...prev, Description: e.target.value }))}
          rows={1}
          placeholder="توضیحات تکمیلی شمارش انبارگردانی..."
          disabled={isFormReadOnly || isCountEditingDisabled}
        />
      ),
    },
  ], [
    values, 
    errors, 
    periods, 
    warehouses, 
    periodColumns, 
    warehouseColumns, 
    roundOptions, 
    isFormReadOnly,
    isCountEditingDisabled,
    numberingSetting,
    currentId
  ]);

  // Bottom Tabs Definition
  const bottomTabs = useMemo(() => [
    {
      id: "count-details-tab",
      label: (
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold">{dynamicTabTitle}</span>
          <span className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-full font-mono">
            {items.length} کالا
          </span>
        </div>
      ),
      content: (
        <div className="flex flex-col h-full space-y-2 p-1">
          {errors.items && (
            <div className="p-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded">
              {errors.items}
            </div>
          )}
          <div className="flex-1 min-h-[300px]">
            <MainDataGrid
              title=""
              hideTitleBar={true}
              columns={gridColumns}
              data={items}
              disableAutoColumns={true}
              emptyMessage={
                !values.StocktakingTagHeaderRef 
                  ? "لطفاً ابتدا دوره انبارگردانی را از هدر انتخاب نمایید."
                  : !values.WarehouseRef 
                    ? "لطفاً انبار شمارش‌شده را از لیست انتخاب کنید."
                    : "هیچ کالای تگ‌خورده‌ای برای این انبار یافت نشد."
              }
              isLoading={false}
              rowKey="ItemRef"
            />
          </div>
        </div>
      ),
    }
  ], [dynamicTabTitle, items, gridColumns, errors.items, values.StocktakingTagHeaderRef, values.WarehouseRef, loading]);

  const activeTfItem = selectedTfItemRowIndex !== null ? items[selectedTfItemRowIndex] : null;

  const isStatusConfirmed = Number(values.Status) === DocumentState.Approved || Number(values.Status) === 5 || String(values.Status) === 'تایید شده';
  const isRecordSaved = Boolean(currentId);

  // Check if selected stocktaking period has its final count registered
  const isFinalCountRegistered = useMemo(() => {
    if (!values.StocktakingTagHeaderRef) return false;

    const requiredFinalRound = Number(values.CountTimes || 1);
    const currentRoundNum = Number(values.CountRound || 1);

    // 1. If current open document is saved and its CountRound matches or exceeds required final count round
    if (currentId && currentRoundNum >= requiredFinalRound) {
      return true;
    }

    // 2. If existingWarehouseCounts contains a saved count for required final count round
    if (Array.isArray(existingWarehouseCounts) && existingWarehouseCounts.length > 0) {
      return existingWarehouseCounts.some(
        (c: any) => Number(c.CountRound || 1) >= requiredFinalRound
      );
    }

    return false;
  }, [values.StocktakingTagHeaderRef, values.CountTimes, values.CountRound, currentId, existingWarehouseCounts]);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      <SimpleFormTwoRowTabbed
        title="شمارش انبارگردانی"
        icon={<ClipboardList className="w-5 h-5 text-blue-600" />}
        bands={bands}
        hideBands={true}
        fields={fields}
        values={values}
        onChange={(name, val) => setValues(prev => ({ ...prev, [name]: val }))}
        errors={errors}
        bottomTabs={bottomTabs}
        defaultBottomTabId="count-details-tab"
        actionbar={
          <StocktakingDiscrepancyButtons
            stocktakingCountId={currentId}
            tagHeaderId={values.StocktakingTagHeaderRef}
            warehouseId={values.WarehouseRef}
            isSaved={isRecordSaved}
            isConfirmed={isStatusConfirmed}
            countRound={values.CountRound}
            totalCountTimes={values.CountTimes}
            hasFinalCountRegistered={isFinalCountRegistered}
            onIssueSurplus={() => setIsSurplusModalOpen(true)}
            onIssueShortage={() => setIsShortageModalOpen(true)}
          />
        }
        onSave={() => handleSave(false, false)}
        onSaveClose={() => handleSave(true, false)}
        onSaveNew={() => handleSave(false, true)}
        onNew={handleNew}
        onDelete={handleDelete}
        onList={handleList}
        listApiUrl="/api/inv/stocktaking-counts"
        listColumns={[
          { 
            key: 'StocktakingNumber', 
            label: 'شماره شمارش', 
            width: 100,
            renderItem: (item: any) => item?.StocktakingNumber || item?.stocktakingNumber || '—',
            exportValue: (item: any) => item?.StocktakingNumber || item?.stocktakingNumber || '',
          },
          { 
            key: 'StocktakingDate', 
            label: 'تاریخ شمارش', 
            width: 120,
            renderItem: (item: any) => {
              const raw = item?.StocktakingDate || item?.stocktakingDate;
              if (!raw) return '—';
              if (String(raw).startsWith('13') || String(raw).startsWith('14')) return String(raw);
              return formatDateByLocale(String(raw), 'fa');
            },
            exportValue: (item: any) => {
              const raw = item?.StocktakingDate || item?.stocktakingDate;
              if (!raw) return '';
              if (String(raw).startsWith('13') || String(raw).startsWith('14')) return String(raw);
              return formatDateByLocale(String(raw), 'fa');
            }
          },
          { 
            key: 'WarehouseTitle', 
            label: 'انبار', 
            width: 160,
            renderItem: (item: any) => item?.warehouse?.WarehouseTitle || item?.WarehouseTitle || '—',
            exportValue: (item: any) => item?.warehouse?.WarehouseTitle || item?.WarehouseTitle || '',
          },
          { 
            key: 'StocktakingPeriod', 
            label: 'دوره انبارگردانی', 
            width: 160,
            renderItem: (item: any) => item?.tagHeader?.StocktakingPeriod || item?.StocktakingPeriod || '—',
            exportValue: (item: any) => item?.tagHeader?.StocktakingPeriod || item?.StocktakingPeriod || '',
          },
          { 
            key: 'CountRound', 
            label: 'نوبت شمارش', 
            width: 100,
            renderItem: (item: any) => item?.CountRound ? `شمارش ${item.CountRound}` : 'شمارش ۱',
            exportValue: (item: any) => item?.CountRound ? `شمارش ${item.CountRound}` : 'شمارش ۱',
          },
          { 
            key: 'Description', 
            label: 'توضیحات', 
            width: 200,
            renderItem: (item: any) => item?.Description || item?.description || '—',
            exportValue: (item: any) => item?.Description || item?.description || '',
          },
        ]}
        onListSelect={(selectedItem) => {
          const selectedCountId = selectedItem?.StocktakingCountID || selectedItem?.id || selectedItem?.StocktakingCountId;
          if (selectedCountId) {
            setCurrentId(Number(selectedCountId));
          }
        }}
        showRecordNavigator={true}
        currentRecordId={currentId}
        onClose={onClose ? onClose : () => removeTab(currentTabId)}
        isSubmitting={loading}
        showLoadingOverlay={loading}
        isReadonly={isFormReadOnly}
        isUsed={isUsed}
        targetForm="StocktakingForm"
      />

      {/* Tracking Factor Modal if active */}
      {tfModalOpen && activeTfItem && (
        <TrackingFactorModal
          isOpen={tfModalOpen}
          onClose={() => {
            setTfModalOpen(false);
            setSelectedTfItemRowIndex(null);
          }}
          itemName={activeTfItem.ItemTitle}
          itemCode={activeTfItem.ItemCode}
          trackingFactors={activeTfItem.trackingFactors || []}
          initialValues={activeTfItem.savedTrackingFactorValues || []}
          initialQuantity={activeTfItem.CountedQuantity || 0}
          onSave={handleSaveTfModal}
          isReadonly={isFormReadOnly || isCountEditingDisabled}
          itemRef={activeTfItem.ItemRef}
          warehouseRef={values.WarehouseRef}
          formName="StocktakingForm"
          documentDate={values.StocktakingDate}
        />
      )}

      {/* Sub Unit Modal */}
      {subUnitModalState.isOpen && (
        <SubUnitModal
          isOpen={subUnitModalState.isOpen}
          onClose={() => setSubUnitModalState(prev => ({ ...prev, isOpen: false, rowIndex: null }))}
          itemId={subUnitModalState.itemId}
          itemCode={subUnitModalState.itemCode}
          itemTitle={subUnitModalState.itemTitle}
          primaryUnitName={subUnitModalState.primaryUnitName}
          subUnits={subUnitModalState.subUnits}
          selectedSubUnitId={subUnitModalState.selectedSubUnitId}
          initialSubQuantity={subUnitModalState.initialSubQuantity}
          initialMainQuantity={subUnitModalState.initialMainQuantity}
          onConfirm={handleConfirmSubUnit}
          onSelectPrimaryUnit={handleSelectPrimaryUnit}
          isReadonly={isFormReadOnly || isCountEditingDisabled}
        />
      )}

      {/* Stocktaking Surplus Modal */}
      {isSurplusModalOpen && (
        <StocktakingSurplusModal
          isOpen={isSurplusModalOpen}
          onClose={() => setIsSurplusModalOpen(false)}
          stocktakingCountId={currentId}
          tagHeaderId={values.StocktakingTagHeaderRef}
          warehouseId={values.WarehouseRef}
          stocktakingNumber={values.StocktakingNumber}
          items={items}
          onSuccess={(createdReceiptId, isDeleted) => {
            setIsSurplusModalOpen(false);
            if (isDeleted) {
              setValues(prev => ({ ...prev, Status: DocumentState.InitialRegistration }));
              if (currentId) {
                apiFetch(`/api/inv/stocktaking-counts/${currentId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ Status: DocumentState.InitialRegistration }),
                }).then(() => loadCountRecord(currentId));
              }
              showToast("سند با موفقیت حذف گردید و وضعیت برگه انبارگردانی به ثبت اولیه تغییر یافت.", "info");
            } else if (createdReceiptId) {
              addTab({
                id: `WarehouseReceipt-${createdReceiptId}`,
                title: `رسید انبار (${createdReceiptId})`,
                groupId: "warehouse_group",
                componentName: "WarehouseReceiptForm",
                props: { id: createdReceiptId },
                closable: true,
              });
            }
          }}
        />
      )}

      {/* Stocktaking Shortage Modal */}
      {isShortageModalOpen && (
        <StocktakingShortageModal
          isOpen={isShortageModalOpen}
          onClose={() => setIsShortageModalOpen(false)}
          stocktakingCountId={currentId}
          tagHeaderId={values.StocktakingTagHeaderRef}
          warehouseId={values.WarehouseRef}
          stocktakingNumber={values.StocktakingNumber}
          items={items}
          onSuccess={(createdIssueId, isDeleted) => {
            setIsShortageModalOpen(false);
            if (isDeleted) {
              setValues(prev => ({ ...prev, Status: DocumentState.InitialRegistration }));
              if (currentId) {
                apiFetch(`/api/inv/stocktaking-counts/${currentId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ Status: DocumentState.InitialRegistration }),
                }).then(() => loadCountRecord(currentId));
              }
              showToast("سند با موفقیت حذف گردید و وضعیت برگه انبارگردانی به ثبت اولیه تغییر یافت.", "info");
            } else if (createdIssueId) {
              addTab({
                id: `WarehouseIssue-${createdIssueId}`,
                title: `حواله انبار (${createdIssueId})`,
                groupId: "warehouse_group",
                componentName: "WarehouseIssueForm",
                props: { id: createdIssueId },
                closable: true,
              });
            }
          }}
        />
      )}
    </div>
  );
}

export default StocktakingForm;
