'use client';
import { clsx } from "clsx";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import moment from 'moment-jalaali';
import { apiFetch, formatDateByLocale } from '@/lib/utils';
import { 
  BarChart, 
  Calendar, 
  Filter, 
  Clock, 
  Loader2, 
  CheckCircle, 
  Search, 
  RefreshCw, 
  ChevronLeft, 
  AlertCircle,
  FileText,
  Printer,
  ChevronDown,
  LayoutList,
  Settings2
} from 'lucide-react';
import { useLanguage } from '@/components/Providers';
import { useToast } from '@/components/ToastProvider';
import { useTabs } from '@/components/TabsProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { ActionButton } from '@/components/buttons/ActionButton';
import { ExcelExportButton } from '@/components/MainDataGridButtons/ExcelExportButton';
import { PdfExportButton } from '@/components/MainDataGridButtons/PdfExportButton';
import { WordExportButton } from '@/components/MainDataGridButtons/WordExportButton';
import { HelpButton } from '@/components/buttons/HelpButton';
import { FullscreenButton } from '@/components/buttons/FullscreenButton';
import { CloseButton } from '@/components/buttons/CloseButton';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';

type SidebarItem = {
  id: string;
  code: string;
  name: string;
};

type FilterOperator =
  | "contains"
  | "notContains"
  | "startsWith"
  | "endsWith"
  | "equals"
  | "notEquals"
  | "empty"
  | "notEmpty";

interface AdvancedFilterValue {
  value: string;
  op: FilterOperator;
}

const filterOptions: { val: FilterOperator; label: string }[] = [
  { val: "contains", label: "شامل" },
  { val: "notContains", label: "شامل نشود" },
  { val: "startsWith", label: "شروع با" },
  { val: "endsWith", label: "پایان با" },
  { val: "equals", label: "برابر با" },
  { val: "notEquals", label: "نابرابر با" },
  { val: "empty", label: "خالی باشد" },
  { val: "notEmpty", label: "خالی نباشد" },
];

type ReportRow = {
  id: string;
  code: string;
  title: string;
  debit: number;
  credit: number;
  balance: number;
  balanceType: string;
};

type HorizontalConfig = Record<string, boolean>;

