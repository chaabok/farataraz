'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  Settings2,
  Lock,
  ChevronUp,
  Grid,
  RotateCcw,
  SlidersHorizontal,
  Download
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
import { MegaMenuInput } from '@/components/inputs';

// Data Types
export interface FiscalYearOption {
  id?: number | string;
  fiscalYearID?: number | string;
  title: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface ReportItem {
  id: string | number;
  rowNo?: number;
  voucherNumber?: number | string;
  referenceNumber?: number | string;
  subNumber?: number | string;
  voucherDate?: string;
  description?: string;
  description2?: string;
  debit: number;
  credit: number;
  currency?: string;
  currency2?: string;
  currencyDebit?: number;
  currencyCredit?: number;
  trackingNumber?: string;
  trackingDate?: string;
  accountCode?: string;
  accountTitle?: string;
  accountTitle2?: string;
  accountLevel?: 'group' | 'general' | 'subsidiary' | 'detailed';
  detailedTypeTitle?: string;
  docType?: string;
  groupCode?: string;
  groupTitle?: string;
  kolCode?: string;
  kolTitle?: string;
  moinCode?: string;
  moinTitle?: string;
  detailed1Code?: string;
  detailed1Title?: string;
  detailed2Code?: string;
  detailed2Title?: string;
  detailed3Code?: string;
  detailed3Title?: string;
  detailed4Code?: string;
  detailed4Title?: string;
  detailed5Code?: string;
  detailed5Title?: string;
  detailed6Code?: string;
  detailed6Title?: string;
  detailed7Code?: string;
  detailed7Title?: string;
  detailed8Code?: string;
  detailed8Title?: string;
  detailed9Code?: string;
  detailed9Title?: string;
  detailed10Code?: string;
  detailed10Title?: string;
  [key: string]: any;
}

const DEFAULT_MOCK_REPORT_ITEMS: ReportItem[] = [
  {
    id: 1,
    rowNo: 1,
    voucherNumber: 101,
    referenceNumber: 1,
    subNumber: 1,
    voucherDate: '1403/01/15',
    description: 'دریافت نقد صندوق',
    debit: 50000000,
    credit: 0,
    currency: 'ریال',
    accountCode: '111001',
    accountTitle: 'صندوق های ریالی',
    accountTitle2: 'Rials funds',
    accountLevel: 'detailed',
    groupCode: '1',
    groupTitle: 'دارایی های جاری',
    kolCode: '1110',
    kolTitle: 'موجودی نقد و بانک',
    moinCode: '111001',
    moinTitle: 'صندوق های ریالی',
    detailed1Code: '111001',
    detailed1Title: 'صندوق های ریالی',
    docType: 'opening',
    status: 'permanent'
  },
  {
    id: 2,
    rowNo: 2,
    voucherNumber: 102,
    referenceNumber: 2,
    subNumber: 1,
    voucherDate: '1403/02/10',
    description: 'گردش بانک ملی',
    debit: 396059391227,
    credit: 396203321985,
    currency: 'ریال',
    accountCode: '111004',
    accountTitle: 'موجودی بانکهای ریالی',
    accountTitle2: 'Rials bank accounts',
    accountLevel: 'subsidiary',
    groupCode: '1',
    groupTitle: 'دارایی های جاری',
    kolCode: '1110',
    kolTitle: 'موجودی نقد و بانک',
    moinCode: '111004',
    moinTitle: 'موجودی بانکهای ریالی',
    detailed1Code: '11100401',
    detailed1Title: 'موجودی بانکهای ریالی',
    docType: 'normal',
    status: 'permanent'
  },
  {
    id: 3,
    rowNo: 3,
    voucherNumber: 103,
    referenceNumber: 3,
    subNumber: 1,
    voucherDate: '1403/03/05',
    description: 'وام ضروری پرسنل',
    debit: 0,
    credit: 944166665,
    currency: 'ریال',
    accountCode: '111402',
    accountTitle: 'وام ضروری کارکنان',
    accountTitle2: 'Staff emergency loan',
    accountLevel: 'subsidiary',
    groupCode: '1',
    groupTitle: 'دارایی های جاری',
    kolCode: '1114',
    kolTitle: 'سایر حسابها و اسناد دریافتنی',
    moinCode: '111402',
    moinTitle: 'وام ضروری کارکنان',
    detailed1Code: '11140201',
    detailed1Title: 'امضروری کارکنان مرکز',
    docType: 'normal',
    status: 'permanent'
  },
  {
    id: 4,
    rowNo: 4,
    voucherNumber: 104,
    referenceNumber: 4,
    subNumber: 1,
    voucherDate: '1403/03/20',
    description: 'واریز جاری سهامداران',
    debit: 538610000000,
    credit: 6500000000,
    currency: 'ریال',
    accountCode: '111419',
    accountTitle: 'جاری سهامداران',
    accountTitle2: 'Shareholders current account',
    accountLevel: 'subsidiary',
    groupCode: '1',
    groupTitle: 'دارایی های جاری',
    kolCode: '1114',
    kolTitle: 'سایر حسابها و اسناد دریافتنی',
    moinCode: '111419',
    moinTitle: 'جاری سهامداران',
    detailed1Code: '11141901',
    detailed1Title: 'جاری سهامداران',
    docType: 'normal',
    status: 'permanent'
  },
  {
    id: 5,
    rowNo: 5,
    voucherNumber: 105,
    referenceNumber: 5,
    subNumber: 1,
    voucherDate: '1403/04/01',
    description: 'سپرده کوتاه مدت بانک',
    debit: 6500000000,
    credit: 0,
    currency: 'ریال',
    accountCode: '111501',
    accountTitle: 'سپرده های کوتاه مدت نزد بانکها',
    accountTitle2: 'Short-term deposits with banks',
    accountLevel: 'subsidiary',
    groupCode: '1',
    groupTitle: 'دارایی های جاری',
    kolCode: '1115',
    kolTitle: 'سرمایه گذاری های کوتاه مدت',
    moinCode: '111501',
    moinTitle: 'سپرده های کوتاه مدت نزد بانکها',
    detailed1Code: '11150101',
    detailed1Title: 'سپرده های کوتاه مدت نزد بانکها',
    docType: 'normal',
    status: 'permanent'
  },
  {
    id: 6,
    rowNo: 6,
    voucherNumber: 106,
    referenceNumber: 6,
    subNumber: 1,
    voucherDate: '1403/04/15',
    description: 'خرید ماشین آلات',
    debit: 768508000000,
    credit: 700000000000,
    currency: 'ریال',
    accountCode: '121003',
    accountTitle: 'ماشین آلات و تجهیزات',
    accountTitle2: 'Machinery and equipment',
    accountLevel: 'subsidiary',
    groupCode: '1',
    groupTitle: 'دارایی های غیرجاری',
    kolCode: '1210',
    kolTitle: 'دارایی ثابت',
    moinCode: '121003',
    moinTitle: 'ماشین آلات و تجهیزات',
    detailed1Code: '12100301',
    detailed1Title: 'ماشین آلات و تجهیزات',
    docType: 'normal',
    status: 'permanent'
  },
  {
    id: 7,
    rowNo: 7,
    voucherNumber: 107,
    referenceNumber: 7,
    subNumber: 1,
    voucherDate: '1403/04/25',
    description: 'خرید اثاثیه',
    debit: 2920571000,
    credit: 0,
    currency: 'ریال',
    accountCode: '121006',
    accountTitle: 'اثاثیه و منصوبات',
    accountTitle2: 'Furniture and fixtures',
    accountLevel: 'subsidiary',
    groupCode: '1',
    groupTitle: 'دارایی های غیرجاری',
    kolCode: '1210',
    kolTitle: 'دارایی ثابت',
    moinCode: '121006',
    moinTitle: 'اثاثیه و منصوبات',
    detailed1Code: '12100601',
    detailed1Title: 'اثاثیه و منصوبات',
    docType: 'normal',
    status: 'permanent'
  }
];

export interface GroupedReportData {
  groupKey: string;
  accountCode: string;
  accountTitle: string;
  accountLevelTitle: string;
  recordCount: number;
  items: ReportItem[];
  totalDebit: number;
  totalCredit: number;
}

export interface HierarchyLevel {
  code: string;
  title: string;
  priorityName: string;
}

export interface AnalyticalTreeNode<TRow> {
  levelIndex: number;
  priorityName: string;
  code: string;
  title: string;
  subNodes?: AnalyticalTreeNode<TRow>[];
  rows?: TRow[];
  totals: {
    debitBalance: number;
    creditBalance: number;
    debitTurnover: number;
    creditTurnover: number;
    debitPriorTurnover: number;
    creditPriorTurnover: number;
    debitPeriodTurnover: number;
    creditPeriodTurnover: number;
    col1Debit: number; col1Credit: number;
    col2Debit: number; col2Credit: number;
    col3Debit: number; col3Credit: number;
    col4Debit: number; col4Credit: number;
  };
}

export interface AnalyticalLedgerNode {
  key: string;
  levelIndex: number;
  priorityName: string;
  code: string;
  title: string;
  subNodes?: AnalyticalLedgerNode[];
  items?: ReportItem[];
  totalDebit: number;
  totalCredit: number;
  recordCount: number;
}

export interface TwoColumnBalanceRow {
  rowNo: number;
  accountCode: string;
  accountTitle: string;
  accountTitle2: string;
  debitBalance: number;
  creditBalance: number;
  parentCode?: string;
  parentTitle?: string;
  hierarchyPath?: HierarchyLevel[];
}

export interface FourColumnBalanceRow {
  rowNo: number;
  accountCode: string;
  accountTitle: string;
  accountTitle2: string;
  debitTurnover: number;
  creditTurnover: number;
  debitBalance: number;
  creditBalance: number;
  parentCode?: string;
  parentTitle?: string;
  hierarchyPath?: HierarchyLevel[];
}

export interface SixColumnBalanceRow {
  rowNo: number;
  accountCode: string;
  accountTitle: string;
  accountTitle2: string;
  debitPriorTurnover: number;
  creditPriorTurnover: number;
  debitPeriodTurnover: number;
  creditPeriodTurnover: number;
  debitBalance: number;
  creditBalance: number;
  parentCode?: string;
  parentTitle?: string;
  hierarchyPath?: HierarchyLevel[];
}

export interface EightColumnBalanceRow {
  rowNo: number;
  accountCode: string;
  accountTitle: string;
  accountTitle2: string;
  col1Debit: number;
  col1Credit: number;
  col2Debit: number;
  col2Credit: number;
  col3Debit: number;
  col3Credit: number;
  col4Debit: number;
  col4Credit: number;
  parentCode?: string;
  parentTitle?: string;
  hierarchyPath?: HierarchyLevel[];
}

export default function TrialBalanceAndLedgerReport() {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const { tabs, activeTabId, removeTab } = useTabs();
  const activeTab = tabs?.find((t) => t.id === activeTabId);

  // Filter Collapse State
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // --- Row 1 Filters ---
  // Box 1: Document Year Scope
  const [filterYearRange, setFilterYearRange] = useState<boolean>(true);
  const [fiscalYearsList, setFiscalYearsList] = useState<FiscalYearOption[]>([]);
  const [fromYear, setFromYear] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('app-fiscal-year') || '1405';
    }
    return '1405';
  });
  const [toYear, setToYear] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('app-fiscal-year') || '1405';
    }
    return '1405';
  });

  // Box 2: Month Scope
  const [filterMonths, setFilterMonths] = useState<boolean>(false);
  const [fromMonth, setFromMonth] = useState<string>('فروردین');
  const [toMonth, setToMonth] = useState<string>('اسفند');

  // Box 3: Date Scope
  const [filterDates, setFilterDates] = useState<boolean>(false);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // Box 4: Voucher Number Scope
  const [filterVoucherNumbers, setFilterVoucherNumbers] = useState<boolean>(false);
  const [fromVoucher, setFromVoucher] = useState<string>('');
  const [toVoucher, setToVoucher] = useState<string>('');

  // Box 5: Document Types Included (شامل اسناد)
  const [docAll, setDocAll] = useState<boolean>(true);
  const [docOpening, setDocOpening] = useState<boolean>(false);
  const [docClosing, setDocClosing] = useState<boolean>(false);
  const [docNatureAdjustment, setDocNatureAdjustment] = useState<boolean>(false);
  const [docProfitLoss, setDocProfitLoss] = useState<boolean>(false);

  // Box 6: Voucher Status (وضعیت سند)
  const [statusAll, setStatusAll] = useState<boolean>(true);
  const [statusTemporary, setStatusTemporary] = useState<boolean>(false);
  const [statusReviewing, setStatusReviewing] = useState<boolean>(false);
  const [statusReviewed, setStatusReviewed] = useState<boolean>(false);
  const [statusPermanent, setStatusPermanent] = useState<boolean>(false);

  // --- Row Selection for Summary Footer ---
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [selectedRowData, setSelectedRowData] = useState<Record<string, { debit: number; credit: number }>>({});

  // --- Row 2 Filters ---
  // Box 7: Report Nature (ماهیت گزارش)
  const [reportNature, setReportNature] = useState<'balance' | 'ledger'>('balance'); // تراز / دفاتر
  const [reportVariant, setReportVariant] = useState<'simple' | 'analytical'>('simple'); // ساده / تحلیلی
  const [selectedAccountLevel, setSelectedAccountLevel] = useState<string>('کل'); // گروه، کل، معین، تفصیلی

  // Box 8: Trial Balance Column Format (تهیه گزارش تراز به صورت)
  const [columnFormat, setColumnFormat] = useState<'2_column' | '4_column' | '6_column' | '8_column'>('4_column');

  // Box 9: Balance Type (نوع مانده)
  const [balanceType, setBalanceType] = useState<string>('debit_credit_or_balance'); 
  // Options: 'debit', 'credit', 'debit_credit_or_balance', 'zero_no_balance', 'debit_credit_zero'

  // Box 10: Other Conditions (سایر شرایط)
  const [printSeparatePages, setPrintSeparatePages] = useState<boolean>(false);
  const [includePriorBalance, setIncludePriorBalance] = useState<boolean>(false);
  const [showOpeningInSeparateCol, setShowOpeningInSeparateCol] = useState<boolean>(false);

  // Box 11: Priority Levels in Analytical Report (اولویت بندی سطوح حسابها در گزارش تحلیلی)
  const [detailedLevelsCount, setDetailedLevelsCount] = useState<number>(10);
  const [priorities, setPriorities] = useState<string[]>(() => {
    const arr = ['گروه', 'کل', 'معین'];
    for (let i = 0; i < 10; i++) {
      arr.push('خالی باشد');
    }
    return arr;
  });
  const [detailedTypes, setDetailedTypes] = useState<any[]>([]);

  // Scroll ref and handlers for priorities list in Box 11
  const prioritiesListRef = useRef<HTMLDivElement>(null);

  const handleScrollPrioritiesUp = () => {
    if (prioritiesListRef.current) {
      prioritiesListRef.current.scrollBy({ top: -40, behavior: 'smooth' });
    }
  };

  const handleScrollPrioritiesDown = () => {
    if (prioritiesListRef.current) {
      prioritiesListRef.current.scrollBy({ top: 40, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    apiFetch('/api/accounting/detailed-types')
      .then(res => {
        if (res.ok) return res.json();
        return null;
      })
      .then(data => {
        if (data) {
          const items = Array.isArray(data) ? data : (data.data || []);
          setDetailedTypes(items);
        }
      })
      .catch(err => {
        console.error('Error fetching detailed types for priority levels:', err);
      });

    apiFetch('/api/common/base-settings/tab/2')
      .then(res => {
        if (res.ok) return res.json();
        return null;
      })
      .then(result => {
        if (result && result.data && result.data.detailedLevelsCount !== undefined) {
          const count = parseInt(result.data.detailedLevelsCount, 10);
          if (!isNaN(count) && count >= 0) {
            setDetailedLevelsCount(count);
          }
        }
      })
      .catch(err => {
        console.error('Error fetching base accounting settings:', err);
      });
  }, []);

  const loadFiscalYears = useCallback(() => {
    apiFetch('/api/common/fiscalyear')
      .then(res => {
        if (res.ok) return res.json();
        return null;
      })
      .then(data => {
        let items: FiscalYearOption[] = [];
        if (data) {
          items = Array.isArray(data) ? data : (data.items || []);
        }

        if (items.length === 0) {
          items = [
            { id: 1, fiscalYearID: 1, title: 'سال مالی ۱۴۰۳', isActive: true },
            { id: 2, fiscalYearID: 2, title: 'سال مالی ۱۴۰۲', isActive: false },
            { id: 3, fiscalYearID: 3, title: 'سال مالی ۱۴۰۱', isActive: false },
            { id: 4, fiscalYearID: 4, title: 'سال مالی ۱۴۰۰', isActive: false },
          ];
        }

        setFiscalYearsList(items);

        // Set default values based on active fiscal year in footer (localStorage 'app-fiscal-year')
        const savedFiscalYearId = localStorage.getItem('app-fiscal-year');
        let targetFy = items.find(fy => String(fy.fiscalYearID || fy.id) === String(savedFiscalYearId));

        if (!targetFy) {
          targetFy = items.find(fy => fy.isActive) || items[0];
        }

        if (targetFy) {
          const val = String(targetFy.fiscalYearID || targetFy.id || targetFy.title);
          setFromYear(val);
          setToYear(val);
        }
      })
      .catch(err => {
        console.error('Error fetching fiscal years in report:', err);
      });
  }, []);

  const updateVoucherBounds = useCallback((fYr: string, tYr: string) => {
    if (!fYr && !tYr) return;
    const query = new URLSearchParams({
      fromYear: fYr || '',
      toYear: tYr || '',
    });
    apiFetch(`/api/accounting/account-review/voucher-bounds?${query.toString()}`)
      .then(res => {
        if (res.ok) return res.json();
        return null;
      })
      .then(data => {
        if (data && data.success) {
          if (data.fromMonth) setFromMonth(data.fromMonth);
          if (data.toMonth) setToMonth(data.toMonth);
          if (data.fromDate) setFromDate(data.fromDate);
          if (data.toDate) setToDate(data.toDate);
          if (data.fromVoucher) setFromVoucher(data.fromVoucher);
          if (data.toVoucher) setToVoucher(data.toVoucher);
        }
      })
      .catch(err => {
        console.error('Error fetching voucher bounds:', err);
      });
  }, []);

  useEffect(() => {
    if (fromYear || toYear) {
      updateVoucherBounds(fromYear, toYear);
    }
  }, [fromYear, toYear, updateVoucherBounds]);

  useEffect(() => {
    loadFiscalYears();

    const handleStorageChange = () => {
      const savedFiscalYearId = localStorage.getItem('app-fiscal-year');
      if (savedFiscalYearId && fiscalYearsList.length > 0) {
        const targetFy = fiscalYearsList.find(fy => String(fy.fiscalYearID || fy.id) === String(savedFiscalYearId));
        if (targetFy) {
          const val = String(targetFy.fiscalYearID || targetFy.id || targetFy.title);
          setFromYear(val);
          setToYear(val);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadFiscalYears, fiscalYearsList.length]);

  useEffect(() => {
    const targetLength = 3 + detailedLevelsCount;
    setPriorities(prev => {
      if (prev.length === targetLength) return prev;
      const next = [...prev];
      if (next.length < targetLength) {
        while (next.length < targetLength) {
          const idx = next.length;
          if (idx === 0) next.push('گروه');
          else if (idx === 1) next.push('کل');
          else if (idx === 2) next.push('معین');
          else next.push('خالی باشد');
        }
      } else {
        next.splice(targetLength);
      }
      return next;
    });
  }, [detailedLevelsCount]);

  // --- Search & Filter Bar States ---
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [quickLevelFilter, setQuickLevelFilter] = useState<string>('کل');

  // --- Resizable Columns Width State ---
  const [twoColWidths, setTwoColWidths] = useState<Record<string, number>>({
    rowNo: 48,
    accountCode: 120,
    accountTitle: 240,
    accountTitle2: 180,
    debitBalance: 144,
    creditBalance: 144,
  });

  const [fourColWidths, setFourColWidths] = useState<Record<string, number>>({
    rowNo: 48,
    accountCode: 120,
    accountTitle: 220,
    accountTitle2: 160,
    debitTurnover: 130,
    creditTurnover: 130,
    debitBalance: 130,
    creditBalance: 130,
  });

  const [sixColWidths, setSixColWidths] = useState<Record<string, number>>({
    rowNo: 48,
    accountCode: 120,
    accountTitle: 200,
    accountTitle2: 150,
    debitPriorTurnover: 120,
    creditPriorTurnover: 120,
    debitPeriodTurnover: 120,
    creditPeriodTurnover: 120,
    debitBalance: 120,
    creditBalance: 120,
  });

  const [eightColWidths, setEightColWidths] = useState<Record<string, number>>({
    rowNo: 48,
    accountCode: 110,
    accountTitle: 180,
    accountTitle2: 130,
    col1Debit: 100,
    col1Credit: 100,
    col2Debit: 100,
    col2Credit: 100,
    col3Debit: 100,
    col3Credit: 100,
    col4Debit: 100,
    col4Credit: 100,
  });

  const [ledgerWidths, setLedgerWidths] = useState<Record<string, number>>({
    rowNo: 48,
    voucherNumber: 90,
    referenceNumber: 90,
    subNumber: 90,
    voucherDate: 100,
    description: 240,
    description2: 180,
    debit: 120,
    credit: 120,
    debitBalance: 120,
    creditBalance: 120,
    currency: 70,
    currency2: 70,
    currencyDebit: 100,
    currencyCredit: 100,
    currencyDebitBalance: 100,
    currencyCreditBalance: 100,
    trackingNumber: 100,
    trackingDate: 100,
  });

  const handleMouseDownResize = (
    e: React.MouseEvent,
    columnKey: string,
    mode: 'two_col' | 'four_col' | 'six_col' | 'eight_col' | 'ledger' | boolean
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = (mode === 'two_col' || mode === true)
      ? (twoColWidths[columnKey] || 100)
      : mode === 'four_col'
      ? (fourColWidths[columnKey] || 100)
      : mode === 'six_col'
      ? (sixColWidths[columnKey] || 100)
      : mode === 'eight_col'
      ? (eightColWidths[columnKey] || 100)
      : (ledgerWidths[columnKey] || 100);

    const onMouseMove = (moveEvent: MouseEvent) => {
      // In RTL direction: moving mouse to the left (moveEvent.clientX < startX) increases column width
      const deltaX = startX - moveEvent.clientX;
      const newWidth = Math.max(35, startWidth + deltaX);
      if (mode === 'two_col' || mode === true) {
        setTwoColWidths(prev => ({ ...prev, [columnKey]: newWidth }));
      } else if (mode === 'four_col') {
        setFourColWidths(prev => ({ ...prev, [columnKey]: newWidth }));
      } else if (mode === 'six_col') {
        setSixColWidths(prev => ({ ...prev, [columnKey]: newWidth }));
      } else if (mode === 'eight_col') {
        setEightColWidths(prev => ({ ...prev, [columnKey]: newWidth }));
      } else {
        setLedgerWidths(prev => ({ ...prev, [columnKey]: newWidth }));
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleEnlargeAllColumns = () => {
    const factor = 1.15;
    setTwoColWidths(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => { next[k] = Math.round(next[k] * factor); });
      return next;
    });
    setFourColWidths(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => { next[k] = Math.round(next[k] * factor); });
      return next;
    });
    setSixColWidths(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => { next[k] = Math.round(next[k] * factor); });
      return next;
    });
    setEightColWidths(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => { next[k] = Math.round(next[k] * factor); });
      return next;
    });
    setLedgerWidths(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => { next[k] = Math.round(next[k] * factor); });
      return next;
    });
  };

  const handleShrinkAllColumns = () => {
    const factor = 0.87;
    setTwoColWidths(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => { next[k] = Math.max(30, Math.round(next[k] * factor)); });
      return next;
    });
    setFourColWidths(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => { next[k] = Math.max(30, Math.round(next[k] * factor)); });
      return next;
    });
    setSixColWidths(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => { next[k] = Math.max(30, Math.round(next[k] * factor)); });
      return next;
    });
    setEightColWidths(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => { next[k] = Math.max(30, Math.round(next[k] * factor)); });
      return next;
    });
    setLedgerWidths(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => { next[k] = Math.max(30, Math.round(next[k] * factor)); });
      return next;
    });
  };

  const handleMouseDownResizeGroup = (
    e: React.MouseEvent,
    colKeys: [string, string],
    mode: 'four_col' | 'six_col' | 'eight_col'
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const [col1, col2] = colKeys;

    let initialW1 = 100;
    let initialW2 = 100;
    if (mode === 'four_col') {
      initialW1 = fourColWidths[col1] || 100;
      initialW2 = fourColWidths[col2] || 100;
    } else if (mode === 'six_col') {
      initialW1 = sixColWidths[col1] || 100;
      initialW2 = sixColWidths[col2] || 100;
    } else if (mode === 'eight_col') {
      initialW1 = eightColWidths[col1] || 100;
      initialW2 = eightColWidths[col2] || 100;
    }

    const startGroupWidth = initialW1 + initialW2;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = startX - moveEvent.clientX;
      const newGroupWidth = Math.max(70, startGroupWidth + deltaX);
      const halfW = Math.max(35, Math.round(newGroupWidth / 2));

      if (mode === 'four_col') {
        setFourColWidths(prev => ({ ...prev, [col1]: halfW, [col2]: halfW }));
      } else if (mode === 'six_col') {
        setSixColWidths(prev => ({ ...prev, [col1]: halfW, [col2]: halfW }));
      } else if (mode === 'eight_col') {
        setEightColWidths(prev => ({ ...prev, [col1]: halfW, [col2]: halfW }));
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // Data & Grouping States
  const [reportItems, setReportItems] = useState<ReportItem[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Dynamic priority extraction logic for analytical reports
  const activePriorities = useMemo(() => {
    const active = priorities.filter(p => p && p !== 'خالی باشد');
    if (active.length === 0) {
      return ['کل', 'معین'];
    }
    return active;
  }, [priorities]);

  const detailPriority = useMemo(() => {
    return activePriorities[activePriorities.length - 1];
  }, [activePriorities]);

  const groupPriority = useMemo(() => {
    if (activePriorities.length > 1) {
      return activePriorities[activePriorities.length - 2];
    }
    const first = activePriorities[0];
    if (first === 'سطح تفصیلی ۲') return 'سطح تفصیلی ۱';
    if (first.startsWith('سطح تفصیلی')) return 'معین';
    if (first === 'معین') return 'کل';
    if (first === 'کل') return 'گروه';
    return 'گروه';
  }, [activePriorities]);

  const getAccountLevelData = useCallback((item: ReportItem, priorityName: string) => {
    if (!priorityName || priorityName === 'خالی باشد') {
      return { code: item.accountCode || '', title: item.accountTitle || '' };
    }

    const normP = priorityName
      .replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 1776))
      .replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 1632));

    if (normP === 'گروه') {
      return {
        code: item.groupCode || (item.accountCode ? item.accountCode.slice(0, 1) : '1'),
        title: item.groupTitle || 'دارایی های جاری'
      };
    }
    if (normP === 'کل') {
      const code = item.kolCode || (item.accountCode ? item.accountCode.slice(0, 4) : '1110');
      const knownKolTitles: Record<string, string> = {
        '1110': 'موجودی نقد و بانک',
        '1114': 'سایر حسابها و اسناد دریافتنی',
        '1115': 'سرمایه گذاری های کوتاه مدت',
        '1210': 'دارایی ثابت',
      };
      let title = item.kolTitle;
      if (!title || (knownKolTitles[code] && title !== knownKolTitles[code] && title === item.accountTitle && item.accountCode !== code)) {
        title = knownKolTitles[code] || item.kolTitle || item.accountTitle || 'موجودی نقد و بانک';
      }
      return {
        code,
        title: title || 'موجودی نقد و بانک'
      };
    }
    if (normP === 'معین') {
      return {
        code: item.moinCode || item.accountCode || '111004',
        title: item.moinTitle || item.accountTitle || 'موجودی بانکهای ریالی'
      };
    }
    if (normP.includes('تفصیلی')) {
      const matches = normP.match(/\d+/g);
      if (matches && matches.length > 1) {
        const codes: string[] = [];
        const titles: string[] = [];
        matches.forEach(mStr => {
          const idx = mStr;
          const c = (item as any)[`detailed${idx}Code`];
          const t = (item as any)[`detailed${idx}Title`];
          codes.push(c || '');
          titles.push(t || '');
        });
        return {
          code: codes.join(' / '),
          title: titles.join(' / ')
        };
      }
      const match = normP.match(/\d+/);
      const idx = match ? match[0] : '1';
      const code = (item as any)[`detailed${idx}Code`];
      const title = (item as any)[`detailed${idx}Title`];
      return {
        code: code || '',
        title: title || ''
      };
    }

    return {
      code: item.accountCode || '',
      title: item.accountTitle || ''
    };
  }, []);

  const getItemHierarchyPath = useCallback((item: ReportItem): HierarchyLevel[] => {
    // Preserve user-defined priority sequence for level grouping
    return activePriorities.map(p => {
      const d = getAccountLevelData(item, p);
      return { ...d, priorityName: p };
    });
  }, [activePriorities, getAccountLevelData]);

  // Fiscal Years List
  const fiscalYears = useMemo(() => ['سال مالی ۱۴۰۳', 'سال مالی ۱۴۰۲', 'سال مالی ۱۴۰۱', 'سال مالی ۱۴۰۰'], []);
  const monthsList = useMemo(() => [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ], []);
  const levelsList = useMemo(() => {
    const basic = ['گروه', 'کل', 'معین'];
    const count = Math.max(1, detailedLevelsCount || 10);
    const detailed = Array.from({ length: count }, (_, i) => `سطح تفصیلی ${i + 1}`);
    return [...basic, ...detailed];
  }, [detailedLevelsCount]);
  const basicAccountLevels = useMemo(() => ['گروه', 'کل', 'معین', 'خالی باشد'], []);

  const isBasicLevel = useCallback((val: string) => {
    return basicAccountLevels.includes(val);
  }, [basicAccountLevels]);

  const getOrdinalName = useCallback((n: number): string => {
    const ordinals = [
      'اول', 'دوم', 'سوم', 'چهارم', 'پنجم', 'ششم', 'هفتم', 'هشتم', 'نهم', 'دهم',
      'یازدهم', 'دوازدهم', 'سیزدهم', 'چهاردهم', 'پانزدهم', 'شانزدهم', 'هفدهم', 'هجدهم', 'نوزدهم', 'بیستم'
    ];
    return ordinals[n - 1] || `${n}ام`;
  }, []);

  const isAnyDetailedLevelSelected = useMemo(() => {
    return priorities.some(p => !isBasicLevel(p));
  }, [priorities, isBasicLevel]);

  const detailedLevelOptions = useMemo(() => {
    const count = Math.max(10, detailedLevelsCount || 10);
    return Array.from({ length: count }, (_, i) => `سطح تفصیلی ${i + 1}`);
  }, [detailedLevelsCount]);

  const isSelectedDetailedLevel = useMemo(() => {
    if (!selectedAccountLevel) return false;
    return /تفصیلی/i.test(selectedAccountLevel);
  }, [selectedAccountLevel]);

  const emptyStateMessage = useMemo(() => {
    if (reportVariant === 'simple' && isSelectedDetailedLevel) {
      return "هیچ حساب تفصیلی در این سطح گردش ندارد";
    }
    return "رکوردی جهت نمایش بر اساس فیلترهای انتخابی یافت نشد.";
  }, [reportVariant, isSelectedDetailedLevel]);

  const getPriorityItems = useCallback((priorityStr: string): string[] => {
    if (!priorityStr || priorityStr === 'خالی باشد') return [];
    return priorityStr.split('، ').map(s => s.trim()).filter(Boolean);
  }, []);

  const isPriorityItemDisabled = useCallback((levelNum: number, itemValue: string): boolean => {
    if (levelNum === 1) return false;
    if (!itemValue || itemValue === 'خالی باشد') return false;
    const targetIdx = levelNum - 1;

    for (let i = 0; i < targetIdx; i++) {
      const pVal = priorities[i];
      if (!pVal || pVal === 'خالی باشد') continue;

      if (isBasicLevel(pVal)) {
        if (pVal === itemValue) return true;
      } else {
        const detailedItems = getPriorityItems(pVal);
        if (detailedItems.includes(itemValue)) return true;
      }
    }

    return false;
  }, [priorities, isBasicLevel, getPriorityItems]);

  const getPriorityItemTooltip = useCallback((levelNum: number, itemValue: string): string => {
    if (!itemValue || itemValue === 'خالی باشد') return "";
    if (isPriorityItemDisabled(levelNum, itemValue)) {
      return "این سطح در اولویت قبلی انتخاب شده است";
    }
    return "";
  }, [isPriorityItemDisabled]);

  const isOptionSelectedInPriority = useCallback((priorityStr: string, item: string): boolean => {
    const items = getPriorityItems(priorityStr);
    return items.includes(item);
  }, [getPriorityItems]);

  const isPriorityVisible = useCallback((idx: number): boolean => {
    if (idx === 0) return true;
    for (let i = 0; i < idx; i++) {
      if (!priorities[i] || priorities[i] === 'خالی باشد') {
        return false;
      }
    }
    return true;
  }, [priorities]);

  const handleSelectPriorityOption = (levelNum: number, selectedValue: string) => {
    const targetIdx = levelNum - 1;

    if (selectedValue === 'خالی باشد') {
      if (levelNum === 1) return;
      setPriorities(prev => {
        const next = [...prev];
        for (let i = targetIdx; i < next.length; i++) {
          next[i] = 'خالی باشد';
        }
        return next;
      });
      return;
    }

    const isSelectedValueDetailed = !isBasicLevel(selectedValue);

    if (!isSelectedValueDetailed) {
      setPriorities(prev => {
        const next = [...prev];
        const existingIdx = next.findIndex((val, idx) => idx !== targetIdx && val === selectedValue);
        if (existingIdx !== -1) {
          next[existingIdx] = next[targetIdx] || 'خالی باشد';
        }
        next[targetIdx] = selectedValue;
        return next;
      });
      return;
    }

    const currentVal = priorities[targetIdx] || '';
    const currentItems = isBasicLevel(currentVal) || currentVal === 'خالی باشد' ? [] : getPriorityItems(currentVal);
    let updatedItems: string[];

    if (currentItems.includes(selectedValue)) {
      updatedItems = currentItems.filter(item => item !== selectedValue);
    } else {
      updatedItems = [...currentItems, selectedValue];
    }

    const newVal = updatedItems.length === 0 ? 'خالی باشد' : updatedItems.join('، ');

    setPriorities(prev => {
      const next = [...prev];
      for (let i = 0; i < next.length; i++) {
        if (i === targetIdx) continue;
        const pItems = getPriorityItems(next[i]);
        if (pItems.includes(selectedValue)) {
          const remaining = pItems.filter(it => it !== selectedValue);
          next[i] = remaining.length === 0 ? 'خالی باشد' : remaining.join('، ');
        }
      }
      next[targetIdx] = newVal;
      if (newVal === 'خالی باشد') {
        for (let i = targetIdx + 1; i < next.length; i++) {
          next[i] = 'خالی باشد';
        }
      }
      return next;
    });
  };

  const handleResetToBasicLevels = () => {
    setPriorities(prev => {
      const next = [...prev];
      if (next.length > 0) next[0] = 'گروه';
      if (next.length > 1) next[1] = 'کل';
      if (next.length > 2) next[2] = 'معین';
      for (let i = 3; i < next.length; i++) {
        next[i] = 'خالی باشد';
      }
      return next;
    });
  };

  // Fetch Report Data from API or generate structured dataset
  const loadReportData = async (overrideParams?: Record<string, any>) => {
    setIsLoading(true);
    try {
      const isDocAll = overrideParams?.docAll ?? docAll;
      const isDocOpening = overrideParams?.docOpening ?? docOpening;
      const isDocClosing = overrideParams?.docClosing ?? docClosing;
      const isDocNatureAdjustment = overrideParams?.docNatureAdjustment ?? docNatureAdjustment;
      const isDocProfitLoss = overrideParams?.docProfitLoss ?? docProfitLoss;

      const docTypesParam = isDocAll ? 'all' : [
        isDocOpening && 'opening',
        isDocClosing && 'closing',
        isDocNatureAdjustment && 'nature',
        isDocProfitLoss && 'pnl'
      ].filter(Boolean).join(',');

      const isStatusAll = overrideParams?.statusAll ?? statusAll;
      const isStatusTemporary = overrideParams?.statusTemporary ?? statusTemporary;
      const isStatusReviewing = overrideParams?.statusReviewing ?? statusReviewing;
      const isStatusReviewed = overrideParams?.statusReviewed ?? statusReviewed;
      const isStatusPermanent = overrideParams?.statusPermanent ?? statusPermanent;

      const statusParam = isStatusAll ? 'all' : [
        isStatusTemporary && 'temporary',
        isStatusReviewing && 'reviewing',
        isStatusReviewed && 'reviewed',
        isStatusPermanent && 'permanent'
      ].filter(Boolean).join(',');

      const curReportNature = overrideParams?.reportNature ?? reportNature;
      const curReportVariant = overrideParams?.reportVariant ?? reportVariant;
      const curSelectedAccountLevel = overrideParams?.selectedAccountLevel ?? selectedAccountLevel;
      const curColumnFormat = overrideParams?.columnFormat ?? columnFormat;
      const curBalanceType = overrideParams?.balanceType ?? balanceType;

      const curFilterYearRange = overrideParams?.filterYearRange ?? filterYearRange;
      const curFromYear = overrideParams?.fromYear ?? fromYear;
      const curToYear = overrideParams?.toYear ?? toYear;

      const curFilterMonths = overrideParams?.filterMonths ?? filterMonths;
      const curFromMonth = overrideParams?.fromMonth ?? fromMonth;
      const curToMonth = overrideParams?.toMonth ?? toMonth;

      const curFilterDates = overrideParams?.filterDates ?? filterDates;
      const curFromDate = overrideParams?.fromDate ?? fromDate;
      const curToDate = overrideParams?.toDate ?? toDate;

      const curFilterVoucherNumbers = overrideParams?.filterVoucherNumbers ?? filterVoucherNumbers;
      const curFromVoucher = overrideParams?.fromVoucher ?? fromVoucher;
      const curToVoucher = overrideParams?.toVoucher ?? toVoucher;

      const curPriorities = overrideParams?.priorities ?? priorities;
      const curPrintSeparatePages = overrideParams?.printSeparatePages ?? printSeparatePages;
      const curIncludePriorBalance = overrideParams?.includePriorBalance ?? includePriorBalance;
      const curShowOpeningInSeparateCol = overrideParams?.showOpeningInSeparateCol ?? showOpeningInSeparateCol;
      const curSearchQuery = overrideParams?.searchQuery ?? searchQuery;

      const params = new URLSearchParams({
        reportNature: curReportNature,
        reportVariant: curReportVariant,
        accountLevel: curSelectedAccountLevel,
        columnFormat: curColumnFormat,
        balanceType: curBalanceType,
        filterYearRange: String(curFilterYearRange),
        fromYear: curFromYear,
        toYear: curToYear,
        filterMonths: String(curFilterMonths),
        fromMonth: curFromMonth,
        toMonth: curToMonth,
        filterDates: String(curFilterDates),
        fromDate: curFromDate,
        toDate: curToDate,
        filterVoucherNumbers: String(curFilterVoucherNumbers),
        fromVoucher: curFromVoucher !== null ? String(curFromVoucher) : '',
        toVoucher: curToVoucher !== null ? String(curToVoucher) : '',
        docTypes: docTypesParam,
        statuses: statusParam,
        priorities: JSON.stringify(curPriorities),
        printAccountInSeparatePages: String(curPrintSeparatePages),
        includePriorBalance: String(curIncludePriorBalance),
        showOpeningInSeparateColumn: String(curShowOpeningInSeparateCol),
        companyRef: localStorage.getItem('app-company') || '2',
        businessStructureRef: localStorage.getItem('app-business-structure') || '2',
        search: curSearchQuery
      });

      const res = await apiFetch(`/api/accounting/trial-balance-and-ledger-report/report-data?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.reportData)) {
          const mappedItems: ReportItem[] = data.reportData.map((item: any, idx: number) => ({
            id: item.id || idx + 1,
            rowNo: idx + 1,
            voucherNumber: item.voucherNumber || item.documentNumber || idx + 1,
            referenceNumber: item.referenceNumber || item.atfNumber || idx + 1,
            subNumber: item.subNumber || item.secondaryNumber || 1,
            voucherDate: item.voucherDate || item.date || '',
            description: item.description || item.babat || '',
            description2: item.description2 || item.babat2 || '',
            debit: Number(item.debit ?? item.debitTurnover ?? item.bedehkar ?? 0),
            credit: Number(item.credit ?? item.creditTurnover ?? item.bestankar ?? 0),
            currency: item.currency || 'ریال',
            currency2: item.currency2 || '',
            currencyDebit: Number(item.currencyDebit || 0),
            currencyCredit: Number(item.currencyCredit || 0),
            trackingNumber: item.trackingNumber || '',
            trackingDate: item.trackingDate || '',
            accountCode: item.accountCode || '',
            accountTitle: item.accountTitle || '',
            accountTitle2: item.accountTitle2 || item.description2 || '',
            accountLevel: item.accountLevel || 'general',
            docType: item.docType || 'normal',
            status: item.status || 'permanent',
            groupCode: item.groupCode || '',
            groupTitle: item.groupTitle || '',
            kolCode: item.kolCode || '',
            kolTitle: item.kolTitle || '',
            moinCode: item.moinCode || '',
            moinTitle: item.moinTitle || '',
            detailed1Code: item.detailed1Code || '',
            detailed1Title: item.detailed1Title || '',
            detailed2Code: item.detailed2Code || '',
            detailed2Title: item.detailed2Title || '',
            detailed3Code: item.detailed3Code || '',
            detailed3Title: item.detailed3Title || '',
            detailed4Code: item.detailed4Code || '',
            detailed4Title: item.detailed4Title || '',
            detailed5Code: item.detailed5Code || '',
            detailed5Title: item.detailed5Title || '',
            detailed6Code: item.detailed6Code || '',
            detailed6Title: item.detailed6Title || '',
            detailed7Code: item.detailed7Code || '',
            detailed7Title: item.detailed7Title || '',
            detailed8Code: item.detailed8Code || '',
            detailed8Title: item.detailed8Title || '',
            detailed9Code: item.detailed9Code || '',
            detailed9Title: item.detailed9Title || '',
            detailed10Code: item.detailed10Code || '',
            detailed10Title: item.detailed10Title || '',
            debitBalance: item.debitBalance,
            creditBalance: item.creditBalance,
            debitTurnover: item.debitTurnover,
            creditTurnover: item.creditTurnover,
            debitPriorTurnover: item.debitPriorTurnover,
            creditPriorTurnover: item.creditPriorTurnover,
            debitPeriodTurnover: item.debitPeriodTurnover,
            creditPeriodTurnover: item.creditPeriodTurnover,
            col1Debit: item.col1Debit,
            col1Credit: item.col1Credit,
            col2Debit: item.col2Debit,
            col2Credit: item.col2Credit,
            col3Debit: item.col3Debit,
            col3Credit: item.col3Credit,
            col4Debit: item.col4Debit,
            col4Credit: item.col4Credit,
            runningBalance: item.runningBalance,
            balanceType: item.balanceType
          }));
          setReportItems(mappedItems);
          return;
        }
      }
      setReportItems([]);
    } catch (err) {
      console.error('API report-data error:', err);
      setReportItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [
    reportNature,
    reportVariant,
    selectedAccountLevel,
    columnFormat,
    balanceType,
    fromYear,
    toYear,
    fromDate,
    toDate,
    fromMonth,
    toMonth,
    fromVoucher,
    toVoucher,
    filterYearRange,
    filterMonths,
    filterDates,
    filterVoucherNumbers,
    docAll,
    docOpening,
    docClosing,
    docNatureAdjustment,
    docProfitLoss,
    statusAll,
    statusTemporary,
    statusReviewing,
    statusReviewed,
    statusPermanent,
    priorities,
    searchQuery,
    printSeparatePages,
    includePriorBalance,
    showOpeningInSeparateCol
  ]);

  // Is Two Column Balance view active?
  const isTwoColumnBalance = reportNature === 'balance' && columnFormat === '2_column';
  // Is Four Column Balance view active?
  const isFourColumnBalance = reportNature === 'balance' && columnFormat === '4_column';
  // Is Six Column Balance view active?
  const isSixColumnBalance = reportNature === 'balance' && columnFormat === '6_column';
  // Is Eight Column Balance view active?
  const isEightColumnBalance = reportNature === 'balance' && columnFormat === '8_column';

  // Total table width calculated from current column widths
  const totalTableWidth = useMemo(() => {
    if (isTwoColumnBalance) {
      return 16 + Object.values(twoColWidths).reduce((acc, val) => acc + val, 0);
    }
    if (isFourColumnBalance) {
      return 16 + Object.values(fourColWidths).reduce((acc, val) => acc + val, 0);
    }
    if (isSixColumnBalance) {
      return 16 + Object.values(sixColWidths).reduce((acc, val) => acc + val, 0);
    }
    if (isEightColumnBalance) {
      return 16 + Object.values(eightColWidths).reduce((acc, val) => acc + val, 0);
    }
    return 16 + Object.values(ledgerWidths).reduce((acc, val) => acc + val, 0);
  }, [isTwoColumnBalance, isFourColumnBalance, isSixColumnBalance, isEightColumnBalance, twoColWidths, fourColWidths, sixColWidths, eightColWidths, ledgerWidths]);

function buildAnalyticalTree<TRow extends { hierarchyPath?: HierarchyLevel[] }>(
  rows: TRow[],
  activePriorities: string[],
  extractTotals: (r: TRow) => Partial<AnalyticalTreeNode<TRow>['totals']>
): AnalyticalTreeNode<TRow>[] {
  if (rows.length === 0) return [];

  const samplePath = rows[0]?.hierarchyPath || [];
  const groupDepth = Math.max(1, samplePath.length - 1);

  function groupRecursive(currentRows: TRow[], depth: number): AnalyticalTreeNode<TRow>[] {
    if (depth >= groupDepth) return [];

    const groupMap: Record<string, { code: string; title: string; priorityName: string; rows: TRow[] }> = {};
    currentRows.forEach(row => {
      const level = (row.hierarchyPath && row.hierarchyPath[depth]) || { code: '', title: '', priorityName: '' };
      const key = `${level.code}_${level.title}`;
      if (!groupMap[key]) {
        groupMap[key] = {
          code: level.code,
          title: level.title,
          priorityName: level.priorityName,
          rows: []
        };
      }
      groupMap[key].rows.push(row);
    });

    return Object.values(groupMap).map(group => {
      const isLeafGroup = depth === groupDepth - 1;
      const subNodes = isLeafGroup ? undefined : groupRecursive(group.rows, depth + 1);
      const leafRows = isLeafGroup ? group.rows : undefined;

      const totals = {
        debitBalance: 0, creditBalance: 0,
        debitTurnover: 0, creditTurnover: 0,
        debitPriorTurnover: 0, creditPriorTurnover: 0,
        debitPeriodTurnover: 0, creditPeriodTurnover: 0,
        col1Debit: 0, col1Credit: 0,
        col2Debit: 0, col2Credit: 0,
        col3Debit: 0, col3Credit: 0,
        col4Debit: 0, col4Credit: 0
      };

      group.rows.forEach(r => {
        const t = extractTotals(r);
        if (t.debitBalance) totals.debitBalance += t.debitBalance;
        if (t.creditBalance) totals.creditBalance += t.creditBalance;
        if (t.debitTurnover) totals.debitTurnover += t.debitTurnover;
        if (t.creditTurnover) totals.creditTurnover += t.creditTurnover;
        if (t.debitPriorTurnover) totals.debitPriorTurnover += t.debitPriorTurnover;
        if (t.creditPriorTurnover) totals.creditPriorTurnover += t.creditPriorTurnover;
        if (t.debitPeriodTurnover) totals.debitPeriodTurnover += t.debitPeriodTurnover;
        if (t.creditPeriodTurnover) totals.creditPeriodTurnover += t.creditPeriodTurnover;
        if (t.col1Debit) totals.col1Debit += t.col1Debit;
        if (t.col1Credit) totals.col1Credit += t.col1Credit;
        if (t.col2Debit) totals.col2Debit += t.col2Debit;
        if (t.col2Credit) totals.col2Credit += t.col2Credit;
        if (t.col3Debit) totals.col3Debit += t.col3Debit;
        if (t.col3Credit) totals.col3Credit += t.col3Credit;
        if (t.col4Debit) totals.col4Debit += t.col4Debit;
        if (t.col4Credit) totals.col4Credit += t.col4Credit;
      });

      return {
        levelIndex: depth,
        priorityName: group.priorityName || activePriorities[depth] || '',
        code: group.code,
        title: group.title,
        subNodes,
        rows: leafRows,
        totals
      };
    });
  }

  return groupRecursive(rows, 0);
}

  // Calculate Two Column Balance Rows
  const twoColumnBalanceRows = useMemo<TwoColumnBalanceRow[]>(() => {
    if (!isTwoColumnBalance) return [];

    const accountMap: Record<string, {
      accountCode: string;
      accountTitle: string;
      accountTitle2: string;
      parentCode?: string;
      parentTitle?: string;
      hierarchyPath?: HierarchyLevel[];
      totalDebit: number;
      totalCredit: number;
    }> = {};

    let filtered = reportItems.filter(item => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.accountCode?.toLowerCase().includes(q) ||
        item.accountTitle?.toLowerCase().includes(q) ||
        item.accountTitle2?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
      );
    });

    filtered.forEach(item => {
      let accCode = item.accountCode || '';
      let accTitle = item.accountTitle || '';
      let pCode = item.groupCode || '';
      let pTitle = item.groupTitle || '';
      let hPath: HierarchyLevel[] | undefined = undefined;

      if (reportVariant === 'analytical') {
        hPath = getItemHierarchyPath(item);
        const hasMissingReq = hPath.some(h => {
          const normP = h.priorityName.replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 1776));
          return normP.includes('تفصیلی') && (!h.code || !h.title || h.title.includes('بدون تفصیلی') || h.code === '-');
        });
        if (hasMissingReq) return;
        const leaf = hPath[hPath.length - 1];
        accCode = leaf?.code || item.accountCode || '';
        accTitle = leaf?.title || item.accountTitle || '';
        if (hPath.length > 1) {
          pCode = hPath[0]?.code || '';
          pTitle = hPath[0]?.title || '';
        }
      }

      let key = `${accCode}_${accTitle}`;
      if (reportVariant === 'analytical' && hPath && hPath.length > 0) {
        key = hPath.map(h => `${h.priorityName}_${h.code}_${h.title}`).join('->');
      }
      if (!accountMap[key]) {
        accountMap[key] = {
          accountCode: accCode,
          accountTitle: accTitle,
          accountTitle2: item.accountTitle2 || item.description2 || '-',
          parentCode: pCode,
          parentTitle: pTitle,
          hierarchyPath: hPath,
          totalDebit: 0,
          totalCredit: 0
        };
      }
      accountMap[key].totalDebit += item.debit;
      accountMap[key].totalCredit += item.credit;
    });

    const rows: TwoColumnBalanceRow[] = [];
    let rNo = 1;

    Object.values(accountMap).forEach(acc => {
      const diff = acc.totalDebit - acc.totalCredit;
      const debitBal = diff > 0 ? diff : 0;
      const creditBal = diff < 0 ? Math.abs(diff) : 0;

      if (balanceType === 'debit' && debitBal === 0) return;
      if (balanceType === 'credit' && creditBal === 0) return;
      if (balanceType === 'zero_no_balance' && (debitBal !== 0 || creditBal !== 0)) return;

      rows.push({
        rowNo: rNo++,
        accountCode: acc.accountCode,
        accountTitle: acc.accountTitle,
        accountTitle2: acc.accountTitle2,
        parentCode: acc.parentCode,
        parentTitle: acc.parentTitle,
        hierarchyPath: acc.hierarchyPath,
        debitBalance: debitBal,
        creditBalance: creditBal
      });
    });

    return rows;
  }, [isTwoColumnBalance, reportItems, searchQuery, balanceType, reportVariant, getItemHierarchyPath]);

  const grandTwoColDebit = useMemo(() => twoColumnBalanceRows.reduce((acc, r) => acc + r.debitBalance, 0), [twoColumnBalanceRows]);
  const grandTwoColCredit = useMemo(() => twoColumnBalanceRows.reduce((acc, r) => acc + r.creditBalance, 0), [twoColumnBalanceRows]);

  // Calculate Four Column Balance Rows
  const fourColumnBalanceRows = useMemo<FourColumnBalanceRow[]>(() => {
    if (!isFourColumnBalance) return [];

    const accountMap: Record<string, {
      accountCode: string;
      accountTitle: string;
      accountTitle2: string;
      parentCode?: string;
      parentTitle?: string;
      hierarchyPath?: HierarchyLevel[];
      totalDebit: number;
      totalCredit: number;
    }> = {};

    let filtered = reportItems.filter(item => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.accountCode?.toLowerCase().includes(q) ||
        item.accountTitle?.toLowerCase().includes(q) ||
        item.accountTitle2?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
      );
    });

    filtered.forEach(item => {
      let accCode = item.accountCode || '';
      let accTitle = item.accountTitle || '';
      let pCode = item.groupCode || '';
      let pTitle = item.groupTitle || '';
      let hPath: HierarchyLevel[] | undefined = undefined;

      if (reportVariant === 'analytical') {
        hPath = getItemHierarchyPath(item);
        const hasMissingReq = hPath.some(h => {
          const normP = h.priorityName.replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 1776));
          return normP.includes('تفصیلی') && (!h.code || !h.title || h.title.includes('بدون تفصیلی') || h.code === '-');
        });
        if (hasMissingReq) return;
        const leaf = hPath[hPath.length - 1];
        accCode = leaf?.code || item.accountCode || '';
        accTitle = leaf?.title || item.accountTitle || '';
        if (hPath.length > 1) {
          pCode = hPath[0]?.code || '';
          pTitle = hPath[0]?.title || '';
        }
      }

      let key = `${accCode}_${accTitle}`;
      if (reportVariant === 'analytical' && hPath && hPath.length > 0) {
        key = hPath.map(h => `${h.priorityName}_${h.code}_${h.title}`).join('->');
      }
      if (!accountMap[key]) {
        accountMap[key] = {
          accountCode: accCode,
          accountTitle: accTitle,
          accountTitle2: item.accountTitle2 || item.description2 || '-',
          parentCode: pCode,
          parentTitle: pTitle,
          hierarchyPath: hPath,
          totalDebit: 0,
          totalCredit: 0
        };
      }
      accountMap[key].totalDebit += item.debit;
      accountMap[key].totalCredit += item.credit;
    });

    const rows: FourColumnBalanceRow[] = [];
    let rNo = 1;

    Object.values(accountMap).forEach(acc => {
      const diff = acc.totalDebit - acc.totalCredit;
      const debitBal = diff > 0 ? diff : 0;
      const creditBal = diff < 0 ? Math.abs(diff) : 0;

      if (balanceType === 'debit' && debitBal === 0) return;
      if (balanceType === 'credit' && creditBal === 0) return;
      if (balanceType === 'zero_no_balance' && (debitBal !== 0 || creditBal !== 0)) return;

      rows.push({
        rowNo: rNo++,
        accountCode: acc.accountCode,
        accountTitle: acc.accountTitle,
        accountTitle2: acc.accountTitle2,
        parentCode: acc.parentCode,
        parentTitle: acc.parentTitle,
        hierarchyPath: acc.hierarchyPath,
        debitTurnover: acc.totalDebit,
        creditTurnover: acc.totalCredit,
        debitBalance: debitBal,
        creditBalance: creditBal
      });
    });

    return rows;
  }, [isFourColumnBalance, reportItems, searchQuery, balanceType, reportVariant, getItemHierarchyPath]);

  const grandFourColDebitTurnover = useMemo(() => fourColumnBalanceRows.reduce((acc, r) => acc + r.debitTurnover, 0), [fourColumnBalanceRows]);
  const grandFourColCreditTurnover = useMemo(() => fourColumnBalanceRows.reduce((acc, r) => acc + r.creditTurnover, 0), [fourColumnBalanceRows]);
  const grandFourColDebitBalance = useMemo(() => fourColumnBalanceRows.reduce((acc, r) => acc + r.debitBalance, 0), [fourColumnBalanceRows]);
  const grandFourColCreditBalance = useMemo(() => fourColumnBalanceRows.reduce((acc, r) => acc + r.creditBalance, 0), [fourColumnBalanceRows]);

  // Calculate Six Column Balance Rows
  const sixColumnBalanceRows = useMemo<SixColumnBalanceRow[]>(() => {
    if (!isSixColumnBalance) return [];

    const accountMap: Record<string, {
      accountCode: string;
      accountTitle: string;
      accountTitle2: string;
      parentCode?: string;
      parentTitle?: string;
      hierarchyPath?: HierarchyLevel[];
      debitPrior: number;
      creditPrior: number;
      debitPeriod: number;
      creditPeriod: number;
    }> = {};

    let filtered = reportItems.filter(item => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.accountCode?.toLowerCase().includes(q) ||
        item.accountTitle?.toLowerCase().includes(q) ||
        item.accountTitle2?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
      );
    });

    filtered.forEach(item => {
      let accCode = item.accountCode || '';
      let accTitle = item.accountTitle || '';
      let pCode = item.groupCode || '';
      let pTitle = item.groupTitle || '';
      let hPath: HierarchyLevel[] | undefined = undefined;

      if (reportVariant === 'analytical') {
        hPath = getItemHierarchyPath(item);
        const hasMissingReq = hPath.some(h => {
          const normP = h.priorityName.replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 1776));
          return normP.includes('تفصیلی') && (!h.code || !h.title || h.title.includes('بدون تفصیلی') || h.code === '-');
        });
        if (hasMissingReq) return;
        const leaf = hPath[hPath.length - 1];
        accCode = leaf?.code || item.accountCode || '';
        accTitle = leaf?.title || item.accountTitle || '';
        if (hPath.length > 1) {
          pCode = hPath[0]?.code || '';
          pTitle = hPath[0]?.title || '';
        }
      }

      let key = `${accCode}_${accTitle}`;
      if (reportVariant === 'analytical' && hPath && hPath.length > 0) {
        key = hPath.map(h => `${h.priorityName}_${h.code}_${h.title}`).join('->');
      }
      if (!accountMap[key]) {
        accountMap[key] = {
          accountCode: accCode,
          accountTitle: accTitle,
          accountTitle2: item.accountTitle2 || item.description2 || '-',
          parentCode: pCode,
          parentTitle: pTitle,
          hierarchyPath: hPath,
          debitPrior: 0,
          creditPrior: 0,
          debitPeriod: 0,
          creditPeriod: 0
        };
      }
      if (item.docType === 'opening') {
        accountMap[key].debitPrior += item.debit;
        accountMap[key].creditPrior += item.credit;
      } else {
        accountMap[key].debitPeriod += item.debit;
        accountMap[key].creditPeriod += item.credit;
      }
    });

    const rows: SixColumnBalanceRow[] = [];
    let rNo = 1;

    Object.values(accountMap).forEach(acc => {
      const totalDebit = acc.debitPrior + acc.debitPeriod;
      const totalCredit = acc.creditPrior + acc.creditPeriod;
      const diff = totalDebit - totalCredit;
      const debitBal = diff > 0 ? diff : 0;
      const creditBal = diff < 0 ? Math.abs(diff) : 0;

      if (balanceType === 'debit' && debitBal === 0) return;
      if (balanceType === 'credit' && creditBal === 0) return;
      if (balanceType === 'zero_no_balance' && (debitBal !== 0 || creditBal !== 0)) return;

      rows.push({
        rowNo: rNo++,
        accountCode: acc.accountCode,
        accountTitle: acc.accountTitle,
        accountTitle2: acc.accountTitle2,
        parentCode: acc.parentCode,
        parentTitle: acc.parentTitle,
        hierarchyPath: acc.hierarchyPath,
        debitPriorTurnover: acc.debitPrior,
        creditPriorTurnover: acc.creditPrior,
        debitPeriodTurnover: acc.debitPeriod,
        creditPeriodTurnover: acc.creditPeriod,
        debitBalance: debitBal,
        creditBalance: creditBal
      });
    });

    return rows;
  }, [isSixColumnBalance, reportItems, searchQuery, balanceType, reportVariant, getItemHierarchyPath]);

  const grandSixColDebitPrior = useMemo(() => sixColumnBalanceRows.reduce((acc, r) => acc + r.debitPriorTurnover, 0), [sixColumnBalanceRows]);
  const grandSixColCreditPrior = useMemo(() => sixColumnBalanceRows.reduce((acc, r) => acc + r.creditPriorTurnover, 0), [sixColumnBalanceRows]);
  const grandSixColDebitPeriod = useMemo(() => sixColumnBalanceRows.reduce((acc, r) => acc + r.debitPeriodTurnover, 0), [sixColumnBalanceRows]);
  const grandSixColCreditPeriod = useMemo(() => sixColumnBalanceRows.reduce((acc, r) => acc + r.creditPeriodTurnover, 0), [sixColumnBalanceRows]);
  const grandSixColDebitBalance = useMemo(() => sixColumnBalanceRows.reduce((acc, r) => acc + r.debitBalance, 0), [sixColumnBalanceRows]);
  const grandSixColCreditBalance = useMemo(() => sixColumnBalanceRows.reduce((acc, r) => acc + r.creditBalance, 0), [sixColumnBalanceRows]);

  // Calculate Eight Column Balance Rows
  const eightColumnBalanceRows = useMemo<EightColumnBalanceRow[]>(() => {
    if (!isEightColumnBalance) return [];

    const accountMap: Record<string, {
      accountCode: string;
      accountTitle: string;
      accountTitle2: string;
      parentCode?: string;
      parentTitle?: string;
      hierarchyPath?: HierarchyLevel[];
      debitOpening: number;
      creditOpening: number;
      debitPrior: number;
      creditPrior: number;
      debitPeriod: number;
      creditPeriod: number;
    }> = {};

    let filtered = reportItems.filter(item => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.accountCode?.toLowerCase().includes(q) ||
        item.accountTitle?.toLowerCase().includes(q) ||
        item.accountTitle2?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
      );
    });

    filtered.forEach(item => {
      let accCode = item.accountCode || '';
      let accTitle = item.accountTitle || '';
      let pCode = item.groupCode || '';
      let pTitle = item.groupTitle || '';
      let hPath: HierarchyLevel[] | undefined = undefined;

      if (reportVariant === 'analytical') {
        hPath = getItemHierarchyPath(item);
        const hasMissingReq = hPath.some(h => {
          const normP = h.priorityName.replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 1776));
          return normP.includes('تفصیلی') && (!h.code || !h.title || h.title.includes('بدون تفصیلی') || h.code === '-');
        });
        if (hasMissingReq) return;
        const leaf = hPath[hPath.length - 1];
        accCode = leaf?.code || item.accountCode || '';
        accTitle = leaf?.title || item.accountTitle || '';
        if (hPath.length > 1) {
          pCode = hPath[0]?.code || '';
          pTitle = hPath[0]?.title || '';
        }
      }

      let key = `${accCode}_${accTitle}`;
      if (reportVariant === 'analytical' && hPath && hPath.length > 0) {
        key = hPath.map(h => `${h.priorityName}_${h.code}_${h.title}`).join('->');
      }
      if (!accountMap[key]) {
        accountMap[key] = {
          accountCode: accCode,
          accountTitle: accTitle,
          accountTitle2: item.accountTitle2 || item.description2 || '-',
          parentCode: pCode,
          parentTitle: pTitle,
          hierarchyPath: hPath,
          debitOpening: 0,
          creditOpening: 0,
          debitPrior: 0,
          creditPrior: 0,
          debitPeriod: 0,
          creditPeriod: 0
        };
      }
      if (item.docType === 'opening') {
        accountMap[key].debitOpening += item.debit;
        accountMap[key].creditOpening += item.credit;
      } else {
        accountMap[key].debitPeriod += item.debit;
        accountMap[key].creditPeriod += item.credit;
      }
    });

    const rows: EightColumnBalanceRow[] = [];
    let rNo = 1;

    Object.values(accountMap).forEach(acc => {
      let c1D = 0, c1C = 0;
      let c2D = 0, c2C = 0;
      let c3D = 0, c3C = 0;
      let c4D = 0, c4C = 0;

      const totalDebit = acc.debitOpening + acc.debitPrior + acc.debitPeriod;
      const totalCredit = acc.creditOpening + acc.creditPrior + acc.creditPeriod;
      const diff = totalDebit - totalCredit;
      const debitBal = diff > 0 ? diff : 0;
      const creditBal = diff < 0 ? Math.abs(diff) : 0;

      if (showOpeningInSeparateCol) {
        c1D = acc.debitOpening;
        c1C = acc.creditOpening;
        c2D = acc.debitPrior;
        c2C = acc.creditPrior;
        c3D = acc.debitPeriod;
        c3C = acc.creditPeriod;
        c4D = debitBal;
        c4C = creditBal;
      } else {
        c1D = acc.debitOpening + acc.debitPrior;
        c1C = acc.creditOpening + acc.creditPrior;
        c2D = acc.debitPeriod;
        c2C = acc.creditPeriod;
        c3D = totalDebit;
        c3C = totalCredit;
        c4D = debitBal;
        c4C = creditBal;
      }

      if (balanceType === 'debit' && c4D === 0) return;
      if (balanceType === 'credit' && c4C === 0) return;
      if (balanceType === 'zero_no_balance' && (c4D !== 0 || c4C !== 0)) return;

      rows.push({
        rowNo: rNo++,
        accountCode: acc.accountCode,
        accountTitle: acc.accountTitle,
        accountTitle2: acc.accountTitle2,
        parentCode: acc.parentCode,
        parentTitle: acc.parentTitle,
        hierarchyPath: acc.hierarchyPath,
        col1Debit: c1D,
        col1Credit: c1C,
        col2Debit: c2D,
        col2Credit: c2C,
        col3Debit: c3D,
        col3Credit: c3C,
        col4Debit: c4D,
        col4Credit: c4C
      });
    });

    return rows;
  }, [isEightColumnBalance, reportItems, searchQuery, balanceType, showOpeningInSeparateCol, reportVariant, getItemHierarchyPath]);

  const grandEightCol1Debit = useMemo(() => eightColumnBalanceRows.reduce((acc, r) => acc + r.col1Debit, 0), [eightColumnBalanceRows]);
  const grandEightCol1Credit = useMemo(() => eightColumnBalanceRows.reduce((acc, r) => acc + r.col1Credit, 0), [eightColumnBalanceRows]);
  const grandEightCol2Debit = useMemo(() => eightColumnBalanceRows.reduce((acc, r) => acc + r.col2Debit, 0), [eightColumnBalanceRows]);
  const grandEightCol2Credit = useMemo(() => eightColumnBalanceRows.reduce((acc, r) => acc + r.col2Credit, 0), [eightColumnBalanceRows]);
  const grandEightCol3Debit = useMemo(() => eightColumnBalanceRows.reduce((acc, r) => acc + r.col3Debit, 0), [eightColumnBalanceRows]);
  const grandEightCol3Credit = useMemo(() => eightColumnBalanceRows.reduce((acc, r) => acc + r.col3Credit, 0), [eightColumnBalanceRows]);
  const grandEightCol4Debit = useMemo(() => eightColumnBalanceRows.reduce((acc, r) => acc + r.col4Debit, 0), [eightColumnBalanceRows]);
  const grandEightCol4Credit = useMemo(() => eightColumnBalanceRows.reduce((acc, r) => acc + r.col4Credit, 0), [eightColumnBalanceRows]);

  // Analytical balance grouping logic based on user priority levels
  const twoColumnAnalyticalGroups = useMemo(() => {
    if (!isTwoColumnBalance || reportVariant !== 'analytical') return [];
    return buildAnalyticalTree(
      twoColumnBalanceRows,
      activePriorities,
      r => ({ debitBalance: r.debitBalance, creditBalance: r.creditBalance })
    );
  }, [isTwoColumnBalance, reportVariant, twoColumnBalanceRows, activePriorities]);

  const fourColumnAnalyticalGroups = useMemo(() => {
    if (!isFourColumnBalance || reportVariant !== 'analytical') return [];
    return buildAnalyticalTree(
      fourColumnBalanceRows,
      activePriorities,
      r => ({
        debitTurnover: r.debitTurnover,
        creditTurnover: r.creditTurnover,
        debitBalance: r.debitBalance,
        creditBalance: r.creditBalance
      })
    );
  }, [isFourColumnBalance, reportVariant, fourColumnBalanceRows, activePriorities]);

  const sixColumnAnalyticalGroups = useMemo(() => {
    if (!isSixColumnBalance || reportVariant !== 'analytical') return [];
    return buildAnalyticalTree(
      sixColumnBalanceRows,
      activePriorities,
      r => ({
        debitPriorTurnover: r.debitPriorTurnover,
        creditPriorTurnover: r.creditPriorTurnover,
        debitPeriodTurnover: r.debitPeriodTurnover,
        creditPeriodTurnover: r.creditPeriodTurnover,
        debitBalance: r.debitBalance,
        creditBalance: r.creditBalance
      })
    );
  }, [isSixColumnBalance, reportVariant, sixColumnBalanceRows, activePriorities]);

  const eightColumnAnalyticalGroups = useMemo(() => {
    if (!isEightColumnBalance || reportVariant !== 'analytical') return [];
    return buildAnalyticalTree(
      eightColumnBalanceRows,
      activePriorities,
      r => ({
        col1Debit: r.col1Debit, col1Credit: r.col1Credit,
        col2Debit: r.col2Debit, col2Credit: r.col2Credit,
        col3Debit: r.col3Debit, col3Credit: r.col3Credit,
        col4Debit: r.col4Debit, col4Credit: r.col4Credit
      })
    );
  }, [isEightColumnBalance, reportVariant, eightColumnBalanceRows, activePriorities]);

  // Group items by Account Code & Title for Ledger view according to selected account level or priority sequence
  const groupedData = useMemo(() => {
    const groupsMap: Record<string, GroupedReportData> = {};

    let filtered = reportItems.filter(item => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.accountCode?.toLowerCase().includes(q) ||
        item.accountTitle?.toLowerCase().includes(q) ||
        item.groupCode?.toLowerCase().includes(q) ||
        item.groupTitle?.toLowerCase().includes(q) ||
        item.kolCode?.toLowerCase().includes(q) ||
        item.kolTitle?.toLowerCase().includes(q) ||
        item.moinCode?.toLowerCase().includes(q) ||
        item.moinTitle?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        String(item.voucherNumber).includes(q)
      );
    });

    if (reportVariant === 'analytical') {
      const levelTitle = `دفتر تحلیلی (${activePriorities.join(' / ')})`;

      filtered.forEach(item => {
        const hPath = getItemHierarchyPath(item);

        // If active priorities include a detailed account level, skip items missing that detailed account
        const hasMissingReq = hPath.some(h => {
          const normP = h.priorityName
            .replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 1776))
            .replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 1632));
          return normP.includes('تفصیلی') && (!h.code || !h.title || h.title.includes('بدون تفصیلی') || h.code === '-');
        });
        if (hasMissingReq) return;

        const accCode = hPath.map(h => h.code).filter(Boolean).join(' / ') || item.accountCode || '';
        const accTitle = hPath.map(h => h.title).filter(Boolean).join(' - ') || item.accountTitle || '';
        if (!accCode && !accTitle) return;

        const groupKey = `${accCode} - ${accTitle}`;

        if (!groupsMap[groupKey]) {
          groupsMap[groupKey] = {
            groupKey,
            accountCode: accCode,
            accountTitle: accTitle,
            accountLevelTitle: levelTitle,
            recordCount: 0,
            items: [],
            totalDebit: 0,
            totalCredit: 0
          };
        }
        groupsMap[groupKey].items.push(item);
        groupsMap[groupKey].recordCount += 1;
        groupsMap[groupKey].totalDebit += item.debit;
        groupsMap[groupKey].totalCredit += item.credit;
      });
    } else {
      const targetLevel = selectedAccountLevel;
      const isDetailedLevel = /تفصیلی/i.test(targetLevel);

      filtered.forEach(item => {
        const levelData = getAccountLevelData(item, targetLevel);

        // If user selected a detailed account level (e.g., 'سطح تفصیلی ۱'), skip items that have no detailed account at that level
        if (isDetailedLevel && (!levelData.code || !levelData.title || levelData.code === '-' || levelData.title.includes('بدون تفصیلی'))) {
          return;
        }

        const accCode = levelData.code || item.accountCode || '';
        const accTitle = levelData.title || item.accountTitle || '';
        if (!accCode && !accTitle) return;

        const groupKey = `${accCode} - ${accTitle}`;

        if (!groupsMap[groupKey]) {
          groupsMap[groupKey] = {
            groupKey,
            accountCode: accCode,
            accountTitle: accTitle,
            accountLevelTitle: targetLevel,
            recordCount: 0,
            items: [],
            totalDebit: 0,
            totalCredit: 0
          };
        }
        groupsMap[groupKey].items.push(item);
        groupsMap[groupKey].recordCount += 1;
        groupsMap[groupKey].totalDebit += item.debit;
        groupsMap[groupKey].totalCredit += item.credit;
      });
    }

    // Calculate running line-by-line balances (مانده در خط) for each group
    Object.values(groupsMap).forEach(group => {
      let runningRial = 0;
      let runningCurrency = 0;
      group.items.forEach(item => {
        runningRial += (item.debit || 0) - (item.credit || 0);
        runningCurrency += (item.currencyDebit || 0) - (item.currencyCredit || 0);

        item.lineDebitBalance = runningRial > 0 ? runningRial : 0;
        item.lineCreditBalance = runningRial < 0 ? Math.abs(runningRial) : 0;

        item.lineCurrencyDebitBalance = runningCurrency > 0 ? runningCurrency : 0;
        item.lineCurrencyCreditBalance = runningCurrency < 0 ? Math.abs(runningCurrency) : 0;
      });
    });

    return Object.values(groupsMap);
  }, [reportItems, searchQuery, reportVariant, selectedAccountLevel, activePriorities, getItemHierarchyPath, getAccountLevelData]);

  // Group items hierarchically for Analytical Ledger view according to priorities sequence (up to 13 levels)
  const analyticalLedgerGroups = useMemo<AnalyticalLedgerNode[]>(() => {
    if (reportNature !== 'ledger' || reportVariant !== 'analytical') return [];

    let filtered = reportItems.filter(item => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.accountCode?.toLowerCase().includes(q) ||
        item.accountTitle?.toLowerCase().includes(q) ||
        item.groupCode?.toLowerCase().includes(q) ||
        item.groupTitle?.toLowerCase().includes(q) ||
        item.kolCode?.toLowerCase().includes(q) ||
        item.kolTitle?.toLowerCase().includes(q) ||
        item.moinCode?.toLowerCase().includes(q) ||
        item.moinTitle?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        String(item.voucherNumber).includes(q)
      );
    });

    const validItems = filtered.filter(item => {
      const hPath = getItemHierarchyPath(item);
      const hasMissingReq = hPath.some(h => {
        const normP = h.priorityName
          .replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 1776))
          .replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 1632));
        return normP.includes('تفصیلی') && (!h.code || !h.title || h.title.includes('بدون تفصیلی') || h.code === '-');
      });
      return !hasMissingReq;
    });

    function buildRecursive(currentItems: ReportItem[], depth: number): AnalyticalLedgerNode[] {
      if (depth >= activePriorities.length || currentItems.length === 0) return [];

      const isLeafLevel = depth === activePriorities.length - 1;
      const groupsMap: Record<string, { code: string; title: string; priorityName: string; items: ReportItem[] }> = {};

      currentItems.forEach(item => {
        const hPath = getItemHierarchyPath(item);
        const level = hPath[depth] || { code: '', title: '', priorityName: activePriorities[depth] || '' };
        const code = level.code || '';
        const title = level.title || '';
        const priorityName = level.priorityName || activePriorities[depth] || '';
        const groupKey = `${code} - ${title}`;

        if (!groupsMap[groupKey]) {
          groupsMap[groupKey] = { code, title, priorityName, items: [] };
        }
        groupsMap[groupKey].items.push(item);
      });

      return Object.entries(groupsMap).map(([gKey, group], idx) => {
        const nodeKey = `ledger_${depth}_${group.priorityName}_${group.code}_${group.title}_${idx}`;

        if (isLeafLevel) {
          let runningRial = 0;
          let runningCurrency = 0;
          const leafItems = group.items.map(item => {
            const copy = { ...item };
            runningRial += (copy.debit || 0) - (copy.credit || 0);
            runningCurrency += (copy.currencyDebit || 0) - (copy.currencyCredit || 0);

            copy.lineDebitBalance = runningRial > 0 ? runningRial : 0;
            copy.lineCreditBalance = runningRial < 0 ? Math.abs(runningRial) : 0;
            copy.lineCurrencyDebitBalance = runningCurrency > 0 ? runningCurrency : 0;
            copy.lineCurrencyCreditBalance = runningCurrency < 0 ? Math.abs(runningCurrency) : 0;
            return copy;
          });

          const totalDebit = leafItems.reduce((acc, i) => acc + (i.debit || 0), 0);
          const totalCredit = leafItems.reduce((acc, i) => acc + (i.credit || 0), 0);

          return {
            key: nodeKey,
            levelIndex: depth,
            priorityName: group.priorityName,
            code: group.code,
            title: group.title,
            items: leafItems,
            totalDebit,
            totalCredit,
            recordCount: leafItems.length
          };
        } else {
          const subNodes = buildRecursive(group.items, depth + 1);
          const totalDebit = subNodes.reduce((acc, s) => acc + s.totalDebit, 0);
          const totalCredit = subNodes.reduce((acc, s) => acc + s.totalCredit, 0);
          const recordCount = subNodes.reduce((acc, s) => acc + s.recordCount, 0);

          return {
            key: nodeKey,
            levelIndex: depth,
            priorityName: group.priorityName,
            code: group.code,
            title: group.title,
            subNodes,
            totalDebit,
            totalCredit,
            recordCount
          };
        }
      });
    }

    return buildRecursive(validItems, 0);
  }, [reportNature, reportVariant, reportItems, searchQuery, activePriorities, getItemHierarchyPath]);

  // Expand / Collapse group rows
  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  // Grand Totals Calculation
  const grandTotalDebit = useMemo(() => reportItems.reduce((acc, curr) => acc + curr.debit, 0), [reportItems]);
  const grandTotalCredit = useMemo(() => reportItems.reduce((acc, curr) => acc + curr.credit, 0), [reportItems]);
  const grandTotalBalance = grandTotalDebit - grandTotalCredit;

  // Clear / Reset All Filters
  const handleResetFilters = () => {
    setFilterYearRange(true);
    const savedFyId = localStorage.getItem('app-fiscal-year');
    const targetFy = fiscalYearsList.find(fy => String(fy.fiscalYearID || fy.id) === String(savedFyId))
      || fiscalYearsList.find(fy => fy.isActive) 
      || fiscalYearsList[0];
    let val = '';
    if (targetFy) {
      val = String(targetFy.fiscalYearID || targetFy.id || targetFy.title);
      setFromYear(val);
      setToYear(val);
    }
    setFilterMonths(false);
    setFilterDates(false);
    setFilterVoucherNumbers(false);
    setDocAll(true);
    setDocOpening(false);
    setDocClosing(false);
    setDocNatureAdjustment(false);
    setDocProfitLoss(false);
    setStatusAll(true);
    setStatusTemporary(false);
    setStatusReviewing(false);
    setStatusReviewed(false);
    setStatusPermanent(false);
    setReportNature('balance');
    setReportVariant('simple');
    setSelectedAccountLevel('کل');
    setColumnFormat('4_column');
    setBalanceType('debit_credit_or_balance');
    setPrintSeparatePages(false);
    setIncludePriorBalance(false);
    setShowOpeningInSeparateCol(false);
    setSearchQuery('');
    setQuickLevelFilter('کل');

    handleResetToBasicLevels();

    setFromDate('');
    setToDate('');
    setFromVoucher('');
    setToVoucher('');
    setFromMonth('فروردین');
    setToMonth('اسفند');

    const defaultPriorities = ['گروه', 'کل', 'معین', ...Array(10).fill('خالی باشد')];
    
    if (val) {
      updateVoucherBounds(val, val);
    }

    loadReportData({
      filterYearRange: true,
      fromYear: val,
      toYear: val,
      filterMonths: false,
      fromMonth: 'فروردین',
      toMonth: 'اسفند',
      filterDates: false,
      fromDate: '',
      toDate: '',
      filterVoucherNumbers: false,
      fromVoucher: '',
      toVoucher: '',
      docAll: true,
      docOpening: false,
      docClosing: false,
      docNatureAdjustment: false,
      docProfitLoss: false,
      statusAll: true,
      statusTemporary: false,
      statusReviewing: false,
      statusReviewed: false,
      statusPermanent: false,
      reportNature: 'balance',
      reportVariant: 'simple',
      selectedAccountLevel: 'کل',
      columnFormat: '4_column',
      balanceType: 'debit_credit_or_balance',
      printSeparatePages: false,
      includePriorBalance: false,
      showOpeningInSeparateCol: false,
      searchQuery: '',
      priorities: defaultPriorities
    });

    showToast('تمامی فیلترها بازنشانی شدند', 'info');
  };

  // Export to Excel
  const handleExportExcel = async () => {
    try {
      let exportRows: any[] = [];
      if (isTwoColumnBalance) {
        exportRows = twoColumnBalanceRows.map(row => ({
          'ردیف': row.rowNo,
          'کد حساب': row.accountCode,
          'عنوان حساب': row.accountTitle,
          'عنوان (۲)': row.accountTitle2,
          'مانده بدهکار (ریال)': row.debitBalance,
          'مانده بستانکار (ریال)': row.creditBalance
        }));
      } else if (isFourColumnBalance) {
        exportRows = fourColumnBalanceRows.map(row => ({
          'ردیف': row.rowNo,
          'کد حساب': row.accountCode,
          'عنوان حساب': row.accountTitle,
          'عنوان (۲)': row.accountTitle2,
          'گردش بدهکار (ریال)': row.debitTurnover,
          'گردش بستانکار (ریال)': row.creditTurnover,
          'مانده بدهکار (ریال)': row.debitBalance,
          'مانده بستانکار (ریال)': row.creditBalance
        }));
      } else if (isSixColumnBalance) {
        exportRows = sixColumnBalanceRows.map(row => ({
          'ردیف': row.rowNo,
          'کد حساب': row.accountCode,
          'عنوان حساب': row.accountTitle,
          'عنوان (۲)': row.accountTitle2,
          'گردش قبل از دوره - بدهکار (ریال)': row.debitPriorTurnover,
          'گردش قبل از دوره - بستانکار (ریال)': row.creditPriorTurnover,
          'گردش طی دوره - بدهکار (ریال)': row.debitPeriodTurnover,
          'گردش طی دوره - بستانکار (ریال)': row.creditPeriodTurnover,
          'مانده تا کنون - بدهکار (ریال)': row.debitBalance,
          'مانده تا کنون - بستانکار (ریال)': row.creditBalance
        }));
      } else if (isEightColumnBalance) {
        const col1Header = showOpeningInSeparateCol ? 'گردش در سند افتتاحیه' : 'گردش قبل از دوره';
        const col2Header = showOpeningInSeparateCol ? 'گردش قبل از دوره' : 'گردش طی دوره';
        const col3Header = showOpeningInSeparateCol ? 'گردش طی دوره' : 'گردش تا کنون';
        const col4Header = 'مانده تا کنون';

        exportRows = eightColumnBalanceRows.map(row => ({
          'ردیف': row.rowNo,
          'کد حساب': row.accountCode,
          'عنوان حساب': row.accountTitle,
          'عنوان (۲)': row.accountTitle2,
          [`${col1Header} - بدهکار (ریال)`]: row.col1Debit,
          [`${col1Header} - بستانکار (ریال)`]: row.col1Credit,
          [`${col2Header} - بدهکار (ریال)`]: row.col2Debit,
          [`${col2Header} - بستانکار (ریال)`]: row.col2Credit,
          [`${col3Header} - بدهکار (ریال)`]: row.col3Debit,
          [`${col3Header} - بستانکار (ریال)`]: row.col3Credit,
          [`${col4Header} - بدهکار (ریال)`]: row.col4Debit,
          [`${col4Header} - بستانکار (ریال)`]: row.col4Credit
        }));
      } else {
        exportRows = reportItems.map(item => ({
          'کد حساب': item.accountCode,
          'عنوان حساب': item.accountTitle,
          'شماره سند': item.voucherNumber,
          'شماره عطف': item.referenceNumber,
          'شماره فرعی': item.subNumber,
          'تاریخ سند': item.voucherDate,
          'شرح': item.description,
          'بدهکار (ریال)': item.debit,
          'بستانکار (ریال)': item.credit,
          'ارز': item.currency,
          'بدهکار ارزی': item.currencyDebit,
          'بستانکار ارزی': item.currencyCredit,
          'شماره پیگیری': item.trackingNumber,
          'تاریخ پیگیری': item.trackingDate
        }));
      }
      // Dynamic import: xlsx is large; load it only when exporting.
      const XLSX = await import('xlsx');
      const ws = XLSX.utils.json_to_sheet(exportRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "گزارش تراز و دفتر");
      XLSX.writeFile(wb, isTwoColumnBalance ? "TwoColumnTrialBalanceReport.xlsx" : "TrialBalanceAndLedgerReport.xlsx");
      showToast('فایل اکسل با موفقیت دانلود شد', 'success');
    } catch (err) {
      showToast('خطا در تولید فایل اکسل', 'error');
    }
  };

  // Print Report
  const handlePrint = () => {
    window.print();
  };

  // Render Analytical Tree Nodes recursively for balance reports
  const renderTwoColumnNodes = (nodes: AnalyticalTreeNode<TwoColumnBalanceRow>[], level: number = 0): React.ReactNode => {
    return nodes.map((node, nIdx) => {
      const isTopLevel = level === 0;
      const nodeKey = `${level}_${node.priorityName}_${node.code}_${node.title}_${nIdx}`;
      const isCollapsed = !!expandedGroups[nodeKey];

      const bgHeaderClass = isTopLevel
        ? "bg-[#d5e3f0] dark:bg-slate-700/80 border-b border-gray-300 dark:border-gray-600 font-bold text-gray-900 dark:text-white select-none cursor-pointer hover:bg-blue-200/70 dark:hover:bg-slate-600/80 transition-colors"
        : "bg-blue-100/70 dark:bg-slate-700/50 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-900 dark:text-gray-100 select-none cursor-pointer hover:bg-blue-200/50 dark:hover:bg-slate-600/60 transition-colors";

      const bgSummaryClass = isTopLevel
        ? "bg-slate-200/80 dark:bg-gray-800/90 font-bold border-b-2 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 select-none"
        : "bg-gray-200/50 dark:bg-gray-800/60 font-semibold border-b border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 select-none";

      const indentPx = level * 16;

      return (
        <React.Fragment key={`${level}_${node.code}_${nIdx}`}>
          <tr className={bgHeaderClass} onClick={() => toggleGroup(nodeKey)}>
            <td className="p-0 border-l border-gray-300 dark:border-gray-700 w-4 bg-gray-200/60 dark:bg-gray-800/60 text-center align-middle">
              <span className="text-blue-700 dark:text-blue-300 inline-flex items-center justify-center">
                {isCollapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </span>
            </td>
            <td colSpan={4} className="p-1.5 px-3 text-right font-bold" style={{ paddingRight: `${12 + indentPx}px` }}>
              <div className="flex items-center gap-1.5 inline-flex select-none">
                <span className="text-blue-700 dark:text-blue-300">
                  {isCollapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </span>
                <span className="text-xs text-blue-700 dark:text-blue-300 ml-1">({node.priorityName}):</span>
                <span className="font-mono text-blue-900 dark:text-blue-300 ml-2">{node.code}</span>
                <span>{node.title}</span>
              </div>
            </td>
            <td colSpan={2} className="p-1 border-l border-gray-300 dark:border-gray-700 bg-opacity-50"></td>
          </tr>

          {!isCollapsed && (
            <>
              {node.subNodes && node.subNodes.length > 0 && renderTwoColumnNodes(node.subNodes, level + 1)}

              {node.rows && node.rows.map(row => (
                <tr
                  key={row.accountCode || row.rowNo}
                  className="border-b border-gray-200 dark:border-gray-800 hover:bg-blue-50/50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <td className="p-0 border-l border-gray-200 dark:border-gray-800 w-4 bg-gray-100/50 dark:bg-gray-800/50 text-center align-middle"></td>
                  <td style={{ width: `${twoColWidths.rowNo}px` }} className="p-1 px-2 text-center text-gray-500 border-l border-gray-200 dark:border-gray-800 truncate">
                    {row.rowNo}
                  </td>
                  <td style={{ width: `${twoColWidths.accountCode}px`, paddingRight: `${16 + (level + 1) * 12}px` }} className="p-1 px-2 font-mono border-l border-gray-200 dark:border-gray-800 font-semibold text-gray-800 dark:text-gray-200 truncate">
                    {row.accountCode}
                  </td>
                  <td style={{ width: `${twoColWidths.accountTitle}px` }} className="p-1 px-2 border-l border-gray-200 dark:border-gray-800 font-medium truncate">
                    {row.accountTitle}
                  </td>
                  <td style={{ width: `${twoColWidths.accountTitle2}px` }} className="p-1 px-2 border-l border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 truncate">
                    {row.accountTitle2}
                  </td>
                  <td style={{ width: `${twoColWidths.debitBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                    {row.debitBalance ? row.debitBalance.toLocaleString() : '0'}
                  </td>
                  <td style={{ width: `${twoColWidths.creditBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                    {row.creditBalance ? row.creditBalance.toLocaleString() : '0'}
                  </td>
                </tr>
              ))}

              <tr className={bgSummaryClass}>
                <td className="p-0 border-l border-gray-300 dark:border-gray-700 w-4 bg-gray-200/80 dark:bg-gray-800"></td>
                <td colSpan={4} className="p-1.5 px-3 text-right font-bold" style={{ paddingRight: `${12 + indentPx}px` }}>
                  <span>جمع {node.priorityName} </span>
                  <span className="font-mono text-blue-900 dark:text-blue-300 ml-1.5">{node.code}</span>
                  <span>{node.title}</span>
                </td>
                <td style={{ width: `${twoColWidths.debitBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-800 dark:text-blue-300 truncate">
                  {node.totals.debitBalance ? node.totals.debitBalance.toLocaleString() : '0'}
                </td>
                <td style={{ width: `${twoColWidths.creditBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-800 dark:text-blue-300 truncate">
                  {node.totals.creditBalance ? node.totals.creditBalance.toLocaleString() : '0'}
                </td>
              </tr>
            </>
          )}
        </React.Fragment>
      );
    });
  };

  const renderFourColumnNodes = (nodes: AnalyticalTreeNode<FourColumnBalanceRow>[], level: number = 0): React.ReactNode => {
    return nodes.map((node, nIdx) => {
      const isTopLevel = level === 0;
      const nodeKey = `${level}_${node.priorityName}_${node.code}_${node.title}_${nIdx}`;
      const isCollapsed = !!expandedGroups[nodeKey];

      const bgHeaderClass = isTopLevel
        ? "bg-[#d5e3f0] dark:bg-slate-700/80 border-b border-gray-300 dark:border-gray-600 font-bold text-gray-900 dark:text-white select-none cursor-pointer hover:bg-blue-200/70 dark:hover:bg-slate-600/80 transition-colors"
        : "bg-blue-100/70 dark:bg-slate-700/50 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-900 dark:text-gray-100 select-none cursor-pointer hover:bg-blue-200/50 dark:hover:bg-slate-600/60 transition-colors";

      const bgSummaryClass = isTopLevel
        ? "bg-slate-200/80 dark:bg-gray-800/90 font-bold border-b-2 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 select-none"
        : "bg-gray-200/50 dark:bg-gray-800/60 font-semibold border-b border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 select-none";

      const indentPx = level * 16;

      return (
        <React.Fragment key={`${level}_${node.code}_${nIdx}`}>
          <tr className={bgHeaderClass} onClick={() => toggleGroup(nodeKey)}>
            <td className="p-0 border-l border-gray-300 dark:border-gray-700 w-4 bg-gray-200/60 dark:bg-gray-800/60 text-center align-middle">
              <span className="text-blue-700 dark:text-blue-300 inline-flex items-center justify-center">
                {isCollapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </span>
            </td>
            <td colSpan={4} className="p-1.5 px-3 text-right font-bold" style={{ paddingRight: `${12 + indentPx}px` }}>
              <div className="flex items-center gap-1.5 inline-flex select-none">
                <span className="text-blue-700 dark:text-blue-300">
                  {isCollapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </span>
                <span className="text-xs text-blue-700 dark:text-blue-300 ml-1">({node.priorityName}):</span>
                <span className="font-mono text-blue-900 dark:text-blue-300 ml-2">{node.code}</span>
                <span>{node.title}</span>
              </div>
            </td>
            <td colSpan={4} className="p-1 border-l border-gray-300 dark:border-gray-700 bg-opacity-50"></td>
          </tr>

          {!isCollapsed && (
            <>
              {node.subNodes && node.subNodes.length > 0 && renderFourColumnNodes(node.subNodes, level + 1)}

              {node.rows && node.rows.map(row => (
                <tr
                  key={row.accountCode || row.rowNo}
                  className="border-b border-gray-200 dark:border-gray-800 hover:bg-blue-50/50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <td className="p-0 border-l border-gray-200 dark:border-gray-800 w-4 bg-gray-100/50 dark:bg-gray-800/50 text-center align-middle"></td>
                  <td style={{ width: `${fourColWidths.rowNo}px` }} className="p-1 px-2 text-center text-gray-500 border-l border-gray-200 dark:border-gray-800 truncate">
                    {row.rowNo}
                  </td>
                  <td style={{ width: `${fourColWidths.accountCode}px`, paddingRight: `${16 + (level + 1) * 12}px` }} className="p-1 px-2 font-mono border-l border-gray-200 dark:border-gray-800 font-semibold text-gray-800 dark:text-gray-200 truncate">
                    {row.accountCode}
                  </td>
                  <td style={{ width: `${fourColWidths.accountTitle}px` }} className="p-1 px-2 border-l border-gray-200 dark:border-gray-800 font-medium truncate">
                    {row.accountTitle}
                  </td>
                  <td style={{ width: `${fourColWidths.accountTitle2}px` }} className="p-1 px-2 border-l border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 truncate">
                    {row.accountTitle2}
                  </td>
                  <td style={{ width: `${fourColWidths.debitTurnover}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                    {row.debitTurnover ? row.debitTurnover.toLocaleString() : '0'}
                  </td>
                  <td style={{ width: `${fourColWidths.creditTurnover}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                    {row.creditTurnover ? row.creditTurnover.toLocaleString() : '0'}
                  </td>
                  <td style={{ width: `${fourColWidths.debitBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                    {row.debitBalance ? row.debitBalance.toLocaleString() : '0'}
                  </td>
                  <td style={{ width: `${fourColWidths.creditBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                    {row.creditBalance ? row.creditBalance.toLocaleString() : '0'}
                  </td>
                </tr>
              ))}

              <tr className={bgSummaryClass}>
                <td className="p-0 border-l border-gray-300 dark:border-gray-700 w-4 bg-gray-200/80 dark:bg-gray-800"></td>
                <td colSpan={4} className="p-1.5 px-3 text-right font-bold" style={{ paddingRight: `${12 + indentPx}px` }}>
                  <span>جمع {node.priorityName} </span>
                  <span className="font-mono text-blue-900 dark:text-blue-300 ml-1.5">{node.code}</span>
                  <span>{node.title}</span>
                </td>
                <td style={{ width: `${fourColWidths.debitTurnover}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-800 dark:text-blue-300 truncate">
                  {node.totals.debitTurnover ? node.totals.debitTurnover.toLocaleString() : '0'}
                </td>
                <td style={{ width: `${fourColWidths.creditTurnover}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-800 dark:text-blue-300 truncate">
                  {node.totals.creditTurnover ? node.totals.creditTurnover.toLocaleString() : '0'}
                </td>
                <td style={{ width: `${fourColWidths.debitBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-800 dark:text-blue-300 truncate">
                  {node.totals.debitBalance ? node.totals.debitBalance.toLocaleString() : '0'}
                </td>
                <td style={{ width: `${fourColWidths.creditBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-800 dark:text-blue-300 truncate">
                  {node.totals.creditBalance ? node.totals.creditBalance.toLocaleString() : '0'}
                </td>
              </tr>
            </>
          )}
        </React.Fragment>
      );
    });
  };

  const renderSixColumnNodes = (nodes: AnalyticalTreeNode<SixColumnBalanceRow>[], level: number = 0): React.ReactNode => {
    return nodes.map((node, nIdx) => {
      const isTopLevel = level === 0;
      const nodeKey = `${level}_${node.priorityName}_${node.code}_${node.title}_${nIdx}`;
      const isCollapsed = !!expandedGroups[nodeKey];

      const bgHeaderClass = isTopLevel
        ? "bg-[#d5e3f0] dark:bg-slate-700/80 border-b border-gray-300 dark:border-gray-600 font-bold text-gray-900 dark:text-white select-none cursor-pointer hover:bg-blue-200/70 dark:hover:bg-slate-600/80 transition-colors"
        : "bg-blue-100/70 dark:bg-slate-700/50 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-900 dark:text-gray-100 select-none cursor-pointer hover:bg-blue-200/50 dark:hover:bg-slate-600/60 transition-colors";

      const bgSummaryClass = isTopLevel
        ? "bg-slate-200/80 dark:bg-gray-800/90 font-bold border-b-2 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 select-none"
        : "bg-gray-200/50 dark:bg-gray-800/60 font-semibold border-b border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 select-none";

      const indentPx = level * 16;

      return (
        <React.Fragment key={`${level}_${node.code}_${nIdx}`}>
          <tr className={bgHeaderClass} onClick={() => toggleGroup(nodeKey)}>
            <td className="p-0 border-l border-gray-300 dark:border-gray-700 w-4 bg-gray-200/60 dark:bg-gray-800/60 text-center align-middle">
              <span className="text-blue-700 dark:text-blue-300 inline-flex items-center justify-center">
                {isCollapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </span>
            </td>
            <td colSpan={4} className="p-1.5 px-3 text-right font-bold" style={{ paddingRight: `${12 + indentPx}px` }}>
              <div className="flex items-center gap-1.5 inline-flex select-none">
                <span className="text-blue-700 dark:text-blue-300">
                  {isCollapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </span>
                <span className="text-xs text-blue-700 dark:text-blue-300 ml-1">({node.priorityName}):</span>
                <span className="font-mono text-blue-900 dark:text-blue-300 ml-2">{node.code}</span>
                <span>{node.title}</span>
              </div>
            </td>
            <td colSpan={6} className="p-1 border-l border-gray-300 dark:border-gray-700 bg-opacity-50"></td>
          </tr>

          {!isCollapsed && (
            <>
              {node.subNodes && node.subNodes.length > 0 && renderSixColumnNodes(node.subNodes, level + 1)}

              {node.rows && node.rows.map(row => (
                <tr
                  key={row.accountCode || row.rowNo}
                  className="border-b border-gray-200 dark:border-gray-800 hover:bg-blue-50/50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <td className="p-0 border-l border-gray-200 dark:border-gray-800 w-4 bg-gray-100/50 dark:bg-gray-800/50 text-center align-middle"></td>
                  <td style={{ width: `${sixColWidths.rowNo}px` }} className="p-1 px-2 text-center text-gray-500 border-l border-gray-200 dark:border-gray-800 truncate">
                    {row.rowNo}
                  </td>
                  <td style={{ width: `${sixColWidths.accountCode}px`, paddingRight: `${16 + (level + 1) * 12}px` }} className="p-1 px-2 font-mono border-l border-gray-200 dark:border-gray-800 font-semibold text-gray-800 dark:text-gray-200 truncate">
                    {row.accountCode}
                  </td>
                  <td style={{ width: `${sixColWidths.accountTitle}px` }} className="p-1 px-2 border-l border-gray-200 dark:border-gray-800 font-medium truncate">
                    {row.accountTitle}
                  </td>
                  <td style={{ width: `${sixColWidths.accountTitle2}px` }} className="p-1 px-2 border-l border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 truncate">
                    {row.accountTitle2}
                  </td>
                  <td style={{ width: `${sixColWidths.debitPriorTurnover}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                    {row.debitPriorTurnover ? row.debitPriorTurnover.toLocaleString() : '0'}
                  </td>
                  <td style={{ width: `${sixColWidths.creditPriorTurnover}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                    {row.creditPriorTurnover ? row.creditPriorTurnover.toLocaleString() : '0'}
                  </td>
                  <td style={{ width: `${sixColWidths.debitPeriodTurnover}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                    {row.debitPeriodTurnover ? row.debitPeriodTurnover.toLocaleString() : '0'}
                  </td>
                  <td style={{ width: `${sixColWidths.creditPeriodTurnover}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                    {row.creditPeriodTurnover ? row.creditPeriodTurnover.toLocaleString() : '0'}
                  </td>
                  <td style={{ width: `${sixColWidths.debitBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                    {row.debitBalance ? row.debitBalance.toLocaleString() : '0'}
                  </td>
                  <td style={{ width: `${sixColWidths.creditBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                    {row.creditBalance ? row.creditBalance.toLocaleString() : '0'}
                  </td>
                </tr>
              ))}

              <tr className={bgSummaryClass}>
                <td className="p-0 border-l border-gray-300 dark:border-gray-700 w-4 bg-gray-200/80 dark:bg-gray-800"></td>
                <td colSpan={4} className="p-1.5 px-3 text-right font-bold" style={{ paddingRight: `${12 + indentPx}px` }}>
                  <span>جمع {node.priorityName} </span>
                  <span className="font-mono text-blue-900 dark:text-blue-300 ml-1.5">{node.code}</span>
                  <span>{node.title}</span>
                </td>
                <td style={{ width: `${sixColWidths.debitPriorTurnover}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-800 dark:text-blue-300 truncate">
                  {node.totals.debitPriorTurnover ? node.totals.debitPriorTurnover.toLocaleString() : '0'}
                </td>
                <td style={{ width: `${sixColWidths.creditPriorTurnover}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-800 dark:text-blue-300 truncate">
                  {node.totals.creditPriorTurnover ? node.totals.creditPriorTurnover.toLocaleString() : '0'}
                </td>
                <td style={{ width: `${sixColWidths.debitPeriodTurnover}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-800 dark:text-blue-300 truncate">
                  {node.totals.debitPeriodTurnover ? node.totals.debitPeriodTurnover.toLocaleString() : '0'}
                </td>
                <td style={{ width: `${sixColWidths.creditPeriodTurnover}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-800 dark:text-blue-300 truncate">
                  {node.totals.creditPeriodTurnover ? node.totals.creditPeriodTurnover.toLocaleString() : '0'}
                </td>
                <td style={{ width: `${sixColWidths.debitBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-800 dark:text-blue-300 truncate">
                  {node.totals.debitBalance ? node.totals.debitBalance.toLocaleString() : '0'}
                </td>
                <td style={{ width: `${sixColWidths.creditBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-800 dark:text-blue-300 truncate">
                  {node.totals.creditBalance ? node.totals.creditBalance.toLocaleString() : '0'}
                </td>
              </tr>
            </>
          )}
        </React.Fragment>
      );
    });
  };

  const renderEightColumnNodes = (nodes: AnalyticalTreeNode<EightColumnBalanceRow>[], level: number = 0): React.ReactNode => {
    return nodes.map((node, nIdx) => {
      const isTopLevel = level === 0;
      const nodeKey = `${level}_${node.priorityName}_${node.code}_${node.title}_${nIdx}`;
      const isCollapsed = !!expandedGroups[nodeKey];

      const bgHeaderClass = isTopLevel
        ? "bg-[#d5e3f0] dark:bg-slate-700/80 border-b border-gray-300 dark:border-gray-600 font-bold text-gray-900 dark:text-white select-none cursor-pointer hover:bg-blue-200/70 dark:hover:bg-slate-600/80 transition-colors"
        : "bg-blue-100/70 dark:bg-slate-700/50 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-900 dark:text-gray-100 select-none cursor-pointer hover:bg-blue-200/50 dark:hover:bg-slate-600/60 transition-colors";

      const bgSummaryClass = isTopLevel
        ? "bg-slate-200/80 dark:bg-gray-800/90 font-bold border-b-2 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 select-none"
        : "bg-gray-200/50 dark:bg-gray-800/60 font-semibold border-b border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 select-none";

      const indentPx = level * 16;

      return (
        <React.Fragment key={`${level}_${node.code}_${nIdx}`}>
          <tr className={bgHeaderClass} onClick={() => toggleGroup(nodeKey)}>
            <td className="p-0 border-l border-gray-300 dark:border-gray-700 w-4 bg-gray-200/60 dark:bg-gray-800/60 text-center align-middle">
              <span className="text-blue-700 dark:text-blue-300 inline-flex items-center justify-center">
                {isCollapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </span>
            </td>
            <td colSpan={4} className="p-1.5 px-3 text-right font-bold" style={{ paddingRight: `${12 + indentPx}px` }}>
              <div className="flex items-center gap-1.5 inline-flex select-none">
                <span className="text-blue-700 dark:text-blue-300">
                  {isCollapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </span>
                <span className="text-xs text-blue-700 dark:text-blue-300 ml-1">({node.priorityName}):</span>
                <span className="font-mono text-blue-900 dark:text-blue-300 ml-2">{node.code}</span>
                <span>{node.title}</span>
              </div>
            </td>
            <td colSpan={8} className="p-1 border-l border-gray-300 dark:border-gray-700 bg-opacity-50"></td>
          </tr>

          {!isCollapsed && (
            <>
              {node.subNodes && node.subNodes.length > 0 && renderEightColumnNodes(node.subNodes, level + 1)}

              {node.rows && node.rows.map(row => (
                <tr
                  key={row.accountCode || row.rowNo}
                  className="border-b border-gray-200 dark:border-gray-800 hover:bg-blue-50/50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <td className="p-0 border-l border-gray-200 dark:border-gray-800 w-4 bg-gray-100/50 dark:bg-gray-800/50 text-center align-middle"></td>
                  <td style={{ width: `${eightColWidths.rowNo}px` }} className="p-1 px-2 text-center text-gray-500 border-l border-gray-200 dark:border-gray-800 truncate">
                    {row.rowNo}
                  </td>
                  <td style={{ width: `${eightColWidths.accountCode}px`, paddingRight: `${16 + (level + 1) * 12}px` }} className="p-1 px-2 font-mono border-l border-gray-200 dark:border-gray-800 font-semibold text-gray-800 dark:text-gray-200 truncate">
                    {row.accountCode}
                  </td>
                  <td style={{ width: `${eightColWidths.accountTitle}px` }} className="p-1 px-2 border-l border-gray-200 dark:border-gray-800 font-medium truncate">
                    {row.accountTitle}
                  </td>
                  <td style={{ width: `${eightColWidths.accountTitle2}px` }} className="p-1 px-2 border-l border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 truncate">
                    {row.accountTitle2}
                  </td>
                  <td style={{ width: `${eightColWidths.col1Debit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                    {row.col1Debit ? row.col1Debit.toLocaleString() : '0'}
                  </td>
                  <td style={{ width: `${eightColWidths.col1Credit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                    {row.col1Credit ? row.col1Credit.toLocaleString() : '0'}
                  </td>
                  <td style={{ width: `${eightColWidths.col2Debit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                    {row.col2Debit ? row.col2Debit.toLocaleString() : '0'}
                  </td>
                  <td style={{ width: `${eightColWidths.col2Credit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                    {row.col2Credit ? row.col2Credit.toLocaleString() : '0'}
                  </td>
                  <td style={{ width: `${eightColWidths.col3Debit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                    {row.col3Debit ? row.col3Debit.toLocaleString() : '0'}
                  </td>
                  <td style={{ width: `${eightColWidths.col3Credit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                    {row.col3Credit ? row.col3Credit.toLocaleString() : '0'}
                  </td>
                  <td style={{ width: `${eightColWidths.col4Debit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                    {row.col4Debit ? row.col4Debit.toLocaleString() : '0'}
                  </td>
                  <td style={{ width: `${eightColWidths.col4Credit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                    {row.col4Credit ? row.col4Credit.toLocaleString() : '0'}
                  </td>
                </tr>
              ))}

              <tr className={bgSummaryClass}>
                <td className="p-0 border-l border-gray-300 dark:border-gray-700 w-4 bg-gray-200/80 dark:bg-gray-800"></td>
                <td colSpan={4} className="p-1.5 px-3 text-right font-bold" style={{ paddingRight: `${12 + indentPx}px` }}>
                  <span>جمع {node.priorityName} </span>
                  <span className="font-mono text-blue-900 dark:text-blue-300 ml-1.5">{node.code}</span>
                  <span>{node.title}</span>
                </td>
                <td style={{ width: `${eightColWidths.col1Debit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-800 dark:text-blue-300 truncate">
                  {node.totals.col1Debit ? node.totals.col1Debit.toLocaleString() : '0'}
                </td>
                <td style={{ width: `${eightColWidths.col1Credit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-800 dark:text-blue-300 truncate">
                  {node.totals.col1Credit ? node.totals.col1Credit.toLocaleString() : '0'}
                </td>
                <td style={{ width: `${eightColWidths.col2Debit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-800 dark:text-blue-300 truncate">
                  {node.totals.col2Debit ? node.totals.col2Debit.toLocaleString() : '0'}
                </td>
                <td style={{ width: `${eightColWidths.col2Credit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-800 dark:text-blue-300 truncate">
                  {node.totals.col2Credit ? node.totals.col2Credit.toLocaleString() : '0'}
                </td>
                <td style={{ width: `${eightColWidths.col3Debit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-800 dark:text-blue-300 truncate">
                  {node.totals.col3Debit ? node.totals.col3Debit.toLocaleString() : '0'}
                </td>
                <td style={{ width: `${eightColWidths.col3Credit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-800 dark:text-blue-300 truncate">
                  {node.totals.col3Credit ? node.totals.col3Credit.toLocaleString() : '0'}
                </td>
                <td style={{ width: `${eightColWidths.col4Debit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-800 dark:text-blue-300 truncate">
                  {node.totals.col4Debit ? node.totals.col4Debit.toLocaleString() : '0'}
                </td>
                <td style={{ width: `${eightColWidths.col4Credit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-800 dark:text-blue-300 truncate">
                  {node.totals.col4Credit ? node.totals.col4Credit.toLocaleString() : '0'}
                </td>
              </tr>
            </>
          )}
        </React.Fragment>
      );
    });
  };

  // Render Analytical Tree Nodes recursively for Ledger reports
  const renderAnalyticalLedgerNodes = (nodes: AnalyticalLedgerNode[], level: number = 0): React.ReactNode => {
    return nodes.map((node, nIdx) => {
      const isTopLevel = level === 0;
      const nodeKey = node.key || `ledger_${level}_${node.priorityName}_${node.code}_${node.title}_${nIdx}`;
      const isCollapsed = !!expandedGroups[nodeKey];
      const groupBalance = node.totalDebit - node.totalCredit;

      const bgHeaderClass = isTopLevel
        ? "bg-[#d5e3f0] dark:bg-slate-700/80 hover:bg-blue-200/70 dark:hover:bg-slate-600/80 font-bold text-blue-950 dark:text-white"
        : level === 1
        ? "bg-blue-100/80 dark:bg-slate-700/60 hover:bg-blue-200/50 dark:hover:bg-slate-600/60 font-semibold text-blue-900 dark:text-blue-200"
        : "bg-blue-50/70 dark:bg-blue-900/30 hover:bg-blue-100/70 dark:hover:bg-blue-900/50 font-medium text-blue-800 dark:text-blue-300";

      return (
        <React.Fragment key={nodeKey}>
          <tr
            onClick={() => toggleGroup(nodeKey)}
            className={`${bgHeaderClass} cursor-pointer border-y border-gray-300 dark:border-gray-700 transition-colors select-none`}
          >
            <td className="p-0 border-l border-gray-200 dark:border-gray-800 w-4 bg-gray-100/50 dark:bg-gray-800/50 text-center align-middle">
              <span className="text-blue-700 dark:text-blue-300 inline-flex items-center justify-center">
                {isCollapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </span>
            </td>
            <td colSpan={7} className="p-1 px-2 border-l border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-1.5" style={{ paddingRight: `${level * 16}px` }}>
                <span className="text-blue-600 dark:text-blue-400">
                  {isCollapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </span>
                <span className="text-xs text-blue-700 dark:text-blue-300 ml-0.5">({node.priorityName}):</span>
                <span className="font-mono font-bold text-blue-900 dark:text-blue-200 ml-1">{node.code}</span>
                <span className="font-semibold">{node.title}</span>
                <span className="text-gray-500 dark:text-gray-400 text-[10px] font-normal mr-2">
                  (تعداد {node.recordCount} رکورد)
                </span>
              </div>
            </td>
            <td style={{ width: `${ledgerWidths.debit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 truncate">
              {node.totalDebit.toLocaleString()}
            </td>
            <td style={{ width: `${ledgerWidths.credit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 truncate">
              {node.totalCredit.toLocaleString()}
            </td>
            <td style={{ width: `${ledgerWidths.debitBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 truncate">
              {groupBalance > 0 ? groupBalance.toLocaleString() : '0'}
            </td>
            <td style={{ width: `${ledgerWidths.creditBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 truncate">
              {groupBalance < 0 ? Math.abs(groupBalance).toLocaleString() : '0'}
            </td>
            <td colSpan={8} className="p-1 px-2 border-l border-gray-200 dark:border-gray-800"></td>
          </tr>

          {!isCollapsed && (
            <>
              {node.subNodes && node.subNodes.length > 0 && renderAnalyticalLedgerNodes(node.subNodes, level + 1)}

              {node.items && node.items.map(item => {
                const itemIdStr = String(item.id);
                const isSelected = selectedRowIds.has(itemIdStr);
                return (
                  <tr
                    key={item.id}
                    onClick={(e) => handleRowClick(itemIdStr, item.debit || 0, item.credit || 0, e)}
                    className={`border-b border-gray-200 dark:border-gray-800 transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-100/90 dark:bg-blue-900/60 font-semibold text-blue-950 dark:text-blue-100' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                  <td className="p-0 border-l border-gray-200 dark:border-gray-800 w-4 bg-gray-100/50 dark:bg-gray-800/50 text-center align-middle"></td>
                  <td style={{ width: `${ledgerWidths.rowNo}px` }} className="p-1 px-2 text-center text-gray-500 border-l border-gray-200 dark:border-gray-800 truncate">
                    {item.rowNo}
                  </td>
                  <td style={{ width: `${ledgerWidths.voucherNumber}px` }} className="p-1 px-2 font-mono border-l border-gray-200 dark:border-gray-800 truncate">
                    {item.voucherNumber}
                  </td>
                  <td style={{ width: `${ledgerWidths.referenceNumber}px` }} className="p-1 px-2 font-mono border-l border-gray-200 dark:border-gray-800 truncate">
                    {item.referenceNumber}
                  </td>
                  <td style={{ width: `${ledgerWidths.subNumber}px` }} className="p-1 px-2 font-mono border-l border-gray-200 dark:border-gray-800 truncate">
                    {item.subNumber}
                  </td>
                  <td style={{ width: `${ledgerWidths.voucherDate}px` }} className="p-1 px-2 font-mono border-l border-gray-200 dark:border-gray-800 truncate">
                    {item.voucherDate}
                  </td>
                  <td style={{ width: `${ledgerWidths.description}px` }} className="p-1 px-2 border-l border-gray-200 dark:border-gray-800 truncate">
                    <div style={{ paddingRight: `${(level + 1) * 12}px` }}>
                      {item.description}
                    </div>
                  </td>
                  <td style={{ width: `${ledgerWidths.description2}px` }} className="p-1 px-2 border-l border-gray-200 dark:border-gray-800 truncate">
                    {item.description2}
                  </td>
                  <td style={{ width: `${ledgerWidths.debit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                    {item.debit ? item.debit.toLocaleString() : '0'}
                  </td>
                  <td style={{ width: `${ledgerWidths.credit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                    {item.credit ? item.credit.toLocaleString() : '0'}
                  </td>
                  <td style={{ width: `${ledgerWidths.debitBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                    {item.lineDebitBalance ? item.lineDebitBalance.toLocaleString() : '0'}
                  </td>
                  <td style={{ width: `${ledgerWidths.creditBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                    {item.lineCreditBalance ? item.lineCreditBalance.toLocaleString() : '0'}
                  </td>
                  <td style={{ width: `${ledgerWidths.currency}px` }} className="p-1 px-2 border-l border-gray-200 dark:border-gray-800 truncate">
                    {item.currency}
                  </td>
                  <td style={{ width: `${ledgerWidths.currency2}px` }} className="p-1 px-2 border-l border-gray-200 dark:border-gray-800 truncate">
                    {item.currency2}
                  </td>
                  <td style={{ width: `${ledgerWidths.currencyDebit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 truncate">
                    {item.currencyDebit ? item.currencyDebit.toLocaleString() : ''}
                  </td>
                  <td style={{ width: `${ledgerWidths.currencyCredit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 truncate">
                    {item.currencyCredit ? item.currencyCredit.toLocaleString() : ''}
                  </td>
                  <td style={{ width: `${ledgerWidths.currencyDebitBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 truncate">
                    {item.lineCurrencyDebitBalance ? item.lineCurrencyDebitBalance.toLocaleString() : ''}
                  </td>
                  <td style={{ width: `${ledgerWidths.currencyCreditBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 truncate">
                    {item.lineCurrencyCreditBalance ? item.lineCurrencyCreditBalance.toLocaleString() : ''}
                  </td>
                  <td style={{ width: `${ledgerWidths.trackingNumber}px` }} className="p-1 px-2 border-l border-gray-200 dark:border-gray-800 truncate">
                    {item.trackingNumber}
                  </td>
                  <td style={{ width: `${ledgerWidths.trackingDate}px` }} className="p-1 px-2 font-mono border-l border-gray-200 dark:border-gray-800 truncate">
                    {item.trackingDate}
                  </td>
                </tr>
              );
            })}
            </>
          )}
        </React.Fragment>
      );
    });
  };

  // Row selection handler
  const handleRowClick = useCallback((id: string, debit: number, credit: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRowIds(prev => {
      const next = new Set(prev);
      if (e.ctrlKey || e.metaKey) {
        if (next.has(id)) next.delete(id);
        else next.add(id);
      } else {
        if (next.has(id) && next.size === 1) {
          next.clear();
        } else {
          next.clear();
          next.add(id);
        }
      }
      return next;
    });

    setSelectedRowData(prev => ({
      ...prev,
      [id]: { debit, credit }
    }));
  }, []);

  // Calculate All Totals for report footer
  const allDebitSum = useMemo(() => {
    if (reportNature === 'ledger') return grandTotalDebit;
    if (isTwoColumnBalance) return grandTwoColDebit;
    if (isFourColumnBalance) return grandFourColDebitTurnover;
    if (isSixColumnBalance) return grandSixColDebitPeriod;
    if (isEightColumnBalance) return grandEightCol3Debit;
    return 0;
  }, [reportNature, isTwoColumnBalance, isFourColumnBalance, isSixColumnBalance, isEightColumnBalance, grandTotalDebit, grandTwoColDebit, grandFourColDebitTurnover, grandSixColDebitPeriod, grandEightCol3Debit]);

  const allCreditSum = useMemo(() => {
    if (reportNature === 'ledger') return grandTotalCredit;
    if (isTwoColumnBalance) return grandTwoColCredit;
    if (isFourColumnBalance) return grandFourColCreditTurnover;
    if (isSixColumnBalance) return grandSixColCreditPeriod;
    if (isEightColumnBalance) return grandEightCol3Credit;
    return 0;
  }, [reportNature, isTwoColumnBalance, isFourColumnBalance, isSixColumnBalance, isEightColumnBalance, grandTotalCredit, grandTwoColCredit, grandFourColCreditTurnover, grandSixColCreditPeriod, grandEightCol3Credit]);

  const allBalanceDiff = allDebitSum - allCreditSum;
  const allBalanceType = (allDebitSum === 0 && allCreditSum === 0) ? 'بی‌حساب' : allBalanceDiff > 0 ? 'بدهکار' : allBalanceDiff < 0 ? 'بستانکار' : 'بی‌حساب';

  const allTotals = useMemo(() => ({
    debit: allDebitSum,
    credit: allCreditSum,
    balance: Math.abs(allBalanceDiff),
    balanceType: allBalanceType
  }), [allDebitSum, allCreditSum, allBalanceDiff, allBalanceType]);

  // Calculate Selected Totals
  const selectedTotals = useMemo(() => {
    let debitSum = 0;
    let creditSum = 0;
    selectedRowIds.forEach(id => {
      const d = selectedRowData[id];
      if (d) {
        debitSum += d.debit || 0;
        creditSum += d.credit || 0;
      }
    });

    const diff = debitSum - creditSum;
    const balanceType = selectedRowIds.size === 0 ? 'بی‌حساب' : diff > 0 ? 'بدهکار' : diff < 0 ? 'بستانکار' : 'بی‌حساب';

    return {
      debit: debitSum,
      credit: creditSum,
      balance: Math.abs(diff),
      balanceType
    };
  }, [selectedRowIds, selectedRowData]);

  // Calculate Total Record Count
  const totalRecordCount = useMemo(() => {
    if (reportNature === 'ledger') {
      return reportItems.length;
    }
    if (isTwoColumnBalance) return twoColumnBalanceRows.length;
    if (isFourColumnBalance) return fourColumnBalanceRows.length;
    if (isSixColumnBalance) return sixColumnBalanceRows.length;
    if (isEightColumnBalance) return eightColumnBalanceRows.length;
    return 0;
  }, [reportNature, reportItems, isTwoColumnBalance, twoColumnBalanceRows, isFourColumnBalance, fourColumnBalanceRows, isSixColumnBalance, sixColumnBalanceRows, isEightColumnBalance, eightColumnBalanceRows]);

  return (
    <div id="trial-balance-ledger-report-container" className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 dir-rtl select-none transition-colors duration-200 -m-[5px]">
      
      {/* ==================== TOP ACTION HEADER BAR ==================== */}
      <div id="report-top-header" className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-slate-800 via-indigo-950 to-slate-900 text-white shadow-md border-b border-indigo-900/50">
        
        {/* Right Side: Title & Expand Toggle */}
        <div className="flex items-center gap-3">
          <button
            id="toggle-filter-panel-btn"
            onClick={() => setIsFilterPanelOpen(prev => !prev)}
            title={isFilterPanelOpen ? "پنهان کردن فیلترها" : "نمایش فیلترها"}
            className="p-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-500 text-white transition-all duration-150 shadow-sm flex items-center justify-center"
          >
            {isFilterPanelOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-base tracking-wide">گزارشات تراز و دفتر</span>
          </div>
        </div>

        {/* Left Side: Actions (Print, PDF, Excel, Clear) */}
        <div className="flex items-center gap-2">
          <button
            id="report-clear-filters-btn"
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-700/70 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors border border-slate-600/50"
            title="پاکسازی فیلترها"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>پاکسازی</span>
          </button>

          <button
            id="report-export-excel-btn"
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-700/80 hover:bg-emerald-600 text-white transition-colors border border-emerald-600/50 shadow-sm"
            title="خروجی Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>اکسل</span>
          </button>

          <button
            id="report-print-btn"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-indigo-700/80 hover:bg-indigo-600 text-white transition-colors border border-indigo-600/50 shadow-sm"
            title="چاپ گزارش"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>چاپ</span>
          </button>

          <div className="w-px h-5 bg-slate-700 mx-1" />

          {activeTab && (
            <CloseButton onClick={() => removeTab(activeTab.id)} />
          )}
        </div>
      </div>

      {/* ==================== FILTER BOXES PANEL ==================== */}
      <AnimatePresence initial={false}>
        {isFilterPanelOpen && (
          <motion.div
            id="report-filter-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700/80 shadow-inner relative z-20 overflow-visible"
          >
            <div className="p-3 space-y-3 max-w-[1700px] mx-auto text-xs">

              {/* ================= ROW 1 BOXES ================= */}
              <div id="filter-row-1" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2.5">

                {/* Box 1: محدوده اسناد (Document Scope / Year Range) */}
                <div id="filter-box-1-year-range" className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 space-y-2">
                  <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-200 pb-1 border-b border-slate-200 dark:border-slate-700">
                    <span>محدوده اسناد :</span>
                    <label className="flex items-center gap-1.5 cursor-pointer text-indigo-600 dark:text-indigo-400">
                      <input
                        id="chk-filter-year-range"
                        type="checkbox"
                        checked={filterYearRange}
                        onChange={e => setFilterYearRange(e.target.checked)}
                        className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>فیلتر شود</span>
                    </label>
                  </div>
                  <div className="space-y-1.5 pt-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-slate-500 dark:text-slate-400">از سال :</span>
                      <select
                        id="select-from-year"
                        disabled={!filterYearRange}
                        value={fromYear}
                        onChange={e => setFromYear(e.target.value)}
                        className="w-28 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 disabled:opacity-50"
                      >
                        {fiscalYearsList.map(yr => {
                          const val = String(yr.fiscalYearID || yr.id || yr.title);
                          return (
                            <option key={val} value={val}>{yr.title}</option>
                          );
                        })}
                      </select>
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-slate-500 dark:text-slate-400">تا سال :</span>
                      <select
                        id="select-to-year"
                        disabled={!filterYearRange}
                        value={toYear}
                        onChange={e => setToYear(e.target.value)}
                        className="w-28 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 disabled:opacity-50"
                      >
                        {fiscalYearsList.map(yr => {
                          const val = String(yr.fiscalYearID || yr.id || yr.title);
                          return (
                            <option key={val} value={val}>{yr.title}</option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Box 2: محدوده ماه (Month Scope) */}
                <div id="filter-box-2-month-scope" className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 space-y-2">
                  <div className="flex items-center justify-end font-semibold text-slate-700 dark:text-slate-200 pb-1 border-b border-slate-200 dark:border-slate-700">
                    <label className="flex items-center gap-1.5 cursor-pointer text-indigo-600 dark:text-indigo-400">
                      <input
                        id="chk-filter-months"
                        type="checkbox"
                        checked={filterMonths}
                        onChange={e => setFilterMonths(e.target.checked)}
                        className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>فیلتر شود</span>
                    </label>
                  </div>
                  <div className="space-y-1.5 pt-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-slate-500 dark:text-slate-400">از ماه :</span>
                      <select
                        id="select-from-month"
                        disabled={!filterMonths}
                        value={fromMonth}
                        onChange={e => setFromMonth(e.target.value)}
                        className="w-28 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 disabled:opacity-50"
                      >
                        {monthsList.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-slate-500 dark:text-slate-400">تا ماه :</span>
                      <select
                        id="select-to-month"
                        disabled={!filterMonths}
                        value={toMonth}
                        onChange={e => setToMonth(e.target.value)}
                        className="w-28 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 disabled:opacity-50"
                      >
                        {monthsList.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Box 3: محدوده تاریخ (Date Scope) */}
                <div id="filter-box-3-date-scope" className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 space-y-2">
                  <div className="flex items-center justify-end font-semibold text-slate-700 dark:text-slate-200 pb-1 border-b border-slate-200 dark:border-slate-700">
                    <label className="flex items-center gap-1.5 cursor-pointer text-indigo-600 dark:text-indigo-400">
                      <input
                        id="chk-filter-dates"
                        type="checkbox"
                        checked={filterDates}
                        onChange={e => setFilterDates(e.target.checked)}
                        className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>فیلتر شود</span>
                    </label>
                  </div>
                  <div className="space-y-1.5 pt-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-slate-500 dark:text-slate-400">از تاریخ :</span>
                      <input
                        id="input-from-date"
                        type="text"
                        disabled={!filterDates}
                        value={fromDate}
                        onChange={e => setFromDate(e.target.value)}
                        dir="ltr"
                        className="w-28 px-2 py-1 text-center rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 disabled:opacity-50"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-slate-500 dark:text-slate-400">تا تاریخ :</span>
                      <input
                        id="input-to-date"
                        type="text"
                        disabled={!filterDates}
                        value={toDate}
                        onChange={e => setToDate(e.target.value)}
                        dir="ltr"
                        className="w-28 px-2 py-1 text-center rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Box 4: محدوده شماره سند (Voucher Number Scope) */}
                <div id="filter-box-4-voucher-number" className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 space-y-2">
                  <div className="flex items-center justify-end font-semibold text-slate-700 dark:text-slate-200 pb-1 border-b border-slate-200 dark:border-slate-700">
                    <label className="flex items-center gap-1.5 cursor-pointer text-indigo-600 dark:text-indigo-400">
                      <input
                        id="chk-filter-vouchers"
                        type="checkbox"
                        checked={filterVoucherNumbers}
                        onChange={e => setFilterVoucherNumbers(e.target.checked)}
                        className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>فیلتر شود</span>
                    </label>
                  </div>
                  <div className="space-y-1.5 pt-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-slate-500 dark:text-slate-400">از سند :</span>
                      <input
                        id="input-from-voucher"
                        type="number"
                        disabled={!filterVoucherNumbers}
                        value={fromVoucher}
                        onChange={e => setFromVoucher(e.target.value)}
                        dir="ltr"
                        className="w-28 px-2 py-1 text-center rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 disabled:opacity-50"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-slate-500 dark:text-slate-400">تا سند :</span>
                      <input
                        id="input-to-voucher"
                        type="number"
                        disabled={!filterVoucherNumbers}
                        value={toVoucher}
                        onChange={e => setToVoucher(e.target.value)}
                        dir="ltr"
                        className="w-28 px-2 py-1 text-center rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Box 5: شامل اسناد (Included Document Types) */}
                <div id="filter-box-5-doc-types" className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 space-y-1.5">
                  <div className="font-semibold text-slate-700 dark:text-slate-200 pb-1 border-b border-slate-200 dark:border-slate-700">
                    شامل اسناد :
                  </div>
                  <div className="grid grid-cols-2 gap-x-1.5 gap-y-1 pt-0.5 text-[11px]">
                    <label className="flex items-center gap-1 cursor-pointer hover:text-indigo-600">
                      <input
                        id="chk-doc-all"
                        type="checkbox"
                        checked={docAll}
                        onChange={e => {
                          const val = e.target.checked;
                          setDocAll(val);
                          if (val) {
                            setDocOpening(false);
                            setDocClosing(false);
                            setDocNatureAdjustment(false);
                            setDocProfitLoss(false);
                          }
                        }}
                        className="rounded border-slate-300 dark:border-slate-600 text-indigo-600"
                      />
                      <span>کل اسناد</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer hover:text-indigo-600">
                      <input
                        id="chk-doc-opening"
                        type="checkbox"
                        checked={docOpening}
                        onChange={e => { setDocOpening(e.target.checked); setDocAll(false); }}
                        className="rounded border-slate-300 dark:border-slate-600 text-indigo-600"
                      />
                      <span>افتتاحیه</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer hover:text-indigo-600">
                      <input
                        id="chk-doc-closing"
                        type="checkbox"
                        checked={docClosing}
                        onChange={e => { setDocClosing(e.target.checked); setDocAll(false); }}
                        className="rounded border-slate-300 dark:border-slate-600 text-indigo-600"
                      />
                      <span>اختتامیه</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer hover:text-indigo-600">
                      <input
                        id="chk-doc-nature"
                        type="checkbox"
                        checked={docNatureAdjustment}
                        onChange={e => { setDocNatureAdjustment(e.target.checked); setDocAll(false); }}
                        className="rounded border-slate-300 dark:border-slate-600 text-indigo-600"
                      />
                      <span>تعدیل ماهیت</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer hover:text-indigo-600">
                      <input
                        id="chk-doc-pnl"
                        type="checkbox"
                        checked={docProfitLoss}
                        onChange={e => { setDocProfitLoss(e.target.checked); setDocAll(false); }}
                        className="rounded border-slate-300 dark:border-slate-600 text-indigo-600"
                      />
                      <span>سود و زیانی</span>
                    </label>
                  </div>
                </div>

                {/* Box 6: وضعیت سند (Voucher Status) */}
                <div id="filter-box-6-voucher-status" className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 space-y-1.5">
                  <div className="font-semibold text-slate-700 dark:text-slate-200 pb-1 border-b border-slate-200 dark:border-slate-700">
                    وضعیت سند :
                  </div>
                  <div className="grid grid-cols-2 gap-x-1.5 gap-y-1 pt-0.5 text-[11px]">
                    <label className="flex items-center gap-1 cursor-pointer hover:text-indigo-600">
                      <input
                        id="chk-status-all"
                        type="checkbox"
                        checked={statusAll}
                        onChange={e => {
                          const val = e.target.checked;
                          setStatusAll(val);
                          if (val) {
                            setStatusTemporary(false);
                            setStatusReviewing(false);
                            setStatusReviewed(false);
                            setStatusPermanent(false);
                          }
                        }}
                        className="rounded border-slate-300 dark:border-slate-600 text-indigo-600"
                      />
                      <span>کل اسناد</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer hover:text-indigo-600">
                      <input
                        id="chk-status-temporary"
                        type="checkbox"
                        checked={statusTemporary}
                        onChange={e => { setStatusTemporary(e.target.checked); setStatusAll(false); }}
                        className="rounded border-slate-300 dark:border-slate-600 text-indigo-600"
                      />
                      <span>موقت</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer hover:text-indigo-600">
                      <input
                        id="chk-status-reviewing"
                        type="checkbox"
                        checked={statusReviewing}
                        onChange={e => { setStatusReviewing(e.target.checked); setStatusAll(false); }}
                        className="rounded border-slate-300 dark:border-slate-600 text-indigo-600"
                      />
                      <span>در دست بررسی</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer hover:text-indigo-600">
                      <input
                        id="chk-status-reviewed"
                        type="checkbox"
                        checked={statusReviewed}
                        onChange={e => { setStatusReviewed(e.target.checked); setStatusAll(false); }}
                        className="rounded border-slate-300 dark:border-slate-600 text-indigo-600"
                      />
                      <span>بررسی شده</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer hover:text-indigo-600">
                      <input
                        id="chk-status-permanent"
                        type="checkbox"
                        checked={statusPermanent}
                        onChange={e => { setStatusPermanent(e.target.checked); setStatusAll(false); }}
                        className="rounded border-slate-300 dark:border-slate-600 text-indigo-600"
                      />
                      <span>دائم</span>
                    </label>
                  </div>
                </div>

              </div>

              {/* ================= ROW 2 BOXES ================= */}
              <div id="filter-row-2" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">

                {/* Box 7: ماهیت گزارش (Report Nature) */}
                <div id="filter-box-7-report-nature" className="group relative p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 space-y-2 transition-all duration-300 z-10 hover:z-20">
                  <div className="font-semibold text-slate-700 dark:text-slate-200 pb-1 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span>ماهیت گزارش :</span>
                  </div>
                  <div className="space-y-2">
                    {/* Radios 1: تراز / دفاتر */}
                    <div className="flex items-center justify-start gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                        <input
                          id="radio-nature-balance"
                          type="radio"
                          name="reportNatureGroup"
                          checked={reportNature === 'balance'}
                          onChange={() => setReportNature('balance')}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>تراز</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                        <input
                          id="radio-nature-ledger"
                          type="radio"
                          name="reportNatureGroup"
                          checked={reportNature === 'ledger'}
                          onChange={() => setReportNature('ledger')}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>دفاتر</span>
                      </label>
                    </div>

                    {/* Radios 2 & Level Dropdown: ساده / تحلیلی */}
                    <div className="flex items-center justify-start gap-3">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          id="radio-variant-simple"
                          type="radio"
                          name="reportVariantGroup"
                          checked={reportVariant === 'simple'}
                          onChange={() => setReportVariant('simple')}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>ساده</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          id="radio-variant-analytical"
                          type="radio"
                          name="reportVariantGroup"
                          checked={reportVariant === 'analytical'}
                          onChange={() => setReportVariant('analytical')}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>تحلیلی</span>
                      </label>

                      {/* Mega-Menu for Account Level selection */}
                      <MegaMenuInput
                        id="btn-select-account-level-megamenu"
                        value={selectedAccountLevel}
                        disabled={reportVariant === 'analytical'}
                        onChange={(val) => setSelectedAccountLevel(val)}
                        title="انتخاب سطح حساب"
                        searchPlaceholder="جستجو در سطوح تفصیلی..."
                        buttonClassName="min-w-[100px]"
                        popoverWidth="w-[360px] max-w-[90vw]"
                        sections={[
                          {
                            title: 'سطوح عمومی حساب',
                            items: basicAccountLevels
                              .filter(item => item !== 'خالی باشد')
                              .map(levelItem => ({
                                value: levelItem,
                                label: levelItem,
                              })),
                          },
                          {
                            title: 'سطوح تفصیلی',
                            items: detailedLevelOptions.map(dLevel => ({
                              value: dLevel,
                              label: dLevel,
                            })),
                          },
                        ]}
                      />
                    </div>
                  </div>
                </div>

                {/* Box 8: تهیه گزارش تراز به صورت (Column Format) */}
                <div id="filter-box-8-column-format" className={`p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 space-y-2 ${reportNature === 'ledger' ? 'opacity-50' : ''}`}>
                  <div className="font-semibold text-slate-700 dark:text-slate-200 pb-1 border-b border-slate-200 dark:border-slate-700">
                    تهیه گزارش تراز به صورت :
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <label className={`flex items-center gap-1.5 ${reportNature === 'ledger' ? 'cursor-not-allowed text-slate-400' : 'cursor-pointer'}`}>
                      <input
                        id="radio-col-2"
                        type="radio"
                        name="columnFormatGroup"
                        checked={columnFormat === '2_column'}
                        onChange={() => setColumnFormat('2_column')}
                        disabled={reportNature === 'ledger'}
                        className="text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed"
                      />
                      <span>دو ستونی</span>
                    </label>
                    <label className={`flex items-center gap-1.5 ${reportNature === 'ledger' ? 'cursor-not-allowed text-slate-400' : 'cursor-pointer'}`}>
                      <input
                        id="radio-col-4"
                        type="radio"
                        name="columnFormatGroup"
                        checked={columnFormat === '4_column'}
                        onChange={() => setColumnFormat('4_column')}
                        disabled={reportNature === 'ledger'}
                        className="text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed"
                      />
                      <span>چهار ستونی</span>
                    </label>
                    <label className={`flex items-center gap-1.5 ${reportNature === 'ledger' ? 'cursor-not-allowed text-slate-400' : 'cursor-pointer'}`}>
                      <input
                        id="radio-col-6"
                        type="radio"
                        name="columnFormatGroup"
                        checked={columnFormat === '6_column'}
                        onChange={() => setColumnFormat('6_column')}
                        disabled={reportNature === 'ledger'}
                        className="text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed"
                      />
                      <span>شش ستونی</span>
                    </label>
                    <label className={`flex items-center gap-1.5 ${reportNature === 'ledger' ? 'cursor-not-allowed text-slate-400' : 'cursor-pointer'}`}>
                      <input
                        id="radio-col-8"
                        type="radio"
                        name="columnFormatGroup"
                        checked={columnFormat === '8_column'}
                        onChange={() => setColumnFormat('8_column')}
                        disabled={reportNature === 'ledger'}
                        className="text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed"
                      />
                      <span>هشت ستونی</span>
                    </label>
                  </div>
                </div>

                {/* Box 9: نوع مانده (Balance Type) */}
                <div id="filter-box-9-balance-type" className={`p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 space-y-1.5 ${reportNature === 'ledger' ? 'opacity-50' : ''}`}>
                  <div className="font-semibold text-slate-700 dark:text-slate-200 pb-1 border-b border-slate-200 dark:border-slate-700">
                    نوع مانده :
                  </div>
                  <div className="space-y-1.5 pt-0.5">
                    {/* Row 1: بدهکار & بستانکار */}
                    <div className="flex items-center gap-4">
                      <label className={`flex items-center gap-1.5 ${reportNature === 'ledger' ? 'cursor-not-allowed text-slate-400' : 'cursor-pointer'}`}>
                        <input
                          id="radio-bal-debit"
                          type="radio"
                          name="balanceTypeGroup"
                          checked={balanceType === 'debit'}
                          onChange={() => setBalanceType('debit')}
                          disabled={reportNature === 'ledger'}
                          className="text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed"
                        />
                        <span>بدهکار</span>
                      </label>
                      <label className={`flex items-center gap-1.5 ${reportNature === 'ledger' ? 'cursor-not-allowed text-slate-400' : 'cursor-pointer'}`}>
                        <input
                          id="radio-bal-credit"
                          type="radio"
                          name="balanceTypeGroup"
                          checked={balanceType === 'credit'}
                          onChange={() => setBalanceType('credit')}
                          disabled={reportNature === 'ledger'}
                          className="text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed"
                        />
                        <span>بستانکار</span>
                      </label>
                    </div>

                    {/* Row 2: بدهکار/بستانکار(یا مانده) & صفر(بدون مانده) */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <label className={`flex items-center gap-1 ${reportNature === 'ledger' ? 'cursor-not-allowed text-slate-400' : 'cursor-pointer'}`}>
                        <input
                          id="radio-bal-debit-credit"
                          type="radio"
                          name="balanceTypeGroup"
                          checked={balanceType === 'debit_credit_or_balance'}
                          onChange={() => setBalanceType('debit_credit_or_balance')}
                          disabled={reportNature === 'ledger'}
                          className="text-indigo-600 focus:ring-indigo-500 shrink-0 disabled:cursor-not-allowed"
                        />
                        <span className="text-[11px] sm:text-xs whitespace-nowrap">بدهکار/بستانکار(یا مانده)</span>
                      </label>
                      <label className={`flex items-center gap-1 ${reportNature === 'ledger' ? 'cursor-not-allowed text-slate-400' : 'cursor-pointer'}`}>
                        <input
                          id="radio-bal-zero"
                          type="radio"
                          name="balanceTypeGroup"
                          checked={balanceType === 'zero_no_balance'}
                          onChange={() => setBalanceType('zero_no_balance')}
                          disabled={reportNature === 'ledger'}
                          className="text-indigo-600 focus:ring-indigo-500 shrink-0 disabled:cursor-not-allowed"
                        />
                        <span className="text-[11px] sm:text-xs whitespace-nowrap">صفر(بدون مانده)</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Box 10: سایر شرایط (Other Conditions) */}
                <div id="filter-box-10-other-conditions" className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 space-y-1.5">
                  <div className="font-semibold text-slate-700 dark:text-slate-200 pb-1 border-b border-slate-200 dark:border-slate-700">
                    سایر شرایط :
                  </div>
                  <div className="space-y-1 pt-0.5">
                    <label className={`flex items-center gap-1.5 ${(reportNature === 'ledger' || reportVariant === 'analytical') ? 'cursor-pointer hover:text-indigo-600' : 'cursor-not-allowed opacity-50 text-slate-400'}`}>
                      <input
                        id="chk-separate-pages"
                        type="checkbox"
                        checked={printSeparatePages}
                        onChange={e => setPrintSeparatePages(e.target.checked)}
                        disabled={reportNature !== 'ledger' && reportVariant !== 'analytical'}
                        className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 disabled:cursor-not-allowed"
                      />
                      <span>چاپ حساب‌ها در صفحات مجزا</span>
                    </label>
                    <label className={`flex items-center gap-1.5 ${(reportNature === 'ledger' || reportVariant === 'analytical') ? 'cursor-pointer hover:text-indigo-600' : 'cursor-not-allowed opacity-50 text-slate-400'}`}>
                      <input
                        id="chk-prior-balance"
                        type="checkbox"
                        checked={includePriorBalance}
                        onChange={e => setIncludePriorBalance(e.target.checked)}
                        disabled={reportNature !== 'ledger' && reportVariant !== 'analytical'}
                        className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 disabled:cursor-not-allowed"
                      />
                      <span>با احتساب مانده از قبل</span>
                    </label>
                    <label className={`flex items-center gap-1.5 ${reportNature !== 'ledger' ? 'cursor-pointer hover:text-indigo-600' : 'cursor-not-allowed opacity-50 text-slate-400'}`}>
                      <input
                        id="chk-opening-sep-col"
                        type="checkbox"
                        checked={showOpeningInSeparateCol}
                        onChange={e => setShowOpeningInSeparateCol(e.target.checked)}
                        disabled={reportNature === 'ledger'}
                        className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 disabled:cursor-not-allowed"
                      />
                      <span>نمایش سند افتتاحیه در ستون مجزا</span>
                    </label>
                  </div>
                </div>

                {/* Box 11: اولویت بندی سطوح حسابها در گزارش تحلیلی (Priority in Analytical Report) */}
                <div id="filter-box-11-priorities" className={`group relative p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 space-y-1.5 transition-all duration-300 z-10 hover:z-20 ${reportVariant !== 'analytical' ? 'opacity-50' : ''}`}>
                  <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-200 pb-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-xs">اولویت بندی سطوح حسابها :</span>
                  </div>

                  <div className="flex items-start gap-1.5 pt-0.5">
                    {/* Vertical Priorities Scroll Control Box (▲ / ▼ Buttons) */}
                    <div id="priorities-scroll-control-widget" className="flex flex-col items-center justify-center bg-slate-800 dark:bg-slate-900 border border-slate-700 rounded p-0.5 shrink-0 shadow-sm self-stretch" title="پیمایش بالا / پایین لیست اولویت‌ها">
                      <button
                        id="btn-scroll-priorities-up"
                        type="button"
                        onClick={handleScrollPrioritiesUp}
                        title="پیمایش به بالا (▲)"
                        className="w-5 h-5 flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-700 rounded transition-colors active:scale-95"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <div className="w-full h-px bg-slate-700 my-0.5" />
                      <button
                        id="btn-scroll-priorities-down"
                        type="button"
                        onClick={handleScrollPrioritiesDown}
                        title="پیمایش به پایین (▼)"
                        className="w-5 h-5 flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-700 rounded transition-colors active:scale-95"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Priorities Dropdown List */}
                    <div ref={prioritiesListRef} className="flex-1 space-y-1 overflow-y-auto scrollbar-thin pr-0.5 transition-all duration-300 ease-in-out max-h-[60px] group-hover:max-h-[180px]">
                      {Array.from({ length: 3 + detailedLevelsCount }).map((_, idx) => {
                        if (!isPriorityVisible(idx)) return null;
                        const levelNum = idx + 1;
                        const val = priorities[idx] || (idx === 0 ? 'گروه' : idx === 1 ? 'کل' : idx === 2 ? 'معین' : 'خالی باشد');
                        const ordinalName = getOrdinalName(levelNum);
                        const basicLevelsForThisPriority = levelNum === 1 
                          ? basicAccountLevels.filter(item => item !== 'خالی باشد')
                          : basicAccountLevels;

                        return (
                          <div key={levelNum} className="flex items-center justify-between gap-1">
                            <span className="text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                              اولویت {ordinalName}
                              {levelNum === 1 && <span className="text-red-500 font-bold mr-0.5" title="انتخاب اولویت اول اجباری است">*</span>} :
                            </span>
                            <MegaMenuInput
                              id={`btn-priority-${levelNum}-megamenu`}
                              value={val}
                              disabled={reportVariant !== 'analytical'}
                              onChange={(selectedVal) => {
                                handleSelectPriorityOption(levelNum, selectedVal);
                              }}
                              title={`مگامنو اولویت‌بندی سطوح - اولویت ${ordinalName}`}
                              searchPlaceholder="جستجو در سطوح تفصیلی..."
                              buttonClassName="w-28 h-6 px-1.5 py-0.5 text-[11px]"
                              popoverWidth="w-[360px] max-w-[90vw]"
                              align="left"
                              sections={[
                                {
                                  title: 'سطوح عمومی حساب',
                                  items: basicLevelsForThisPriority.map(levelItem => {
                                    const isDisabled = isPriorityItemDisabled(levelNum, levelItem);
                                    const tooltip = getPriorityItemTooltip(levelNum, levelItem);
                                    return {
                                      value: levelItem,
                                      label: levelItem,
                                      disabled: isDisabled,
                                      tooltip: tooltip,
                                      isSelected: val === levelItem,
                                    };
                                  }),
                                },
                                {
                                  title: 'سطوح تفصیلی',
                                  items: detailedLevelOptions.map(dLevel => {
                                    const isSelected = isOptionSelectedInPriority(val, dLevel);
                                    const isDisabled = isPriorityItemDisabled(levelNum, dLevel);
                                    const tooltip = getPriorityItemTooltip(levelNum, dLevel);
                                    return {
                                      value: dLevel,
                                      label: dLevel,
                                      disabled: isDisabled,
                                      tooltip: tooltip,
                                      showCheckbox: true,
                                      isSelected: isSelected,
                                    };
                                  }),
                                },
                              ]}
                              footerNote={
                                isAnyDetailedLevelSelected ? (
                                  <div className="text-[10px] text-amber-700 dark:text-amber-400 flex items-center justify-between gap-1.5">
                                    <span className="truncate">💡 سطح تفصیلی برای گزارش انتخاب شده است.</span>
                                    <button
                                      type="button"
                                      onClick={handleResetToBasicLevels}
                                      className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold shrink-0"
                                    >
                                      بازنشانی
                                    </button>
                                  </div>
                                ) : null
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== DATA GRID TABLE ==================== */}
      <div id="report-grid-container" className="flex-1 overflow-auto p-0 m-0 relative flex flex-col min-h-0">
        {isLoading && <LoadingOverlay message="در حال محاسبه و بارگیری گزارش تراز و دفاتر..." />}

        {reportNature === 'balance' && reportVariant === 'analytical' && (
          <div className="bg-slate-200/90 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 border-b-0 px-3 py-1.5 font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center justify-between rounded-t-sm shrink-0">
            <span>
              گزارش تراز تحلیلی {isTwoColumnBalance ? 'دو' : isFourColumnBalance ? 'چهار' : isSixColumnBalance ? 'شش' : 'هشت'} ستونی / {priorities[0] || 'کل'} / {priorities[1] || 'معین'} {priorities[2] ? `/ ${priorities[2]}` : ''}
            </span>
            <span className="text-[11px] font-normal text-slate-600 dark:text-slate-400">
              دسته‌بندی شده بر اساس اولویت‌بندی سطوح حساب‌ها
            </span>
          </div>
        )}

        <div className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-x-auto w-full flex-1 min-h-full flex flex-col justify-between">
          <table
            id="trial-balance-ledger-table"
            style={{ width: `${Math.max(totalTableWidth, 1000)}px`, minWidth: '100%', minHeight: '100%' }}
            className="text-right border-collapse text-[11px] table-fixed min-h-full h-full"
          >
            <colgroup>
              {isTwoColumnBalance ? (
                <>
                  <col style={{ width: '16px' }} />
                  <col style={{ width: `${twoColWidths.rowNo}px` }} />
                  <col style={{ width: `${twoColWidths.accountCode}px` }} />
                  <col style={{ width: `${twoColWidths.accountTitle}px` }} />
                  <col style={{ width: `${twoColWidths.accountTitle2}px` }} />
                  <col style={{ width: `${twoColWidths.debitBalance}px` }} />
                  <col style={{ width: `${twoColWidths.creditBalance}px` }} />
                </>
              ) : isFourColumnBalance ? (
                <>
                  <col style={{ width: '16px' }} />
                  <col style={{ width: `${fourColWidths.rowNo}px` }} />
                  <col style={{ width: `${fourColWidths.accountCode}px` }} />
                  <col style={{ width: `${fourColWidths.accountTitle}px` }} />
                  <col style={{ width: `${fourColWidths.accountTitle2}px` }} />
                  <col style={{ width: `${fourColWidths.debitTurnover}px` }} />
                  <col style={{ width: `${fourColWidths.creditTurnover}px` }} />
                  <col style={{ width: `${fourColWidths.debitBalance}px` }} />
                  <col style={{ width: `${fourColWidths.creditBalance}px` }} />
                </>
              ) : isSixColumnBalance ? (
                <>
                  <col style={{ width: '16px' }} />
                  <col style={{ width: `${sixColWidths.rowNo}px` }} />
                  <col style={{ width: `${sixColWidths.accountCode}px` }} />
                  <col style={{ width: `${sixColWidths.accountTitle}px` }} />
                  <col style={{ width: `${sixColWidths.accountTitle2}px` }} />
                  <col style={{ width: `${sixColWidths.debitPriorTurnover}px` }} />
                  <col style={{ width: `${sixColWidths.creditPriorTurnover}px` }} />
                  <col style={{ width: `${sixColWidths.debitPeriodTurnover}px` }} />
                  <col style={{ width: `${sixColWidths.creditPeriodTurnover}px` }} />
                  <col style={{ width: `${sixColWidths.debitBalance}px` }} />
                  <col style={{ width: `${sixColWidths.creditBalance}px` }} />
                </>
              ) : isEightColumnBalance ? (
                <>
                  <col style={{ width: '16px' }} />
                  <col style={{ width: `${eightColWidths.rowNo}px` }} />
                  <col style={{ width: `${eightColWidths.accountCode}px` }} />
                  <col style={{ width: `${eightColWidths.accountTitle}px` }} />
                  <col style={{ width: `${eightColWidths.accountTitle2}px` }} />
                  <col style={{ width: `${eightColWidths.col1Debit}px` }} />
                  <col style={{ width: `${eightColWidths.col1Credit}px` }} />
                  <col style={{ width: `${eightColWidths.col2Debit}px` }} />
                  <col style={{ width: `${eightColWidths.col2Credit}px` }} />
                  <col style={{ width: `${eightColWidths.col3Debit}px` }} />
                  <col style={{ width: `${eightColWidths.col3Credit}px` }} />
                  <col style={{ width: `${eightColWidths.col4Debit}px` }} />
                  <col style={{ width: `${eightColWidths.col4Credit}px` }} />
                </>
              ) : (
                <>
                  <col style={{ width: '16px' }} />
                  <col style={{ width: `${ledgerWidths.rowNo}px` }} />
                  <col style={{ width: `${ledgerWidths.voucherNumber}px` }} />
                  <col style={{ width: `${ledgerWidths.referenceNumber}px` }} />
                  <col style={{ width: `${ledgerWidths.subNumber}px` }} />
                  <col style={{ width: `${ledgerWidths.voucherDate}px` }} />
                  <col style={{ width: `${ledgerWidths.description}px` }} />
                  <col style={{ width: `${ledgerWidths.description2}px` }} />
                  <col style={{ width: `${ledgerWidths.debit}px` }} />
                  <col style={{ width: `${ledgerWidths.credit}px` }} />
                  <col style={{ width: `${ledgerWidths.debitBalance}px` }} />
                  <col style={{ width: `${ledgerWidths.creditBalance}px` }} />
                  <col style={{ width: `${ledgerWidths.currency}px` }} />
                  <col style={{ width: `${ledgerWidths.currency2}px` }} />
                  <col style={{ width: `${ledgerWidths.currencyDebit}px` }} />
                  <col style={{ width: `${ledgerWidths.currencyCredit}px` }} />
                  <col style={{ width: `${ledgerWidths.currencyDebitBalance}px` }} />
                  <col style={{ width: `${ledgerWidths.currencyCreditBalance}px` }} />
                  <col style={{ width: `${ledgerWidths.trackingNumber}px` }} />
                  <col style={{ width: `${ledgerWidths.trackingDate}px` }} />
                </>
              )}
            </colgroup>
            <thead className="bg-[#e4e4e4] dark:bg-gray-800 text-gray-700 dark:text-gray-200 sticky top-0 z-10 shadow-sm">
              {isTwoColumnBalance ? (
                <tr className="border-b border-gray-300 dark:border-gray-700 font-semibold select-none">
                  <th className="p-1 border-l border-gray-300 dark:border-gray-700 w-4 text-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-normal"></th>
                  
                  <th
                    style={{ width: `${twoColWidths.rowNo}px` }}
                    className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                  >
                    <span>ردیف</span>
                    <div
                      onMouseDown={(e) => handleMouseDownResize(e, 'rowNo', 'two_col')}
                      className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                      title="تغییر عرض ستون"
                    />
                  </th>

                  <th
                    style={{ width: `${twoColWidths.accountCode}px` }}
                    className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                  >
                    <span>کد حساب</span>
                    <div
                      onMouseDown={(e) => handleMouseDownResize(e, 'accountCode', 'two_col')}
                      className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                      title="تغییر عرض ستون"
                    />
                  </th>

                  <th
                    style={{ width: `${twoColWidths.accountTitle}px` }}
                    className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                  >
                    <span>عنوان حساب</span>
                    <div
                      onMouseDown={(e) => handleMouseDownResize(e, 'accountTitle', 'two_col')}
                      className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                      title="تغییر عرض ستون"
                    />
                  </th>

                  <th
                    style={{ width: `${twoColWidths.accountTitle2}px` }}
                    className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                  >
                    <span>عنوان (۲)</span>
                    <div
                      onMouseDown={(e) => handleMouseDownResize(e, 'accountTitle2', 'two_col')}
                      className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                      title="تغییر عرض ستون"
                    />
                  </th>

                  <th
                    style={{ width: `${twoColWidths.debitBalance}px` }}
                    className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-left bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                  >
                    <span>مانده بدهکار</span>
                    <div
                      onMouseDown={(e) => handleMouseDownResize(e, 'debitBalance', 'two_col')}
                      className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                      title="تغییر عرض ستون"
                    />
                  </th>

                  <th
                    style={{ width: `${twoColWidths.creditBalance}px` }}
                    className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-left bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                  >
                    <span>مانده بستانکار</span>
                    <div
                      onMouseDown={(e) => handleMouseDownResize(e, 'creditBalance', 'two_col')}
                      className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                      title="تغییر عرض ستون"
                    />
                  </th>
                </tr>
              ) : isFourColumnBalance ? (
                <>
                  <tr className="border-b border-gray-300 dark:border-gray-700 font-semibold select-none">
                    <th rowSpan={2} className="p-1 border-l border-gray-300 dark:border-gray-700 w-4 text-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-normal"></th>
                    
                    <th
                      rowSpan={2}
                      style={{ width: `${fourColWidths.rowNo}px` }}
                      className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate align-middle"
                    >
                      <span>ردیف</span>
                      <div
                        onMouseDown={(e) => handleMouseDownResize(e, 'rowNo', 'four_col')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                        title="تغییر عرض ستون"
                      />
                    </th>

                    <th
                      rowSpan={2}
                      style={{ width: `${fourColWidths.accountCode}px` }}
                      className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate align-middle"
                    >
                      <span>کد حساب</span>
                      <div
                        onMouseDown={(e) => handleMouseDownResize(e, 'accountCode', 'four_col')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                        title="تغییر عرض ستون"
                      />
                    </th>

                    <th
                      rowSpan={2}
                      style={{ width: `${fourColWidths.accountTitle}px` }}
                      className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate align-middle"
                    >
                      <span>عنوان حساب</span>
                      <div
                        onMouseDown={(e) => handleMouseDownResize(e, 'accountTitle', 'four_col')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                        title="تغییر عرض ستون"
                      />
                    </th>

                    <th
                      rowSpan={2}
                      style={{ width: `${fourColWidths.accountTitle2}px` }}
                      className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate align-middle"
                    >
                      <span>عنوان (۲)</span>
                      <div
                        onMouseDown={(e) => handleMouseDownResize(e, 'accountTitle2', 'four_col')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                        title="تغییر عرض ستون"
                      />
                    </th>

                    <th
                      colSpan={2}
                      className="relative p-1 px-2 border-l border-b border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-bold underline decoration-gray-400 dark:decoration-gray-500 underline-offset-4"
                    >
                      <span>گردش طی دوره</span>
                      <div
                        onMouseDown={(e) => handleMouseDownResizeGroup(e, ['debitTurnover', 'creditTurnover'], 'four_col')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                        title="تغییر عرض گروه ستون"
                      />
                    </th>

                    <th
                      colSpan={2}
                      className="relative p-1 px-2 border-l border-b border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-bold underline decoration-gray-400 dark:decoration-gray-500 underline-offset-4"
                    >
                      <span>مانده طی دوره</span>
                      <div
                        onMouseDown={(e) => handleMouseDownResizeGroup(e, ['debitBalance', 'creditBalance'], 'four_col')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                        title="تغییر عرض گروه ستون"
                      />
                    </th>
                  </tr>
                  <tr className="border-b border-gray-300 dark:border-gray-700 font-semibold select-none">
                    <th
                      style={{ width: `${fourColWidths.debitTurnover}px` }}
                      className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                    >
                      <span>بدهکار</span>
                      <div
                        onMouseDown={(e) => handleMouseDownResize(e, 'debitTurnover', 'four_col')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                        title="تغییر عرض ستون"
                      />
                    </th>

                    <th
                      style={{ width: `${fourColWidths.creditTurnover}px` }}
                      className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                    >
                      <span>بستانکار</span>
                      <div
                        onMouseDown={(e) => handleMouseDownResize(e, 'creditTurnover', 'four_col')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                        title="تغییر عرض ستون"
                      />
                    </th>

                    <th
                      style={{ width: `${fourColWidths.debitBalance}px` }}
                      className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                    >
                      <span>بدهکار</span>
                      <div
                        onMouseDown={(e) => handleMouseDownResize(e, 'debitBalance', 'four_col')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                        title="تغییر عرض ستون"
                      />
                    </th>

                    <th
                      style={{ width: `${fourColWidths.creditBalance}px` }}
                      className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                    >
                      <span>بستانکار</span>
                      <div
                        onMouseDown={(e) => handleMouseDownResize(e, 'creditBalance', 'four_col')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                        title="تغییر عرض ستون"
                      />
                    </th>
                  </tr>
                </>
              ) : isSixColumnBalance ? (
                <>
                  <tr className="border-b border-gray-300 dark:border-gray-700 font-semibold select-none">
                    <th rowSpan={2} className="p-1 border-l border-gray-300 dark:border-gray-700 w-4 text-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-normal"></th>
                    
                    <th
                      rowSpan={2}
                      style={{ width: `${sixColWidths.rowNo}px` }}
                      className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate align-middle"
                    >
                      <span>ردیف</span>
                      <div
                        onMouseDown={(e) => handleMouseDownResize(e, 'rowNo', 'six_col')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                        title="تغییر عرض ستون"
                      />
                    </th>

                    <th
                      rowSpan={2}
                      style={{ width: `${sixColWidths.accountCode}px` }}
                      className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate align-middle"
                    >
                      <span>کد حساب</span>
                      <div
                        onMouseDown={(e) => handleMouseDownResize(e, 'accountCode', 'six_col')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                        title="تغییر عرض ستون"
                      />
                    </th>

                    <th
                      rowSpan={2}
                      style={{ width: `${sixColWidths.accountTitle}px` }}
                      className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate align-middle"
                    >
                      <span>عنوان حساب</span>
                      <div
                        onMouseDown={(e) => handleMouseDownResize(e, 'accountTitle', 'six_col')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                        title="تغییر عرض ستون"
                      />
                    </th>

                    <th
                      rowSpan={2}
                      style={{ width: `${sixColWidths.accountTitle2}px` }}
                      className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate align-middle"
                    >
                      <span>عنوان (۲)</span>
                      <div
                        onMouseDown={(e) => handleMouseDownResize(e, 'accountTitle2', 'six_col')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                        title="تغییر عرض ستون"
                      />
                    </th>

                    <th
                      colSpan={2}
                      className="relative p-1 px-2 border-l border-b border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-bold"
                    >
                      <span>گردش قبل از دوره</span>
                      <div
                        onMouseDown={(e) => handleMouseDownResizeGroup(e, ['debitPriorTurnover', 'creditPriorTurnover'], 'six_col')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                        title="تغییر عرض گروه ستون"
                      />
                    </th>

                    <th
                      colSpan={2}
                      className="relative p-1 px-2 border-l border-b border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-bold"
                    >
                      <span>گردش طی دوره</span>
                      <div
                        onMouseDown={(e) => handleMouseDownResizeGroup(e, ['debitPeriodTurnover', 'creditPeriodTurnover'], 'six_col')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                        title="تغییر عرض گروه ستون"
                      />
                    </th>

                    <th
                      colSpan={2}
                      className="relative p-1 px-2 border-l border-b border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-bold"
                    >
                      <span>مانده تا کنون</span>
                      <div
                        onMouseDown={(e) => handleMouseDownResizeGroup(e, ['debitBalance', 'creditBalance'], 'six_col')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                        title="تغییر عرض گروه ستون"
                      />
                    </th>
                  </tr>

                  <tr className="border-b border-gray-300 dark:border-gray-700 font-semibold select-none">
                    <th
                      style={{ width: `${sixColWidths.debitPriorTurnover}px` }}
                      className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                    >
                      <span>بدهکار</span>
                      <div
                        onMouseDown={(e) => handleMouseDownResize(e, 'debitPriorTurnover', 'six_col')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                        title="تغییر عرض ستون"
                      />
                    </th>

                    <th
                      style={{ width: `${sixColWidths.creditPriorTurnover}px` }}
                      className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                    >
                      <span>بستانکار</span>
                      <div
                        onMouseDown={(e) => handleMouseDownResize(e, 'creditPriorTurnover', 'six_col')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                        title="تغییر عرض ستون"
                      />
                    </th>

                    <th
                      style={{ width: `${sixColWidths.debitPeriodTurnover}px` }}
                      className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                    >
                      <span>بدهکار</span>
                      <div
                        onMouseDown={(e) => handleMouseDownResize(e, 'debitPeriodTurnover', 'six_col')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                        title="تغییر عرض ستون"
                      />
                    </th>

                    <th
                      style={{ width: `${sixColWidths.creditPeriodTurnover}px` }}
                      className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                    >
                      <span>بستانکار</span>
                      <div
                        onMouseDown={(e) => handleMouseDownResize(e, 'creditPeriodTurnover', 'six_col')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                        title="تغییر عرض ستون"
                      />
                    </th>

                    <th
                      style={{ width: `${sixColWidths.debitBalance}px` }}
                      className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                    >
                      <span>بدهکار</span>
                      <div
                        onMouseDown={(e) => handleMouseDownResize(e, 'debitBalance', 'six_col')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                        title="تغییر عرض ستون"
                      />
                    </th>

                    <th
                      style={{ width: `${sixColWidths.creditBalance}px` }}
                      className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                    >
                      <span>بستانکار</span>
                      <div
                        onMouseDown={(e) => handleMouseDownResize(e, 'creditBalance', 'six_col')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                        title="تغییر عرض ستون"
                      />
                    </th>
                  </tr>
                </>
              ) : isEightColumnBalance ? (
                <>
                  <tr className="border-b border-gray-300 dark:border-gray-700 font-semibold select-none">
                    <th rowSpan={2} className="p-1 border-l border-gray-300 dark:border-gray-700 w-4 text-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-normal"></th>
                    
                    <th
                      rowSpan={2}
                      style={{ width: `${eightColWidths.rowNo}px` }}
                      className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate align-middle"
                    >
                      <span>ردیف</span>
                      <div
                        onMouseDown={(e) => handleMouseDownResize(e, 'rowNo', 'eight_col')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                        title="تغییر عرض ستون"
                      />
                    </th>

                    <th
                      rowSpan={2}
                      style={{ width: `${eightColWidths.accountCode}px` }}
                      className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate align-middle"
                    >
                      <span>کد حساب</span>
                      <div
                        onMouseDown={(e) => handleMouseDownResize(e, 'accountCode', 'eight_col')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                        title="تغییر عرض ستون"
                      />
                    </th>

                    <th
                      rowSpan={2}
                      style={{ width: `${eightColWidths.accountTitle}px` }}
                      className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate align-middle"
                    >
                      <span>عنوان حساب</span>
                      <div
                        onMouseDown={(e) => handleMouseDownResize(e, 'accountTitle', 'eight_col')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                        title="تغییر عرض ستون"
                      />
                    </th>

                    <th
                      rowSpan={2}
                      style={{ width: `${eightColWidths.accountTitle2}px` }}
                      className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate align-middle"
                    >
                      <span>عنوان (۲)</span>
                      <div
                        onMouseDown={(e) => handleMouseDownResize(e, 'accountTitle2', 'eight_col')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                        title="تغییر عرض ستون"
                      />
                    </th>

                    <th
                      colSpan={2}
                      className="p-1 px-2 border-l border-b border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-bold"
                    >
                      {showOpeningInSeparateCol ? 'گردش در سند افتتاحیه' : 'گردش قبل از دوره'}
                    </th>

                    <th
                      colSpan={2}
                      className="p-1 px-2 border-l border-b border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-bold"
                    >
                      {showOpeningInSeparateCol ? 'گردش قبل از دوره' : 'گردش طی دوره'}
                    </th>

                    <th
                      colSpan={2}
                      className="p-1 px-2 border-l border-b border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-bold"
                    >
                      {showOpeningInSeparateCol ? 'گردش طی دوره' : 'گردش تا کنون'}
                    </th>

                    <th
                      colSpan={2}
                      className="p-1 px-2 border-l border-b border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-bold"
                    >
                      مانده تا کنون
                    </th>
                  </tr>

                  <tr className="border-b border-gray-300 dark:border-gray-700 font-semibold select-none">
                    <th
                      style={{ width: `${eightColWidths.col1Debit}px` }}
                      className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                    >
                      <span>بدهکار</span>
                      <div
                        onMouseDown={(e) => handleMouseDownResize(e, 'col1Debit', 'eight_col')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                        title="تغییر عرض ستون"
                      />
                    </th>

                    <th
                      style={{ width: `${eightColWidths.col1Credit}px` }}
                      className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                    >
                      <span>بستانکار</span>
                      <div
                        onMouseDown={(e) => handleMouseDownResize(e, 'col1Credit', 'eight_col')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                        title="تغییر عرض ستون"
                      />
                    </th>

                    <th
                      style={{ width: `${eightColWidths.col2Debit}px` }}
                      className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                    >
                      <span>بدهکار</span>
                      <div
                        onMouseDown={(e) => handleMouseDownResize(e, 'col2Debit', 'eight_col')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                        title="تغییر عرض ستون"
                      />
                    </th>

                    <th
                      style={{ width: `${eightColWidths.col2Credit}px` }}
                      className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                    >
                      <span>بستانکار</span>
                      <div
                        onMouseDown={(e) => handleMouseDownResize(e, 'col2Credit', 'eight_col')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                        title="تغییر عرض ستون"
                      />
                    </th>

                    <th
                      style={{ width: `${eightColWidths.col3Debit}px` }}
                      className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                    >
                      <span>بدهکار</span>
                      <div
                        onMouseDown={(e) => handleMouseDownResize(e, 'col3Debit', 'eight_col')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                        title="تغییر عرض ستون"
                      />
                    </th>

                    <th
                      style={{ width: `${eightColWidths.col3Credit}px` }}
                      className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                    >
                      <span>بستانکار</span>
                      <div
                        onMouseDown={(e) => handleMouseDownResize(e, 'col3Credit', 'eight_col')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                        title="تغییر عرض ستون"
                      />
                    </th>

                    <th
                      style={{ width: `${eightColWidths.col4Debit}px` }}
                      className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                    >
                      <span>بدهکار</span>
                      <div
                        onMouseDown={(e) => handleMouseDownResize(e, 'col4Debit', 'eight_col')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                        title="تغییر عرض ستون"
                      />
                    </th>

                    <th
                      style={{ width: `${eightColWidths.col4Credit}px` }}
                      className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                    >
                      <span>بستانکار</span>
                      <div
                        onMouseDown={(e) => handleMouseDownResize(e, 'col4Credit', 'eight_col')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                        title="تغییر عرض ستون"
                      />
                    </th>
                  </tr>
                </>
              ) : (
                <tr className="border-b border-gray-300 dark:border-gray-700 font-semibold select-none">
                  <th className="p-1 border-l border-gray-300 dark:border-gray-700 w-4 text-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-normal"></th>
                  
                  <th
                    style={{ width: `${ledgerWidths.rowNo}px` }}
                    className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                  >
                    <span>ردیف</span>
                    <div
                      onMouseDown={(e) => handleMouseDownResize(e, 'rowNo', false)}
                      className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                      title="تغییر عرض ستون"
                    />
                  </th>

                  <th
                    style={{ width: `${ledgerWidths.voucherNumber}px` }}
                    className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                  >
                    <span>شماره سند</span>
                    <div
                      onMouseDown={(e) => handleMouseDownResize(e, 'voucherNumber', false)}
                      className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                      title="تغییر عرض ستون"
                    />
                  </th>

                  <th
                    style={{ width: `${ledgerWidths.referenceNumber}px` }}
                    className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                  >
                    <span>شماره عطف</span>
                    <div
                      onMouseDown={(e) => handleMouseDownResize(e, 'referenceNumber', false)}
                      className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                      title="تغییر عرض ستون"
                    />
                  </th>

                  <th
                    style={{ width: `${ledgerWidths.subNumber}px` }}
                    className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                  >
                    <span>شماره فرعی</span>
                    <div
                      onMouseDown={(e) => handleMouseDownResize(e, 'subNumber', false)}
                      className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                      title="تغییر عرض ستون"
                    />
                  </th>

                  <th
                    style={{ width: `${ledgerWidths.voucherDate}px` }}
                    className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                  >
                    <span>تاریخ سند</span>
                    <div
                      onMouseDown={(e) => handleMouseDownResize(e, 'voucherDate', false)}
                      className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                      title="تغییر عرض ستون"
                    />
                  </th>

                  <th
                    style={{ width: `${ledgerWidths.description}px` }}
                    className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                  >
                    <span>شرح</span>
                    <div
                      onMouseDown={(e) => handleMouseDownResize(e, 'description', false)}
                      className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                      title="تغییر عرض ستون"
                    />
                  </th>

                  <th
                    style={{ width: `${ledgerWidths.description2}px` }}
                    className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                  >
                    <span>شرح (۲)</span>
                    <div
                      onMouseDown={(e) => handleMouseDownResize(e, 'description2', false)}
                      className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                      title="تغییر عرض ستون"
                    />
                  </th>

                  <th
                    style={{ width: `${ledgerWidths.debit}px` }}
                    className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-left bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                  >
                    <span>بدهکار</span>
                    <div
                      onMouseDown={(e) => handleMouseDownResize(e, 'debit', false)}
                      className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                      title="تغییر عرض ستون"
                    />
                  </th>

                  <th
                    style={{ width: `${ledgerWidths.credit}px` }}
                    className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-left bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                  >
                    <span>بستانکار</span>
                    <div
                      onMouseDown={(e) => handleMouseDownResize(e, 'credit', false)}
                      className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                      title="تغییر عرض ستون"
                    />
                  </th>

                  <th
                    style={{ width: `${ledgerWidths.debitBalance}px` }}
                    className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-left bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                  >
                    <span>مانده بدهکار</span>
                    <div
                      onMouseDown={(e) => handleMouseDownResize(e, 'debitBalance', false)}
                      className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                      title="تغییر عرض ستون"
                    />
                  </th>

                  <th
                    style={{ width: `${ledgerWidths.creditBalance}px` }}
                    className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-left bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                  >
                    <span>مانده بستانکار</span>
                    <div
                      onMouseDown={(e) => handleMouseDownResize(e, 'creditBalance', false)}
                      className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                      title="تغییر عرض ستون"
                    />
                  </th>

                  <th
                    style={{ width: `${ledgerWidths.currency}px` }}
                    className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                  >
                    <span>ارز</span>
                    <div
                      onMouseDown={(e) => handleMouseDownResize(e, 'currency', false)}
                      className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                      title="تغییر عرض ستون"
                    />
                  </th>

                  <th
                    style={{ width: `${ledgerWidths.currency2}px` }}
                    className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                  >
                    <span>ارز (۲)</span>
                    <div
                      onMouseDown={(e) => handleMouseDownResize(e, 'currency2', false)}
                      className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                      title="تغییر عرض ستون"
                    />
                  </th>

                  <th
                    style={{ width: `${ledgerWidths.currencyDebit}px` }}
                    className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-left bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                  >
                    <span>بدهکار ارزی</span>
                    <div
                      onMouseDown={(e) => handleMouseDownResize(e, 'currencyDebit', false)}
                      className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                      title="تغییر عرض ستون"
                    />
                  </th>

                  <th
                    style={{ width: `${ledgerWidths.currencyCredit}px` }}
                    className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-left bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                  >
                    <span>بستانکار ارزی</span>
                    <div
                      onMouseDown={(e) => handleMouseDownResize(e, 'currencyCredit', false)}
                      className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                      title="تغییر عرض ستون"
                    />
                  </th>

                  <th
                    style={{ width: `${ledgerWidths.currencyDebitBalance}px` }}
                    className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-left bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                  >
                    <span>مانده بدهکار ارزی</span>
                    <div
                      onMouseDown={(e) => handleMouseDownResize(e, 'currencyDebitBalance', false)}
                      className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                      title="تغییر عرض ستون"
                    />
                  </th>

                  <th
                    style={{ width: `${ledgerWidths.currencyCreditBalance}px` }}
                    className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-left bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                  >
                    <span>مانده بستانکار ارزی</span>
                    <div
                      onMouseDown={(e) => handleMouseDownResize(e, 'currencyCreditBalance', false)}
                      className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                      title="تغییر عرض ستون"
                    />
                  </th>

                  <th
                    style={{ width: `${ledgerWidths.trackingNumber}px` }}
                    className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                  >
                    <span>شماره پیگیری</span>
                    <div
                      onMouseDown={(e) => handleMouseDownResize(e, 'trackingNumber', false)}
                      className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                      title="تغییر عرض ستون"
                    />
                  </th>

                  <th
                    style={{ width: `${ledgerWidths.trackingDate}px` }}
                    className="relative p-1 px-2 border-l border-gray-300 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold truncate"
                  >
                    <span>تاریخ پیگیری</span>
                    <div
                      onMouseDown={(e) => handleMouseDownResize(e, 'trackingDate', false)}
                      className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
                      title="تغییر عرض ستون"
                    />
                  </th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {isTwoColumnBalance ? (
                reportVariant === 'analytical' ? (
                  twoColumnAnalyticalGroups.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400 dark:text-gray-500 text-xs select-none">
                        {emptyStateMessage}
                      </td>
                    </tr>
                  ) : (
                    renderTwoColumnNodes(twoColumnAnalyticalGroups)
                  )
                ) : twoColumnBalanceRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400 dark:text-gray-500 text-xs select-none">
                      {emptyStateMessage}
                    </td>
                  </tr>
                ) : (
                  twoColumnBalanceRows.map(row => (
                    <tr
                      key={row.accountCode || row.rowNo}
                      className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <td className="p-0 border-l border-gray-200 dark:border-gray-800 w-4 bg-gray-100/50 dark:bg-gray-800/50 text-center align-middle"></td>
                      <td style={{ width: `${twoColWidths.rowNo}px` }} className="p-1 px-2 text-center text-gray-500 border-l border-gray-200 dark:border-gray-800 truncate">
                        {row.rowNo}
                      </td>
                      <td style={{ width: `${twoColWidths.accountCode}px` }} className="p-1 px-2 font-mono border-l border-gray-200 dark:border-gray-800 font-semibold text-gray-800 dark:text-gray-200 truncate">
                        {row.accountCode}
                      </td>
                      <td style={{ width: `${twoColWidths.accountTitle}px` }} className="p-1 px-2 border-l border-gray-200 dark:border-gray-800 font-medium truncate">
                        {row.accountTitle}
                      </td>
                      <td style={{ width: `${twoColWidths.accountTitle2}px` }} className="p-1 px-2 border-l border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 truncate">
                        {row.accountTitle2}
                      </td>
                      <td style={{ width: `${twoColWidths.debitBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                        {row.debitBalance ? row.debitBalance.toLocaleString() : '0'}
                      </td>
                      <td style={{ width: `${twoColWidths.creditBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                        {row.creditBalance ? row.creditBalance.toLocaleString() : '0'}
                      </td>
                    </tr>
                  ))
                )
              ) : isFourColumnBalance ? (
                reportVariant === 'analytical' ? (
                  fourColumnAnalyticalGroups.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-gray-400 dark:text-gray-500 text-xs select-none">
                        {emptyStateMessage}
                      </td>
                    </tr>
                  ) : (
                    renderFourColumnNodes(fourColumnAnalyticalGroups)
                  )
                ) : fourColumnBalanceRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-400 dark:text-gray-500 text-xs select-none">
                      {emptyStateMessage}
                    </td>
                  </tr>
                ) : (
                  fourColumnBalanceRows.map(row => (
                    <tr
                      key={row.accountCode || row.rowNo}
                      className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <td className="p-0 border-l border-gray-200 dark:border-gray-800 w-4 bg-gray-100/50 dark:bg-gray-800/50 text-center align-middle"></td>
                      <td style={{ width: `${fourColWidths.rowNo}px` }} className="p-1 px-2 text-center text-gray-500 border-l border-gray-200 dark:border-gray-800 truncate">
                        {row.rowNo}
                      </td>
                      <td style={{ width: `${fourColWidths.accountCode}px` }} className="p-1 px-2 font-mono border-l border-gray-200 dark:border-gray-800 font-semibold text-gray-800 dark:text-gray-200 truncate">
                        {row.accountCode}
                      </td>
                      <td style={{ width: `${fourColWidths.accountTitle}px` }} className="p-1 px-2 border-l border-gray-200 dark:border-gray-800 font-medium truncate">
                        {row.accountTitle}
                      </td>
                      <td style={{ width: `${fourColWidths.accountTitle2}px` }} className="p-1 px-2 border-l border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 truncate">
                        {row.accountTitle2}
                      </td>
                      <td style={{ width: `${fourColWidths.debitTurnover}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                        {row.debitTurnover ? row.debitTurnover.toLocaleString() : '0'}
                      </td>
                      <td style={{ width: `${fourColWidths.creditTurnover}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                        {row.creditTurnover ? row.creditTurnover.toLocaleString() : '0'}
                      </td>
                      <td style={{ width: `${fourColWidths.debitBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                        {row.debitBalance ? row.debitBalance.toLocaleString() : '0'}
                      </td>
                      <td style={{ width: `${fourColWidths.creditBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                        {row.creditBalance ? row.creditBalance.toLocaleString() : '0'}
                      </td>
                    </tr>
                  ))
                )
              ) : isSixColumnBalance ? (
                reportVariant === 'analytical' ? (
                  sixColumnAnalyticalGroups.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-gray-400 dark:text-gray-500 text-xs select-none">
                        {emptyStateMessage}
                      </td>
                    </tr>
                  ) : (
                    renderSixColumnNodes(sixColumnAnalyticalGroups)
                  )
                ) : sixColumnBalanceRows.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="p-8 text-center text-gray-400 dark:text-gray-500 text-xs select-none">
                      {emptyStateMessage}
                    </td>
                  </tr>
                ) : (
                  sixColumnBalanceRows.map(row => (
                    <tr
                      key={row.accountCode || row.rowNo}
                      className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <td className="p-0 border-l border-gray-200 dark:border-gray-800 w-4 bg-gray-100/50 dark:bg-gray-800/50 text-center align-middle"></td>
                      <td style={{ width: `${sixColWidths.rowNo}px` }} className="p-1 px-2 text-center text-gray-500 border-l border-gray-200 dark:border-gray-800 truncate">
                        {row.rowNo}
                      </td>
                      <td style={{ width: `${sixColWidths.accountCode}px` }} className="p-1 px-2 font-mono border-l border-gray-200 dark:border-gray-800 font-semibold text-gray-800 dark:text-gray-200 truncate">
                        {row.accountCode}
                      </td>
                      <td style={{ width: `${sixColWidths.accountTitle}px` }} className="p-1 px-2 border-l border-gray-200 dark:border-gray-800 font-medium truncate">
                        {row.accountTitle}
                      </td>
                      <td style={{ width: `${sixColWidths.accountTitle2}px` }} className="p-1 px-2 border-l border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 truncate">
                        {row.accountTitle2}
                      </td>
                      <td style={{ width: `${sixColWidths.debitPriorTurnover}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                        {row.debitPriorTurnover ? row.debitPriorTurnover.toLocaleString() : '0'}
                      </td>
                      <td style={{ width: `${sixColWidths.creditPriorTurnover}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                        {row.creditPriorTurnover ? row.creditPriorTurnover.toLocaleString() : '0'}
                      </td>
                      <td style={{ width: `${sixColWidths.debitPeriodTurnover}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                        {row.debitPeriodTurnover ? row.debitPeriodTurnover.toLocaleString() : '0'}
                      </td>
                      <td style={{ width: `${sixColWidths.creditPeriodTurnover}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                        {row.creditPeriodTurnover ? row.creditPeriodTurnover.toLocaleString() : '0'}
                      </td>
                      <td style={{ width: `${sixColWidths.debitBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                        {row.debitBalance ? row.debitBalance.toLocaleString() : '0'}
                      </td>
                      <td style={{ width: `${sixColWidths.creditBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                        {row.creditBalance ? row.creditBalance.toLocaleString() : '0'}
                      </td>
                    </tr>
                  ))
                )
              ) : isEightColumnBalance ? (
                reportVariant === 'analytical' ? (
                  eightColumnAnalyticalGroups.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="p-8 text-center text-gray-400 dark:text-gray-500 text-xs select-none">
                        {emptyStateMessage}
                      </td>
                    </tr>
                  ) : (
                    renderEightColumnNodes(eightColumnAnalyticalGroups)
                  )
                ) : eightColumnBalanceRows.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="p-8 text-center text-gray-400 dark:text-gray-500 text-xs select-none">
                      {emptyStateMessage}
                    </td>
                  </tr>
                ) : (
                  eightColumnBalanceRows.map(row => (
                    <tr
                      key={row.accountCode || row.rowNo}
                      className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <td className="p-0 border-l border-gray-200 dark:border-gray-800 w-4 bg-gray-100/50 dark:bg-gray-800/50 text-center align-middle"></td>
                      <td style={{ width: `${eightColWidths.rowNo}px` }} className="p-1 px-2 text-center text-gray-500 border-l border-gray-200 dark:border-gray-800 truncate">
                        {row.rowNo}
                      </td>
                      <td style={{ width: `${eightColWidths.accountCode}px` }} className="p-1 px-2 font-mono border-l border-gray-200 dark:border-gray-800 font-semibold text-gray-800 dark:text-gray-200 truncate">
                        {row.accountCode}
                      </td>
                      <td style={{ width: `${eightColWidths.accountTitle}px` }} className="p-1 px-2 border-l border-gray-200 dark:border-gray-800 font-medium truncate">
                        {row.accountTitle}
                      </td>
                      <td style={{ width: `${eightColWidths.accountTitle2}px` }} className="p-1 px-2 border-l border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 truncate">
                        {row.accountTitle2}
                      </td>
                      <td style={{ width: `${eightColWidths.col1Debit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                        {row.col1Debit ? row.col1Debit.toLocaleString() : '0'}
                      </td>
                      <td style={{ width: `${eightColWidths.col1Credit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                        {row.col1Credit ? row.col1Credit.toLocaleString() : '0'}
                      </td>
                      <td style={{ width: `${eightColWidths.col2Debit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                        {row.col2Debit ? row.col2Debit.toLocaleString() : '0'}
                      </td>
                      <td style={{ width: `${eightColWidths.col2Credit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                        {row.col2Credit ? row.col2Credit.toLocaleString() : '0'}
                      </td>
                      <td style={{ width: `${eightColWidths.col3Debit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                        {row.col3Debit ? row.col3Debit.toLocaleString() : '0'}
                      </td>
                      <td style={{ width: `${eightColWidths.col3Credit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                        {row.col3Credit ? row.col3Credit.toLocaleString() : '0'}
                      </td>
                      <td style={{ width: `${eightColWidths.col4Debit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                        {row.col4Debit ? row.col4Debit.toLocaleString() : '0'}
                      </td>
                      <td style={{ width: `${eightColWidths.col4Credit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                        {row.col4Credit ? row.col4Credit.toLocaleString() : '0'}
                      </td>
                    </tr>
                  ))
                )
              ) : reportVariant === 'analytical' ? (
                analyticalLedgerGroups.length === 0 ? (
                  <tr>
                    <td colSpan={20} className="p-8 text-center text-gray-400 dark:text-gray-500 text-xs select-none">
                      {emptyStateMessage}
                    </td>
                  </tr>
                ) : (
                  renderAnalyticalLedgerNodes(analyticalLedgerGroups)
                )
              ) : groupedData.length === 0 ? (
                <tr>
                  <td colSpan={20} className="p-8 text-center text-gray-400 dark:text-gray-500 text-xs select-none">
                    {emptyStateMessage}
                  </td>
                </tr>
              ) : (
                groupedData.map((group, groupIdx) => {
                  const isCollapsed = expandedGroups[group.groupKey];
                  const groupBalance = group.totalDebit - group.totalCredit;
                  return (
                    <React.Fragment key={group.groupKey}>
                      
                      {/* Hierarchical Group Header Row (Matching TabCellRow group style) */}
                      <tr
                        onClick={() => toggleGroup(group.groupKey)}
                        className="bg-blue-50/70 dark:bg-blue-900/30 hover:bg-blue-100/70 dark:hover:bg-blue-900/50 font-semibold text-blue-900 dark:text-blue-200 cursor-pointer border-y border-gray-300 dark:border-gray-700 transition-colors"
                      >
                        <td className="p-0 border-l border-gray-200 dark:border-gray-800 w-4 bg-gray-100/50 dark:bg-gray-800/50 text-center align-middle"></td>
                        <td colSpan={7} className="p-1 px-2 border-l border-gray-200 dark:border-gray-800">
                          <div className="flex items-center gap-2">
                            <span className="text-blue-600 dark:text-blue-400">
                              {isCollapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </span>
                            <span>{group.accountLevelTitle}: {group.groupKey}</span>
                            <span className="text-gray-500 dark:text-gray-400 text-[10px] font-normal">
                              (تعداد {group.recordCount} رکورد)
                            </span>
                          </div>
                        </td>
                        <td style={{ width: `${ledgerWidths.debit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 truncate">
                          {group.totalDebit.toLocaleString()}
                        </td>
                        <td style={{ width: `${ledgerWidths.credit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 truncate">
                          {group.totalCredit.toLocaleString()}
                        </td>
                        <td style={{ width: `${ledgerWidths.debitBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 truncate">
                          {groupBalance > 0 ? groupBalance.toLocaleString() : '0'}
                        </td>
                        <td style={{ width: `${ledgerWidths.creditBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 truncate">
                          {groupBalance < 0 ? Math.abs(groupBalance).toLocaleString() : '0'}
                        </td>
                        <td colSpan={8} className="p-1 px-2 border-l border-gray-200 dark:border-gray-800"></td>
                      </tr>

                      {/* Items under this group */}
                      {!isCollapsed && group.items.map((item, itemIdx) => (
                        <tr
                          key={item.id}
                          className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 transition-colors"
                        >
                          <td className="p-0 border-l border-gray-200 dark:border-gray-800 w-4 bg-gray-100/50 dark:bg-gray-800/50 text-center align-middle"></td>
                          <td style={{ width: `${ledgerWidths.rowNo}px` }} className="p-1 px-2 text-center text-gray-500 border-l border-gray-200 dark:border-gray-800 truncate">
                            {item.rowNo}
                          </td>
                          <td style={{ width: `${ledgerWidths.voucherNumber}px` }} className="p-1 px-2 font-mono border-l border-gray-200 dark:border-gray-800 truncate">
                            {item.voucherNumber}
                          </td>
                          <td style={{ width: `${ledgerWidths.referenceNumber}px` }} className="p-1 px-2 font-mono border-l border-gray-200 dark:border-gray-800 truncate">
                            {item.referenceNumber}
                          </td>
                          <td style={{ width: `${ledgerWidths.subNumber}px` }} className="p-1 px-2 font-mono border-l border-gray-200 dark:border-gray-800 truncate">
                            {item.subNumber}
                          </td>
                          <td style={{ width: `${ledgerWidths.voucherDate}px` }} className="p-1 px-2 font-mono border-l border-gray-200 dark:border-gray-800 truncate">
                            {item.voucherDate}
                          </td>
                          <td style={{ width: `${ledgerWidths.description}px` }} className="p-1 px-2 border-l border-gray-200 dark:border-gray-800 truncate">
                            {item.description}
                          </td>
                          <td style={{ width: `${ledgerWidths.description2}px` }} className="p-1 px-2 border-l border-gray-200 dark:border-gray-800 truncate">
                            {item.description2}
                          </td>
                          <td style={{ width: `${ledgerWidths.debit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                            {item.debit ? item.debit.toLocaleString() : '0'}
                          </td>
                          <td style={{ width: `${ledgerWidths.credit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                            {item.credit ? item.credit.toLocaleString() : '0'}
                          </td>
                          <td style={{ width: `${ledgerWidths.debitBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                            {item.lineDebitBalance ? item.lineDebitBalance.toLocaleString() : '0'}
                          </td>
                          <td style={{ width: `${ledgerWidths.creditBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 truncate">
                            {item.lineCreditBalance ? item.lineCreditBalance.toLocaleString() : '0'}
                          </td>
                          <td style={{ width: `${ledgerWidths.currency}px` }} className="p-1 px-2 border-l border-gray-200 dark:border-gray-800 truncate">
                            {item.currency}
                          </td>
                          <td style={{ width: `${ledgerWidths.currency2}px` }} className="p-1 px-2 border-l border-gray-200 dark:border-gray-800 truncate">
                            {item.currency2}
                          </td>
                          <td style={{ width: `${ledgerWidths.currencyDebit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 truncate">
                            {item.currencyDebit ? item.currencyDebit.toLocaleString() : ''}
                          </td>
                          <td style={{ width: `${ledgerWidths.currencyCredit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 truncate">
                            {item.currencyCredit ? item.currencyCredit.toLocaleString() : ''}
                          </td>
                          <td style={{ width: `${ledgerWidths.currencyDebitBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 truncate">
                            {item.lineCurrencyDebitBalance ? item.lineCurrencyDebitBalance.toLocaleString() : ''}
                          </td>
                          <td style={{ width: `${ledgerWidths.currencyCreditBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-200 dark:border-gray-800 truncate">
                            {item.lineCurrencyCreditBalance ? item.lineCurrencyCreditBalance.toLocaleString() : ''}
                          </td>
                          <td style={{ width: `${ledgerWidths.trackingNumber}px` }} className="p-1 px-2 border-l border-gray-200 dark:border-gray-800 truncate">
                            {item.trackingNumber}
                          </td>
                          <td style={{ width: `${ledgerWidths.trackingDate}px` }} className="p-1 px-2 font-mono border-l border-gray-200 dark:border-gray-800 truncate">
                            {item.trackingDate}
                          </td>
                        </tr>
                      ))}

                    </React.Fragment>
                  );
                })
              )}
              {/* Empty spacer row to fill vertical space so data rows keep normal height */}
              <tr className="h-full">
                <td
                  colSpan={
                    isTwoColumnBalance
                      ? 7
                      : isFourColumnBalance
                      ? 9
                      : isSixColumnBalance
                      ? 11
                      : isEightColumnBalance
                      ? 13
                      : 20
                  }
                  className="p-0 border-0 pointer-events-none"
                ></td>
              </tr>
            </tbody>
            
            {/* Grand Summary Footer */}
            {isTwoColumnBalance ? (
              twoColumnBalanceRows.length > 0 && (
                <tfoot className="bg-[#e4e4e4] dark:bg-gray-800 text-gray-700 dark:text-gray-200 sticky bottom-0 z-20 shadow-[0_-1px_2px_rgba(0,0,0,0.05)] border-t border-gray-300 dark:border-gray-700 font-bold border-b-2">
                  <tr>
                    <td className="p-1 border-l border-gray-300 dark:border-gray-700 w-4 text-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-normal"></td>
                    <td colSpan={4} className="p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-left">
                      جمع کل :
                    </td>
                    <td style={{ width: `${twoColWidths.debitBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-700 dark:text-blue-400 truncate">
                      {grandTwoColDebit.toLocaleString()}
                    </td>
                    <td style={{ width: `${twoColWidths.creditBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-700 dark:text-blue-400 truncate">
                      {grandTwoColCredit.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              )
            ) : isFourColumnBalance ? (
              fourColumnBalanceRows.length > 0 && (
                <tfoot className="bg-[#e4e4e4] dark:bg-gray-800 text-gray-700 dark:text-gray-200 sticky bottom-0 z-20 shadow-[0_-1px_2px_rgba(0,0,0,0.05)] border-t border-gray-300 dark:border-gray-700 font-bold border-b-2">
                  <tr>
                    <td className="p-1 border-l border-gray-300 dark:border-gray-700 w-4 text-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-normal"></td>
                    <td colSpan={4} className="p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-left">
                      جمع کل :
                    </td>
                    <td style={{ width: `${fourColWidths.debitTurnover}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-700 dark:text-blue-400 truncate">
                      {grandFourColDebitTurnover.toLocaleString()}
                    </td>
                    <td style={{ width: `${fourColWidths.creditTurnover}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-700 dark:text-blue-400 truncate">
                      {grandFourColCreditTurnover.toLocaleString()}
                    </td>
                    <td style={{ width: `${fourColWidths.debitBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-700 dark:text-blue-400 truncate">
                      {grandFourColDebitBalance.toLocaleString()}
                    </td>
                    <td style={{ width: `${fourColWidths.creditBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-700 dark:text-blue-400 truncate">
                      {grandFourColCreditBalance.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              )
            ) : isSixColumnBalance ? (
              sixColumnBalanceRows.length > 0 && (
                <tfoot className="bg-[#e4e4e4] dark:bg-gray-800 text-gray-700 dark:text-gray-200 sticky bottom-0 z-20 shadow-[0_-1px_2px_rgba(0,0,0,0.05)] border-t border-gray-300 dark:border-gray-700 font-bold border-b-2">
                  <tr>
                    <td className="p-1 border-l border-gray-300 dark:border-gray-700 w-4 text-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-normal"></td>
                    <td colSpan={4} className="p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-left">
                      جمع کل :
                    </td>
                    <td style={{ width: `${sixColWidths.debitPriorTurnover}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-700 dark:text-blue-400 truncate">
                      {grandSixColDebitPrior.toLocaleString()}
                    </td>
                    <td style={{ width: `${sixColWidths.creditPriorTurnover}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-700 dark:text-blue-400 truncate">
                      {grandSixColCreditPrior.toLocaleString()}
                    </td>
                    <td style={{ width: `${sixColWidths.debitPeriodTurnover}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-700 dark:text-blue-400 truncate">
                      {grandSixColDebitPeriod.toLocaleString()}
                    </td>
                    <td style={{ width: `${sixColWidths.creditPeriodTurnover}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-700 dark:text-blue-400 truncate">
                      {grandSixColCreditPeriod.toLocaleString()}
                    </td>
                    <td style={{ width: `${sixColWidths.debitBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-700 dark:text-blue-400 truncate">
                      {grandSixColDebitBalance.toLocaleString()}
                    </td>
                    <td style={{ width: `${sixColWidths.creditBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-700 dark:text-blue-400 truncate">
                      {grandSixColCreditBalance.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              )
            ) : isEightColumnBalance ? (
              eightColumnBalanceRows.length > 0 && (
                <tfoot className="bg-[#e4e4e4] dark:bg-gray-800 text-gray-700 dark:text-gray-200 sticky bottom-0 z-20 shadow-[0_-1px_2px_rgba(0,0,0,0.05)] border-t border-gray-300 dark:border-gray-700 font-bold border-b-2">
                  <tr>
                    <td className="p-1 border-l border-gray-300 dark:border-gray-700 w-4 text-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-normal"></td>
                    <td colSpan={4} className="p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-left">
                      جمع کل :
                    </td>
                    <td style={{ width: `${eightColWidths.col1Debit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-700 dark:text-blue-400 truncate">
                      {grandEightCol1Debit.toLocaleString()}
                    </td>
                    <td style={{ width: `${eightColWidths.col1Credit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-700 dark:text-blue-400 truncate">
                      {grandEightCol1Credit.toLocaleString()}
                    </td>
                    <td style={{ width: `${eightColWidths.col2Debit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-700 dark:text-blue-400 truncate">
                      {grandEightCol2Debit.toLocaleString()}
                    </td>
                    <td style={{ width: `${eightColWidths.col2Credit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-700 dark:text-blue-400 truncate">
                      {grandEightCol2Credit.toLocaleString()}
                    </td>
                    <td style={{ width: `${eightColWidths.col3Debit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-700 dark:text-blue-400 truncate">
                      {grandEightCol3Debit.toLocaleString()}
                    </td>
                    <td style={{ width: `${eightColWidths.col3Credit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-700 dark:text-blue-400 truncate">
                      {grandEightCol3Credit.toLocaleString()}
                    </td>
                    <td style={{ width: `${eightColWidths.col4Debit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-700 dark:text-blue-400 truncate">
                      {grandEightCol4Debit.toLocaleString()}
                    </td>
                    <td style={{ width: `${eightColWidths.col4Credit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-700 dark:text-blue-400 truncate">
                      {grandEightCol4Credit.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              )
            ) : reportItems.length > 0 && (
              <tfoot className="bg-[#e4e4e4] dark:bg-gray-800 text-gray-700 dark:text-gray-200 sticky bottom-0 z-20 shadow-[0_-1px_2px_rgba(0,0,0,0.05)] border-t border-gray-300 dark:border-gray-700 font-bold border-b-2">
                <tr>
                  <td className="p-1 border-l border-gray-300 dark:border-gray-700 w-4 text-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-normal"></td>
                  <td colSpan={7} className="p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-left">
                    جمع کل :
                  </td>
                  <td style={{ width: `${ledgerWidths.debit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-700 dark:text-blue-400 truncate">
                    {grandTotalDebit.toLocaleString()}
                  </td>
                  <td style={{ width: `${ledgerWidths.credit}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-700 dark:text-blue-400 truncate">
                    {grandTotalCredit.toLocaleString()}
                  </td>
                  <td style={{ width: `${ledgerWidths.debitBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-700 dark:text-blue-400 truncate">
                    {grandTotalBalance > 0 ? grandTotalBalance.toLocaleString() : '0'}
                  </td>
                  <td style={{ width: `${ledgerWidths.creditBalance}px` }} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-blue-700 dark:text-blue-400 truncate">
                    {grandTotalBalance < 0 ? Math.abs(grandTotalBalance).toLocaleString() : '0'}
                  </td>
                  <td colSpan={8} className="p-1 px-2 text-left font-mono border-l border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                    مانده نهایی: {Math.abs(grandTotalBalance).toLocaleString()} ({grandTotalBalance >= 0 ? 'بد' : 'بس'})
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>


        {/* Main Sticky Bottom Footer Bar (Matching AccountReview) */}
        <div className="bg-slate-100 dark:bg-gray-800 px-4 py-1.5 border-t border-gray-300 dark:border-gray-700 flex items-center justify-between gap-4 font-bold text-[11px] shrink-0 select-text z-30 min-h-[40px] rounded-b shadow-sm">
          {/* Right side: Action / Export Icons */}
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
            <PdfExportButton onClick={handleExportExcel} hideLabel tooltipPosition="top" className="shadow-sm bg-white dark:bg-slate-800" />
            <ExcelExportButton onClick={handleExportExcel} hideLabel tooltipPosition="top" className="shadow-sm bg-white dark:bg-slate-800" />
            <WordExportButton onClick={handleExportExcel} hideLabel tooltipPosition="top" className="shadow-sm bg-white dark:bg-slate-800" />
          </div>

          {/* Center side: totals */}
          <div className="flex items-center gap-4 bg-white dark:bg-slate-800 px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-slate-500 dark:text-slate-400">جمع کل گردش:</span>
            <div className="flex gap-6 font-mono font-bold text-sm">
               <span className="text-emerald-700 dark:text-emerald-500">
                 بد: <span dir="ltr">{allTotals.debit === 0 ? '۰' : allTotals.debit.toLocaleString()}</span>
               </span>
               <span className="text-rose-600 dark:text-rose-500">
                 بس: <span dir="ltr">{allTotals.credit === 0 ? '۰' : allTotals.credit.toLocaleString()}</span>
               </span>
            </div>
          </div>

          {/* Left side: Row count */}
          <div className="text-gray-500 flex items-center">
            مجموع رکوردها: <span className="text-slate-800 dark:text-slate-200 font-mono font-bold mr-1">{totalRecordCount}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
