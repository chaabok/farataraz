"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  ChevronDown, 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  GripVertical,
  X,
  Filter,
  Check,
  Eraser,
  ListChecks,
  Square,
  CheckSquare,
  RotateCcw,
  Save,
  Trash2,
  Settings2,
  Eye,
  EyeOff,
  LayoutDashboard as LayoutIcon,
  Trash,
  LayoutTemplate,
  Plus,
  ExternalLink
} from 'lucide-react';
import { cn, safeStringify, escapeHtml, formatDateByLocale } from '@/lib/utils';
import { apiFetch } from '@/lib/utils';
import { latinizeDigits, localizeNumericString } from '@/lib/digitLocale';
import { useLanguage } from "@/components/Providers";
import { useTabs } from "@/components/TabsProvider";
import { motion, AnimatePresence } from 'framer-motion';
import { eventBus, EVENTS } from '@/lib/events';

// Actual project buttons
import { ActionButton } from '@/components/buttons/ActionButton';
import { ExcelExportButton } from '@/components/MainDataGridButtons/ExcelExportButton';
import { PdfExportButton } from '@/components/MainDataGridButtons/PdfExportButton';
import { WordExportButton } from '@/components/MainDataGridButtons/WordExportButton';
import { DeleteButton } from '@/components/MainDataGridButtons/DeleteButton';
import { ConfirmButton } from '@/components/MainDataGridButtons/ConfirmButton';
import { EditButton } from '@/components/MainDataGridButtons/EditButton';
import { MultiColumnDropdownNewButton } from './MultiColumnDropdownNewButton';
import type { AddFormOption } from './MultiColumnDropdown';
export type { AddFormOption };
import { PrintDropdownData } from './PrintDropdownData';
import { Tooltip } from '@/components/ui/Tooltip';
import { FormFieldWrapper } from './FormFieldWrapper';
import { loadHtml2Pdf } from '@/lib/pdf-loader';
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";

const getResolvedValue = (item: any, key: string) => {
  if (!item || !key) return undefined;
  if (!key.includes('.')) {
    if (item[key] !== undefined && item[key] !== null) return item[key];
    if (key === 'IssueNumber') return item.IssueNumber ?? item.ReceiptNumber ?? item.WarehouseIssueID ?? item.WarehouseReceiptID ?? item.id;
    if (key === 'IssueDate') return item.IssueDate ?? item.ReceiptDate;
    if (key === 'ReceiptNumber') return item.ReceiptNumber ?? item.IssueNumber ?? item.WarehouseReceiptID ?? item.WarehouseIssueID ?? item.id;
    if (key === 'ReceiptDate') return item.ReceiptDate ?? item.IssueDate;
    if (key === 'ReceiverName') return item.ReceiverName ?? item.SupplierName ?? item.receiverParty?.title;
    if (key === 'SupplierName') return item.SupplierName ?? item.ReceiverName ?? item.supplierParty?.title;
    if (key === 'id' || key === 'ID') {
      return item.id ?? item.ID ?? item.StocktakingSettingID ?? item.WarehouseDocumentTypeID ?? item.WarehouseID ?? item.MeasurementUnitID ?? item.ItemAccountCategoryID ?? item.partyId ?? item.PartyID ?? item.bankAccountId ?? item.BankAccountID ?? item.costCenterId ?? item.CostCenterID ?? item.businessStructureId ?? item.BusinessStructureID ?? item.currencyID ?? item.CurrencyID;
    }
    if (key === 'title' || key === 'name' || key === 'Title' || key === 'Name') {
      return item.title ?? item.Title ?? item.name ?? item.Name ?? item.MethodName ?? item.WarehouseDocumentTypeTitle ?? item.WarehouseTitle ?? item.WarehouseName ?? item.MeasurementUnitTitle ?? item.MeasurementUnitName;
    }
    if (key === 'code' || key === 'Code') {
      return item.code ?? item.Code ?? item.WarehouseDocumentTypeCode ?? item.WarehouseCode ?? item.MeasurementUnitCode;
    }
    return undefined;
  }
  return key.split('.').reduce((obj, k) => (obj || {})[k], item);
};