export function AccountReview() {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const { addTab } = useTabs();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; row: any } | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // dismiss context menu when clicking outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Date controls
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [fiscalYearTitle, setFiscalYearTitle] = useState('');

  // Column Filters
  const [showColumnFilters, setShowColumnFilters] = useState(false);
  const [columnFilters, setColumnFilters] = useState<Record<string, AdvancedFilterValue>>({
    code: { op: 'contains', value: '' },
    title: { op: 'contains', value: '' },
    debit: { op: 'contains', value: '' },
    credit: { op: 'contains', value: '' },
    balance: { op: 'contains', value: '' },
    balanceType: { op: 'contains', value: '' }
  });

  // New States for "محدوده اسناد" (Doc Scope)
  const [hasYearFilter, setHasYearFilter] = useState(true);
  const [fromYear, setFromYear] = useState('');
  const [toYear, setToYear] = useState('');
  const [fiscalYears, setFiscalYears] = useState<any[]>([]);

  const [hasMonthFilter, setHasMonthFilter] = useState(false);
  const [fromMonth, setFromMonth] = useState('فروردین');
  const [toMonth, setToMonth] = useState('اسفند');

  const [hasDateFilter, setHasDateFilter] = useState(true);
  const [fromCustomDate, setFromCustomDate] = useState('۱۴۰۳/۰۱/۰۱');
  const [toCustomDate, setToCustomDate] = useState('۱۴۰۳/۱۲/۲۹');

  const [hasVoucherFilter, setHasVoucherFilter] = useState(false);
  const [fromVoucher, setFromVoucher] = useState('dd-2');
  const [toVoucher, setToVoucher] = useState('dd-1248');

  // Included documents checklist
  const [includedDocs, setIncludedDocs] = useState({
    all: true,
    opening: false,
    closing: false,
    natureAdjustment: false,
    profitAndLoss: false,
    other: false
  });

  // Voucher status custom checklist
  const [voucherStatus, setVoucherStatus] = useState({
    all: true,
    temporary: false,
    underReview: false,
    checked: false,
    permanent: false
  });

  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  const handleIncludedDocsChange = (key: keyof typeof includedDocs) => {
    setIncludedDocs(prev => {
      if (key === 'all') {
        const newVal = !prev.all;
        return {
          all: newVal,
          opening: false,
          closing: false,
          natureAdjustment: false,
          profitAndLoss: false,
          other: false
        };
      } else {
        const updated = { ...prev, [key]: !prev[key] };
        const hasAnySpecific = updated.opening || updated.closing || updated.natureAdjustment || updated.profitAndLoss || updated.other;
        updated.all = !hasAnySpecific;
        return updated;
      }
    });
  };

  const handleVoucherStatusChange = (key: keyof typeof voucherStatus) => {
    setVoucherStatus(prev => {
      if (key === 'all') {
        const newVal = !prev.all;
        return {
          all: newVal,
          temporary: false,
          underReview: false,
          checked: false,
          permanent: false
        };
      } else {
        const updated = { ...prev, [key]: !prev[key] };
        const hasAnySpecific = updated.temporary || updated.underReview || updated.checked || updated.permanent;
        updated.all = !hasAnySpecific;
        return updated;
      }
    });
  };

  // Sidebar controls
  const [detailedLevelsCount, setDetailedLevelsCount] = useState<number>(10);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState<boolean>(false);
  const [verticalType, setVerticalType] = useState<string>('group');
  const [rootVerticalType, setRootVerticalType] = useState<string>('group');
  const [verticalValue, setVerticalValue] = useState<string>('all');

  // Horizontal selections
  const [horizontalType, setHorizontalType] = useState<string>('group');
  const [horizontalConfig, setHorizontalConfig] = useState<HorizontalConfig>({
    group: true,
    total: false,
    specific: false,
    detailed_1: false,
    detailed_2: false,
    detailed_3: false,
    currency: false,
    tracking: false,
  });

  const [viewMode, setViewMode] = useState<'report' | 'history'>('report');
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [historyTitle, setHistoryTitle] = useState<string>('');
  const [drillDownPath, setDrillDownPath] = useState<{type: string, id: string, title: string}[]>([]);

  // Report Grid data
  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [detailedTypes, setDetailedTypes] = useState<any[]>([]);

  // Row selection states
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [highlightedRowIds, setHighlightedRowIds] = useState<Record<string, boolean>>({});
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [shiftAnchorIndex, setShiftAnchorIndex] = useState<number | null>(null);

  // Auto-init dates according to active fiscal year in footer/localStorage
  useEffect(() => {
    apiFetch('/api/accounting/detailed-types')
      .then(res => res.json())
      .then(data => {
        setDetailedTypes(Array.isArray(data) ? data : (data.data || []));
      })
      .catch(err => console.error('Error fetching detailed types', err));

    apiFetch(`/api/common/base-settings/tab/2`)
      .then(res => res.json())
      .then(resData => {
        if (resData?.data) {
          if (resData.data.detailedLevelsCount !== undefined) {
            setDetailedLevelsCount(parseInt(resData.data.detailedLevelsCount, 10));
          } else {
            setDetailedLevelsCount(10);
          }
        }
      })
      .catch(err => console.error('Error fetching settings', err))
      .finally(() => setIsSettingsLoaded(true));

    const loadFiscalYear = () => {
      const activeFyId = localStorage.getItem('app-fiscal-year');
      
      apiFetch('/api/common/fiscalyear')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setFiscalYears(data);
            const matched = activeFyId 
              ? data.find((fy: any) => String(fy.fiscalYearID || fy.id) === String(activeFyId))
              : (data.find((fy: any) => fy.isActive) || data[0]);

            if (matched) {
              setFiscalYearTitle(matched.title);
              // Ensure dates are parsed to string formatted YYYY-MM-DD
              const start = matched.startDate ? (typeof matched.startDate === 'string' ? matched.startDate.split('T')[0] : '') : '';
              const end = matched.endDate ? (typeof matched.endDate === 'string' ? matched.endDate.split('T')[0] : '') : '';
              setFromDate(start);
              setToDate(end);

              const matchedId = String(matched.fiscalYearID || matched.id);
              setFromYear(matchedId);
              setToYear(matchedId);

              // Generate localized start date string
              if (matched.startDate) {
                const startIso = typeof matched.startDate === 'string' ? matched.startDate.split('T')[0] : new Date(matched.startDate).toISOString().split('T')[0];
                const mStart = moment(startIso, 'YYYY-MM-DD');
                if (mStart.isValid()) {
                  const jalaliStart = mStart.format('jYYYY/jMM/jDD');
                  const localizedStart = jalaliStart.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d, 10)]);
                  setFromCustomDate(localizedStart);
                }
              } else if (matched.title) {
                const persianYear = String(matched.title).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d, 10)]);
                setFromCustomDate(`${persianYear}/۰۱/۰۱`);
              }

              apiFetch(`/api/accounting/vouchers/last-date?fiscalYearId=${matchedId}`)
                .then(res => res.json())
                .then(data => {
                  if (data && data.lastDate) {
                    const persianDate = String(data.lastDate).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d, 10)]);
                    setToCustomDate(persianDate);
                  }
                })
                .catch(err => console.error('Error fetching last voucher date', err));
            }
          }
        })
        .catch(err => {
          console.error('Error fetching fiscal year dates', err);
        });
    };

    loadFiscalYear();

    const handleStorageChange = () => {
      loadFiscalYear();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const fetchHistoryData = () => {
    let selectedId = '';
    if (selectedRows.size === 1) {
      selectedId = Array.from(selectedRows)[0];
    } else {
      const highlights = Object.keys(highlightedRowIds);
      if (highlights.length === 1) {
        selectedId = highlights[0];
      }
    }

    if (!selectedId) return;

    const selectedRow = reportData.find(r => r.id === selectedId);
    if (selectedRow) {
      setHistoryTitle(selectedRow.title);
    } else {
      setHistoryTitle('');
    }

    setIsReportLoading(true);

    const params = new URLSearchParams({
      fromDate,
      toDate,
      verticalType,
      verticalValue,
      horizontalType,
      fromVoucher: hasVoucherFilter ? fromVoucher : '',
      toVoucher: hasVoucherFilter ? toVoucher : '',
      includedDocs: JSON.stringify(includedDocs),
      voucherStatus: JSON.stringify(voucherStatus),
      hasYearFilter: String(hasYearFilter),
      fromYear,
      toYear,
      hasMonthFilter: String(hasMonthFilter),
      fromMonth,
      toMonth,
      hasDateFilter: String(hasDateFilter),
      fromCustomDate,
      toCustomDate,
      selectedId
    });

    apiFetch(`/api/accounting/account-review/history?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setHistoryData(data.reportData || []);
          setViewMode('history');
        } else {
          showToast(data.message || 'خطا در بارگیری گردش حساب', 'error');
        }
      })
      .catch(err => {
        console.error(err);
        showToast('خطا در ارتباط با سرور', 'error');
      })
      .finally(() => setIsReportLoading(false));
  };

  // Load report data live (AJAX on filter modification)
  const fetchReportData = () => {
    setIsReportLoading(true);
    
    const params = new URLSearchParams({
      fromDate,
      toDate,
      verticalType,
      verticalValue,
      horizontalType,
      fromVoucher: hasVoucherFilter ? fromVoucher : '',
      toVoucher: hasVoucherFilter ? toVoucher : '',
      includedDocs: JSON.stringify(includedDocs),
      voucherStatus: JSON.stringify(voucherStatus),
      hasYearFilter: String(hasYearFilter),
      fromYear,
      toYear,
      hasMonthFilter: String(hasMonthFilter),
      fromMonth,
      toMonth,
      hasDateFilter: String(hasDateFilter),
      fromCustomDate,
      toCustomDate
    });

    apiFetch(`/api/accounting/account-review/report-data?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setReportData(data.reportData || []);
          if (data.horizontalConfig) {
            setHorizontalConfig(data.horizontalConfig);
          }
        } else {
          showToast(data.message || 'خطا در بارگیری داده‌های گزارش', 'error');
        }
      })
      .catch(err => {
        console.error('Error fetching report details', err);
        showToast('خطا در تولید اطلاعات گزارش', 'error');
      })
      .finally(() => {
        setIsReportLoading(false);
      });
  };

  // Trigger loading when dates, vertical selection, or horizontal category changes
  useEffect(() => {
    fetchReportData();
  }, [
    verticalType,
    verticalValue, 
    horizontalType, 
    fromDate, 
    toDate,
    hasYearFilter,
    fromYear,
    toYear,
    hasMonthFilter,
    fromMonth,
    toMonth,
    hasDateFilter,
    fromCustomDate,
    toCustomDate,
    hasVoucherFilter,
    fromVoucher,
    toVoucher,
    includedDocs,
    voucherStatus
  ]);

  // Handle Radio Button change
  const handleVerticalTypeChange = (type: string) => {
    setVerticalType(type);
    setRootVerticalType(type);
    setVerticalValue('all');
    setHorizontalType(type);

    setDrillDownPath([]);
    setViewMode('report');
  };

  // Click row to highlight and activate horizontal menu
  const handleRowClick = (e: React.MouseEvent, index: number, row: ReportRow) => {
    e.stopPropagation();
    if (verticalValue === row.id && verticalType === horizontalType) {
      // Optional: uncomment below if we want to toggle click
      // setVerticalValue('all');
    } else {
      setDrillDownPath(prev => {
        let newPath = [...prev];
        const existingIndex = newPath.findIndex(p => p.type === horizontalType);
        if (existingIndex !== -1) {
          newPath = newPath.slice(0, existingIndex);
        }
        newPath.push({ type: horizontalType, id: row.id, title: row.title });
        return newPath;
      });

      setVerticalType(horizontalType);
      setVerticalValue(row.id);
    }
    setHighlightedRowIds({ [row.id]: true });
    setLastSelectedIndex(index);
    setShiftAnchorIndex(index);
  };

  // Double click row to toggle selection
  const handleRowDoubleClick = (e: React.MouseEvent, index: number, row: ReportRow) => {
    e.preventDefault();
    const newSelection = new Set(selectedRows);
    if (e.shiftKey && lastSelectedIndex !== null) {
      const anchor = shiftAnchorIndex !== null ? shiftAnchorIndex : lastSelectedIndex;
      const start = Math.min(anchor, index);
      const end = Math.max(anchor, index);
      
      const newItems = new Set(selectedRows);
      for (let i = start; i <= end; i++) {
         if (filteredReportData[i]) newItems.add(filteredReportData[i].id);
      }
      setSelectedRows(newItems);
    } else {
      if (newSelection.has(row.id)) {
        newSelection.delete(row.id);
      } else {
        newSelection.add(row.id);
      }
      setSelectedRows(newSelection);
    }
    setLastSelectedIndex(index);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newSelection = new Set(selectedRows);
      Object.keys(highlightedRowIds).forEach(id => {
        newSelection.add(id);
      });
      setSelectedRows(newSelection);
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredReportData.length === 0) return;

      if (lastSelectedIndex === null) {
        setLastSelectedIndex(0);
        setShiftAnchorIndex(0);
        setHighlightedRowIds({ [filteredReportData[0].id]: true });
        setVerticalValue(filteredReportData[0].id);
        setVerticalType(horizontalType);
        return;
      }

      const nextIndex = e.key === 'ArrowDown' 
        ? Math.min(lastSelectedIndex + 1, filteredReportData.length - 1)
        : Math.max(lastSelectedIndex - 1, 0);

      if (nextIndex === lastSelectedIndex) return;

      if (e.shiftKey) {
        const anchor = shiftAnchorIndex !== null ? shiftAnchorIndex : lastSelectedIndex;
        if (shiftAnchorIndex === null) setShiftAnchorIndex(anchor);
        
        const newHighlights: Record<string, boolean> = { ...highlightedRowIds };
        
        const start = Math.min(anchor, nextIndex);
        const end = Math.max(anchor, nextIndex);
        
        const oldStart = Math.min(anchor, lastSelectedIndex);
        const oldEnd = Math.max(anchor, lastSelectedIndex);
        
        for (let i = oldStart; i <= oldEnd; i++) {
           if (filteredReportData[i]) delete newHighlights[filteredReportData[i].id];
        }
        
        for (let i = start; i <= end; i++) {
           if (filteredReportData[i]) newHighlights[filteredReportData[i].id] = true;
        }

        setHighlightedRowIds(newHighlights);
        setVerticalValue(filteredReportData[nextIndex].id);
        setVerticalType(horizontalType);
        setLastSelectedIndex(nextIndex);
      } else {
        setShiftAnchorIndex(nextIndex);
        setHighlightedRowIds({ [filteredReportData[nextIndex].id]: true });
        setVerticalValue(filteredReportData[nextIndex].id);
        setVerticalType(horizontalType);
        setLastSelectedIndex(nextIndex);
      }
    }
  };

  const checkFilter = (rowVal: string | number | undefined, filter?: AdvancedFilterValue) => {
    if (!filter) return true;
    if (filter.op === 'empty') return !rowVal;
    if (filter.op === 'notEmpty') return !!rowVal;
    if (!filter.value) return true;
    
    const sVal = String(rowVal ?? '').toLowerCase();
    const fVal = filter.value.toLowerCase();
    switch (filter.op) {
      case 'contains': return sVal.includes(fVal);
      case 'notContains': return !sVal.includes(fVal);
      case 'startsWith': return sVal.startsWith(fVal);
      case 'endsWith': return sVal.endsWith(fVal);
      case 'equals': return sVal === fVal;
      case 'notEquals': return sVal !== fVal;
      default: return true;
    }
  };

  // Filtered report grid rows
  const filteredReportData = reportData.filter((row: ReportRow) => {
    if (!checkFilter(row.code, columnFilters.code)) return false;
    if (!checkFilter(row.title, columnFilters.title)) return false;
    if (!checkFilter(row.debit, columnFilters.debit)) return false;
    if (!checkFilter(row.credit, columnFilters.credit)) return false;
    if (!checkFilter(row.balance, columnFilters.balance)) return false;
    if (!checkFilter(row.balanceType, columnFilters.balanceType)) return false;
    return true;
  });

  // Calculate totals for All
  let allDebitSum = 0;
  let allCreditSum = 0;

  filteredReportData.forEach(r => {
    allDebitSum += r.debit;
    allCreditSum += r.credit;
  });
  
  const allBalanceDiff = allDebitSum - allCreditSum;
  const allBalanceType = allBalanceDiff > 0 ? 'بدهکار' : allBalanceDiff < 0 ? 'بستانکار' : 'بی‌حساب';

  const allTotals = {
    debit: allDebitSum,
    credit: allCreditSum,
    balance: Math.abs(allBalanceDiff),
    balanceType: allBalanceType,
  };

  // Calculate totals for Selected
  let selDebitSum = 0;
  let selCreditSum = 0;

  const baseData = filteredReportData.filter(r => selectedRows.has(r.id));
  
  baseData.forEach(r => {
    selDebitSum += r.debit;
    selCreditSum += r.credit;
  });
  
  const selBalanceDiff = selDebitSum - selCreditSum;
  const selBalanceType = baseData.length === 0 ? 'بی‌حساب' : selBalanceDiff > 0 ? 'بدهکار' : selBalanceDiff < 0 ? 'بستانکار' : 'بی‌حساب';

  const selectedTotals = {
    debit: selDebitSum,
    credit: selCreditSum,
    balance: Math.abs(selBalanceDiff),
    balanceType: selBalanceType,
  };

  let historyDebitSum = 0;
  let historyCreditSum = 0;
  historyData?.forEach(r => {
    historyDebitSum += (r.debit || 0);
    historyCreditSum += (r.credit || 0);
  });

  const getReviewOptions = () => {
    let list = [
      { value: 'group', label: 'گروه' },
      { value: 'total', label: 'کل' },
      { value: 'specific', label: 'معین' },
    ];

    if (detailedTypes && detailedTypes.length > 0) {
      detailedTypes.forEach(dt => {
        list.push({
          value: `detailedType_${dt.detailedTypesId || dt.id}`,
          label: dt.title,
        });
      });
    } else {
      for (let i = 1; i <= detailedLevelsCount; i++) {
        list.push({
          value: `detailed_${i}`,
          label: `تفصیلی ${String(i).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d, 10)])}`,
        });
      }
    }

    list.push({ value: 'tracking', label: 'پیگیری' });
    list.push({ value: 'currency', label: 'ارز' });

    // Filter out the currently selected root vertical type so it doesn't appear in the horizontal tabs
    list = list.filter(opt => opt.value !== rootVerticalType);

    return list;
  };

  const getVerticalReviewOptions = () => {
    const list = [
      { value: 'group', label: 'گروه' },
      { value: 'total', label: 'کل' },
      { value: 'specific', label: 'معین' },
    ];

    for (let i = 1; i <= detailedLevelsCount; i++) {
      list.push({
        value: `detailed_${i}`,
        label: `تفصیلی ${String(i).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d, 10)])}`,
      });
    }

    list.push({ value: 'tracking', label: 'پیگیری' });
    list.push({ value: 'currency', label: 'ارز' });

    return list;
  };

  // Translation helpers for vertical levels
  const getVerticalLabel = (type: string) => {
    if (type && type.startsWith('detailedType_')) {
      const typeId = type.split('_')[1];
      const found = detailedTypes.find(dt => String(dt.detailedTypesId || dt.id) === String(typeId));
      return found ? found.title : 'تفصیلی';
    }
    if (type && type.startsWith('detailed_')) {
      const num = type.split('_')[1];
      return `تفصیلی سطح ${String(num).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d, 10)])}`;
    }
    switch (type) {
      case 'group': return 'گروه حساب';
      case 'total': return 'حساب کل';
      case 'specific': return 'حساب معین';
      case 'currency': return 'ارز';
      case 'tracking': return 'شماره پیگیری';
      default: return 'ناشناس';
    }
  };

  const getHorizontalLabel = (type: string) => {
    if (type && type.startsWith('detailedType_')) {
      const typeId = type.split('_')[1];
      const found = detailedTypes.find(dt => String(dt.detailedTypesId || dt.id) === String(typeId));
      return found ? found.title : 'تفصیلی';
    }
    if (type && type.startsWith('detailed_')) {
      const num = type.split('_')[1];
      return `تفصیلی سطح ${String(num).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d, 10)])}`;
    }
    switch (type) {
      case 'group': return 'کلان گروه';
      case 'total': return 'حساب‌های کل';
      case 'specific': return 'حساب‌های معین';
      case 'currency': return 'گردش ارزی';
      case 'tracking': return 'کدهای پیگیری';
      default: return 'تفصیلی‌ها';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = (type: 'pdf' | 'excel' | 'word') => {
    const isHistory = viewMode === 'history';
    const dataToExport = isHistory ? historyData : filteredReportData;

    if (!dataToExport || dataToExport.length === 0) {
      showToast('داده‌ای برای خروجی وجود ندارد', 'error');
      return;
    }
    
    // Common data mapping for all exports
    const exportData = isHistory 
      ? dataToExport.map((r: any) => ({
          'تاریخ سند': r.issueDate,
          'ش.سند': r.voucherNumber,
          'ش.عطف': r.dailyNumber,
          'کد حساب': r.accountCode,
          'عنوان حساب': r.accountTitle,
          'شرح آرتیکل': r.description,
          'بدهکار': r.debit || 0,
          'بستانکار': r.credit || 0,
          'مانده': r.runningBalance || 0,
          'تشخیص': r.runningBalanceType || ''
        }))
      : dataToExport.map((r: any) => ({
          'کد تفصیلی/حساب': r.code,
          'عنوان سرفصل': r.title,
          'بدهکار': r.debit,
          'بستانکار': r.credit,
          'مانده': r.balance,
          'تشخیص': r.balanceType
        }));

    if (type === 'excel') {
      import('xlsx').then(XLSX => {
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "گزارش");
        XLSX.writeFile(wb, "AccountReview.xlsx");
      });
    } else if (type === 'word') {
       const headers = Object.keys(exportData[0] || {});
       const rows = exportData.map(r => Object.values(r));
       
       const htmlContent = `
         <htm` + `l xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
         <head><meta charset="utf-8"></head><body dir="rtl">
         <h2>گزارش مرور حساب‌ها</h2>
         <table border="1" style="border-collapse: collapse; width: 100%;">
           <thead>
             <tr>${headers.map(h => `<th style="padding: 8px; background-color: #f2f2f2;">${String(h).replace(new RegExp('<', 'g'), "&lt;")}</th>`).join("")}</tr>
           </thead>
           <tbody>
             ${rows.map(r => "<tr>" + r.map(cell => `<td style="padding: 8px;">${String(cell).replace(new RegExp('<', 'g'), "&lt;")}</td>`).join("") + "</tr>").join("")}
           </tbody>
         </table>
         </body></htm` + `l>
       `;

       const blob = new Blob(["\uFEFF" + htmlContent], {
         type: "application/msword",
       });
       const url = URL.createObjectURL(blob);
       const link = document.createElement("a");
       link.setAttribute("href", url);
       link.setAttribute(
         "download",
         `AccountReview_${new Date().toISOString().split("T")[0]}.doc`
       );
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
    } else if (type === 'pdf') {
       import('html2pdf.js').then((html2pdf) => {
         const headers = Object.keys(exportData[0] || {});
         const rows = exportData.map(r => Object.values(r));
         const el = document.createElement('div');
         el.innerHTML = `
           <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 20px;">
             <h2 style="text-align: center; margin-bottom: 20px;">گزارش مرور حساب‌ها</h2>
             <table border="1" style="border-collapse: collapse; width: 100%; border: 1px solid #ddd; font-size: 12px;">
               <thead>
                 <tr style="background-color: #f5f5f5;">
                   ${headers.map(h => `<th style="padding: 8px; border: 1px solid #ddd;">${String(h).replace(new RegExp('<', 'g'), "&lt;")}</th>`).join("")}
                 </tr>
               </thead>
               <tbody>
                 ${rows.map(r => `<tr>${r.map(cell => `<td style="padding: 8px; border: 1px solid #ddd;">${String(cell).replace(new RegExp('<', 'g'), "&lt;")}</td>`).join("")}</tr>`).join("")}
               </tbody>
             </table>
           </div>
         `;
         html2pdf.default().from(el).set({
           margin: 10,
           filename: `AccountReview_${new Date().toISOString().split("T")[0]}.pdf`,
           image: { type: 'jpeg', quality: 0.98 },
           html2canvas: { scale: 2 },
           jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
         }).save();
       });
    }
  };

  const [colWidths, setColWidths] = useState<Record<string, number>>({});
  
  const handleResizeStart = (e: React.MouseEvent, colId: string) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = (e.currentTarget.parentElement as HTMLElement).offsetWidth;
    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = startX - moveEvent.clientX; // RTL support: dragging left increases width
      setColWidths(prev => ({ ...prev, [colId]: Math.max(50, startWidth + delta) }));
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const renderFilterInput = (key: string, width?: number | string) => {
    const currentOp = columnFilters[key]?.op || 'contains';
    const currentValue = columnFilters[key]?.value || '';
    return (
      <th className="p-1 px-2 border-x border-gray-200 dark:border-gray-800" style={{ width }}>
        <div className="relative flex items-center w-full group/filter">
          <div className="absolute z-10 flex items-center justify-center w-5 h-5 right-1">
            <select
              value={currentOp}
              onChange={(e) => setColumnFilters(f => ({ ...f, [key]: { ...f[key], op: e.target.value as FilterOperator } }))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title="شرط فیلتر"
            >
              {filterOptions.map((opt) => (
                <option key={opt.val} value={opt.val}>{opt.label}</option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 pointer-events-none group-hover/filter:text-emerald-500" />
          </div>
          <input
            type="text"
            value={currentValue}
            onChange={(e) => setColumnFilters(f => ({ ...f, [key]: { ...f[key], value: e.target.value } }))}
            disabled={currentOp === "empty" || currentOp === "notEmpty"}
            placeholder={`${filterOptions.find(o => o.val === currentOp)?.label}...`}
            className="w-full text-xs py-1.5 pr-7 pl-2 border rounded bg-white dark:bg-gray-950 dark:border-gray-800 focus:ring-1 focus:ring-emerald-500 outline-none disabled:bg-gray-100 disabled:dark:bg-gray-800 disabled:cursor-not-allowed"
          />
        </div>
      </th>
    );
  };

  const handleOpenVoucher = (row: any) => {
    if (row?.voucherId) {
      addTab(`ویرایش سند ${row.voucherNumber}`, 'accounting', null, 'Voucher', { id: row.voucherId });
    } else {
      showToast('شناسه سند یافت نشد', 'error');
    }
  };

  const handleContextMenu = (e: React.MouseEvent, row: any) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, row });
  };

  const handleContextMenuAction = (action: string, row: any) => {
    setContextMenu(null);
    if (action === 'view') {
      handleOpenVoucher(row);
    } else if (action === 'print') {
      showToast('فرآیند چاپ سند با موفقیت آغاز شد...', 'info');
      // logic
    } else if (action === 'delete') {
      showToast('حذف سند پیش از بررسی‌های نهایی مجاز نمی‌باشد', 'error');
    }
  };

  if (!isSettingsLoaded) {
    return <LoadingOverlay visible={true} message="در حال بارگزاری تنظیمات حسابداری..." />;
  }

  return (
    <div ref={formRef} className="flex flex-col h-full w-full bg-white dark:bg-gray-900 overflow-x-hidden relative rounded-lg border border-gray-200 dark:border-gray-800 shadow-md">
      
      {/* Title Header with Emerald Gradient */}
      <div className="relative flex flex-col flex-shrink-0 w-full m-0 border-b border-x-0 border-b-emerald-600 dark:border-b-emerald-500 rounded-none z-30">
        <div className="w-full bg-emerald-600 dark:bg-emerald-500 px-4 py-2 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center opacity-90">
              <BarChart className="h-4 w-4 opacity-90 animate-pulse" />
            </div>
            <h3 className="text-[13px] font-medium">گزارش مرور حساب‌ها (ترازشویی لایو)</h3>
            {fiscalYearTitle && (
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-mono font-medium">
                دوره: {fiscalYearTitle}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <HelpButton hideLabel variant="ghost" className="text-white hover:text-white/80 hover:bg-transparent dark:hover:bg-transparent p-1 shadow-none" />
            <FullscreenButton targetRef={formRef} hideLabel variant="ghost" className="text-white hover:text-white/80 hover:bg-transparent dark:hover:bg-transparent p-1 shadow-none" />
            <CloseButton hideLabel variant="ghost" className="text-white hover:text-white/80 hover:bg-transparent dark:hover:bg-transparent p-1 shadow-none" />
          </div>
        </div>
        {/* New Rich ERP Filter Toolbar bar (Collapsible Document Range and Inclusions) */}
        <div className="w-full bg-slate-50 dark:bg-slate-900 px-4 py-1.5 pb-2 flex flex-col border-b border-gray-250 dark:border-gray-800 select-none">
          {/* Header row containing aligned titles for all three columns */}
          <div className="flex flex-col md:flex-row gap-3.5 text-right items-center w-full">
            
            {/* Right Header - Document Scope (Boxes 1-4) with Collapse/Expand Action button */}
            <div className="w-full md:w-[60%] flex-shrink-0 flex items-center justify-between">
              <button 
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                type="button"
                className="flex items-center gap-1.5 text-xs font-bold text-slate-750 dark:text-slate-300 hover:text-emerald-600 transition"
              >
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-205/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold font-mono">
                  {isFiltersOpen ? '−' : '+'}
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block pr-1">محدوده اسناد :</span>
              </button>

              <div className="flex items-center gap-3">
              </div>
            </div>

            {/* Middle Header - Inclusions (Box 5) */}
            <div className="w-full md:w-[20%] flex-shrink-0">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 pr-1 block">شامل اسناد :</span>
            </div>

            {/* Left Header - Status (Box 6) */}
            <div className="w-full md:w-[20%] flex-shrink-0">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 pr-1 block">وضعیت سند :</span>
            </div>
          </div>

          <AnimatePresence initial={true}>
            {isFiltersOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mt-1"
              >
                <div className="flex flex-col md:flex-row gap-3.5 pb-1 text-[11px] text-slate-700 dark:text-slate-300 w-full">
                  
                  {/* Collapsible/Group of Document parameters (Box 1, 2, 3, 4) - Takes 60% of total width */}
                  <div className="w-full md:w-[60%] flex-shrink-0 grid grid-cols-1 md:grid-cols-4 gap-3">
                    
                    {/* Box 1: فیلتر سال (Year Selector) */}
                    <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900/50 p-2 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium font-sans">سال</span>
                        <label className="flex items-center gap-1.5 cursor-pointer font-bold select-none">
                          <span className="text-[10px] text-slate-600 dark:text-slate-300">فیلتر شود</span>
                          <input 
                            type="checkbox"
                            checked={hasYearFilter}
                            onChange={(e) => setHasYearFilter(e.target.checked)}
                            className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 dark:bg-slate-800 border-slate-350"
                          />
                        </label>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] text-slate-450 w-11 text-right shrink-0">از سال :</span>
                          <select 
                            disabled={!hasYearFilter}
                            value={fromYear}
                            onChange={(e) => setFromYear(e.target.value)}
                            className="flex-1 text-[10px] py-0.5 px-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none focus:border-blue-500 disabled:opacity-40 font-bold font-sans"
                          >
                            {fiscalYears.length > 0 ? (
                              fiscalYears.map((fy: any) => (
                                <option key={fy.fiscalYearID || fy.id} value={String(fy.fiscalYearID || fy.id)}>
                                  {fy.title}
                                </option>
                              ))
                            ) : (
                              <option value="">در حال بارگیری...</option>
                            )}
                          </select>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] text-slate-450 w-11 text-right shrink-0">تا سال :</span>
                          <select 
                            disabled={!hasYearFilter}
                            value={toYear}
                            onChange={(e) => setToYear(e.target.value)}
                            className="flex-1 text-[10px] py-0.5 px-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none focus:border-blue-500 disabled:opacity-40 font-bold font-sans"
                          >
                            {fiscalYears.length > 0 ? (
                              fiscalYears.map((fy: any) => (
                                <option key={fy.fiscalYearID || fy.id} value={String(fy.fiscalYearID || fy.id)}>
                                  {fy.title}
                                </option>
                              ))
                            ) : (
                              <option value="">در حال بارگیری...</option>
                            )}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Box 2: فیلتر ماه (Month Selector) */}
                    <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900/50 p-2 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium font-sans">ماه</span>
                        <label className="flex items-center gap-1.5 cursor-pointer font-bold select-none">
                          <span className="text-[10px] text-slate-600 dark:text-slate-300">فیلتر شود</span>
                          <input 
                            type="checkbox"
                            checked={hasMonthFilter}
                            onChange={(e) => setHasMonthFilter(e.target.checked)}
                            className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 dark:bg-slate-800 border-slate-355"
                          />
                        </label>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] text-slate-450 w-11 text-right shrink-0">از ماه :</span>
                          <select 
                            disabled={!hasMonthFilter}
                            value={fromMonth}
                            onChange={(e) => setFromMonth(e.target.value)}
                            className="flex-1 text-[10px] py-0.5 px-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none focus:border-blue-500 disabled:opacity-40 font-bold font-sans"
                          >
                            <option value="فروردین">فروردین</option>
                            <option value="اردیبهشت">اردیبهشت</option>
                            <option value="خرداد">خرداد</option>
                            <option value="تیر">تیر</option>
                            <option value="مرداد">مرداد</option>
                            <option value="شهریور">شهریور</option>
                            <option value="مهر">مهر</option>
                            <option value="آبان">آبان</option>
                            <option value="آذر">آذر</option>
                            <option value="دی">دی</option>
                            <option value="بهمن">بهمن</option>
                            <option value="اسفند">اسفند</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] text-slate-450 w-11 text-right shrink-0">تا ماه :</span>
                          <select 
                            disabled={!hasMonthFilter}
                            value={toMonth}
                            onChange={(e) => setToMonth(e.target.value)}
                            className="flex-1 text-[10px] py-0.5 px-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none focus:border-blue-500 disabled:opacity-40 font-bold font-sans"
                          >
                            <option value="فروردین">فروردین</option>
                            <option value="اردیبهشت">اردیبهشت</option>
                            <option value="خرداد">خرداد</option>
                            <option value="تیر">تیر</option>
                            <option value="مرداد">مرداد</option>
                            <option value="شهریور">شهریور</option>
                            <option value="مهر">مهر</option>
                            <option value="آبان">آبان</option>
                            <option value="آذر">آذر</option>
                            <option value="دی">دی</option>
                            <option value="بهمن">بهمن</option>
                            <option value="اسفند">اسفند</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Box 3: فیلتر تاریخ (Date Selector) */}
                    <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900/50 p-2 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">تاریخ</span>
                        <label className="flex items-center gap-1.5 cursor-pointer font-bold select-none">
                          <span className="text-[10px] text-slate-600 dark:text-slate-300">فیلتر شود</span>
                          <input 
                            type="checkbox"
                            checked={hasDateFilter}
                            onChange={(e) => setHasDateFilter(e.target.checked)}
                            className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 dark:bg-slate-800 border-slate-355"
                          />
                        </label>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] text-slate-450 w-11 text-right shrink-0">از تاریخ :</span>
                          <input 
                            type="text"
                            disabled={!hasDateFilter}
                            value={fromCustomDate}
                            onChange={(e) => setFromCustomDate(e.target.value)}
                            dir="ltr"
                            className="w-full min-w-0 flex-1 text-[10px] font-bold text-center py-0.5 px-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none focus:border-blue-500 disabled:opacity-40 font-mono"
                          />
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] text-slate-450 w-11 text-right shrink-0">تا تاریخ :</span>
                          <input 
                            type="text"
                            disabled={!hasDateFilter}
                            value={toCustomDate}
                            onChange={(e) => setToCustomDate(e.target.value)}
                            dir="ltr"
                            className="w-full min-w-0 flex-1 text-[10px] font-bold text-center py-0.5 px-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none focus:border-blue-500 disabled:opacity-40 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Box 4: فیلتر سند (Voucher Selector) */}
                    <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900/50 p-2 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">سند</span>
                        <label className="flex items-center gap-1.5 cursor-pointer font-bold select-none">
                          <span className="text-[10px] text-slate-600 dark:text-slate-300">فیلتر شود</span>
                          <input 
                            type="checkbox"
                            checked={hasVoucherFilter}
                            onChange={(e) => setHasVoucherFilter(e.target.checked)}
                            className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 dark:bg-slate-800 border-slate-355"
                          />
                        </label>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] text-slate-450 w-11 text-right shrink-0">از سند :</span>
                          <input 
                            type="text"
                            disabled={!hasVoucherFilter}
                            value={fromVoucher}
                            onChange={(e) => setFromVoucher(e.target.value)}
                            dir="ltr"
                            className="w-full min-w-0 flex-1 text-[10px] font-bold text-center py-0.5 px-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none focus:border-blue-500 disabled:opacity-40 font-mono"
                          />
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] text-slate-450 w-11 text-right shrink-0">تا سند :</span>
                          <input 
                            type="text"
                            disabled={!hasVoucherFilter}
                            value={toVoucher}
                            onChange={(e) => setToVoucher(e.target.value)}
                            dir="ltr"
                            className="w-full min-w-0 flex-1 text-[10px] font-bold text-center py-0.5 px-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none focus:border-blue-500 disabled:opacity-40 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Box 5: شامل اسناد (Inclusions Checklist) - Takes 20% of width on desktop */}
                  <div className="w-full md:w-[20%] flex-shrink-0">
                    <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900/50 p-2 h-full flex flex-col justify-start">
                      <div className="grid grid-cols-2 gap-x-2.5 gap-y-1">
                        <label className="flex items-center justify-start gap-1 cursor-pointer text-[10px] font-semibold select-none leading-none py-0.5">
                          <input 
                            type="checkbox"
                            checked={includedDocs.all}
                            onChange={() => handleIncludedDocsChange('all')}
                            className="w-3.5 h-3.5 text-blue-600 rounded bg-slate-100 dark:bg-slate-850 border-slate-300"
                          />
                          <span className="text-slate-800 dark:text-slate-200">کل اسناد</span>
                        </label>
                        <label className="flex items-center justify-start gap-1 cursor-pointer text-[10px] font-semibold select-none leading-none py-0.5">
                          <input 
                            type="checkbox"
                            checked={includedDocs.natureAdjustment}
                            onChange={() => handleIncludedDocsChange('natureAdjustment')}
                            className="w-3.5 h-3.5 text-blue-600 rounded bg-slate-100 dark:bg-slate-850 border-slate-300"
                          />
                          <span className="text-slate-850 dark:text-slate-350">تعدیل ماهیت</span>
                        </label>
                        <label className="flex items-center justify-start gap-1 cursor-pointer text-[10px] font-semibold select-none leading-none py-0.5">
                          <input 
                            type="checkbox"
                            checked={includedDocs.opening}
                            onChange={() => handleIncludedDocsChange('opening')}
                            className="w-3.5 h-3.5 text-blue-600 rounded bg-slate-100 dark:bg-slate-850 border-slate-300"
                          />
                          <span className="text-slate-850 dark:text-slate-350">افتتاحیه</span>
                        </label>
                        <label className="flex items-center justify-start gap-1 cursor-pointer text-[10px] font-semibold select-none leading-none py-0.5">
                          <input 
                            type="checkbox"
                            checked={includedDocs.closing}
                            onChange={() => handleIncludedDocsChange('closing')}
                            className="w-3.5 h-3.5 text-blue-600 rounded bg-slate-100 dark:bg-slate-850 border-slate-300"
                          />
                          <span className="text-slate-850 dark:text-slate-350">اختتامیه</span>
                        </label>
                        <label className="flex items-center justify-start gap-1 cursor-pointer text-[10px] font-semibold select-none leading-none py-0.5">
                          <input 
                            type="checkbox"
                            checked={includedDocs.profitAndLoss}
                            onChange={() => handleIncludedDocsChange('profitAndLoss')}
                            className="w-3.5 h-3.5 text-blue-600 rounded bg-slate-100 dark:bg-slate-850 border-slate-300"
                          />
                          <span className="text-slate-850 dark:text-slate-350">سود و زیانی</span>
                        </label>
                        <label className="flex items-center justify-start gap-1 cursor-pointer text-[10px] font-semibold select-none leading-none py-0.5">
                          <input 
                            type="checkbox"
                            checked={includedDocs.other}
                            onChange={() => handleIncludedDocsChange('other')}
                            className="w-3.5 h-3.5 text-blue-600 rounded bg-slate-100 dark:bg-slate-850 border-slate-300"
                          />
                          <span className="text-slate-850 dark:text-slate-350">سایر اسناد</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Box 6: وضعیت سند (Voucher Status Checklist) - Takes 20% of width on desktop */}
                  <div className="w-full md:w-[20%] flex-shrink-0">
                    <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900/50 p-2 h-full flex flex-col justify-start">
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                        <label className="flex items-center justify-start gap-1 cursor-pointer text-[10px] font-semibold select-none leading-none py-0.5">
                          <input 
                            type="checkbox"
                            checked={voucherStatus.all}
                            onChange={() => handleVoucherStatusChange('all')}
                            className="w-3.5 h-3.5 text-blue-600 rounded bg-slate-100 dark:bg-slate-850 border-slate-300"
                          />
                          <span className="text-slate-850 dark:text-slate-205">کل اسناد</span>
                        </label>
                        <label className="flex items-center justify-start gap-1 cursor-pointer text-[10px] font-semibold select-none leading-none py-0.5">
                          <input 
                            type="checkbox"
                            checked={voucherStatus.temporary}
                            onChange={() => handleVoucherStatusChange('temporary')}
                            className="w-3.5 h-3.5 text-blue-600 rounded bg-slate-100 dark:bg-slate-850 border-slate-300"
                          />
                          <span className="text-slate-850 dark:text-slate-350">موقت</span>
                        </label>
                        <label className="flex items-center justify-start gap-1 cursor-pointer text-[10px] font-semibold select-none leading-none py-0.5">
                          <input 
                            type="checkbox"
                            checked={voucherStatus.underReview}
                            onChange={() => handleVoucherStatusChange('underReview')}
                            className="w-3.5 h-3.5 text-blue-600 rounded bg-slate-100 dark:bg-slate-850 border-slate-300"
                          />
                          <span className="text-slate-850 dark:text-slate-350">در دست بررسی</span>
                        </label>
                        <label className="flex items-center justify-start gap-1 cursor-pointer text-[10px] font-semibold select-none leading-none py-0.5">
                          <input 
                            type="checkbox"
                            checked={voucherStatus.checked}
                            onChange={() => handleVoucherStatusChange('checked')}
                            className="w-3.5 h-3.5 text-blue-600 rounded bg-slate-100 dark:bg-slate-850 border-slate-300"
                          />
                          <span className="text-slate-850 dark:text-slate-350 font-sans">بررسی شده</span>
                        </label>
                        <label className="flex items-center justify-start gap-1 cursor-pointer text-[10px] font-semibold select-none leading-none py-0.5">
                          <input 
                            type="checkbox"
                            checked={voucherStatus.permanent}
                            onChange={() => handleVoucherStatusChange('permanent')}
                            className="w-3.5 h-3.5 text-blue-600 rounded bg-slate-100 dark:bg-slate-850 border-slate-300"
                          />
                          <span className="text-slate-850 dark:text-slate-350 font-sans">دائم</span>
                        </label>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Split Body content */}
      <div className="flex flex-1 flex-row h-full min-h-0 w-full overflow-hidden bg-slate-50/30 dark:bg-gray-950/25">
        
        {/* Left/Right RTL Column: Vertical Selector Sidebar list */}
        <div className="w-[180px] border-e border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/50 flex flex-col flex-shrink-0 min-h-0 p-2.5 px-3">
           <div className="text-[12px] font-bold text-slate-800 dark:text-slate-200 mb-3 pb-2 border-b border-gray-100 dark:border-gray-800">
             مرور از طریق :
           </div>
           <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-0.5">
              {getVerticalReviewOptions().map(opt => (
                <label key={opt.value} className="flex items-center justify-between cursor-pointer group px-1">
                  <span className="text-[10px] text-slate-700 dark:text-slate-300 font-medium group-hover:text-blue-600 transition-colors">
                    {opt.label}
                  </span>
                  <input
                    type="radio"
                    name="reviewBy"
                    value={opt.value}
                    checked={rootVerticalType === opt.value}
                    onChange={(e) => {
                      handleVerticalTypeChange(e.target.value);
                    }}
                    className="w-3.5 h-3.5 text-blue-500 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                  />
                </label>
              ))}
           </div>
        </div>

        {/* Right Columns: Horizontal Toolbar Level and Table Grid */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          
          <div className="flex-1 flex flex-col overflow-hidden">
             {viewMode === 'report' ? (
               <>
              {/* Horizontal Tabs: Group, Total, Subsidiary, Detailed, etc. */}
              <div className="flex flex-shrink-0 items-center border-b border-gray-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900 px-3 overflow-x-auto relative w-full">
                
                <div className="flex flex-wrap gap-2 py-2.5 rtl:space-x-reverse w-full flex-1">
                  {getReviewOptions().map(opt => {
                    const type = opt.value;
                    const isEnabled = (horizontalConfig[type] ?? false) && verticalValue !== 'all' && verticalType !== type;
                    const isSelected = isEnabled && horizontalType === type;

                    return (
                      <button
                        key={type}
                        disabled={!isEnabled}
                        onClick={() => setHorizontalType(type)}
                        type="button"
                        className={clsx(
                          "px-3.5 py-1.5 rounded-md text-xs font-semibold select-none flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer border",
                          isSelected
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-[0_2px_8px_rgba(16,185,129,0.3)]"
                            : isEnabled
                              ? "bg-white text-slate-700 border-gray-200 hover:bg-slate-50 dark:bg-gray-800 dark:text-slate-300 dark:border-gray-700 dark:hover:bg-gray-750"
                              : "bg-gray-100/60 text-gray-300 dark:bg-gray-900/40 dark:text-gray-700 border-gray-100 dark:border-gray-800/80 cursor-not-allowed opacity-50"
                        )}
                        title={
                          !isEnabled 
                            ? `آیتم انتخاب شده با این بعد افقی گردش و تراکنش مشترکی در بازه زمانی انتخابی ندارد`
                            : ''
                        }
                      >
                        {opt.label}
                        {/* Dot indicator if active */}
                        {isEnabled && !isSelected && (
                          <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Summary Totals area */}
              <div className="px-4 py-2 bg-white dark:bg-gray-900 flex justify-between items-center text-[11px] font-bold select-text">
                <div className="flex flex-col justify-center gap-1.5">
                  <div className="flex items-center gap-6 justify-start">
                     <div className="text-red-500 dark:text-red-500 w-36 text-left">جمع اقلام انتخاب شده :</div>
                     <div className="flex items-center gap-8 text-slate-800 dark:text-white">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500 dark:text-gray-300">بدهکار:</span>
                          <span className="font-mono">{selectedTotals.debit.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500 dark:text-gray-300">بستانکار:</span>
                          <span className="font-mono">{selectedTotals.credit.toLocaleString()}</span>
                        </div>
                        <div className="text-gray-300 dark:text-gray-600">|</div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500 dark:text-gray-300">اختلاف مانده تراز:</span>
                          <span className={clsx("font-mono mr-1", selectedTotals.balanceType === 'بدهکار' ? 'text-emerald-600 dark:text-emerald-400' : selectedTotals.balanceType === 'بستانکار' ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400')}>
                            {selectedTotals.balance.toLocaleString()}
                          </span>
                          {selectedTotals.balanceType !== 'بی‌حساب' && (
                            <span className={clsx(
                               "px-2 py-0.5 rounded text-[10px] mr-1",
                               selectedTotals.balanceType === 'بدهکار' ? 'bg-blue-600/90 text-white' : 'bg-amber-600/90 text-white'
                            )}>
                              {selectedTotals.balanceType}
                            </span>
                          )}
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-6 justify-start">
                     <div className="text-red-500 dark:text-red-500 w-36 text-left">سرجمع کل :</div>
                     <div className="flex items-center gap-8 text-slate-800 dark:text-white">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500 dark:text-gray-300">بدهکار:</span>
                          <span className="font-mono">{allTotals.debit.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500 dark:text-gray-300">بستانکار:</span>
                          <span className="font-mono">{allTotals.credit.toLocaleString()}</span>
                        </div>
                        <div className="text-gray-300 dark:text-gray-600">|</div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500 dark:text-gray-300">اختلاف مانده تراز:</span>
                          <span className={clsx("font-mono mr-1", allTotals.balanceType === 'بدهکار' ? 'text-emerald-600 dark:text-emerald-400' : allTotals.balanceType === 'بستانکار' ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400')}>
                            {allTotals.balance.toLocaleString()}
                          </span>
                          {allTotals.balanceType !== 'بی‌حساب' && (
                            <span className={clsx(
                               "px-2 py-0.5 rounded text-[10px] mr-1",
                               allTotals.balanceType === 'بدهکار' ? 'bg-blue-600/90 text-white' : 'bg-amber-600/90 text-white'
                            )}>
                              {allTotals.balanceType}
                            </span>
                          )}
                        </div>
                     </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ActionButton
                    icon={RefreshCw}
                    onClick={fetchHistoryData}
                    disabled={!(selectedRows.size === 1 || Object.keys(highlightedRowIds).length === 1)}
                    variant="primary"
                    hideLabel={false}
                    className={clsx(
                      "!w-auto px-4 py-2 rounded-md shadow-sm border text-[12px] font-bold shrink-0",
                      (selectedRows.size === 1 || Object.keys(highlightedRowIds).length === 1)
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700"
                        : "bg-gray-200 text-gray-400 border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-600"
                    )}
                  >
                    گردش حساب
                  </ActionButton>
                </div>
              </div>

              {/* Report Interactive Grid body */}
              <div 
                className="flex-1 overflow-auto relative bg-white dark:bg-gray-950 focus:outline-none"
                tabIndex={0}
                onKeyDown={handleKeyDown}
              >
                <LoadingOverlay visible={isReportLoading} message="در حال دریافت اطلاعات..." />

                {filteredReportData.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-white dark:bg-transparent">
                    <FileText className="h-10 w-10 text-gray-200 dark:text-gray-800 mb-2" />
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">هیچ گردشی در فرآیند تراشویی این دوره ثبت نشده است</span>
                    <span className="text-[11px] text-gray-400 mt-1">تراکنشی با خصوصیات انتخابی سازگاری ندارد</span>
                  </div>
                ) : (
                  <div className="min-w-[800px] text-xs font-medium">
                    <table className="min-w-full w-max text-right border-collapse select-text border border-gray-200 dark:border-gray-800 table-fixed">
                        <thead className="bg-gray-200 dark:bg-gray-800 text-slate-800 dark:text-slate-100 sticky top-0 border-b border-gray-300 dark:border-gray-700 z-10 font-bold">
                        <tr>
                          <th style={{ width: colWidths['code'] || 140 }} className="py-3 px-4 border-b border-x text-right border-gray-200 dark:border-gray-800 relative select-none">
                            کد تفصیلی/حساب
                            <div onMouseDown={(e) => handleResizeStart(e, 'code')} className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-emerald-500 active:bg-emerald-600 z-20"></div>
                          </th>
                          <th style={{ width: colWidths['title'] || 'auto' }} className="py-3 px-4 border-b border-x text-right border-gray-200 dark:border-gray-800 relative select-none">
                            عنوان سرفصل
                            <div onMouseDown={(e) => handleResizeStart(e, 'title')} className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-emerald-500 active:bg-emerald-600 z-20"></div>
                          </th>
                          <th style={{ width: colWidths['debit'] || 160 }} className="py-3 px-4 border-b border-x text-right border-gray-200 dark:border-gray-800 relative select-none">
                            جمع بدهکار (ریال)
                            <div onMouseDown={(e) => handleResizeStart(e, 'debit')} className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-emerald-500 active:bg-emerald-600 z-20"></div>
                          </th>
                          <th style={{ width: colWidths['credit'] || 160 }} className="py-3 px-4 border-b border-x text-right border-gray-200 dark:border-gray-800 relative select-none">
                            جمع بستانکار (ریال)
                            <div onMouseDown={(e) => handleResizeStart(e, 'credit')} className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-emerald-500 active:bg-emerald-600 z-20"></div>
                          </th>
                          <th style={{ width: colWidths['balance'] || 160 }} className="py-3 px-4 border-b border-x text-right border-gray-200 dark:border-gray-800 relative select-none">
                            مانده (ریال)
                            <div onMouseDown={(e) => handleResizeStart(e, 'balance')} className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-emerald-500 active:bg-emerald-600 z-20"></div>
                          </th>
                          <th style={{ width: colWidths['type'] || 120 }} className="py-3 px-4 border-b border-x text-center border-gray-200 dark:border-gray-800 relative select-none">
                            تشخیص
                            <div onMouseDown={(e) => handleResizeStart(e, 'type')} className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-emerald-500 active:bg-emerald-600 z-20"></div>
                          </th>
                        </tr>
                        {showColumnFilters && (
                          <tr className="bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
                            {renderFilterInput('code', colWidths['code'] || 140)}
                            {renderFilterInput('title', colWidths['title'] || 'auto')}
                            {renderFilterInput('debit', colWidths['debit'] || 160)}
                            {renderFilterInput('credit', colWidths['credit'] || 160)}
                            {renderFilterInput('balance', colWidths['balance'] || 160)}
                            {renderFilterInput('balanceType', colWidths['type'] || 120)}
                          </tr>
                        )}
                      </thead>
                      <tbody>
                        {filteredReportData.map((row, idx) => {
                          const isSelected = selectedRows.has(row.id);
                          const isHighlighted = highlightedRowIds[row.id];
                          const isActive = verticalValue === row.id;
                          return (
                            <tr 
                              key={row.id} 
                              onClick={(e) => handleRowClick(e, idx, row)}
                              onDoubleClick={(e) => handleRowDoubleClick(e, idx, row)}
                              className={clsx(
                                "border-b border-gray-200 dark:border-gray-800 transition-all font-semibold cursor-pointer",
                                isSelected 
                                  ? "bg-blue-100 dark:bg-blue-900/60 border-r-4 border-r-blue-500 dark:border-r-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60"
                                  : isActive 
                                    ? "bg-emerald-50/70 dark:bg-emerald-950/35 text-emerald-900 dark:text-emerald-400 font-bold hover:bg-emerald-50/70 dark:hover:bg-emerald-950/35"
                                    : isHighlighted
                                      ? "bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                                      : idx % 2 === 1 
                                        ? "bg-slate-50/20 dark:bg-gray-900/10 hover:bg-slate-50/60 dark:hover:bg-gray-900/40" 
                                        : "hover:bg-slate-50/60 dark:hover:bg-gray-900/40"
                              )}
                            >
                            <td className="py-1.5 px-4 font-mono text-slate-500 font-bold border-x border-gray-200 dark:border-gray-800">{row.code}</td>
                              <td className="py-1.5 px-4 text-slate-800 dark:text-slate-200 border-x border-gray-200 dark:border-gray-800">{row.title}</td>
                              <td className="py-1.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300 border-x border-gray-200 dark:border-gray-800">
                                {row.debit === 0 ? '-' : row.debit.toLocaleString()}
                              </td>
                              <td className="py-1.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300 border-x border-gray-200 dark:border-gray-800">
                                {row.credit === 0 ? '-' : row.credit.toLocaleString()}
                              </td>
                              <td className="py-1.5 px-4 font-mono font-bold text-emerald-800 dark:text-emerald-400 border-x border-gray-200 dark:border-gray-800">
                                {row.balance === 0 ? '۰' : row.balance.toLocaleString()}
                              </td>
                              <td className="py-1.5 px-4 text-center border-x border-gray-200 dark:border-gray-800">
                                <span className={clsx(
                                  "px-2 py-0.5 rounded-full text-[10px] font-bold inline-block border",
                                  row.balanceType === 'بدهکار' 
                                    ? "bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400"
                                    : row.balanceType === 'بستانکار'
                                      ? "bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/25 dark:border-amber-900/20 dark:text-amber-400"
                                      : "bg-gray-50 border-gray-200 text-gray-500 dark:bg-gray-900 dark:border-gray-800"
                                )}>
                                  {row.balanceType}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Summary Footer for report totals */}
              {filteredReportData.length > 0 && (
                <div className="bg-slate-50 dark:bg-gray-900 px-4 py-1 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between gap-4 font-bold sticky bottom-0 text-xs shrink-0 select-text z-10 min-h-[44px]">
                  
                  {/* Right side: Icons */}
                  <div className="flex items-center gap-1 [&_button]:!p-1 [&_button]:!h-7 [&_button]:!w-7 [&_button_svg]:!w-4 [&_button_svg]:!h-4">
                    <ActionButton
                      icon={Filter}
                      onClick={() => setShowColumnFilters(!showColumnFilters)}
                      variant="ghost"
                      hideLabel
                      tooltip="فیلتر"
                      tooltipPosition="top"
                      className={showColumnFilters ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400" : ""}
                    />
                    <ActionButton
                      icon={LayoutList}
                      variant="ghost"
                      hideLabel
                      tooltip="نمایش ستون‌ها"
                      tooltipPosition="top"
                      className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-md ring-2 ring-slate-100 dark:ring-slate-900"
                    />
                    <div className="w-px h-5 bg-gray-300 dark:bg-gray-700 mx-1"></div>
                    <ActionButton
                      icon={Printer}
                      onClick={handlePrint}
                      variant="ghost"
                      hideLabel
                      tooltip="چاپ"
                      tooltipPosition="top"
                      className="shadow-sm bg-white dark:bg-slate-800"
                    />
                    <PdfExportButton onClick={() => handleExport('pdf')} hideLabel tooltipPosition="top" className="shadow-sm bg-white dark:bg-slate-800" />
                    <ExcelExportButton onClick={() => handleExport('excel')} hideLabel tooltipPosition="top" className="shadow-sm bg-white dark:bg-slate-800" />
                    <WordExportButton onClick={() => handleExport('word')} hideLabel tooltipPosition="top" className="shadow-sm bg-white dark:bg-slate-800" />
                    <ActionButton
                      icon={Settings2}
                      variant="ghost"
                      hideLabel
                      tooltip="تنظیمات"
                      tooltipPosition="top"
                      className="shadow-sm bg-white dark:bg-slate-800"
                    />
                  </div>
                  
                  {/* Left side: Row count */}
                  <div className="text-gray-500 flex items-center">
                    مجموع سطرها: <span className="text-slate-800 dark:text-slate-200 font-mono font-bold mr-1">{filteredReportData.length}</span>
                  </div>
                </div>
              )}
               </>
             ) : (
               <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-950">
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                     <ActionButton
                       icon={ChevronLeft}
                       onClick={() => setViewMode('report')}
                       variant="ghost"
                       tooltip="بازگشت به مرور حساب"
                       className="rtl:rotate-180"
                     />
                     <span className="font-bold text-sm text-emerald-700 dark:text-emerald-400">
                       {(() => {
                         const items = [getVerticalLabel(rootVerticalType)];
                         let lastType = rootVerticalType;
                         drillDownPath.forEach(p => {
                           if (p.type !== lastType) {
                             items.push(getVerticalLabel(p.type));
                           }
                           items.push(p.title);
                           lastType = p.type;
                         });
                         
                         if (historyTitle) {
                           if (horizontalType !== lastType) {
                             items.push(getVerticalLabel(horizontalType));
                           }
                           items.push(historyTitle);
                         }

                         if (items.length === 1 && !historyTitle && drillDownPath.length === 0) {
                           return 'ریز گردش حساب / اسناد';
                         }
                         
                         return items.join(' > ');
                       })()}
                     </span>
                     <div className="flex-1"></div>
                     <span className="text-xs text-gray-500">مجموع رکوردها: <span className="font-mono font-bold mr-1">{historyData?.length || 0}</span></span>
                  </div>
                  
                  <div className="flex-1 overflow-auto">
                     <table className="min-w-full w-max text-right border-collapse select-text border-gray-200 dark:border-gray-800 text-[11px] font-medium">
                        <thead className="bg-gray-200 dark:bg-gray-800 text-slate-800 dark:text-slate-100 sticky top-0 border-b border-gray-300 dark:border-gray-700 z-10 font-bold whitespace-nowrap">
                           <tr>
                              <th className="py-2 px-3 border-x border-b border-gray-200 dark:border-gray-800">تاریخ سند</th>
                              <th className="py-2 px-3 border-x border-b border-gray-200 dark:border-gray-800">ش.سند</th>
                              <th className="py-2 px-3 border-x border-b border-gray-200 dark:border-gray-800">ش.عطف</th>
                              <th className="py-2 px-3 border-x border-b border-gray-200 dark:border-gray-800">کد حساب</th>
                              <th className="py-2 px-3 border-x border-b border-gray-200 dark:border-gray-800">عنوان حساب</th>
                              <th className="py-2 px-3 border-x border-b border-gray-200 dark:border-gray-800 min-w-[200px]">شرح آرتیکل</th>
                              <th className="py-2 px-3 border-x border-b border-gray-200 dark:border-gray-800">بدهکار (ریال)</th>
                              <th className="py-2 px-3 border-x border-b border-gray-200 dark:border-gray-800">بستانکار (ریال)</th>
                              <th className="py-2 px-3 border-x border-b border-gray-200 dark:border-gray-800">مانده</th>
                              <th className="py-2 px-3 border-x border-b border-gray-200 dark:border-gray-800">تشخیص</th>
                              <th className="py-2 px-3 border-x border-b border-gray-200 dark:border-gray-800">ارز</th>
                              <th className="py-2 px-3 border-x border-b border-gray-200 dark:border-gray-800">مقدار ارز</th>
                              <th className="py-2 px-3 border-x border-b border-gray-200 dark:border-gray-800">نرخ ارز</th>
                              <th className="py-2 px-3 border-x border-b border-gray-200 dark:border-gray-800">شماره پیگیری</th>
                              <th className="py-2 px-3 border-x border-b border-gray-200 dark:border-gray-800">تاریخ پیگیری</th>
                              <th className="py-2 px-3 border-x border-b border-gray-200 dark:border-gray-800">ثبت کننده</th>
                           </tr>
                        </thead>
                        <tbody>
                           {historyData?.map((row, idx) => (
                              <tr 
                                key={row.id || idx} 
                                className="border-b border-gray-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-900 transition-colors whitespace-nowrap cursor-pointer"
                                onDoubleClick={() => handleOpenVoucher(row)}
                                onContextMenu={(e) => handleContextMenu(e, row)}
                              >
                                 <td className="py-1.5 px-3 border-x border-gray-200 dark:border-gray-800 font-mono">{formatDateByLocale(row.issueDate, language || 'fa')}</td>
                                 <td className="py-1.5 px-3 border-x border-gray-200 dark:border-gray-800 font-mono">{row.voucherNumber}</td>
                                 <td className="py-1.5 px-3 border-x border-gray-200 dark:border-gray-800 font-mono">{row.dailyNumber}</td>
                                 <td className="py-1.5 px-3 border-x border-gray-200 dark:border-gray-800 font-mono">{row.accountCode}</td>
                                 <td className="py-1.5 px-3 border-x border-gray-200 dark:border-gray-800 max-w-[200px] truncate" title={row.accountTitle}>{row.accountTitle}</td>
                                 <td className="py-1.5 px-3 border-x border-gray-200 dark:border-gray-800 max-w-[300px] truncate" title={row.description}>{row.description}</td>
                                 <td className="py-1.5 px-3 border-x border-gray-200 dark:border-gray-800 font-mono">{row.debit === 0 ? '-' : row.debit?.toLocaleString()}</td>
                                 <td className="py-1.5 px-3 border-x border-gray-200 dark:border-gray-800 font-mono">{row.credit === 0 ? '-' : row.credit?.toLocaleString()}</td>
                                 <td className="py-1.5 px-3 border-x border-gray-200 dark:border-gray-800 font-mono text-emerald-700 dark:text-emerald-400">{row.runningBalance?.toLocaleString()}</td>
                                 <td className="py-1.5 px-3 border-x border-gray-200 dark:border-gray-800 font-bold text-center">
                                    <span className={clsx(
                                       "px-2 rounded",
                                       row.runningBalanceType === 'بدهکار' ? "text-blue-600 bg-blue-50" : row.runningBalanceType === 'بستانکار' ? "text-amber-600 bg-amber-50" : ""
                                    )}>{row.runningBalanceType}</span>
                                 </td>
                                 <td className="py-1.5 px-3 border-x border-gray-200 dark:border-gray-800">{row.currencyName || '-'}</td>
                                 <td className="py-1.5 px-3 border-x border-gray-200 dark:border-gray-800 font-mono">{row.currencyAmount || '-'}</td>
                                 <td className="py-1.5 px-3 border-x border-gray-200 dark:border-gray-800 font-mono">{row.currencyRate || '-'}</td>
                                 <td className="py-1.5 px-3 border-x border-gray-200 dark:border-gray-800 font-mono">{row.trackingNumber || '-'}</td>
                                 <td className="py-1.5 px-3 border-x border-gray-200 dark:border-gray-800 font-mono">{row.trackingDate || '-'}</td>
                                 <td className="py-1.5 px-3 border-x border-gray-200 dark:border-gray-800">{row.creatorName || '-'}</td>
                              </tr>
                           ))}
                           {(!historyData || historyData.length === 0) && (
                              <tr>
                                 <td colSpan={16} className="py-8 text-center text-gray-500">
                                    داده‌ای برای نمایش وجود ندارد
                                 </td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </div>

                  {/* Summary Footer for history totals */}
                  {historyData && historyData.length > 0 && (
                    <div className="bg-slate-50 dark:bg-gray-900 px-4 py-1 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between gap-4 font-bold sticky bottom-0 text-[11px] shrink-0 select-text z-30 min-h-[44px]">
                      
                      {/* Right side: Icons */}
                      <div className="flex items-center gap-1 [&_button]:!p-1 [&_button]:!h-7 [&_button]:!w-7 [&_button_svg]:!w-4 [&_button_svg]:!h-4">
                        <ActionButton
                          icon={Printer}
                          onClick={handlePrint}
                          variant="ghost"
                          hideLabel
                          tooltip="چاپ"
                          tooltipPosition="top"
                          className="shadow-sm bg-white dark:bg-slate-800"
                        />
                        <PdfExportButton onClick={() => handleExport('pdf')} hideLabel tooltipPosition="top" className="shadow-sm bg-white dark:bg-slate-800" />
                        <ExcelExportButton onClick={() => handleExport('excel')} hideLabel tooltipPosition="top" className="shadow-sm bg-white dark:bg-slate-800" />
                        <WordExportButton onClick={() => handleExport('word')} hideLabel tooltipPosition="top" className="shadow-sm bg-white dark:bg-slate-800" />
                      </div>
                      
                      {/* Center side: totals */}
                      <div className="flex items-center gap-4 bg-white dark:bg-slate-800 px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                        <span className="text-slate-500 dark:text-slate-400">جمع کل گردش:</span>
                        <div className="flex gap-6 font-mono font-bold text-sm">
                           <span className="text-emerald-700 dark:text-emerald-500">
                             بد: <span dir="ltr">{historyDebitSum === 0 ? '-' : historyDebitSum.toLocaleString()}</span>
                           </span>
                           <span className="text-rose-600 dark:text-rose-500">
                             بس: <span dir="ltr">{historyCreditSum === 0 ? '-' : historyCreditSum.toLocaleString()}</span>
                           </span>
                        </div>
                      </div>

                      {/* Left side: Row count */}
                      <div className="text-gray-500 flex items-center">
                        مجموع رکوردها: <span className="text-slate-800 dark:text-slate-200 font-mono font-bold mr-1">{historyData.length}</span>
                      </div>
                    </div>
                  )}
               </div>
             )}

            </div>
        </div>

      </div>

      {/* Context Menu for History Rows */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="fixed z-[100] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-md overflow-hidden min-w-[200px]"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <div className="flex flex-col py-1">
              <button
                onClick={(e) => { e.stopPropagation(); handleContextMenuAction('view', contextMenu.row); }}
                className="px-4 py-2 text-sm text-right hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                style={{ fontFamily: 'inherit' }}
              >
                مشاهده سند
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleContextMenuAction('print', contextMenu.row); }}
                className="px-4 py-2 text-sm text-right hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                style={{ fontFamily: 'inherit' }}
              >
                چاپ سند
              </button>
              <div className="h-px bg-slate-200 dark:bg-slate-700 my-1"></div>
              <button
                onClick={(e) => { e.stopPropagation(); handleContextMenuAction('delete', contextMenu.row); }}
                className="px-4 py-2 text-sm text-right hover:bg-red-50 dark:hover:bg-slate-700 text-red-600 dark:text-red-400 transition-colors"
                style={{ fontFamily: 'inherit' }}
              >
                حذف سند
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