const parseColWidth = (w: any): number => {
  if (typeof w === 'number') return !isNaN(w) && w > 0 ? w : 150;
  if (typeof w === 'string') {
    const parsed = parseInt(w, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return 150;
};

export interface SingleSelectColumn {
  key: string;
  label: string;
  width?: number; // initial width in pixels
  sortable?: boolean;
  hideFilter?: boolean;
  hidden?: boolean;
  renderItem?: (item: any) => React.ReactNode;
  exportValue?: (item: any) => string;
}

export function getInferredAddFormOption(
  listApiUrl?: string, 
  addFormOptions?: AddFormOption | AddFormOption[],
  columns?: any[]
): AddFormOption[] {
  if (addFormOptions) {
    return Array.isArray(addFormOptions) ? addFormOptions : [addFormOptions];
  }

  const url = (listApiUrl || '').toLowerCase();

  if (url.includes('measurement-units') || url.includes('measurementunits')) {
    return [{ title: 'تعریف واحد سنجش جدید', componentName: 'MeasurementUnitForm', groupId: 'inv' }];
  }
  if (url.includes('item-service-groups') || url.includes('product-service-groups')) {
    return [{ title: 'تعریف گروه کالا / خدمت جدید', componentName: 'ItemServiceGroupForm', groupId: 'inv' }];
  }
  if (url.includes('product-services') || url.includes('items')) {
    return [{ title: 'تعریف کالا / خدمت جدید', componentName: 'ProductServiceForm', groupId: 'inv' }];
  }
  if (url.includes('warehouses')) {
    return [{ title: 'تعریف انبار جدید', componentName: 'WarehouseForm', groupId: 'inv' }];
  }
  if (url.includes('account-categories')) {
    return [{ title: 'تعریف طبقه بندی حساب کالا', componentName: 'ItemAccountCategoryForm', groupId: 'inv' }];
  }
  if (url.includes('tracking-factors')) {
    return [{ title: 'تعریف عامل ردیابی جدید', componentName: 'TrackingFactorForm', groupId: 'inv' }];
  }
  if (url.includes('bank-accounts')) {
    return [{ title: 'تعریف حساب بانکی جدید', componentName: 'BankAccountForm', groupId: 'rap' }];
  }
  if (url.includes('rap/reasons') || url.includes('reasons')) {
    return [{ title: 'تعریف علت جدید', componentName: 'RapReason', groupId: 'rap' }];
  }
  if (url.includes('geo-locations') || url.includes('cities')) {
    return [{ title: 'تعریف موقعیت مکانی جدید', componentName: 'GeoLocation', groupId: 'common' }];
  }
  if (url.includes('currencies')) {
    return [{ title: 'تعریف ارز جدید', componentName: 'Currency', groupId: 'common' }];
  }
  if (url.includes('detailed-accounts') || url.includes('requester')) {
    return [
      { title: 'تعریف حساب تفصیل جدید', componentName: 'DetailedAccountForm', groupId: 'accounting' },
      { title: 'تعریف مرکز هزینه جدید', componentName: 'CostCenter', groupId: 'accounting' },
      { title: 'تعریف پروژه جدید', componentName: 'ProjectForm', groupId: 'cnt' }
    ];
  }
  if (url.includes('accounting/accounts') || url.includes('/accounts') || url.includes('accounts')) {
    return [{ title: 'کدینگ حساب‌ها', componentName: 'Accounts', groupId: 'accounting' }];
  }
  if (url.includes('cost-centers')) {
    return [{ title: 'تعریف مرکز هزینه جدید', componentName: 'CostCenter', groupId: 'accounting' }];
  }
  if (url.includes('projects')) {
    return [{ title: 'تعریف پروژه جدید', componentName: 'ProjectForm', groupId: 'accounting' }];
  }
  if (url.includes('parties')) {
    return [{ title: 'تعریف طرف حساب جدید', componentName: 'Party', groupId: 'common' }];
  }
  if (url.includes('banks')) {
    return [{ title: 'تعریف بانک جدید', componentName: 'BankForm', groupId: 'rap' }];
  }
  if (url.includes('cashes')) {
    return [{ title: 'تعریف صندوق جدید', componentName: 'CashForm', groupId: 'rap' }];
  }
  if (url.includes('petty-cash')) {
    return [{ title: 'تعریف تنخواه جدید', componentName: 'PettyCashForm', groupId: 'rap' }];
  }
  if (url.includes('sales-channels') || url.includes('saleschannels')) {
    return [{ title: 'تعریف کانال فروش جدید', componentName: 'SalesChannelForm', groupId: 'sle' }];
  }
  if (url.includes('sales-types') || url.includes('salestypes')) {
    return [{ title: 'تعریف نوع فروش جدید', componentName: 'SalesTypeForm', groupId: 'sle' }];
  }
  if (url.includes('customer-groups') || url.includes('customergroups')) {
    return [{ title: 'تعریف گروه مشتری جدید', componentName: 'CustomerGroup', groupId: 'sle' }];
  }
  if (url.includes('sales-centers') || url.includes('salescenters')) {
    return [{ title: 'تعریف مرکز فروش جدید', componentName: 'SalesCenter', groupId: 'sle' }];
  }

  // Column inspection fallback
  if (columns && Array.isArray(columns)) {
    const keys = columns.map(c => String(c.key || c.name || '').toLowerCase()).join(' ');
    if (keys.includes('warehouse') || keys.includes('locationcode') || keys.includes('locationtitle')) {
      return [{ title: 'تعریف انبار جدید', componentName: 'WarehouseForm', groupId: 'inv' }];
    }
    if (keys.includes('measurementunit') || keys.includes('unitname')) {
      return [{ title: 'تعریف واحد سنجش جدید', componentName: 'MeasurementUnitForm', groupId: 'inv' }];
    }
    if (keys.includes('itemname') || keys.includes('product_name') || keys.includes('itemcode')) {
      return [{ title: 'تعریف کالا / خدمت جدید', componentName: 'ProductServiceForm', groupId: 'inv' }];
    }
    if (keys.includes('province') || keys.includes('country')) {
      return [{ title: 'تعریف موقعیت مکانی جدید', componentName: 'GeoLocation', groupId: 'common' }];
    }
    if (keys.includes('bankaccount') || keys.includes('accountnumber')) {
      return [{ title: 'تعریف حساب بانکی جدید', componentName: 'BankAccountForm', groupId: 'rap' }];
    }
    if (keys.includes('parenttitle') && keys.includes('naturelabel')) {
      return [{ title: 'تعریف علت جدید', componentName: 'RapReason', groupId: 'rap' }];
    }
  }

  return [];
}

interface ColumnLayout {
  id: string;
  name: string;
  columns: SingleSelectColumn[];
  isDefault?: boolean;
}

interface SingleSelectDropDownProps<T> {
  data?: T[];
  options?: T[];
  listApiUrl?: string;
  columns: SingleSelectColumn[];
  value?: T | number | string | null;
  selectedValue?: T | number | string | null;
  valueKey?: string;
  onChange?: (item: any, selectedVal?: any) => void;
  onSelect?: (item: any, selectedVal?: any) => void;
  searchKeys?: string[];
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
  alignVertical?: boolean;
  labelWidth?: string;
  displayKey?: keyof T; // which key to show when selected
  renderSelection?: (item: T) => React.ReactNode; 
  pageSize?: number; // Configurable page size
  onAdd?: () => void;
  addFormOptions?: AddFormOption | AddFormOption[];
  onDelete?: (item: T) => void;
  onDeleteRows?: (items: T[]) => void;
  onEdit?: (item: T) => void;
  onEditRows?: (items: T[]) => void;
  onViewAll?: () => void;
  
  enableDelete?: boolean;
  enableEdit?: boolean;
  disabled?: boolean;
  dropdownPlacement?: 'top' | 'bottom' | 'auto';
  trigger?: (toggle: () => void, isOpen: boolean, searchQuery: string, setSearchQuery: (q: string) => void) => React.ReactNode;
  id?: string;
  prefetch?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  filterItem?: (item: T) => boolean;
  noWrapper?: boolean;
  className?: string;
  notFoundMessage?: string;
  /**
   * Task 70: اختیاری — در حالت data-mode (بدون listApiUrl) والد با این کال‌بک
   * فهرست خود را دوباره واکشی می‌کند. هر بار پنل باز شود و همچنین با کلیک روی
   * دکمه بروزرسانی پنل فراخوانی می‌شود تا بدون بستن فرم، لیست تازه شود.
   */
  onRefresh?: () => void | Promise<void>;
}

const EMPTY_ARRAY: any[] = [];

export interface SingleSelectDropDownRef {
  openAndSearch: (query: string) => void;
  close: () => void;
}

export const SingleSelectDropDown = React.forwardRef(function SingleSelectDropDown<T extends Record<string, any>>({
  data = EMPTY_ARRAY as T[],
  options,
  listApiUrl,
  columns: columnsArray = EMPTY_ARRAY,
  value,
  selectedValue,
  valueKey,
  onChange,
  onSelect,
  placeholder,
  label,
  required,
  error,
  alignVertical,
  labelWidth,
  displayKey,
  renderSelection,
  pageSize = 100,
  onAdd,
  addFormOptions,
  onDelete,
  onDeleteRows,
  onEdit,
  onEditRows,
  onViewAll,
  
  enableDelete = false,
  enableEdit = false,
  disabled = false,
  dropdownPlacement = 'auto',
  trigger,
  id,
  onKeyDown,
  filterItem,
  noWrapper,
  className,
  prefetch = false,
  notFoundMessage,
  onRefresh
}: SingleSelectDropDownProps<T>, ref: React.ForwardedRef<SingleSelectDropDownRef>) {
  const { addTab, activeTabId } = useTabs();
  const [isOpen, setIsOpen] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const activeValue = value !== undefined ? value : selectedValue;
  const activeOnChange = onChange || onSelect;
  const activeDisplayKey = (displayKey || 'title') as string;

  useEffect(() => {
    setIsOpen(false);
    setShowAddMenu(false);
  }, [activeTabId]);

  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showColumnFilters, setShowColumnFilters] = useState(true);
  const [columnFilters, setColumnFilters] = useState<Record<string, { value: string, type: string }>>({});
  const [activeFilterMenu, setActiveFilterMenu] = useState<string | null>(null);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const isMultiSelectionEnabled = false;
  const [selectedRows, setSelectedRows] = useState<Set<any>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  
  const [columns, setColumns] = useState<SingleSelectColumn[]>(
    columnsArray.map(col => ({ ...col, width: parseColWidth(col.width), hidden: false }))
  );
  
  const initialSourceData = (Array.isArray(data) && data.length > 0) ? data : (Array.isArray(options) ? options : []);
  const [internalData, setInternalData] = useState<T[]>(initialSourceData);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom');
  const [alignment, setAlignment] = useState<'left' | 'right'>('left');
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, bottom: 0, right: 0 });
  const [savedLayouts, setSavedLayouts] = useState<ColumnLayout[]>([]);

  const handleSelectItem = (item: T) => {
    const selectedVal = item ? (valueKey && getResolvedValue(item, valueKey) !== undefined ? getResolvedValue(item, valueKey) : (getResolvedValue(item, 'id') ?? item.id ?? item.ID ?? item.WarehouseDocumentTypeID ?? item.MeasurementUnitID ?? item.ItemAccountCategoryID ?? Object.values(item)[0])) : null;
    if (activeOnChange) {
      activeOnChange(item, selectedVal);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    if (activeValue !== undefined && activeValue !== null && activeValue !== '') {
      let resolvedItem: T | null = null;
      if (typeof activeValue === 'object') {
        resolvedItem = activeValue as T;
      } else {
        const rawList = [...(internalData || []), ...(Array.isArray(data) ? data : []), ...(Array.isArray(options) ? options : [])];
        const sourceList = rawList.filter((item, index, self) => {
          if (!item) return false;
          const k1 = getResolvedValue(item, valueKey || 'id');
          return self.findIndex(i => {
            if (!i) return false;
            if (i === item) return true;
            const k2 = getResolvedValue(i, valueKey || 'id');
            return k1 !== undefined && k2 !== undefined && String(k1) === String(k2);
          }) === index;
        });
        resolvedItem = sourceList.find((item: any) => {
          if (!item) return false;
          if (valueKey && getResolvedValue(item, valueKey) !== undefined) {
            return String(getResolvedValue(item, valueKey)) === String(activeValue);
          }
          const itemVal = getResolvedValue(item, 'id') ?? item.id ?? item.ID ?? item.WarehouseDocumentTypeID ?? item.WarehouseID ?? item.MeasurementUnitID ?? item.ItemAccountCategoryID ?? item.code ?? item.key;
          return itemVal !== undefined && String(itemVal) === String(activeValue);
        }) || null;
      }

      if (resolvedItem) {
        let valStr = '';
        if (renderSelection) {
          const rendered = renderSelection(resolvedItem);
          valStr = typeof rendered === 'string' ? rendered : String(getResolvedValue(resolvedItem, activeDisplayKey) || '');
        } else {
          valStr = String(getResolvedValue(resolvedItem, activeDisplayKey) || '');
        }
        setInputValue(valStr);
      } else {
        setInputValue(String(activeValue));
      }
    } else {
      setInputValue('');
    }
  }, [activeValue, internalData, data, options, valueKey, activeDisplayKey, renderSelection]);
  
  React.useImperativeHandle(ref, () => ({
    openAndSearch: (query: string) => {
      setSearchQuery(query);
      setShowGlobalSearch(true); // make sure global search bar is visible
      setIsOpen(true);
    },
    close: () => setIsOpen(false)
  }));

  useEffect(() => {
    const sourceList = (Array.isArray(data) && data.length > 0) ? data : (Array.isArray(options) ? options : []);
    if (sourceList.length > 0) {
      setInternalData(sourceList);
    } else if (!listApiUrl) {
      setInternalData([]);
    }
  }, [data, options, listApiUrl]);

  useEffect(() => {
    if (listApiUrl) {
      setHasFetched(false);
      setPage(1);
    }
  }, [listApiUrl]);

  const fetchPage = async (
    pageNum: number, 
    reset = false,
    overrideParams?: {
      searchQuery?: string;
      columnFilters?: Record<string, { value: string; type: string }>;
      sortConfig?: { key: string; direction: 'asc' | 'desc' | null };
    }
  ) => {
    if (!listApiUrl) return;
    setIsLoadingApi(true);
    try {
      const urlObj = new URL(listApiUrl, window.location.origin);
      urlObj.searchParams.set('pageIndex', String(pageNum - 1));
      urlObj.searchParams.set('pageSize', String(pageSize));
      
      const currentColumnFilters = overrideParams?.columnFilters !== undefined ? overrideParams.columnFilters : columnFilters;
      const currentSortConfig = overrideParams?.sortConfig !== undefined ? overrideParams.sortConfig : sortConfig;
      const currentSearchQuery = overrideParams?.searchQuery !== undefined ? overrideParams.searchQuery : searchQuery;

      const activeFilters = Object.entries(currentColumnFilters || {})
        .filter(([, f]) => f && (f.value || ['isEmpty', 'isNotEmpty', 'empty', 'notEmpty'].includes(f.type)))
        .map(([k, f]) => ({ id: k, value: { op: f!.type, value: f!.value } }));
      
      if (activeFilters.length > 0) {
        urlObj.searchParams.set('columnFilters', JSON.stringify(activeFilters));
      }
      
      if (currentSortConfig.key && currentSortConfig.direction) {
        urlObj.searchParams.set('sorting', JSON.stringify([{ id: currentSortConfig.key, desc: currentSortConfig.direction === 'desc' }]));
      }

      if (currentSearchQuery) {
        urlObj.searchParams.set('search', currentSearchQuery); // For simpler endpoints
        const advanced = visibleColumns
          .filter(c => !c.hidden)
          .map((c, i) => ({
            id: `g${i}`,
            columnId: c.key,
            operator: 'contains',
            value: currentSearchQuery,
            logicalOp: 'or'
          }));
        urlObj.searchParams.set('advancedFilters', JSON.stringify(advanced));
      }

      const res = await apiFetch(urlObj.toString());
      if (res.ok) {
        const json = await res.json();
        let items = Array.isArray(json) ? json : (json.items || (json.data && json.data.items) || (Array.isArray(json.data) ? json.data : []));
        if (!Array.isArray(items)) items = [];
        if (reset) {
          setInternalData(items);
        } else {
          setInternalData(prev => {
            const existingIds = new Set(prev.map(i => i.id || Object.values(i)[0]));
            const filteredNew = items.filter((i: any) => !existingIds.has(i.id || Object.values(i)[0]));
            return [...prev, ...filteredNew];
          });
        }
        setHasMore(items.length === pageSize);
        // Mark as fetched ONLY on success: if the request failed (e.g. the
        // backend was restarting), `hasFetched` stays false so the next
        // open/focus retries the fetch instead of leaving the dropdown
        // permanently empty until a full page reload.
        setHasFetched(true);
      } else {
        if (reset) {
          setInternalData([]);
        }
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
      if (reset) {
        setInternalData([]);
      }
      setHasMore(false);
    } finally {
      setIsLoadingApi(false);
    }
  };

  // Task 70: رفرش خودکار لیست هر بار پنل باز می‌شود (بدون نیاز به بستن فرم).
  // حالت API: صفحه اول دوباره واکشی می‌شود؛ حالت data-mode: onRefresh والد صدا زده می‌شود.
  const wasOpenRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);
  const listApiUrlRef = useRef(listApiUrl);
  const isOpenRef = useRef(false);
  const [isRefreshingData, setIsRefreshingData] = useState(false);

  // همگام‌سازی refها در effect (نه حین رندر)
  useEffect(() => {
    onRefreshRef.current = onRefresh;
    listApiUrlRef.current = listApiUrl;
  });

  const runDataRefresh = async () => {
    const fn = onRefreshRef.current;
    if (!fn) return;
    setIsRefreshingData(true);
    try {
      await fn();
    } catch (err) {
      console.error('onRefresh failed:', err);
    } finally {
      setIsRefreshingData(false);
    }
  };

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      if (listApiUrlRef.current) {
        fetchPage(1, true);
      } else {
        runDataRefresh();
      }
    }
    wasOpenRef.current = isOpen;
    isOpenRef.current = isOpen;
  }, [isOpen, listApiUrl]);

  // واکشی اولیه فقط وقتی پنل بسته است (prefetch / رفع ابهام متن ورودی).
  // وقتی پنل باز است، effect بالا مسئول واکشی تازه است تا دوباره‌کاری نشود.
  useEffect(() => {
    if (!isOpen && (prefetch || (value !== undefined && value !== null && value !== '')) && listApiUrl && !hasFetched) {
      fetchPage(1, true);
    }
  }, [isOpen, prefetch, value, listApiUrl, hasFetched]);

  useEffect(() => {
    const unsubscribe = eventBus.on(EVENTS.DATA_CHANGED, (payload: any) => {
      if (listApiUrl) {
        fetchPage(1, true);
      }
    });
    return () => unsubscribe();
  }, [listApiUrl]);

  const [activeLayoutId, setActiveLayoutId] = useState<string>('default');
  const [columnSearchQuery, setColumnSearchQuery] = useState('');

  const { t, language, direction: dir } = useLanguage();

  const defaultPlaceholder = React.useMemo(() => {
    switch (language) {
      case 'fa': return 'انتخاب کنید...';
      case 'ar': return 'اختر عنصرًا...';
      case 'zh': return '请选择...';
      default: return 'Select an item...';
    }
  }, [language]);

  const finalPlaceholder = placeholder || defaultPlaceholder;

  // Local storage persistence for layouts
  useEffect(() => {
    if (!displayKey) return;
    const stored = localStorage.getItem(`mcdd-layouts-${displayKey.toString()}`);
    if (stored) {
      try {
        setSavedLayouts(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load layouts", e);
      }
    }
  }, [displayKey]);

  useEffect(() => {
    if (!displayKey) return;
    if (savedLayouts.length > 0) {
      localStorage.setItem(`mcdd-layouts-${displayKey.toString()}`, safeStringify(savedLayouts));
    }
  }, [savedLayouts, displayKey]);

  const visibleColumns = useMemo(() => {
    return columnsArray
      .map(propCol => {
         const stateCol = columns.find(c => c.key === propCol.key);
         const w = parseColWidth(stateCol?.width ?? propCol.width);
         return { ...propCol, width: w, hidden: stateCol?.hidden || false };
      })
      .filter(col => !col.hidden);
  }, [columnsArray, columns]);

  const handleToggleColumn = (key: string) => {
    setColumns(prev => prev.map(col => 
      col.key === key ? { ...col, hidden: !col.hidden } : col
    ));
    setActiveLayoutId('custom');
  };

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({
    key: '',
    direction: null
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filter types definitions
  const filterTypes = [
    { id: 'contains', label: 'شامل' },
    { id: 'equals', label: 'برابر' },
    { id: 'notEquals', label: 'نامساوی' },
    { id: 'startsWith', label: 'شروع با' },
    { id: 'isEmpty', label: 'خالی' },
    { id: 'isNotEmpty', label: 'غیر خالی' },
  ];

  // Close active filter menu when clicking outside
  useEffect(() => {
    const handleClickOutsideMenu = (e: MouseEvent) => {
      if (activeFilterMenu && !(e.target as HTMLElement).closest('.filter-menu-container')) {
        setActiveFilterMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideMenu);
    return () => document.removeEventListener('mousedown', handleClickOutsideMenu);
  }, [activeFilterMenu]);

  // Click outside to close the main dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && !containerRef.current?.contains(e.target as Node)) {
        // Also don't close if clicking within a menu or tooltip that might be portals, etc.
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Reset search query when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Logic to handle column filter changes
  const handleColumnFilterChange = (key: string, value: string, type?: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [key]: {
        value: value,
        type: type || (prev[key]?.type || 'contains')
      }
    }));
    setVisibleCount(pageSize);
    setActiveFilterMenu(null);
  };
  const [isResizing, setIsResizing] = useState(false);
  const [lockedWidth, setLockedWidth] = useState<number | string>('max-content');
  const [panelHeight, setPanelHeight] = useState<number>(210);
  const [userResizedWidth, setUserResizedWidth] = useState<number | null>(null);
  const [userResizedHeight, setUserResizedHeight] = useState<number | null>(null);

  const totalContentWidth = useMemo(() => {
    const colsWidth = visibleColumns.reduce((acc, col) => acc + parseColWidth(col.width), 0);
    return colsWidth + (isMultiSelectionEnabled ? 40 : 0);
  }, [visibleColumns, isMultiSelectionEnabled]);
  const [isPanelResizing, setIsPanelResizing] = useState(false);
  const panelResizingRef = useRef<{ 
    direction: 'top' | 'bottom' | 'side' | 'bottom-side'; 
    startY: number; 
    startX: number;
    startHeight: number;
    startWidth: number;
  } | null>(null);

  // Calculate and lock width on open
  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth || 150;
        const viewportWidth = window.innerWidth || 1200;
        const viewportHeight = window.innerHeight || 800;
        
        const maxWidth = Math.max(300, viewportWidth - 20); // 10px margin on each side
        const formWidthLimit = Math.max(containerWidth, viewportWidth * 0.55); // 55% of the screen by default
        const maxAllowedTarget = Math.min(maxWidth, formWidthLimit);
        
        const validTotalContentWidth = parseColWidth(totalContentWidth) || 500;
        const targetWidth = Math.min(maxAllowedTarget, Math.max(containerWidth, validTotalContentWidth, 500));
        let width = userResizedWidth || targetWidth;
        if (typeof width !== 'number' || isNaN(width) || width <= 0) {
          width = 600;
        }
        width = Math.min(maxWidth, width);

        let height = userResizedHeight || 210;
        if (typeof height !== 'number' || isNaN(height) || height <= 0) {
          height = 210;
        }

        setLockedWidth(width);
        setPanelHeight(height);

        const rect = containerRef.current.getBoundingClientRect();

        let p: 'top' | 'bottom';
        let finalHeight = height;

        // Vertical placement
        if (dropdownPlacement === 'top') {
          p = 'top';
        } else if (dropdownPlacement === 'bottom') {
          p = 'bottom';
        } else {
          const spaceBelow = viewportHeight - rect.bottom - 20; // 20px padding from bottom edge
          const spaceAbove = rect.top - 20; // 20px padding from top edge

          if (spaceBelow >= height) {
            p = 'bottom';
            finalHeight = height;
          } else if (spaceAbove > spaceBelow) {
            p = 'top';
            finalHeight = Math.min(height, spaceAbove);
          } else {
            p = 'bottom';
            finalHeight = spaceBelow;
          }
        }
        
        setPlacement(p);
        setPanelHeight(userResizedHeight || finalHeight);

        let a: 'left' | 'right';
        // Horizontal alignment
        if (dir === 'rtl') {
          if (rect.right < width) {
            a = 'left'; // Align left edge of dropdown to left edge of input (expanding to right)
          } else {
            a = 'right'; // Expand to left
          }
        } else {
          if (rect.left + width > viewportWidth) {
            a = 'right';
          } else {
            a = 'left';
          }
        }
        setAlignment(a);

        const effectiveHeight = userResizedHeight || finalHeight;
        
        let calculatedLeft = a === 'left' ? rect.left : rect.right - Math.max(containerWidth, width);
        if (typeof calculatedLeft !== 'number' || isNaN(calculatedLeft)) calculatedLeft = 10;

        // Clamp to viewport
        if (calculatedLeft < 10) calculatedLeft = 10;
        if (calculatedLeft + width > viewportWidth - 10) {
          calculatedLeft = Math.max(10, viewportWidth - width - 10);
        }

        let calculatedRight = viewportWidth - (calculatedLeft + width);
        if (typeof calculatedRight !== 'number' || isNaN(calculatedRight)) calculatedRight = 10;

        setDropdownPos({
          top: p === 'bottom' ? rect.bottom + 4 : rect.top - effectiveHeight - 4,
          left: calculatedLeft,
          bottom: viewportHeight - (p === 'top' ? rect.top - 4 : rect.bottom + effectiveHeight + 4),
          right: calculatedRight,
        });
      } else if (!isOpen) {
        setLockedWidth('max-content');
      }
    };

    updatePosition();
    
    if (isOpen) {
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen, totalContentWidth, userResizedWidth, userResizedHeight, dir, dropdownPlacement]);

  // Reset visible count when searching or sorting
  useEffect(() => {
    setVisibleCount(pageSize);
  }, [searchQuery, sortConfig, pageSize]);

  // Debounced server-side fetching when search/sort/filters change.
  // Task 70: «isOpen» از وابستگی‌ها حذف شد (با isOpenRef کنترل می‌شود) تا با
  // باز شدن پنل دوبار درخواست زده نشود — رفرشِ باز شدن را effect اختصاصی بالا انجام می‌دهد.
  useEffect(() => {
    if (!listApiUrl || !isOpenRef.current) return;
    const timer = setTimeout(() => {
      fetchPage(1, true);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, columnFilters, sortConfig, listApiUrl]);

  // Filtering
  const filteredData = useMemo(() => {
    let result = internalData;
    if (filterItem) {
      result = result.filter(filterItem);
    }
    // Task 64: فیلتر و جستجو حتی وقتی listApiUrl ست شده هم سمت کلاینت اعمال می‌شود
    // (قبلاً به‌کلی غیرفعال بود و چون برخی endpointها پارامترها را نادیده می‌گرفتند،
    // فیلتر/جستجوی پنل فهرست در اکشن بار کار نمی‌کرد. اگر بک‌اند فیلتر کرده باشد
    // اعمال مجدد همان شرط‌ها نتیجه را تغییر نمی‌دهد.)
    const q = latinizeDigits(searchQuery).trim().toLowerCase();
    if (q) {
      result = result.filter(item =>
        visibleColumns.some(col =>
          String(getResolvedValue(item, col.key) ?? '').toLowerCase().includes(q)
        ) ||
        Object.values(item || {}).some(val =>
          String(val ?? '').toLowerCase().includes(q)
        )
      );
    }
    if (showColumnFilters) {
      Object.entries(columnFilters || {}).forEach(([key, filter]) => {
        if (!filter) return;
        const val = latinizeDigits(filter.value || '').trim().toLowerCase();
        const type = filter.type;
        if (!val && type !== 'isEmpty' && type !== 'isNotEmpty') return;
        result = result.filter(item => {
          const itemVal = latinizeDigits(String(getResolvedValue(item, key) ?? '')).toLowerCase();
          switch (type) {
            case 'contains': return itemVal.includes(val);
            case 'equals': return itemVal === val;
            case 'notEquals': return itemVal !== val;
            case 'startsWith': return itemVal.startsWith(val);
            case 'isEmpty': return !itemVal || itemVal.trim() === '';
            case 'isNotEmpty': return itemVal && itemVal.trim() !== '';
            default: return true;
          }
        });
      });
    }
    return result;
  }, [internalData, searchQuery, columnFilters, showColumnFilters, filterItem, visibleColumns]);

  // Sorting
  const sortedData = useMemo(() => {
    if (listApiUrl) return filteredData; // Backend handles sorting
    if (!sortConfig.key || !sortConfig.direction) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = getResolvedValue(a, sortConfig.key);
      const bVal = getResolvedValue(b, sortConfig.key);
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig, listApiUrl]);

  // Set active index when open or when data/value changes
  useEffect(() => {
    if (isOpen) {
      if (value) {
        const valueId = typeof value === 'object' && value !== null ? ((value as any).id || Object.values(value)[0]) : value;
        const foundIdx = sortedData.findIndex(item => {
          const itemId = typeof item === 'object' && item !== null ? ((item as any).id || Object.values(item)[0]) : item;
          return itemId === valueId;
        });
        if (foundIdx !== -1) {
          setActiveIndex(foundIdx);
          return;
        }
      }
      if (activeIndex === -1 || activeIndex >= sortedData.length) {
        setActiveIndex(sortedData.length > 0 ? 0 : -1);
      }
    } else {
      setActiveIndex(-1);
    }
  }, [isOpen, sortedData, value]);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && isOpen) {
      const activeElem = document.getElementById(`mcdd-row-${activeIndex}`);
      if (activeElem) {
        activeElem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [activeIndex, isOpen]);

  // Handle global keyboard keys when dropdown list is open
  useEffect(() => {
    if (!isOpen) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // If pressing Alt + ArrowDown, toggle off
      if (e.altKey && e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(false);
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => {
          const next = prev + 1;
          return next < sortedData.length ? next : prev;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => {
          const next = prev - 1;
          return next >= 0 ? next : 0;
        });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        if (activeIndex >= 0 && activeIndex < sortedData.length) {
          handleSelectItem(sortedData[activeIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown, true);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown, true);
  }, [isOpen, activeIndex, sortedData, onChange]);

  // Infinite Scroll Handler
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 20) {
       if (listApiUrl) {
         if (!isLoadingApi && hasMore) {
           setPage(p => {
             const np = p + 1;
             fetchPage(np);
             return np;
           });
         }
       } else {
         if (visibleCount < sortedData.length && !isLoadingMore) {
           setIsLoadingMore(true);
           setTimeout(() => {
             setVisibleCount(prev => prev + pageSize);
             setIsLoadingMore(false);
           }, 400);
         }
       }
    }
  };

  const handleSort = (key: string) => {
    if (isResizing) return;
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Column Resizing logic
  const resizingRef = useRef<{ index: number; startX: number; startWidth: number } | null>(null);

  const startResizing = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setIsResizing(true);
    resizingRef.current = {
      index,
      startX: e.clientX,
      startWidth: columns[index].width || 150
    };
    document.addEventListener('mousemove', handleResizing);
    document.addEventListener('mouseup', stopResizing);
  };

  const handleResizing = (e: MouseEvent) => {
    if (!resizingRef.current) return;
    const { index, startX, startWidth } = resizingRef.current;
    let diff = dir === 'rtl' ? startX - e.clientX : e.clientX - startX;
    const newWidth = Math.max(50, startWidth + diff);
    setColumns(prev => prev.map((col, i) => i === index ? { ...col, width: newWidth } : col));
  };

  const stopResizing = () => {
    resizingRef.current = null;
    document.removeEventListener('mousemove', handleResizing);
    document.removeEventListener('mouseup', stopResizing);
    setTimeout(() => setIsResizing(false), 100);
  };


  const startPanelResizing = (direction: 'top' | 'bottom' | 'side' | 'bottom-side', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPanelResizing(true);
    panelResizingRef.current = {
      direction,
      startY: e.clientY,
      startX: e.clientX,
      startHeight: dropdownRef.current?.offsetHeight || 400,
      startWidth: Number(lockedWidth) || dropdownRef.current?.offsetWidth || 300
    };
    document.addEventListener('mousemove', handlePanelResizing);
    document.addEventListener('mouseup', stopPanelResizing);
  };

  const handlePanelResizing = (e: MouseEvent) => {
    if (!panelResizingRef.current) return;
    const { direction, startY, startX, startHeight, startWidth } = panelResizingRef.current;
    
    if (direction === 'bottom' || direction === 'bottom-side') {
      const newHeight = Math.max(200, startHeight + (e.clientY - startY));
      setPanelHeight(newHeight);
      setUserResizedHeight(newHeight);
    } else if (direction === 'top') {
      const newHeight = Math.max(200, startHeight - (e.clientY - startY));
      setPanelHeight(newHeight);
      setUserResizedHeight(newHeight);
    }

    if (direction === 'side' || direction === 'bottom-side') {
      let diffX = e.clientX - startX;
      if (dir === 'rtl') diffX = -diffX;
      const newWidth = Math.max(500, startWidth + diffX);
      setLockedWidth(newWidth);
      setUserResizedWidth(newWidth);
    }
  };

  const stopPanelResizing = () => {
    panelResizingRef.current = null;
    document.removeEventListener('mousemove', handlePanelResizing);
    document.removeEventListener('mouseup', stopPanelResizing);
    setIsPanelResizing(false);
  };

  // Drag and Drop for Reordering
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    if (isResizing) return;
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newColumns = [...columns];
    const draggedItem = newColumns[draggedIndex];
    newColumns.splice(draggedIndex, 1);
    newColumns.splice(index, 0, draggedItem);
    setColumns(newColumns);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleResizeStart = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    
    const startX = e.pageX;
    const startWidth = visibleColumns[index].width || 150;
    
    const handleMouseMove = (mouseMoveEvent: MouseEvent) => {
      const isRtl = dir === 'rtl';
      const currentX = mouseMoveEvent.pageX;
      const diffX = isRtl ? startX - currentX : currentX - startX;
      
      const newWidth = Math.max(50, startWidth + diffX);
      
      setColumns(prevColumns => {
         const mapped = [...prevColumns];
         const targetKey = visibleColumns[index].key;
         const colIndex = mapped.findIndex(c => c.key === targetKey);
         if (colIndex !== -1) {
            mapped[colIndex] = { ...mapped[colIndex], width: newWidth };
         }
         return mapped;
      });
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleExcelExport = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (sortedData.length === 0) {
      alert(dir === 'rtl' ? "داده‌ای برای خروجی وجود ندارد." : "No data available for export.");
      return;
    }

    const headers = visibleColumns.map(col => col.label).join(',');
    const rows = sortedData.map(row => 
      visibleColumns.map(col => {
        let val = col.exportValue ? col.exportValue(row) : String(getResolvedValue(row, col.key) || '');
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(',')
    ).join('\n');
    
    const csvContent = '\uFEFF' + headers + '\n' + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${(label || 'export').replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWordExport = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (sortedData.length === 0) {
      alert(dir === 'rtl' ? "داده‌ای برای خروجی وجود ندارد." : "No data available for export.");
      return;
    }

    const headers = visibleColumns.map(col => `<th>${escapeHtml(col.label)}</th>`).join('');
    const rows = sortedData.map(row => 
      `<tr>${visibleColumns.map(col => `<td>${escapeHtml(col.exportValue ? col.exportValue(row) : String(getResolvedValue(row, col.key) || ''))}</td>`).join('')}</tr>`
    ).join('');
    
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <style>
          table { width: 100%; border-collapse: collapse; dir: ${dir}; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: ${dir === 'rtl' ? 'right' : 'left'}; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <table>
          <thead><tr>${headers}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword;charset=utf-8'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(label || 'export').replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePdfExport = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const container = document.createElement('div');
    container.id = 'pdf-temp-container';
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '1122px'; 
    container.style.zIndex = '-9999';
    container.style.visibility = 'hidden';
    container.dir = dir; 
    document.body.appendChild(container);
    
    try {
      if (sortedData.length === 0) {
        alert(dir === 'rtl' ? "داده‌ای برای خروجی وجود ندارد." : "No data available for export.");
        document.body.removeChild(container);
        return;
      }

      const style = document.createElement('style');
      style.innerHTML = `
        @import url('https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.0.0/Vazirmatn-font-face.css');
        .pdf-export-wrapper { background: white; padding: 30px; font-family: 'Vazirmatn', sans-serif !important; width: 1000px; margin: 0 auto; }
        .pdf-title { text-align: center; margin-bottom: 25px; font-size: 24px; color: #000; font-weight: bold; }
        .pdf-table { width: 100%; border-collapse: collapse; border: 1.5px solid #000; table-layout: fixed; }
        .pdf-th { background-color: #f8fafc; color: #000; border: 1.5px solid #000; padding: 10px 5px; text-align: center; font-size: 12px; font-weight: bold; }
        .pdf-td { border: 1px solid #000; padding: 8px 5px; text-align: center; color: #000; font-size: 11px; word-break: break-all; }
        .pdf-tr-alt { background-color: #f9fafb; }
      `;
      container.appendChild(style);

      const content = document.createElement('div');
      content.className = 'pdf-export-wrapper';
      const title = document.createElement('h2');
      title.className = 'pdf-title';
      title.innerText = label || placeholder || 'Data Export';
      content.appendChild(title);

      const table = document.createElement('table');
      table.className = 'pdf-table';
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      visibleColumns.forEach(col => {
        const th = document.createElement('th');
        th.className = 'pdf-th';
        th.style.width = col.width ? `${col.width}px` : 'auto';
        th.innerText = col.label;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);
      
      const tbody = document.createElement('tbody');
      sortedData.forEach((row, idx) => {
        const tr = document.createElement('tr');
        if (idx % 2 === 1) tr.className = 'pdf-tr-alt';
        visibleColumns.forEach(col => {
          const td = document.createElement('td');
          td.className = 'pdf-td';
          td.innerText = col.exportValue ? col.exportValue(row) : String(getResolvedValue(row, col.key) || '');
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      content.appendChild(table);
      container.appendChild(content);

      setTimeout(async () => {
        try {
          const html2pdfLib = await loadHtml2Pdf();
          if (html2pdfLib) {
            await (html2pdfLib as any)().from(content).set({
              margin: 10,
              filename: `${(label || 'export').replace(/\s+/g, '_')}.pdf`,
              image: { type: 'jpeg', quality: 1.0 },
              html2canvas: { scale: 2, useCORS: true },
              jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
            }).save();
          }
           if (document.body.contains(container)) document.body.removeChild(container);
        } catch (err) {
          console.error(err);
          if (document.body.contains(container)) document.body.removeChild(container);
        }
      }, 1500);
    } catch (err) {
      console.error(err);
      if (document.body.contains(container)) document.body.removeChild(container);
    }
  };

  const handleReset = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setColumns(columnsArray.map(col => ({ ...col, width: col.width || 150, hidden: false })));
    setActiveLayoutId('default');
    setSortConfig({ key: '', direction: null });
    setColumnFilters({});
    setSearchQuery('');
    setColumnSearchQuery('');
    setSelectedRows(new Set());
    setShowGlobalSearch(false);
    setShowDeleteConfirm(false);
    setShowEditConfirm(false);
    setActiveFilterMenu(null);
    setPage(1);

    if (listApiUrl) {
      fetchPage(1, true, { searchQuery: '', columnFilters: {}, sortConfig: { key: '', direction: null } });
    } else {
      // Task 70: در حالت data-mode بازسازی از props قدیمی کافی نیست —
      // onRefresh والد صدا زده می‌شود تا داده واقعاً از سرور تازه شود.
      const sourceList = (Array.isArray(data) && data.length > 0) ? data : (Array.isArray(options) ? options : []);
      setInternalData(sourceList);
      setVisibleCount(pageSize);
      runDataRefresh();
    }
  };

  const handleInputKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();

      if (!inputValue) {
        setIsOpen(true);
        return;
      }

      setSearchQuery(inputValue);

      if (listApiUrl) {
        try {
          const urlObj = new URL(listApiUrl, window.location.origin);
          urlObj.searchParams.set('pageIndex', '0');
          urlObj.searchParams.set('pageSize', String(pageSize));
          urlObj.searchParams.set('search', inputValue);
          
          const advanced = visibleColumns
            .filter(c => !c.hidden)
            .map((c, i) => ({
              id: `g${i}`,
              columnId: c.key,
              operator: 'contains',
              value: inputValue,
              logicalOp: 'or'
            }));
          urlObj.searchParams.set('advancedFilters', JSON.stringify(advanced));

          const res = await apiFetch(urlObj.toString());
          if (res.ok) {
            const json = await res.json();
            let items = Array.isArray(json) ? json : (json.items || (json.data && json.data.items) || (Array.isArray(json.data) ? json.data : []));
            if (!Array.isArray(items)) items = [];
            
            const exactMatch = items.find((item: any) => String(getResolvedValue(item, displayKey as string)).toLowerCase() === inputValue.toLowerCase());

            if (exactMatch) {
              handleSelectItem(exactMatch);
              setShowGlobalSearch(false);
            } else if (items.length === 1) {
              handleSelectItem(items[0]);
              setShowGlobalSearch(false);
            } else {
              setInternalData(items);
              setIsOpen(true);
              setShowGlobalSearch(true);
            }
          } else {
            setIsOpen(true);
            setShowGlobalSearch(true);
          }
        } catch (err) {
          setIsOpen(true);
          setShowGlobalSearch(true);
        }
      } else {
        const q = inputValue.toLowerCase();
        let exactMatches = internalData.filter(item => 
          Object.values(item).some(val => 
            String(val).toLowerCase() === q
          )
        );
        if (filterItem) exactMatches = exactMatches.filter(filterItem);

        if (exactMatches.length === 1) {
          handleSelectItem(exactMatches[0]);
          setShowGlobalSearch(false);
        } else {
          let matched = internalData.filter(item => 
            Object.values(item).some(val => 
              String(val).toLowerCase().includes(q)
            )
          );
          if (filterItem) matched = matched.filter(filterItem);

          if (matched.length === 1) {
            handleSelectItem(matched[0]);
            setShowGlobalSearch(false);
          } else {
            setIsOpen(true);
            setShowGlobalSearch(true);
          }
        }
      }
    } else if (e.key === 'ArrowDown') {
      if (e.altKey) {
        setIsOpen(true);
      }
    } else if (onKeyDown) {
      onKeyDown(e as any);
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (dropdownRef.current && dropdownRef.current.contains(e.relatedTarget as Node)) {
      return;
    }
    const trimmed = inputValue.trim();
    if (!trimmed) {
      if (value !== null && value !== undefined && value !== '') {
        if (onChange) onChange(null, null);
      }
      return;
    }

    const rawList = [...(internalData || []), ...(Array.isArray(data) ? data : []), ...(Array.isArray(options) ? options : [])];
    const sourceList = rawList.filter((item, index, self) => 
      item && self.findIndex(i => i === item || (i && item && (i.id || i.ID || i.ItemAccountCategoryID) && (i.id || i.ID || i.ItemAccountCategoryID) === (item.id || item.ID || item.ItemAccountCategoryID))) === index
    );
    const q = trimmed.toLowerCase();

    let matched = sourceList.find((item: any) => {
      if (!item) return false;
      const dispVal = getResolvedValue(item, displayKey as string);
      const valKeyVal = valueKey ? getResolvedValue(item, valueKey) : undefined;
      const itemCodeVal = item.ItemAccountCategoryCode ?? item.code ?? item.Code;
      const itemVal = item.id ?? item.ID ?? item.MeasurementUnitID ?? item.ItemAccountCategoryID ?? Object.values(item)[0];
      return (
        (dispVal !== undefined && String(dispVal).trim().toLowerCase() === q) ||
        (valKeyVal !== undefined && String(valKeyVal).trim().toLowerCase() === q) ||
        (itemCodeVal !== undefined && String(itemCodeVal).trim().toLowerCase() === q) ||
        (itemVal !== undefined && String(itemVal).trim().toLowerCase() === q)
      );
    });

    if (!matched && !isNaN(Number(trimmed))) {
      matched = sourceList.find((item: any) => {
        if (!item) return false;
        const codeVal = item.ItemAccountCategoryCode ?? item.code ?? item.Code;
        const idVal = item.ItemAccountCategoryID ?? item.id ?? item.ID;
        return (codeVal !== undefined && Number(codeVal) === Number(trimmed)) ||
               (idVal !== undefined && Number(idVal) === Number(trimmed));
      });
    }

    if (filterItem && matched && !filterItem(matched)) {
      matched = undefined;
    }

    if (matched) {
      handleSelectItem(matched);
    } else if (!isNaN(Number(trimmed)) && Number(trimmed) > 0) {
      if (onChange) onChange(null, Number(trimmed));
    } else if (value !== null && value !== undefined && value !== '') {
      const currentResolved = sourceList.find((item: any) => {
        if (valueKey && getResolvedValue(item, valueKey) !== undefined) {
          return String(getResolvedValue(item, valueKey)) === String(value);
        }
        const itemVal = item.id ?? item.ID ?? item.MeasurementUnitID ?? item.ItemAccountCategoryID ?? Object.values(item)[0];
        return itemVal !== undefined && String(itemVal) === String(value);
      });
      if (currentResolved) {
        let valStr = '';
        if (renderSelection) {
          const rendered = renderSelection(currentResolved);
          valStr = typeof rendered === 'string' ? rendered : String(getResolvedValue(currentResolved, displayKey as string) || '');
        } else {
          valStr = String(getResolvedValue(currentResolved, displayKey as string) || '');
        }
        setInputValue(valStr);
      }
    }
  };

  const content = (
      <div className={cn("relative w-full", className)} ref={containerRef}>
        {trigger ? (
          <div className={cn("w-full h-full", disabled && "opacity-60 cursor-not-allowed pointer-events-none")}>
            {trigger(
              () => { if (!disabled) setIsOpen(!isOpen); },
              isOpen,
              searchQuery,
              (q: string) => { if (!disabled) { setSearchQuery(q); if(!isOpen && q) setIsOpen(true); } }
            )}
          </div>
        ) : (
          <div className="flex w-full h-[25px]">
            <input
              type="text"
              id={id}
              value={inputValue}
              onFocus={() => {
                if (listApiUrl && !hasFetched) {
                  fetchPage(1, true);
                }
              }}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (isOpen) {
                  setSearchQuery(e.target.value);
                }
              }}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              placeholder={finalPlaceholder}
              className={cn(
                "flex-1 px-2 h-[25px] w-full text-[11px] bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 focus:border-indigo-500 transition-all outline-none text-slate-900 dark:text-slate-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 font-medium disabled:opacity-80 disabled:cursor-not-allowed",
                "rounded-s",
                error ? "border-rose-500 ring-rose-500/20 ring-1" : (isOpen && "border-indigo-500 ring-1 ring-indigo-50/50 dark:ring-indigo-900/40")
              )}
              disabled={disabled}
              autoComplete="off"
            />
            <div 
              className={cn(
                "w-[26px] h-[25px] flex items-center justify-center transition-colors flex-shrink-0 rounded-e border text-white",
                disabled ? "bg-slate-600 border-slate-700 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 border-blue-600 cursor-pointer"
              )}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation(); 
                if (!disabled) {
                  setIsOpen(!isOpen);
                }
              }}
              title="بازکردن جستجو"
            >
              <Plus strokeWidth={3} className="w-2.5 h-2.5 drop-shadow-sm" />
            </div>
          </div>
        )}

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: placement === 'bottom' ? 10 : -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: placement === 'bottom' ? 10 : -10 }}
              className={cn(
                "fixed z-[99999] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl flex flex-col pointer-events-auto"
              )}
              style={{ 
                width: lockedWidth,
                minWidth: Math.min(500, typeof window !== 'undefined' ? window.innerWidth - 20 : 500),
                maxWidth: 'calc(100vw - 20px)',
                maxHeight: panelHeight,
                height: panelHeight,
                top: dropdownPos.top,
                left: alignment === 'left' ? dropdownPos.left : undefined,
                right: alignment === 'right' ? dropdownPos.right : undefined,
              }}
              ref={dropdownRef}
            >
            {/* Resize Handles */}
            <div 
              className="absolute top-0 w-full h-1 cursor-ns-resize z-50 opacity-0"
              onMouseDown={(e) => startPanelResizing('top', e)}
            />
            <div 
              className="absolute bottom-0 w-full h-1.5 cursor-ns-resize z-50 opacity-0 hover:bg-indigo-500/50 transition-all"
              onMouseDown={(e) => startPanelResizing('bottom', e)}
            />
            <div 
              className={cn("absolute top-0 bottom-0 w-1.5 cursor-ew-resize z-50 opacity-0 hover:bg-indigo-500/50 transition-all", dir === 'rtl' ? "left-0" : "right-0")}
              onMouseDown={(e) => startPanelResizing('side', e)}
            />
            <div 
              className={cn("absolute bottom-0 w-3 h-3 cursor-nwse-resize z-50 opacity-0 hover:bg-indigo-500/50 transition-all", dir === 'rtl' ? "left-0" : "right-0")}
              onMouseDown={(e) => startPanelResizing('bottom-side', e)}
            />
            
            {showGlobalSearch && (
              <div className="p-3 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 rounded-t-xl">
                <div className="relative">
                  <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400", dir === 'rtl' ? "right-3" : "left-3")} />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={dir === 'rtl' ? "جستجو..." : "Search..."}
                    className={cn(
                      "w-full py-1.5 text-[11px] bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-1 focus:ring-indigo-500 transition-all",
                      dir === 'rtl' ? "pr-9 pl-4" : "pl-9 pr-4"
                    )}
                  />
                </div>
              </div>
            )}

            <div 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className={cn("overflow-auto flex-1 min-h-[100px]", !showGlobalSearch && "rounded-t-xl")}
            >
              <table className="border-collapse table-fixed w-full" style={{ minWidth: totalContentWidth }}>
                <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800">
                  <tr>
                    {isMultiSelectionEnabled && (
                      <th className="w-10 border border-slate-200 dark:border-slate-700 text-center">
                        <input
                          type="checkbox"
                          checked={sortedData.length > 0 && selectedRows.size === sortedData.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRows(new Set(sortedData));
                            } else {
                              setSelectedRows(new Set());
                            }
                          }}
                          className="cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </th>
                    )}
                    {visibleColumns.map((col, idx) => (
                      <th 
                        key={col.key}
                        draggable={!isResizing}
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDragEnd={handleDragEnd}
                        className={cn(
                          "relative px-2 py-[5px] border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider select-none",
                          dir === 'rtl' ? "text-right" : "text-left",
                          draggedIndex === idx && "opacity-50"
                        )}
                        style={{ width: parseColWidth(col.width), cursor: isResizing ? 'col-resize' : 'grab' }}
                        onClick={() => handleSort(col.key)}
                      >
                        <div className="flex items-center gap-1">
                          <GripVertical size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <span>{col.label}</span>
                        </div>
                        <div
                          className={cn(
                            "absolute top-0 bottom-0 w-1 cursor-col-resize hover:bg-indigo-500/50 z-10",
                            dir === 'rtl' ? "left-0" : "right-0"
                          )}
                          onMouseDown={(e) => handleResizeStart(e, idx)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </th>
                    ))}
                  </tr>
                  
                  {showColumnFilters && (
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                      {isMultiSelectionEnabled && <th className="border border-slate-200 dark:border-slate-700 w-10 text-center" />}
                      {visibleColumns.map((col) => (
                        <th key={`filter-${col.key}`} className="p-1 px-2 border border-slate-200 dark:border-slate-700 font-normal relative">
                          {!col.hideFilter && (
                            <div className="relative flex items-center filter-menu-container">
                              <input
                                type="text"
                                value={(columnFilters && col?.key ? columnFilters[col.key]?.value : '') || ''}
                                onChange={(e) => handleColumnFilterChange(col.key, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className={cn(
                                  "w-full h-[24px] text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-indigo-500",
                                  dir === 'rtl' ? "pr-6 pl-2 text-right" : "pl-6 pr-2 text-left"
                                )}
                                placeholder={'فیلتر...'}
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveFilterMenu(activeFilterMenu === col.key ? null : col.key);
                                }}
                                className={cn(
                                  "absolute p-1 rounded transition-colors",
                                  dir === 'rtl' ? "right-1" : "left-1",
                                  activeFilterMenu === col.key ? "text-indigo-600" : "text-slate-400 hover:text-indigo-500"
                                )}
                              >
                                <Filter size={12} />
                              </button>
                              
                              {activeFilterMenu === col.key && (
                                <div className={cn(
                                  "absolute top-full mt-1 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-[120]",
                                  dir === 'rtl' ? "right-0" : "left-0"
                                )}>
                                  {filterTypes.map(type => (
                                    <button
                                      key={type.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleColumnFilterChange(col.key, (columnFilters && col?.key ? columnFilters[col.key]?.value : '') || '', type.id);
                                      }}
                                      className={cn(
                                        "w-full px-3 py-1.5 text-[11px] hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between",
                                        dir === 'rtl' ? "text-right" : "text-left"
                                      )}
                                    >
                                      <span>{type.label}</span>
                                      {((columnFilters && col?.key ? columnFilters[col.key]?.type : 'contains') || 'contains') === type.id && <Check size={12} className="text-indigo-500" />}
                                    </button>
                                  ))}
                                  <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleColumnFilterChange(col.key, '', 'contains');
                                    }}
                                    className={cn(
                                      "w-full px-3 py-1.5 text-[11px] hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center justify-between",
                                      dir === 'rtl' ? "text-right" : "text-left"
                                    )}
                                  >
                                    <span>{'حذف'}</span>
                                    <Eraser size={12} />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  )}
                </thead>
                <tbody>
                  {listApiUrl && isLoadingApi && internalData.length === 0 ? (
                    <tr>
                      <td colSpan={visibleColumns.length + (isMultiSelectionEnabled ? 1 : 0)} className="h-32 text-center text-slate-500">
                        <div className="flex items-center justify-center gap-2">
                          <RotateCcw className="animate-spin w-4 h-4 text-indigo-500" />
                          <span>{dir === 'rtl' ? 'در حال بارگذاری...' : 'Loading...'}</span>
                        </div>
                      </td>
                    </tr>
                  ) : sortedData.length === 0 ? (
                    <tr>
                      <td colSpan={visibleColumns.length + (isMultiSelectionEnabled ? 1 : 0)} className="h-24 text-center text-slate-500 text-sm">
                        {notFoundMessage || (dir === 'rtl' ? 'اطلاعاتی یافت نشد' : 'No information found.')}
                      </td>
                    </tr>
                  ) : (
                    sortedData.slice(0, listApiUrl ? sortedData.length : visibleCount).map((item, idx) => (
                      <tr 
                        key={idx}
                        id={`mcdd-row-${idx}`}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectItem(item)}
                        className={cn(
                          "cursor-pointer transition-colors border-b border-slate-200 dark:border-slate-700",
                          idx === activeIndex ? "bg-indigo-100/70 dark:bg-indigo-950/50 border-y-indigo-300" : (value === item ? "bg-indigo-50 dark:bg-indigo-900/20" : "hover:bg-slate-50 dark:hover:bg-slate-800/50")
                        )}
                      >
                        {isMultiSelectionEnabled && (
                          <td className="w-10 px-2 py-[3px] border border-slate-200 dark:border-slate-700 text-center" onClick={(e) => {
                            e.stopPropagation();
                            const newSelection = new Set(selectedRows);
                            if (selectedRows.has(item)) {
                              newSelection.delete(item);
                            } else {
                              newSelection.add(item);
                            }
                            setSelectedRows(newSelection);
                          }}>
                            <input 
                              type="checkbox" 
                              checked={selectedRows.has(item)}
                              onChange={() => {}}
                              className="cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </td>
                        )}
                        {visibleColumns.map(col => {
                          const colKey = col?.key || '';
                          const colLabel = col?.label || (col as any)?.title || '';
                          const isDateCol = colKey.toLowerCase().includes('date') || colLabel.includes('تاریخ');
                          const rawValue = colKey.includes('.') ? colKey.split('.').reduce((obj: any, k: string) => (obj || {})[k], item) : (item && colKey ? item[colKey] : undefined);
                          // Task 62/64: ارقام مقدار نمایشی به زبان انتخاب‌شده تبدیل می‌شود
                          const displayValue = isDateCol && rawValue
                            ? localizeNumericString(formatDateByLocale(String(rawValue), language), language)
                            : localizeNumericString(String(rawValue ?? ''), language);

                          return (
                            <td key={col.key} className={cn("px-2 py-[3px] text-[11px] text-slate-600 dark:text-slate-300 truncate border border-slate-200 dark:border-slate-700", dir === 'rtl' ? "text-right" : "text-left")}>
                              {(() => {
                                if (col.renderItem) return col.renderItem(item);
                                const rendered = (col as any).render ? (col as any).render(rawValue, item) : displayValue;
                                // خروجی رشته‌ای/عددی رندرهای اختصاصی هم بومی‌سازی می‌شود (مثل تاریخ شمسی)
                                return typeof rendered === 'string' || typeof rendered === 'number'
                                  ? localizeNumericString(String(rendered), language)
                                  : rendered;
                              })()}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                  {((!listApiUrl && visibleCount < sortedData.length) || (listApiUrl && isLoadingApi && internalData.length > 0)) && (
                    <tr>
                      <td colSpan={visibleColumns.length + (isMultiSelectionEnabled ? 1 : 0)} className="p-3 text-center">
                        <div className="max-w-[200px] h-8 mx-auto bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse" />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-1.5 px-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 rounded-b-xl flex items-center gap-1 shrink-0 overflow-visible flex-wrap [&_button]:!p-0.5 [&_button]:!h-6 [&_button]:!w-6 [&_button_svg]:!w-[13px] [&_button_svg]:!h-[13px]">
              <ActionButton 
                onClick={handleReset} 
                icon={RotateCcw}
                variant="outline"
                hideLabel
                tooltip={dir === 'rtl' ? 'بروزرسانی لیست' : 'Refresh list'}
                tooltipPosition="top"
                className={cn(
                  (isLoadingApi || isRefreshingData) && 'animate-pulse opacity-70 pointer-events-none'
                )}
              />
              <ActionButton 
                onClick={() => setShowColumnFilters(!showColumnFilters)}
                icon={Filter}
                variant="outline"
                hideLabel
                tooltip={dir === 'rtl' ? 'فیلتر ستون‌ها' : 'Column Filters'}
                tooltipPosition="top"
                className={showColumnFilters ? "text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/40" : ""}
              />


              <PdfExportButton onClick={handlePdfExport} hideLabel />
              <ExcelExportButton onClick={handleExcelExport} hideLabel />
              <WordExportButton onClick={handleWordExport} hideLabel />

              {onViewAll && (
                <ActionButton 
                  onClick={() => {
                    setIsOpen(false);
                    onViewAll();
                  }}
                  icon={ExternalLink}
                  variant="outline"
                  hideLabel
                  tooltip={dir === 'rtl' ? 'مشاهده فهرست کامل' : 'View Full List'}
                  tooltipPosition="top"
                  className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                />
              )}
              
              <ActionButton 
                onClick={() => setShowGlobalSearch(!showGlobalSearch)}
                icon={Search}
                variant="outline"
                hideLabel
                tooltip={dir === 'rtl' ? 'جستجو' : 'Search'}
                tooltipPosition="top"
                className={showGlobalSearch ? "text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/40 bg-indigo-50 dark:bg-indigo-950/40" : ""}
              />

              {isMultiSelectionEnabled && selectedRows.size > 0 && enableDelete && (
                <DeleteButton onClick={() => onDeleteRows?.(Array.from(selectedRows))} hideLabel />
              )}
              {isMultiSelectionEnabled && selectedRows.size === 1 && enableEdit && (
                <EditButton onClick={() => onEdit?.(Array.from(selectedRows)[0])} hideLabel />
              )}
              {isMultiSelectionEnabled && selectedRows.size > 0 && enableEdit && (
                <EditButton onClick={() => onEditRows?.(Array.from(selectedRows))} hideLabel />
              )}

              <div className="relative inline-block">
                <MultiColumnDropdownNewButton 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    const optionsList = getInferredAddFormOption(listApiUrl, addFormOptions, columns);

                    if (optionsList.length > 1) {
                      setShowAddMenu(prev => !prev);
                    } else if (optionsList.length === 1) {
                      const opt = optionsList[0];
                      setIsOpen(false);
                      setShowAddMenu(false);
                      if (opt.componentName) {
                        addTab(opt.title, opt.groupId || 'main', opt.icon, opt.componentName, opt.props);
                      }
                      if (onAdd) onAdd();
                    } else if (onAdd) {
                      setIsOpen(false);
                      setShowAddMenu(false);
                      onAdd();
                    }
                  }} 
                  hideLabel 
                />

                {(() => {
                  const optionsList = getInferredAddFormOption(listApiUrl, addFormOptions, columns);
                  if (!showAddMenu || optionsList.length <= 1) return null;
                  return (
                    <div 
                      className={cn(
                        "absolute bottom-full mb-2 z-[200] min-w-[200px] bg-slate-800 dark:bg-slate-900 text-slate-100 rounded-lg shadow-2xl border border-slate-700 py-1.5 px-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100",
                        dir === 'rtl' ? "right-0" : "left-0"
                      )}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 border-b border-slate-700/60 mb-1 flex items-center justify-between">
                        <span>{dir === 'rtl' ? 'ایجاد مورد جدید' : 'Create New'}</span>
                      </div>
                      {optionsList.map((opt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            setShowAddMenu(false);
                            if (opt.componentName) {
                              addTab(opt.title, opt.groupId || 'main', opt.icon, opt.componentName, opt.props);
                            }
                            if (onAdd) onAdd();
                          }}
                          className="w-full px-2.5 py-1.5 text-xs text-slate-200 hover:bg-indigo-600 hover:text-white rounded-md flex items-center gap-2 transition-colors text-right whitespace-nowrap group cursor-pointer"
                        >
                          {opt.icon ? (
                            <span className="w-4 h-4 text-indigo-400 group-hover:text-white flex items-center justify-center shrink-0">{opt.icon}</span>
                          ) : (
                            <Plus size={14} className="text-indigo-400 group-hover:text-white shrink-0" />
                          )}
                          <span className="font-medium">{opt.title}</span>
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </div>

              <div className="flex-1" />
              <span className="text-xs text-slate-400 font-medium">
                {sortedData.length} مورد
              </span>
            </div>
            {isOpen && isLoadingApi && (
              <LoadingOverlay visible={true} message={dir === 'rtl' ? 'در حال بارگذاری اطلاعات...' : 'Loading data...'} />
            )}
          </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
      </div>
  );

  if (noWrapper) return content;

  return (
    <FormFieldWrapper label={label} required={required} error={error} labelWidth={labelWidth} alignVertical={alignVertical}>
      {content}
    </FormFieldWrapper>
  );
});