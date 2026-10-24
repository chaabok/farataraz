"use client";

/**
 * MainDataGrid — the shared, feature-rich data grid used by all «فهرست» list forms.
 *
 * Features (matching the Parsa ERP reference design):
 *  - Gradient title bar with icon, record count, help / fullscreen / close buttons
 *  - Sortable, filterable, resizable, drag-reorderable columns (RTL & LTR)
 *  - Per-column filter row: text input + funnel button opening an operator menu
 *    (شامل / شامل نباشد / شروع با / پایان با / برابر با / نابرابر با / خالی باشد / خالی نباشد)
 *  - Row selection (checkbox column with select-all + indeterminate, shift-range, keyboard)
 *  - Boolean / status columns rendered as elegant badges & pills
 *  - Empty state, loading overlay, infinite-scroll support
 *  - Footer toolbar: CRUD actions, copy, print, Excel/Word/PDF export,
 *    column management, grouping and advanced-search toggles
 *  - Grid preferences persisted per gridId (sorting / filters / column order / visibility)
 *  - Server-side mode (manual sorting/filtering/pagination + debounced onParamsChange)
 */

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  ColumnDef,
  ColumnFiltersState,
  ColumnOrderState,
  RowSelectionState,
  GroupingState,
  ExpandedState,
  ColumnVisibilityState,
  SortingState,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  RefreshCw,
  Copy,
  Printer,
  Filter,
  FilterX,
  GripHorizontal,
  LayoutList,
  DatabaseZap,
} from "lucide-react";
import { clsx } from "clsx";
import { useLanguage } from "@/components/Providers";
import { useOptionalTabs } from "@/components/TabsProvider";
import { useGridStore } from "@/lib/stores/gridStore";
import { useToast } from "@/components/ToastProvider";
import { CloseButton } from "../buttons/CloseButton";
import { FullscreenButton } from "../buttons/FullscreenButton";
import { HelpButton } from "../buttons/HelpButton";
import { ColumnManagement } from "../buttons/ColumnManagement";
import { NewButton } from "../MainDataGridButtons/NewButton";
import { ActionButton } from "../buttons/ActionButton";
import { DeleteButton } from "../MainDataGridButtons/DeleteButton";
import { EditButton } from "../MainDataGridButtons/EditButton";
import { ExcelExportButton } from "../MainDataGridButtons/ExcelExportButton";
import { PdfExportButton } from "../MainDataGridButtons/PdfExportButton";
import { WordExportButton } from "../MainDataGridButtons/WordExportButton";
import { LoadingOverlay } from "./LoadingOverlay";
import { eventBus, EVENTS } from "@/lib/events";
import { ColumnGrouping } from "./ColumnGrouping";
import { AdvancedSearch, AdvancedFilterCondition } from "./AdvancedSearch";
import { formatDateByLocale, apiFetch, getPersianEntityName } from "@/lib/utils";
import { latinizeDigits, localizeNumericString } from "@/lib/digitLocale";
import { useGridExport } from "@/hooks/useGridExport";
import { useGridKeyboardNavigation } from "@/hooks/useGridKeyboardNavigation";

export type FilterOperator =
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

const FILTER_OPTIONS: { val: FilterOperator; label: string }[] = [
  { val: "contains", label: "شامل" },
  { val: "notContains", label: "شامل نباشد" },
  { val: "startsWith", label: "شروع با" },
  { val: "endsWith", label: "پایان با" },
  { val: "equals", label: "برابر با" },
  { val: "notEquals", label: "نابرابر با" },
  { val: "empty", label: "خالی باشد" },
  { val: "notEmpty", label: "خالی نباشد" },
];

export function pushBaseFieldsToEnd(order: string[]): string[] {
  const normal: string[] = [];
  const base: string[] = [];
  const select: string[] = [];

  order.forEach((item) => {
    if (item === "select") {
      // selection checkbox is always the very last column (left-most in RTL),
      // matching the Parsa reference design
      select.push(item);
    } else if (BASE_INHERITED_FIELDS_SET.has(item.toLowerCase())) {
      base.push(item);
    } else {
      normal.push(item);
    }
  });

  return [...normal, ...base, ...select];
}

export function isTablePrimaryKey(key: string): boolean {
  if (!key) return false;
  const lower = key.toLowerCase();
  if (lower === "id") return true;
  if (lower.endsWith("id") && !lower.endsWith("nationalid")) {
    return true;
  }
  return false;
}

export type DataGridColumn = {
  key: string;
  header?: string;
  label?: string;
  width?: number | string;
  type?: string;
  resizable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  hidden?: boolean;
  hideFilter?: boolean;
  enableHiding?: boolean;
  enumOptions?: { value: any; label: string }[];
  cell?: (info: any) => React.ReactNode;
  renderCell?: (info: any) => React.ReactNode;
};

export interface DataGridParams {
  pageIndex: number;
  pageSize: number;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  advancedFilters?: AdvancedFilterCondition[];
}

interface MainDataGridProps {
  columns: DataGridColumn[];
  data: any[];
  title: string;
  icon?: React.ReactNode;
  onAdd?: () => void;
  onEdit?: (item: any) => void;
  onEditRows?: (items: any[]) => void;
  onDelete?: (item: any) => void;
  onRefresh?: () => void;
  onDeleteRows?: (items: any[]) => void;
  onHelp?: () => void;
  onExcelExport?: () => void;
  hideExcelExport?: boolean;
  onPdfExport?: () => void;
  hidePdfExport?: boolean;
  onWordExport?: () => void;
  hideWordExport?: boolean;
  hideCopy?: boolean;
  hidePrint?: boolean;
  hideTitleBar?: boolean;
  isLoading?: boolean;
  className?: string;
  enableMultiSelection?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  // Server-side props
  serverSide?: boolean;
  totalItems?: number;
  onParamsChange?: (params: DataGridParams) => void;
  pageSize?: number;
  onRowDoubleClick?: (item: any) => void;
  customTopActionbar?: React.ReactNode;
  customFooterActions?: React.ReactNode;
  onSelectionChange?: (selectedRows: any[]) => void;
  gridId?: string;
  entityName?: string;
  enableAdvancedSearch?: boolean;
  enableColumnGrouping?: boolean;
  enableExport?: boolean;
  disableAutoColumns?: boolean;
}

const BASE_INHERITED_FIELDS_SET = new Set([
  "companyref",
  "businessstructureref",
  "branchref",
  "agencyref",
  "creator",
  "lastmodifier",
  "creationdate",
  "createtime",
  "lastmodificationdate",
  "lastmodificationtime",
  "createdat",
  "updatedat",
  "version",
  "companyentity",
  "businessstructureentity",
  "branchentity",
  "agencyentity",
]);

const LOCALIZED_FIELD_TRANSLATIONS: Record<string, Record<string, string>> = {
  fa: {
    id: "شناسه",
    companyRef: "شرکت",
    businessStructureRef: "ساختار کسب و کار",
    creator: "کاربر ایجاد کننده",
    lastModifier: "کاربر ویرایش کننده",
    createdAt: "تاریخ ایجاد",
    updatedAt: "تاریخ ویرایش",
    isActive: "وضعیت فعال",
    status: "وضعیت",
    description: "توضیحات",
    desc: "توضیحات",
    title: "عنوان",
    latinTitle: "عنوان لاتین",
    code: "کد",
    displayOrder: "ترتیب نمایش",
    bankAccountId: "کد حساب بانکی",
    accountNumber: "شماره حساب",
    shabaNumber: "شماره شبا",
    detailedCode: "کد تفصیلی",
    initialBalance: "موجودی اولیه",
    openingDate: "تاریخ افتتاح",
    accountHolderName: "صاحب حساب",
    subsidiaryLatinTitle: "حساب معین لاتین",
    branchCode: "کد شعبه",
    branchName: "نام شعبه",
    swiftCode: "کد سوئیفت",
    isDefault: "پیش‌فرض",
    chequebookId: "کد دسته‌چک",
    chequebookRef: "دسته‌چک",
    startNumber: "شماره شروع",
    endNumber: "شماره پایان",
    chequeCount: "تعداد برگ",
    chequeNumber: "شماره چک",
    sayyadNumber: "شماره صیاد",
    dueDate: "تاریخ سررسید",
    amount: "مبلغ",
    payeeName: "در وجه",
    isPrinted: "چاپ شده",
    isPassed: "پاس شده",
    cashId: "کد صندوق",
    cashierName: "نام صندوق‌دار",
    pettyCashId: "کد تنخواه‌گردان",
    pettyCashierRef: "تنخواه‌دار",
    maxBalance: "سقف موجودی",
    partyId: "کد طرف حساب",
    firstName: "نام",
    lastName: "نام خانوادگی",
    nationalCode: "کد ملی",
    nationalId: "شناسه ملی",
    economicCode: "کد اقتصادی",
    registrationNumber: "شماره ثبت",
    phone: "تلفن",
    mobile: "موبایل",
    email: "ایمیل",
    website: "وب‌سایت",
    postalCode: "کد پستی",
    address: "آدرس",
    city: "شهر",
    province: "استان",
    fiscalYearId: "کد سال مالی",
    startDate: "تاریخ شروع",
    endDate: "تاریخ پایان",
    isClosed: "بسته شده",
    currencyId: "کد ارز",
    currencySymbol: "نماد ارز",
    exchangeRate: "نرخ برابری",
    entityName: "نام موجودیت",
    prefix: "پیشوند",
    suffix: "پسوند",
    startFrom: "شروع از",
    currentNumber: "شماره فعلی",
    paddingLength: "طول پدینگ",
    costCenterId: "کد مرکز هزینه",
    projectId: "کد پروژه",
    contractId: "کد قرارداد",
    contractDate: "تاریخ قرارداد",
    contractor: "پیمانکار",
    employer: "کارفرما",
  },
  en: {
    id: "ID",
    companyRef: "Company",
    businessStructureRef: "Business Structure",
    creator: "Created By",
    lastModifier: "Modified By",
    createdAt: "Created At",
    updatedAt: "Updated At",
    isActive: "Is Active",
    status: "Status",
    description: "Description",
    desc: "Description",
    title: "Title",
    latinTitle: "Latin Title",
    code: "Code",
    displayOrder: "Display Order",
    bankAccountId: "Bank Account ID",
    accountNumber: "Account Number",
    shabaNumber: "Shaba Number",
    detailedCode: "Detailed Code",
    initialBalance: "Initial Balance",
    openingDate: "Opening Date",
    accountHolderName: "Account Holder",
    subsidiaryLatinTitle: "Subsidiary Latin Title",
    branchCode: "Branch Code",
    branchName: "Branch Name",
    swiftCode: "SWIFT Code",
    isDefault: "Default",
    chequebookId: "Chequebook ID",
    chequebookRef: "Chequebook",
    startNumber: "Start Number",
    endNumber: "End Number",
    chequeCount: "Cheque Count",
    chequeNumber: "Cheque Number",
    sayyadNumber: "Sayyad Number",
    dueDate: "Due Date",
    amount: "Amount",
    payeeName: "Payee Name",
    isPrinted: "Is Printed",
    isPassed: "Is Passed",
    cashId: "Cash ID",
    cashierName: "Cashier Name",
    pettyCashId: "Petty Cash ID",
    pettyCashierRef: "Petty Cashier",
    maxBalance: "Max Balance",
    partyId: "Party ID",
    firstName: "First Name",
    lastName: "Last Name",
    nationalCode: "National Code",
    nationalId: "National ID",
    economicCode: "Economic Code",
    registrationNumber: "Registration No",
    phone: "Phone",
    mobile: "Mobile",
    email: "Email",
    website: "Website",
    postalCode: "Postal Code",
    address: "Address",
    city: "City",
    province: "Province",
    fiscalYearId: "Fiscal Year ID",
    startDate: "Start Date",
    endDate: "End Date",
    isClosed: "Is Closed",
    currencyId: "Currency ID",
    currencySymbol: "Symbol",
    exchangeRate: "Exchange Rate",
    entityName: "Entity Name",
    prefix: "Prefix",
    suffix: "Suffix",
    startFrom: "Start From",
    currentNumber: "Current Number",
    paddingLength: "Padding Length",
    costCenterId: "Cost Center ID",
    projectId: "Project ID",
    contractId: "Contract ID",
    contractDate: "Contract Date",
    contractor: "Contractor",
    employer: "Employer",
  },
  ar: {
    id: "المعرف",
    companyRef: "الشركة",
    businessStructureRef: "هيكل العمل",
    creator: "تم إنشاؤه بواسطة",
    lastModifier: "تم تعديله بواسطة",
    createdAt: "تاريخ الإنشاء",
    updatedAt: "تاريخ التعديل",
    isActive: "نشط",
    status: "الحالة",
    description: "الوصف",
    desc: "الوصف",
    title: "العنوان",
    latinTitle: "العنوان اللاتيني",
    code: "الرمز",
    displayOrder: "ترتیب العرض",
    bankAccountId: "معرف الحساب البنكي",
    accountNumber: "رقم الحساب",
    shabaNumber: "رقم شبا",
    detailedCode: "الرمز التفصيلي",
    initialBalance: "الرصيد الافتتاحي",
    openingDate: "تاريخ الفتح",
    accountHolderName: "صاحب الحساب",
    subsidiaryLatinTitle: "العنوان اللاتيني الفرعي",
    branchCode: "رمز الفرع",
    branchName: "اسم الفرع",
    swiftCode: "رمز السويفت",
    isDefault: "افتراضي",
    chequebookId: "معرف دفتر الشيكات",
    chequebookRef: "دفتر الشيكات",
    startNumber: "رقم البدء",
    endNumber: "رقم الانتهاء",
    chequeCount: "عدد الشيكات",
    chequeNumber: "رقم الشيك",
    sayyadNumber: "رقم صياد",
    dueDate: "تاريخ الاستحقاق",
    amount: "المبلغ",
    payeeName: "المدفوع له",
    isPrinted: "مطبوع",
    isPassed: "مقبول",
    cashId: "معرف الصندوق",
    cashierName: "اسم أمين الصندوق",
    pettyCashId: "معرف السلفة",
    pettyCashierRef: "أمين السلفة",
    maxBalance: "الحد الأقصى للرصيد",
    partyId: "معرف الطرف الآخر",
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    nationalCode: "الرقم الوطني",
    nationalId: "الهوية الوطنية",
    economicCode: "الرمز الاقتصادي",
    registrationNumber: "رقم التسجيل",
    phone: "الهاتف",
    mobile: "الجوال",
    email: "البريد الإلكتروني",
    website: "الموقع الإلكتروني",
    postalCode: "الرمز البريدي",
    address: "العنوان",
    city: "المدينة",
    province: "المحافظة",
    fiscalYearId: "معرف السنة المالية",
    startDate: "تاريخ البدء",
    endDate: "تاريخ الانتهاء",
    isClosed: "مغلق",
    currencyId: "معرف العملة",
    currencySymbol: "رمز العملة",
    exchangeRate: "سعر الصرف",
    entityName: "اسم الكيان",
    prefix: "البادئة",
    suffix: "اللاحقة",
    startFrom: "يبدأ من",
    currentNumber: "الرقم الحالي",
    paddingLength: "طول الحشو",
    costCenterId: "معرف مركز التكلفة",
    projectId: "معرف المشروع",
    contractId: "معرف العقد",
    contractDate: "تاريخ العقد",
    contractor: "المقاول",
    employer: "صاحب العمل",
  },
};

const getLocalizedEnumLabel = (key: string, value: any, lang: string): string | null => {
  if (value === null || value === undefined) return null;
  const normKey = key.toLowerCase();
  const valStr = String(value);

  if (normKey.includes("banktype")) {
    if (valStr === "1") return lang === "en" ? "Government" : lang === "ar" ? "حكومي" : "دولتی";
    if (valStr === "2") return lang === "en" ? "Private" : lang === "ar" ? "خاص" : "خصوصی";
  }
  if (normKey.includes("businessstructuretype") || normKey.includes("structuretype")) {
    if (valStr === "1") return lang === "en" ? "Holding" : lang === "ar" ? "هولدينغ" : "هلدینگ";
    if (valStr === "2") return lang === "en" ? "Company" : lang === "ar" ? "شركة" : "شرکت";
    if (valStr === "3") return lang === "en" ? "Branch" : lang === "ar" ? "فرع" : "شعبه";
    if (valStr === "4") return lang === "en" ? "Department" : lang === "ar" ? "قسم" : "دپارتمان";
  }
  if (normKey.includes("checkstatus") || normKey.includes("chequestatus")) {
    if (valStr === "1") return lang === "en" ? "Normal" : lang === "ar" ? "عادي" : "عادی";
    if (valStr === "2") return lang === "en" ? "Canceled" : lang === "ar" ? "ملغي" : "ابطال شده";
    if (valStr === "3") return lang === "en" ? "Issued" : lang === "ar" ? "صادر" : "صادر شده";
    if (valStr === "4") return lang === "en" ? "Passed" : lang === "ar" ? "تم المرور" : "پاس شده";
  }
  if (normKey.includes("costcentertype")) {
    if (valStr === "1") return lang === "en" ? "Administrative" : lang === "ar" ? "إداري" : "اداری و تشکیلاتی";
    if (valStr === "2") return lang === "en" ? "Commercial" : lang === "ar" ? "تجاري" : "بازرگانی";
    if (valStr === "3") return lang === "en" ? "Production" : lang === "ar" ? "إنتاجي" : "تولیدی";
    if (valStr === "4") return lang === "en" ? "Service" : lang === "ar" ? "خدمي" : "خدماتی";
    if (valStr === "5") return lang === "en" ? "General" : lang === "ar" ? "عام" : "عمومی";
  }
  if (normKey.includes("entitytype")) {
    if (valStr === "1") return lang === "en" ? "Main Menu" : lang === "ar" ? "القائمة الرئيسية" : "منو اصلی";
    if (valStr === "2") return lang === "en" ? "Sub Menu" : lang === "ar" ? "القائمة الفرعية" : "زیر منو";
    if (valStr === "3") return lang === "en" ? "Form" : lang === "ar" ? "نموذج" : "فرم";
  }
  if (normKey.includes("geographictype")) {
    if (valStr === "1") return lang === "en" ? "Country" : lang === "ar" ? "بلد" : "کشور";
    if (valStr === "2") return lang === "en" ? "Province" : lang === "ar" ? "محافظة" : "استان";
    if (valStr === "3") return lang === "en" ? "City" : lang === "ar" ? "مدينة" : "شهر";
    if (valStr === "4") return lang === "en" ? "Village" : lang === "ar" ? "قرية" : "روستا";
  }

  return null;
};

/* ------------------------------------------------------------------ */
/* Filter operator menu (portal) — the dropdown shown in the reference */
/* ------------------------------------------------------------------ */

interface FilterOperatorMenuProps {
  anchorRect: DOMRect;
  currentOp: FilterOperator;
  onSelect: (op: FilterOperator) => void;
  onClose: () => void;
  rtl: boolean;
}

function FilterOperatorMenu({ anchorRect, currentOp, onSelect, onClose, rtl }: FilterOperatorMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const MENU_W = 150;
  const MENU_H = FILTER_OPTIONS.length * 28 + 8;

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const handleScrollOrResize = () => onClose();
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);
    window.addEventListener("resize", handleScrollOrResize);
    // close on any scroll (capture covers the grid's inner scroll containers)
    document.addEventListener("scroll", handleScrollOrResize, true);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("resize", handleScrollOrResize);
      document.removeEventListener("scroll", handleScrollOrResize, true);
    };
  }, [onClose]);

  let top = anchorRect.bottom + 4;
  if (top + MENU_H > window.innerHeight - 8) {
    top = Math.max(8, anchorRect.top - MENU_H - 4);
  }
  let left: number;
  if (rtl) {
    left = Math.max(8, anchorRect.right - MENU_W);
  } else {
    left = Math.min(window.innerWidth - MENU_W - 8, anchorRect.left);
  }

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      className="fixed z-[100000] w-[150px] rounded-lg border border-slate-200 bg-white py-1 shadow-2xl shadow-black/20 dark:border-slate-700 dark:bg-slate-800 dark:shadow-black/50"
      style={{ top, left }}
    >
      {FILTER_OPTIONS.map((opt) => {
        const active = opt.val === currentOp;
        return (
          <button
            key={opt.val}
            type="button"
            role="menuitemradio"
            aria-checked={active}
            onClick={() => onSelect(opt.val)}
            className={clsx(
              "flex w-full items-center justify-between gap-2 px-3 py-[5px] text-[11px] transition-colors",
              active
                ? "bg-blue-600 font-medium text-white"
                : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/80"
            )}
          >
            <span>{opt.label}</span>
            {active && <Check className="h-3.5 w-3.5 shrink-0" />}
          </button>
        );
      })}
    </div>,
    document.body
  );
}

const EMPTY_ARRAY: any[] = [];

export function MainDataGrid({
  columns: columnsDef,
  data = EMPTY_ARRAY,
  title,
  icon,
  onAdd,
  onEdit,
  onEditRows,
  onDelete,
  onDeleteRows,
  onRefresh,
  onHelp,
  onExcelExport,
  hideExcelExport = false,
  onPdfExport,
  hidePdfExport = false,
  onWordExport,
  hideWordExport = false,
  hideCopy = false,
  hidePrint = false,
  hideTitleBar = false,
  isLoading = false,
  className = "",
  enableMultiSelection = true,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  serverSide = false,
  totalItems,
  onParamsChange,
  pageSize: initialPageSize = 50,
  onRowDoubleClick,
  customTopActionbar,
  customFooterActions,
  onSelectionChange,
  gridId,
  entityName,
  enableAdvancedSearch = true,
  enableColumnGrouping = true,
  disableAutoColumns = false,
}: MainDataGridProps) {
  const formRef = useRef<HTMLDivElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLTableRowElement>(null);

  const { t, direction, language } = useLanguage();
  const { showToast } = useToast();
  const rtl = direction === "rtl";

  const tt = useCallback(
    (key: string, fallback: string) => {
      const v = t(key as any);
      return v && v !== key ? v : fallback;
    },
    [t]
  );

  /* ---------------- Task 62/64: بومی‌سازی ارقام سلول‌ها ---------------- */
  // ارقام هر مقدار رشته‌ای/عددی به ارقام زبان انتخاب‌شده تبدیل می‌شود (بدون گروه‌بندی —
  // کدها و شناسه‌ها نباید گروه‌بندی شوند؛ فرم‌ها برای گروه‌بندی از render اختصاصی استفاده می‌کنند)
  const locDigits = useCallback(
    (v: any): any => {
      if (v === null || v === undefined) return v;
      if (typeof v === "number") return localizeNumericString(String(v), language);
      if (typeof v === "string") return localizeNumericString(v, language);
      return v;
    },
    [language]
  );

  const { preferences, setPreferences } = useGridStore();
  const gridPrefs = gridId ? preferences[gridId] : undefined;

  /* ------------------------- sorting state ------------------------- */
  const [sorting, setSorting] = useState<SortingState>(() => {
    if (gridPrefs?.sorting && gridPrefs.sorting.length > 0) {
      return gridPrefs.sorting;
    }
    if (columnsDef && columnsDef.length > 0) {
      const firstCol = columnsDef[0];
      const firstColKey =
        firstCol.key || (firstCol as any).id || (firstCol.header ? String(firstCol.header) : undefined);
      if (firstColKey) {
        return [{ id: firstColKey, desc: true }];
      }
    }
    return [];
  });

  const isSortingInitializedRef = useRef(false);
  useEffect(() => {
    if (isSortingInitializedRef.current) return;
    if (columnsDef && columnsDef.length > 0) {
      const hasPrefs = gridPrefs?.sorting && gridPrefs.sorting.length > 0;
      if (hasPrefs && gridPrefs?.sorting) {
        setSorting(gridPrefs.sorting);
      } else {
        const firstCol = columnsDef[0];
        const firstColKey =
          firstCol.key || (firstCol as any).id || (firstCol.header ? String(firstCol.header) : undefined);
        if (firstColKey) {
          setSorting([{ id: firstColKey, desc: true }]);
        }
      }
      isSortingInitializedRef.current = true;
    }
  }, [columnsDef, gridPrefs]);

  /* ------------------------- filter states ------------------------- */
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(gridPrefs?.filters || []);
  const [globalFilter, setGlobalFilter] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterCondition[]>([]);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [{ pageIndex, pageSize }, setPagination] = useState({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  const [grouping, setGrouping] = useState<GroupingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});

  /* ------------------------- column order -------------------------- */
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() => {
    let order: string[];
    if (gridPrefs?.columnOrder) {
      order = [...gridPrefs.columnOrder];
    } else {
      order = columnsDef.map(
        (c, index) => c.key || (c as any).id || (c.header ? String(c.header) : `column_${index}`)
      );
      if (!disableAutoColumns) {
        if (!order.includes("creator")) order.push("creator");
        if (!order.includes("lastModifier")) order.push("lastModifier");
      }
      // selection checkbox is rendered as the LAST column (left-most in RTL),
      // exactly like the Parsa reference design
      if (enableMultiSelection) {
        order.push("select");
      }
    }
    return pushBaseFieldsToEnd(order);
  });

  const [showGroupPanel, setShowGroupPanel] = useState(false);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>(
    gridPrefs?.columnVisibility || {}
  );
  const [isEditConfirmOpen, setIsEditConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [shiftAnchorIndex, setShiftAnchorIndex] = useState<number | null>(null);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [highlightedRowIds, setHighlightedRowIds] = useState<Record<string, boolean>>({});

  // open filter operator menu: which column + where
  const [operatorMenu, setOperatorMenu] = useState<{ colId: string; rect: DOMRect } | null>(null);

  /* ------------------------- users lookup -------------------------- */
  const usersMapRef = useRef<Record<string, string>>({});
  const [usersMapVersion, setUsersMapVersion] = useState(0);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch("/api/iam/users");
        if (res.ok && !cancelled) {
          const json = await res.json().catch(() => null);
          const users = Array.isArray(json) ? json : json?.data?.items || json?.items || json?.data || [];
          const map: Record<string, string> = {};
          if (Array.isArray(users)) {
            users.forEach((u: any) => {
              const id = u.userId || u.id;
              if (id) {
                map[String(id)] = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username;
              }
            });
          }
          usersMapRef.current = map;
          setUsersMapVersion((v) => v + 1);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ------------------------- persistence --------------------------- */
  useEffect(() => {
    if (gridId) {
      setPreferences(gridId, {
        sorting,
        filters: columnFilters,
        columnOrder,
        columnVisibility,
      });
    }
  }, [gridId, sorting, columnFilters, columnOrder, columnVisibility, setPreferences]);

  /* --------------------- server-side params ------------------------ */
  useEffect(() => {
    if (!serverSide || !onParamsChange) return;
    const timeout = setTimeout(() => {
      onParamsChange({
        pageIndex,
        pageSize,
        sorting,
        columnFilters,
        globalFilter,
        advancedFilters,
      });
    }, 500);
    return () => clearTimeout(timeout);
  }, [pageIndex, pageSize, sorting, columnFilters, globalFilter, advancedFilters, serverSide, onParamsChange]);

  /* ------------------------ infinite scroll ------------------------ */
  useEffect(() => {
    if (!onLoadMore || !hasMore || isLoading || isLoadingMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    return () => observer.disconnect();
  }, [onLoadMore, hasMore, isLoading, isLoadingMore]);

  /* --------------------- live data refresh ------------------------- */
  useEffect(() => {
    if (!onRefresh) return;
    const unsubscribe = eventBus.on(EVENTS.DATA_CHANGED, () => {
      onRefresh();
    });
    return () => unsubscribe();
  }, [onRefresh]);

  /* ------------------------ group theming -------------------------- */
  let groupId = "general";
  const tabsCtx = useOptionalTabs();
  if (tabsCtx && tabsCtx.tabs && tabsCtx.activeTabId) {
    const activeTab = tabsCtx.tabs.find((tb) => tb.id === tabsCtx.activeTabId);
    if (activeTab) {
      groupId = activeTab.groupId;
    }
  }

  const groupHeaderGradients: Record<string, string> = {
    general: "from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600",
    financial: "from-emerald-600 to-emerald-500 dark:from-emerald-700 dark:to-emerald-600",
    warehouse: "from-cyan-600 to-cyan-500 dark:from-cyan-700 dark:to-cyan-600",
    hr: "from-rose-600 to-rose-500 dark:from-rose-700 dark:to-rose-600",
    production: "from-orange-600 to-orange-500 dark:from-orange-700 dark:to-orange-600",
    admin: "from-purple-600 to-purple-500 dark:from-purple-700 dark:to-purple-600",
  };

  const groupFormStyles: Record<string, string> = {
    general:
      "border-x-blue-100 border-b-blue-100 dark:border-x-blue-900/30 dark:border-b-blue-900/30 shadow-[0_8px_30px_-4px_rgba(59,130,246,0.15)] dark:shadow-[0_8px_30px_-4px_rgba(59,130,246,0.05)]",
    financial:
      "border-x-emerald-100 border-b-emerald-100 dark:border-x-emerald-900/30 dark:border-b-emerald-900/30 shadow-[0_8px_30px_-4px_rgba(16,185,129,0.15)] dark:shadow-[0_8px_30px_-4px_rgba(16,185,129,0.05)]",
    warehouse:
      "border-x-cyan-100 border-b-cyan-100 dark:border-x-cyan-900/30 dark:border-b-cyan-900/30 shadow-[0_8px_30px_-4px_rgba(6,182,212,0.15)] dark:shadow-[0_8px_30px_-4px_rgba(6,182,212,0.05)]",
    hr: "border-x-rose-100 border-b-rose-100 dark:border-x-rose-900/30 dark:border-b-rose-900/30 shadow-[0_8px_30px_-4px_rgba(244,63,94,0.15)] dark:shadow-[0_8px_30px_-4px_rgba(244,63,94,0.05)]",
    production:
      "border-x-orange-100 border-b-orange-100 dark:border-x-orange-900/30 dark:border-b-orange-900/30 shadow-[0_8px_30px_-4px_rgba(249,115,22,0.15)] dark:shadow-[0_8px_30px_-4px_rgba(249,115,22,0.05)]",
    admin: "border-x-purple-100 border-b-purple-100 dark:border-x-purple-900/30 dark:border-b-purple-900/30 shadow-[0_8px_30px_-4px_rgba(168,85,247,0.15)] dark:shadow-[0_8px_30px_-4px_rgba(168,85,247,0.05)]",
  };

  const currentHeaderGradient = groupHeaderGradients[groupId] || groupHeaderGradients["general"];
  const currentFormStyle = groupFormStyles[groupId] || groupFormStyles["general"];

  /* --------------------------- columns ----------------------------- */
  const columns = useMemo<ColumnDef<any>[]>(() => {
    const cols: ColumnDef<any>[] = columnsDef.map((col, index) => {
      const colId = col.key || (col as any).id || (col.header ? String(col.header) : `column_${index}`);
      let displayHeader = col.header || col.label;
      if (isTablePrimaryKey(colId)) {
        displayHeader = LOCALIZED_FIELD_TRANSLATIONS[language]?.id || "شناسه";
      } else {
        const localized =
          LOCALIZED_FIELD_TRANSLATIONS[language]?.[colId] ||
          LOCALIZED_FIELD_TRANSLATIONS[language]?.[String(displayHeader)];
        if (localized) {
          displayHeader = localized;
        } else if (!displayHeader) {
          displayHeader = LOCALIZED_FIELD_TRANSLATIONS["fa"]?.[colId] || colId;
        }
      }
      const def: ColumnDef<any> = {
        id: colId,
        header: displayHeader,
        accessorKey: col.key,
        size: col.width ? (isNaN(Number(col.width)) ? undefined : Number(col.width)) : undefined,
        enableHiding: col.enableHiding,
        filterFn: (row, columnId, filterValue: any) => {
          const value = row.getValue(columnId) as string | number | null | undefined;
          const strVal = latinizeDigits(String(value ?? "")).toLowerCase();

          if (!filterValue || typeof filterValue !== "object") {
            const searchVal = latinizeDigits(String(filterValue ?? "")).toLowerCase();
            return strVal.includes(searchVal);
          }

          const searchVal = latinizeDigits(String(filterValue.value ?? "")).toLowerCase();
          const op = filterValue.op ?? "contains";

          switch (op) {
            case "contains":
              return strVal.includes(searchVal);
            case "notContains":
              return !strVal.includes(searchVal);
            case "startsWith":
              return strVal.startsWith(searchVal);
            case "endsWith":
              return strVal.endsWith(searchVal);
            case "equals":
              return strVal === searchVal;
            case "notEquals":
              return strVal !== searchVal;
            case "empty":
              return strVal === "";
            case "notEmpty":
              return strVal !== "";
            default:
              return true;
          }
        },
      };

      const isDateCol =
        col.type === "date" ||
        (typeof col.key === "string" && col.key.toLowerCase().includes("date")) ||
        (typeof col.header === "string" && col.header.includes("تاریخ"));

      const hasGlobalEnum = getLocalizedEnumLabel(colId, "1", language) !== null;
      const isEnumCol = col.enumOptions || col.type === "enum" || hasGlobalEnum;

      if (col.cell) {
        def.cell = col.cell;
      } else if (col.renderCell) {
        def.cell = (info) => col.renderCell!(info);
      } else if ((col as any).render) {
        def.cell = ({ row, getValue }: any) => {
          const r = (col as any).render(getValue(), row.original, row.index);
          // Task 62/64: خروجی رشته‌ای/عددی رندرهای اختصاصی هم بومی‌سازی می‌شود
          return typeof r === "string" || typeof r === "number" ? locDigits(String(r)) : r;
        };
      } else if (col.type === "boolean") {
        def.cell = ({ row }) => {
          const val = row.getValue(colId);
          const boolVal = val === true || val === 1 || val === "true" || val === "بله";
          return (
            <div className="flex w-full items-center justify-center">
              <span
                className={clsx(
                  "inline-flex h-4 w-4 items-center justify-center rounded-[4px] border transition-colors",
                  boolVal
                    ? "border-emerald-300 bg-emerald-50 text-emerald-600 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                    : "border-rose-200 bg-rose-50 text-rose-500 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400"
                )}
              >
                {boolVal ? <Check className="h-3 w-3" strokeWidth={3} /> : <X className="h-3 w-3" strokeWidth={3} />}
              </span>
            </div>
          );
        };
      } else if (isEnumCol) {
        def.cell = ({ row }) => {
          const val = row.getValue(colId);
          if (val === null || val === undefined) return "";
          let label = "";
          if (col.enumOptions) {
            const option = col.enumOptions.find((opt) => String(opt.value) === String(val));
            label = option ? option.label : "";
          } else {
            label = getLocalizedEnumLabel(colId, val, language) || "";
          }
          if (label) {
            return (
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-px text-[10.5px] text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300">
                {locDigits(label)}
              </span>
            );
          }
          return locDigits(String(val));
        };
      } else if (isDateCol) {
        def.cell = ({ row }) => {
          const val = row.getValue(colId);
          return val ? locDigits(formatDateByLocale(val as string, language)) : "";
        };
      } else {
        // Task 62/64: سلول پیش‌فرض — در این نسخه tanstack، flexRender برای سلول‌های تابعی
        // همیشه React element می‌سازد، پس بومی‌سازی ارقام باید داخل خودِ رندرر انجام شود.
        def.cell = ({ getValue }: any) => {
          const val = getValue();
          if (val === null || val === undefined) return "";
          if (typeof val === "boolean") return val ? "✓" : "✗";
          if (typeof val === "object") {
            return locDigits(
              val.title || val.name || val.Title || val.Name || val.code || val.Code || JSON.stringify(val)
            );
          }
          return locDigits(String(val));
        };
      }
      return def;
    });

    if (enableMultiSelection) {
      cols.unshift({
        id: "select",
        header: ({ table: tbl }) => (
          <div className="flex h-full w-full items-center justify-center p-1">
            <input
              type="checkbox"
              checked={tbl.getIsAllRowsSelected()}
              ref={(input) => {
                if (input) {
                  input.indeterminate = tbl.getIsSomeRowsSelected();
                }
              }}
              onChange={tbl.getToggleAllRowsSelectedHandler()}
              className="h-3.5 w-3.5 cursor-pointer rounded border-slate-400 accent-blue-600 dark:border-slate-600"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex w-full items-center justify-center p-0">
            <input
              type="checkbox"
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              readOnly
              className="h-3.5 w-3.5 cursor-pointer rounded border-slate-400 accent-blue-600 dark:border-slate-600"
            />
          </div>
        ),
        size: 44,
        enableSorting: false,
        enableResizing: false,
        enableColumnFilter: false,
        enableGrouping: false,
      });
    }

    if (!disableAutoColumns) {
      if (!cols.find((c) => c.id === "creator")) {
        cols.push({
          id: "creator",
          accessorKey: "creator",
          header: "کاربر ایجاد کننده",
          size: 130,
          enableSorting: true,
          cell: (info) => {
            const val = info.row.original.creator;
            return val ? usersMapRef.current[String(val)] || val.toString() || String(val) : "";
          },
        });
      }

      if (!cols.find((c) => c.id === "lastModifier")) {
        cols.push({
          id: "lastModifier",
          accessorKey: "lastModifier",
          header: "کاربر ویرایش کننده",
          size: 130,
          enableSorting: true,
          cell: (info) => {
            const val = info.row.original.lastModifier;
            return val ? usersMapRef.current[String(val)] || val.toString() || String(val) : "";
          },
        });
      }

      // Scan all keys present in data
      const allDataKeys = new Set<string>();
      if (Array.isArray(data)) {
        data.forEach((item) => {
          if (item && typeof item === "object") {
            Object.keys(item).forEach((k) => {
              if (
                k !== "__v" &&
                k !== "_id" &&
                !k.startsWith("_") &&
                k.toLowerCase() !== "password" &&
                k.toLowerCase() !== "salt"
              ) {
                allDataKeys.add(k);
              }
            });
          }
        });
      }

      const existingColKeys = new Set<string>();
      cols.forEach((c) => {
        if (c.id) existingColKeys.add(c.id);
        const accKey = (c as any).accessorKey;
        if (accKey && typeof accKey === "string") {
          existingColKeys.add(accKey);
          const dotIndex = accKey.indexOf(".");
          if (dotIndex !== -1) {
            existingColKeys.add(accKey.substring(0, dotIndex));
          }
        }
      });

      // Add missing keys
      allDataKeys.forEach((key) => {
        if (!existingColKeys.has(key)) {
          let headerTitle = isTablePrimaryKey(key)
            ? LOCALIZED_FIELD_TRANSLATIONS[language]?.id || "شناسه"
            : LOCALIZED_FIELD_TRANSLATIONS[language]?.[key];
          if (!headerTitle) {
            headerTitle = key
              .replace(/([A-Z])/g, " $1")
              .replace(/[_-]/g, " ")
              .trim();
            headerTitle = headerTitle.charAt(0).toUpperCase() + headerTitle.slice(1);
          }

          const isDateKey =
            key.toLowerCase().includes("date") ||
            key.toLowerCase().includes("time") ||
            key.toLowerCase().includes("createdat") ||
            key.toLowerCase().includes("updatedat");

          cols.push({
            id: key,
            accessorKey: key,
            header: headerTitle,
            size: 130,
            enableSorting: true,
            cell: ({ row }) => {
              const val = row.original[key];
              if (val === null || val === undefined) return "";
              if (typeof val === "object") {
                return locDigits(val.title || val.name || val.Title || val.Name || val.code || val.Code || JSON.stringify(val));
              }
              if (typeof val === "boolean") {
                return val ? "✓" : "✗";
              }
              const enumLabel = getLocalizedEnumLabel(key, val, language);
              if (enumLabel) {
                return `[${val}] ${enumLabel}`;
              }
              if (isDateKey && (typeof val === "string" || val instanceof Date)) {
                return locDigits(formatDateByLocale(val as string, language));
              }
              return locDigits(String(val));
            },
          });
        }
      });
    }

    return cols;
    // usersMapVersion keeps creator/lastModifier cells fresh once the lookup resolves
  }, [columnsDef, enableMultiSelection, data, language, disableAutoColumns, usersMapVersion]);

  /* ------------- synchronize columnOrder with column defs ---------- */
  useEffect(() => {
    const currentKeys = columns.map((c) => c.id as string);
    setColumnOrder((prev) => {
      const validKeysSet = new Set([...currentKeys, "select"]);
      const sanitizedPrev = prev.filter((k) => validKeysSet.has(k));

      const missingKeys = currentKeys.filter((key) => !sanitizedPrev.includes(key));
      if (missingKeys.length === 0 && sanitizedPrev.length === prev.length) {
        return pushBaseFieldsToEnd(prev);
      }

      const order = [...sanitizedPrev];
      missingKeys.forEach((key) => {
        if (key === "select") {
          // pushBaseFieldsToEnd already places the selection checkbox last
          if (!order.includes(key)) order.push(key);
          return;
        }
        const origIndex = currentKeys.indexOf(key);
        if (origIndex === 0) {
          order.unshift(key);
        } else {
          const prevKey = currentKeys[origIndex - 1];
          const prevIdxInOrder = order.indexOf(prevKey);
          if (prevIdxInOrder !== -1) {
            order.splice(prevIdxInOrder + 1, 0, key);
          } else {
            order.push(key);
          }
        }
      });
      return pushBaseFieldsToEnd(order);
    });
  }, [columns]);

  /* ------------- Task 64: اعمال سمت کلاینت جستجوی پیشرفته -------------
   * شرط‌های جستجوی پیشرفته (دکمه قیف اکشن بار) علاوه بر ارسال به سرور، روی
   * داده‌های بارگذاری‌شده هم اعمال می‌شوند تا حتی برای endpointهایی که پارامترها را
   * نادیده می‌گیرند، جستجو واقعاً کار کند. (اگر بک‌اند فیلتر کرده باشد، اعمال مجدد
   * نتیجه را تغییر نمی‌دهد — idempotent)
   */
  const resolvePathValue = (obj: any, path: string): any =>
    String(path)
      .split(".")
      .reduce((o, k) => (o === null || o === undefined ? o : o[k]), obj);

  const advancedFilteredData = useMemo(() => {
    if (!advancedFilters || advancedFilters.length === 0) return data;

    const matchCondition = (row: any, cond: AdvancedFilterCondition): boolean => {
      const raw = resolvePathValue(row, cond.columnId);
      const rowStr = latinizeDigits(String(raw ?? "")).toLowerCase().trim();
      const q = latinizeDigits(String(cond.value ?? "")).toLowerCase().trim();
      switch (cond.operator) {
        case "contains":
          return rowStr.includes(q);
        case "notContains":
          return !rowStr.includes(q);
        case "startsWith":
          return rowStr.startsWith(q);
        case "endsWith":
          return rowStr.endsWith(q);
        case "equals":
          return rowStr === q;
        case "notEquals":
          return rowStr !== q;
        case "empty":
          return rowStr === "";
        case "notEmpty":
          return rowStr !== "";
        default:
          return true;
      }
    };

    return data.filter((row) => {
      let acc = matchCondition(row, advancedFilters[0]);
      for (let i = 1; i < advancedFilters.length; i++) {
        const res = matchCondition(row, advancedFilters[i]);
        acc = advancedFilters[i].logicalOp === "or" ? acc || res : acc && res;
      }
      return acc;
    });
  }, [data, advancedFilters]);

  /* --------------------------- table ------------------------------- */
  const table = useReactTable({
    data: advancedFilteredData,
    columns,
    columnResizeMode: "onChange",
    columnResizeDirection: direction as any,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      columnOrder,
      columnVisibility,
      rowSelection,
      grouping,
      expanded,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    autoResetPageIndex: false,
    autoResetExpanded: false,
    enableRowSelection: true,
    enableMultiRowSelection: enableMultiSelection,
    getCoreRowModel: getCoreRowModel(),
    // Sorting & filtering are always applied on the client against the loaded
    // page data (the backend ignores sort/filter params) — only pagination is
    // delegated to the server in serverSide mode.
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    manualPagination: serverSide,
    rowCount: totalItems,
  });

  const selectedRows = table.getSelectedRowModel().flatRows;
  const activeRow = activeRowId ? table.getRowModel().rows.find((r) => r.id === activeRowId) : null;
  const effectiveSelectedRows = selectedRows.length > 0 ? selectedRows : activeRow ? [activeRow] : [];
  const selectedItem = effectiveSelectedRows.length > 0 ? effectiveSelectedRows[0].original : null;

  const onSelectionChangeRef = useRef(onSelectionChange);
  useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange;
  });
  useEffect(() => {
    if (onSelectionChangeRef.current) {
      onSelectionChangeRef.current(effectiveSelectedRows.map((r) => r.original));
    }
  }, [rowSelection, activeRowId]);

  /* ------------------------ row handlers --------------------------- */
  const handleRowClick = (e: React.MouseEvent, row: any, index: number) => {
    e.stopPropagation();
    setActiveRowId(row.id);
    setHighlightedRowIds({ [row.id]: true });
    setLastSelectedIndex(index);
    if (!e.shiftKey) setShiftAnchorIndex(index);

    if (enableMultiSelection) {
      if (e.shiftKey && lastSelectedIndex !== null) {
        const anchor = shiftAnchorIndex !== null ? shiftAnchorIndex : lastSelectedIndex;
        const start = Math.min(anchor, index);
        const end = Math.max(anchor, index);
        const rows = table.getRowModel().rows;
        const newSelection = { ...rowSelection };
        for (let i = start; i <= end; i++) {
          newSelection[rows[i].id] = true;
        }
        setRowSelection(newSelection);
      } else {
        row.toggleSelected();
      }
    } else {
      setRowSelection({ [row.id]: true });
    }
  };

  const handleRowDoubleClick = (e: React.MouseEvent, row: any, index: number) => {
    e.preventDefault();
    if (onRowDoubleClick) {
      onRowDoubleClick(row.original);
    } else if (onEdit) {
      onEdit(row.original);
    }
    setLastSelectedIndex(index);
  };

  const { handleKeyDown } = useGridKeyboardNavigation({
    table,
    rowSelection,
    setRowSelection,
    enableMultiSelection,
    lastSelectedIndex,
    setLastSelectedIndex,
    shiftAnchorIndex,
    setShiftAnchorIndex,
    highlightedRowIds,
    setHighlightedRowIds,
    setActiveRowId,
  });

  const { handleExcelExport, handlePdfExport, handleWordExport } = useGridExport({
    table,
    columnsDef,
    title,
    onExcelExport,
    onPdfExport,
    onWordExport,
  });

  /* --------------------------- copy rows --------------------------- */
  const handleCopyRows = async () => {
    try {
      const rows = effectiveSelectedRows.length > 0 ? effectiveSelectedRows : table.getRowModel().flatRows;
      if (rows.length === 0) {
        showToast("رکوردی برای کپی وجود ندارد", "error");
        return;
      }
      const visibleColumns = table.getVisibleLeafColumns().filter((c) => c.id !== "select");
      const headers = visibleColumns.map((c) => {
        const def = columnsDef.find((d) => d.key === (c.columnDef as any).accessorKey || d.key === c.id);
        return typeof def?.header === "string" ? def.header : c.id;
      });
      const lines = rows.map((row: any) =>
        visibleColumns
          .map((c) => {
            const val = row.getValue ? row.getValue(c.id) : row.original?.[c.id];
            return String(val ?? "").replace(/\t/g, " ").replace(/\n/g, " ");
          })
          .join("\t")
      );
      const tsv = [headers.join("\t"), ...lines].join("\n");
      // primary path: async clipboard API; fallback: hidden textarea + execCommand
      let copied = false;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(tsv);
          copied = true;
        }
      } catch {
        copied = false;
      }
      if (!copied) {
        try {
          const ta = document.createElement("textarea");
          ta.value = tsv;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.focus();
          ta.select();
          copied = document.execCommand("copy");
          document.body.removeChild(ta);
        } catch {
          copied = false;
        }
      }
      if (!copied) {
        showToast("خطا در کپی اطلاعات", "error");
        return;
      }
      showToast(
        effectiveSelectedRows.length > 0
          ? `${effectiveSelectedRows.length} ردیف انتخاب شده کپی شد`
          : "تمام ردیف‌های نمایش داده شده کپی شد",
        "success"
      );
    } catch {
      showToast("خطا در کپی اطلاعات", "error");
    }
  };

  /* ------------------------ delete workflow ------------------------ */
  const handleInitiateDelete = async () => {
    if (effectiveSelectedRows.length === 0) return;

    if (entityName) {
      setIsDeleting(true);
      try {
        for (const row of effectiveSelectedRows) {
          const id =
            row.original.id ||
            row.original[`${entityName.charAt(0).toLowerCase() + entityName.slice(1)}Id`] ||
            row.original[`${entityName}Id`] ||
            row.original[`${entityName}ID`] ||
            row.original.Id ||
            row.original.ID;
          if (!id || id === "new" || (typeof id === "string" && id.startsWith("new-"))) continue;

          const res = await apiFetch(`/api/core/usage-check?tableName=${entityName}&id=${id}`);
          const checkData = await res.json();
          if (checkData.isUsed) {
            const destEntity = checkData.usedInEntity || checkData.usedInTable;
            const destNamePersian = destEntity ? getPersianEntityName(destEntity) : "سایر بخش‌ها";
            showToast(
              `از اطلاعات این فرم در فرم [${destNamePersian}] استفاده شده است. امکان حذف وجود ندارد.`,
              "error"
            );
            setIsDeleting(false);
            return;
          }
        }
      } catch (err) {
        console.error("Error checking referential integrity", err);
      }
      setIsDeleting(false);
    }

    setIsDeleteConfirmOpen(true);
  };

  /* ------------------------ filter helpers ------------------------- */
  const getFilterParts = (filterValue: any): { op: FilterOperator; value: string } => {
    const op =
      typeof filterValue === "object" && filterValue !== null && "op" in filterValue
        ? filterValue.op
        : "contains";
    const value =
      typeof filterValue === "object" && filterValue !== null && "value" in filterValue
        ? filterValue.value
        : typeof filterValue === "string"
          ? filterValue
          : "";
    return { op, value };
  };

  const isFilterActive = (filterValue: any): boolean => {
    if (filterValue === undefined || filterValue === null || filterValue === "") return false;
    const { op, value } = getFilterParts(filterValue);
    if (op === "empty" || op === "notEmpty") return true;
    return String(value ?? "").trim() !== "";
  };

  const totalSize = table.getTotalSize();
  const visibleRows = table.getRowModel().rows;
  const hasAnyActiveFilter = columnFilters.length > 0 || advancedFilters.length > 0 || !!globalFilter;
  const hasFilterWithoutResult = data.length > 0 && visibleRows.length === 0;

  return (
    <div
      ref={formRef}
      className={clsx(
        "flex flex-col h-full w-full bg-white dark:bg-gray-900 overflow-hidden",
        hideTitleBar ? "border border-gray-200 dark:border-gray-800 rounded-lg" : "rounded-b-lg border-x border-b border-t-0",
        currentFormStyle,
        className
      )}
    >
      {/* ============================ Header ============================ */}
      {!hideTitleBar && (
        <div className="relative z-10 m-0 flex w-full flex-shrink-0 flex-col rounded-none border-b border-b-gray-200 border-x-0 dark:border-b-gray-800">
          <div
            className={clsx(
              "flex w-full items-center justify-between bg-gradient-to-l px-4 py-2 text-white shadow-sm",
              currentHeaderGradient
            )}
          >
            <div className="flex items-center gap-2">
              {icon && <div className="flex items-center justify-center opacity-90">{icon}</div>}
              {title && <h3 className="text-[13px] font-medium tracking-tight">{locDigits(title)}</h3>}
            </div>
            <div className="flex items-center gap-0.5">
              <HelpButton
                onClick={onHelp}
                hideLabel
                variant="ghost"
                className="p-0 h-6 w-6 text-white shadow-none hover:bg-transparent hover:text-white/80 dark:hover:bg-transparent"
              />
              <FullscreenButton
                targetRef={formRef}
                hideLabel
                variant="ghost"
                className="p-0 h-6 w-6 text-white shadow-none hover:bg-transparent hover:text-white/80 dark:hover:bg-transparent"
              />
              <CloseButton
                hideLabel
                variant="ghost"
                className="p-0 h-6 w-6 text-white shadow-none hover:bg-transparent hover:text-white/80 dark:hover:bg-transparent"
              />
            </div>
          </div>
          {customTopActionbar && (
            <div className="Actionbar flex w-full flex-nowrap items-center justify-start gap-4 overflow-x-auto bg-gray-50/50 px-4 py-2 no-scrollbar dark:bg-gray-800/20">
              {customTopActionbar}
            </div>
          )}
        </div>
      )}

      {/* ======================== Table Content ========================= */}
      <div className="relative flex min-h-0 flex-1 flex-col bg-white dark:bg-gray-900">
        {isLoading && <LoadingOverlay message={tt("loading", "در حال دریافت اطلاعات...")} />}
        {isAdvancedSearchOpen && (
          <div className="pt-2">
            <AdvancedSearch
              columns={columnsDef as any}
              onSearch={setAdvancedFilters}
              isOpen={true}
              onOpen={() => {}}
              onClose={() => {
                setAdvancedFilters([]);
                setIsAdvancedSearchOpen(false);
              }}
            />
          </div>
        )}
        {showGroupPanel && <ColumnGrouping table={table} />}
        <div
          className="flex flex-1 flex-col overflow-hidden focus:outline-none"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <div ref={tableContainerRef} className="flex-1 overflow-x-auto overflow-y-auto">
            <table
              className={clsx(
                "relative w-full whitespace-nowrap border-collapse text-right text-xs outline-none",
                (isLoading || data.length === 0) && "h-full"
              )}
              style={{
                width: "100%",
                minWidth:
                  totalSize && !isNaN(totalSize) && totalSize > 0 ? totalSize : "100%",
                tableLayout: "fixed",
              }}
            >
              {/* ====================== Header + Filters ====================== */}
              <thead className="sticky top-0 z-10 text-gray-700 dark:text-gray-300">
                {table.getHeaderGroups().map((headerGroup) => (
                  <React.Fragment key={headerGroup.id}>
                    {/* titles row */}
                    <tr className="bg-slate-100/90 shadow-[0_1px_0_0_rgba(0,0,0,0.06)] dark:bg-slate-800/90">
                      {headerGroup.headers.map((header, index) => (
                        <th
                          key={header.id}
                          className={clsx(
                            "group relative select-none overflow-hidden border border-slate-300 px-[1px] py-[3.5px] text-[11px] font-semibold transition-colors hover:bg-slate-200/70 dark:border-slate-700 dark:hover:bg-slate-700/70",
                            header.column.id === "select" && "px-1"
                          )}
                          style={{
                            width:
                              header.column.id === "select"
                                ? 44
                                : !isNaN(header.getSize())
                                  ? header.getSize()
                                  : undefined,
                            maxWidth: header.column.id === "select" ? 44 : undefined,
                          }}
                        >
                          {header.column.id === "select" ? (
                            <div className="flex h-full w-full items-center justify-center">
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </div>
                          ) : (
                            <div
                              draggable={true}
                              onDragStart={(e) => {
                                setDraggedColumn(header.column.id);
                                e.dataTransfer.setData("columnId", header.column.id);
                              }}
                              onDragOver={(e) => e.preventDefault()}
                              onDragEnter={(e) => {
                                e.preventDefault();
                                if (draggedColumn && draggedColumn !== header.column.id) {
                                  setColumnOrder((colOrder) => {
                                    const newOrder = [...colOrder];
                                    const draggedIdx = newOrder.indexOf(draggedColumn);
                                    const targetIdx = newOrder.indexOf(header.column.id);
                                    newOrder.splice(draggedIdx, 1);
                                    newOrder.splice(targetIdx, 0, draggedColumn);
                                    return newOrder;
                                  });
                                }
                              }}
                              onDragEnd={() => setDraggedColumn(null)}
                              className={clsx(
                                "flex items-center gap-2 overflow-hidden px-1.5",
                                header.column.getCanSort() && "cursor-pointer",
                                draggedColumn === header.column.id && "opacity-50"
                              )}
                              onClick={header.column.getToggleSortingHandler()}
                              title={tt("click_to_sort", "برای مرتب‌سازی کلیک کنید")}
                            >
                              <GripHorizontal className="h-3.5 w-3.5 shrink-0 cursor-grab text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 dark:text-slate-500" />
                              <div className="whitespace-nowrap">
                                {flexRender(header.column.columnDef.header, header.getContext())}
                              </div>
                              {header.column.getIsSorted() === "asc" && (
                                <ChevronUp className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                              )}
                              {header.column.getIsSorted() === "desc" && (
                                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                              )}
                            </div>
                          )}
                          {header.column.getCanResize() && (
                            <div
                              onMouseDown={header.getResizeHandler()}
                              onTouchStart={header.getResizeHandler()}
                              className={clsx(
                                "absolute bottom-0 top-0 z-20 w-2 cursor-col-resize select-none touch-none transition-opacity",
                                rtl ? "-ml-1 left-0" : "-mr-1 right-0",
                                header.column.getIsResizing()
                                  ? "bg-blue-500 opacity-100"
                                  : "bg-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-blue-500 dark:bg-slate-500 dark:hover:bg-blue-500"
                              )}
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                        </th>
                      ))}
                    </tr>
                    {/* filter row */}
                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                      {headerGroup.headers.map((header, index) => (
                        <th
                          key={header.id + "-filter"}
                          className="overflow-hidden border border-slate-300 p-1 dark:border-slate-700"
                          style={{
                            width:
                              header.column.id === "select"
                                ? 44
                                : !isNaN(header.getSize())
                                  ? header.getSize()
                                  : undefined,
                            maxWidth: header.column.id === "select" ? 44 : undefined,
                          }}
                        >
                          {header.column.getCanFilter() ? (
                            (() => {
                              const filterValue = header.column.getFilterValue() as
                                | AdvancedFilterValue
                                | string
                                | undefined;
                              const { op: currentOp, value: currentValue } = getFilterParts(filterValue);
                              const active = isFilterActive(filterValue);
                              const opLabel =
                                FILTER_OPTIONS.find((o) => o.val === currentOp)?.label || "شامل";

                              return (
                                <div className="group/filter relative flex w-full items-center">
                                  <button
                                    type="button"
                                    title={opLabel}
                                    onClick={(e) => {
                                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                      // toggle: clicking the same funnel again closes the menu
                                      setOperatorMenu((prev) =>
                                        prev?.colId === header.column.id ? null : { colId: header.column.id, rect }
                                      );
                                    }}
                                    className={clsx(
                                      "absolute z-10 flex h-5 w-5 items-center justify-center rounded transition-colors",
                                      rtl ? "right-1" : "left-1",
                                      active
                                        ? "text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                        : "text-slate-400 hover:text-blue-500 dark:text-slate-500 dark:hover:text-blue-400"
                                    )}
                                  >
                                    {active ? (
                                      <Filter className="h-3.5 w-3.5 fill-blue-100 dark:fill-blue-900/50" />
                                    ) : (
                                      <Filter className="h-3.5 w-3.5" />
                                    )}
                                  </button>
                                  <input
                                    type="text"
                                    value={currentValue}
                                    onChange={(e) =>
                                      header.column.setFilterValue({
                                        value: e.target.value,
                                        op: currentOp,
                                      })
                                    }
                                    disabled={currentOp === "empty" || currentOp === "notEmpty"}
                                    placeholder={`${opLabel}...`}
                                    className={clsx(
                                      "h-[22px] w-full rounded border bg-white py-1 text-xs font-normal transition-all focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:dark:bg-slate-800",
                                      rtl ? "pr-7 pl-2" : "pl-7 pr-2",
                                      active
                                        ? "border-blue-400 focus:border-blue-500 focus:ring-blue-500/30 dark:border-blue-600"
                                        : "border-slate-300 focus:border-blue-500 focus:ring-blue-500/30 dark:border-slate-600"
                                    )}
                                  />
                                  {active && (
                                    <button
                                      type="button"
                                      title={tt("clear_filter", "حذف فیلتر")}
                                      onClick={() => header.column.setFilterValue(undefined)}
                                      className={clsx(
                                        "absolute z-10 flex h-5 w-5 items-center justify-center rounded text-slate-400 transition-colors hover:text-rose-500",
                                        rtl ? "left-1" : "right-1"
                                      )}
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                  {operatorMenu?.colId === header.column.id && (
                                    <FilterOperatorMenu
                                      anchorRect={operatorMenu.rect}
                                      currentOp={currentOp}
                                      rtl={rtl}
                                      onSelect={(op) => {
                                        header.column.setFilterValue({ value: currentValue, op });
                                        setOperatorMenu(null);
                                      }}
                                      onClose={() => setOperatorMenu(null)}
                                    />
                                  )}
                                </div>
                              );
                            })()
                          ) : header.column.id === "select" || index === 0 ? (
                            <div className="flex h-full w-full items-center justify-center text-slate-400 dark:text-slate-500">
                              <Filter className="h-4 w-4 opacity-60" />
                            </div>
                          ) : null}
                        </th>
                      ))}
                    </tr>
                  </React.Fragment>
                ))}
              </thead>

              {/* =========================== Body =========================== */}
              <tbody>
                {isLoading && data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="border border-slate-300 px-6 py-8 text-center text-slate-500 dark:border-slate-700"
                    >
                      {tt("loading", "در حال دریافت اطلاعات...")}
                    </td>
                  </tr>
                ) : hasFilterWithoutResult ? (
                  <tr>
                    <td colSpan={columns.length} className="p-0">
                      <div className="flex h-full min-h-[220px] w-full flex-col items-center justify-center gap-3 text-slate-400 dark:text-slate-500">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/20">
                          <FilterX className="h-8 w-8 opacity-60" strokeWidth={1.5} />
                        </div>
                        <span className="text-xs">{tt("no_match", "هیچ ردیفی با فیلترهای فعلی مطابقت ندارد")}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setColumnFilters([]);
                            setAdvancedFilters([]);
                            setGlobalFilter("");
                          }}
                          className="rounded-md border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                        >
                          {tt("clear_filters", "حذف فیلترها")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="p-0">
                      <div className="flex h-full min-h-[220px] w-full flex-col items-center justify-center gap-3 text-slate-400 dark:text-slate-500">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                          <DatabaseZap className="h-8 w-8 opacity-50" strokeWidth={1.5} />
                        </div>
                        <span className="text-xs">{tt("no_data", "اطلاعاتی برای نمایش وجود ندارد")}</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((row, index) => {
                    const isSelected = row.getIsSelected();
                    const isHighlighted = highlightedRowIds[row.id];
                    const isActive = row.id === activeRowId;

                    return (
                      <tr
                        key={row.id}
                        onClick={(e) => handleRowClick(e, row, index)}
                        onDoubleClick={(e) => handleRowDoubleClick(e, row, index)}
                        className={clsx(
                          "group/row cursor-pointer transition-colors",
                          isSelected
                            ? "bg-blue-50 hover:bg-blue-50 dark:bg-blue-900/40 dark:hover:bg-blue-900/40"
                            : isHighlighted || isActive
                              ? "bg-blue-50/60 hover:bg-blue-50/60 dark:bg-blue-900/20 dark:hover:bg-blue-900/20"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        )}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className={clsx(
                              "relative whitespace-nowrap border border-slate-200 p-0 transition-colors group-hover/row:border-slate-300 dark:border-slate-800 dark:group-hover/row:border-slate-700",
                              isSelected && "border-blue-200 dark:border-blue-800",
                              cell.column.id === "select" && "text-center"
                            )}
                            style={{
                              width:
                                cell.column.id === "select"
                                  ? 44
                                  : !isNaN(cell.column.getSize())
                                    ? cell.column.getSize()
                                    : undefined,
                              maxWidth: cell.column.id === "select" ? 44 : undefined,
                              height: "1px",
                            }}
                          >
                            <div
                              className={clsx(
                                "flex h-full w-full items-center overflow-hidden py-[2px]",
                                cell.column.id === "select" ? "justify-center" : "px-1.5"
                              )}
                            >
                              <div className="w-full truncate">
                                {cell.getIsGrouped() ? (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        row.getToggleExpandedHandler()();
                                      }}
                                      className="cursor-pointer rounded border border-slate-200 bg-white p-1 text-slate-500 shadow-sm transition-colors hover:text-blue-500 dark:border-slate-700 dark:bg-slate-800"
                                    >
                                      {row.getIsExpanded() ? (
                                        <ChevronDown className="h-4 w-4" />
                                      ) : rtl ? (
                                        <ChevronLeft className="h-4 w-4" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4" />
                                      )}
                                    </button>
                                    <span className="font-semibold text-blue-700 dark:text-blue-400">
                                      {(() => {
                                        const rendered = flexRender(cell.column.columnDef.cell, cell.getContext());
                                        return typeof rendered === "string" || typeof rendered === "number" ? locDigits(rendered) : rendered;
                                      })()}
                                    </span>
                                    <span className="select-none text-sm text-slate-500 dark:text-slate-400">
                                      ({row.subRows.length})
                                    </span>
                                  </div>
                                ) : cell.getIsAggregated() ? (
                                  (() => {
                                    const rendered = flexRender(
                                      cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell,
                                      cell.getContext()
                                    );
                                    return typeof rendered === "string" || typeof rendered === "number" ? locDigits(rendered) : rendered;
                                  })()
                                ) : cell.getIsPlaceholder() ? null : (() => {
                                  let isStatusColumn = false;

                                  const originalColumnDef = columnsDef.find((c) => c.key === cell.column.id);
                                  const hasCustomRenderer =
                                    !!originalColumnDef?.cell || !!originalColumnDef?.renderCell;

                                  if (!hasCustomRenderer) {
                                    if (
                                      cell.column.id === "isActive" ||
                                      cell.column.id === "status" ||
                                      cell.column.id === "وضعیت" ||
                                      cell.column.id === "فعال"
                                    ) {
                                      isStatusColumn = true;
                                    } else if (
                                      typeof cell.column.columnDef.header === "string" &&
                                      ["وضعیت", "فعال", "status", "isActive"].includes(
                                        cell.column.columnDef.header
                                      )
                                    ) {
                                      isStatusColumn = true;
                                    }
                                  }

                                  if (isStatusColumn) {
                                    let val = cell.getValue();
                                    if (val === undefined) {
                                      const original: any = cell.row.original;
                                      val = original[cell.column.id] ?? original.isActive ?? original.status;
                                    }

                                    let active = false;
                                    if (val === true || val === "بله" || val === "فعال" || val === 1 || val === "active")
                                      active = true;
                                    else if (val === false || val === "خیر" || val === "غیرفعال" || val === 0 || val === "inactive")
                                      active = false;
                                    else active = !!val;

                                    return (
                                      <div className="flex h-full w-full items-center justify-center py-[1.5px]">
                                        <span
                                          className={clsx(
                                            "whitespace-nowrap rounded-full border px-3 py-0 text-[11px] font-medium transition-colors",
                                            active
                                              ? "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800/60 dark:bg-[#072f20] dark:text-emerald-500"
                                              : "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-800/60 dark:bg-[#3f1616] dark:text-rose-500"
                                          )}
                                        >
                                          {active ? "فعال" : "غیرفعال"}
                                        </span>
                                      </div>
                                    );
                                  }

                                  return (() => {
                                    const rendered = flexRender(cell.column.columnDef.cell, cell.getContext());
                                    return typeof rendered === "string" || typeof rendered === "number" ? locDigits(rendered) : rendered;
                                  })();
                                })()}
                              </div>
                            </div>
                          </td>
                        ))}
                      </tr>
                    );
                  })
                )}
                {/* Infinite Scroll Observer Target */}
                {hasMore && (
                  <tr ref={observerTarget}>
                    <td colSpan={columns.length} className="h-4 border-none p-0" />
                  </tr>
                )}
                {isLoadingMore && (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="border border-slate-300 bg-slate-50/30 px-6 py-4 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800/20"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                        <span>{tt("loading_more", "در حال بارگذاری موارد بیشتر...")}</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ========================= Footer bar ========================= */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 bg-gradient-to-l from-slate-50 to-white px-3 py-1.5 dark:border-gray-800 dark:from-slate-900 dark:to-slate-900">
            {/* start cluster (right in RTL): CRUD + data actions */}
            <div className="flex items-center gap-1 [&_button]:!h-6 [&_button]:!w-6 [&_button]:!p-0.5 [&_button_svg]:!h-[13px] [&_button_svg]:!w-[13px]">
              {onRefresh && (
                <ActionButton
                  onClick={onRefresh}
                  disabled={isLoading}
                  icon={RefreshCw}
                  variant="ghost"
                  hideLabel
                  tooltip={tt("refresh", "بروزرسانی")}
                  tooltipPosition="top"
                  className={clsx(isLoading && "[&_svg]:animate-spin")}
                />
              )}
              {onAdd && <NewButton onClick={onAdd} hideLabel />}
              {(onEdit || onEditRows) && (
                <EditButton
                  onClick={() => {
                    if (effectiveSelectedRows.length > 0) setIsEditConfirmOpen(true);
                  }}
                  disabled={effectiveSelectedRows.length === 0}
                  hideLabel
                  tooltipPosition="top"
                />
              )}
              {(onDelete || onDeleteRows) && (
                <DeleteButton
                  onClick={handleInitiateDelete}
                  disabled={effectiveSelectedRows.length === 0}
                  hideLabel
                  tooltipPosition="top"
                />
              )}
              {(onRefresh || onAdd || onEdit || onDelete) && (
                <div className="mx-1 h-4 w-px bg-slate-300 dark:bg-slate-600" />
              )}
              {!hideCopy && (
                <ActionButton
                  onClick={handleCopyRows}
                  icon={Copy}
                  variant="ghost"
                  hideLabel
                  tooltip={tt("copy_rows", "کپی ردیف‌های انتخاب شده")}
                  tooltipPosition="top"
                />
              )}
              {!hidePrint && (
                <ActionButton
                  onClick={() => window.print()}
                  icon={Printer}
                  variant="ghost"
                  hideLabel
                  tooltip={tt("print", "چاپ")}
                  tooltipPosition="top"
                />
              )}
              {!hideExcelExport && <ExcelExportButton onClick={handleExcelExport} hideLabel />}
              {!hideWordExport && <WordExportButton onClick={handleWordExport} hideLabel />}
              {!hidePdfExport && <PdfExportButton onClick={handlePdfExport} hideLabel />}
              {customFooterActions}
            </div>

            {/* center: selection summary */}
            <div className="flex items-center">
              {enableMultiSelection && effectiveSelectedRows.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setRowSelection({});
                    setHighlightedRowIds({});
                    setActiveRowId(null);
                  }}
                  className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-[11px] font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60"
                  title={tt("clear_selection", "لغو انتخاب")}
                >
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] text-white">
                    {effectiveSelectedRows.length}
                  </span>
                  {tt("rows_selected", "ردیف انتخاب شده")}
                  <X className="h-3 w-3" />
                </button>
              )}
              {hasAnyActiveFilter && effectiveSelectedRows.length === 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setColumnFilters([]);
                    setAdvancedFilters([]);
                    setGlobalFilter("");
                  }}
                  className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-0.5 text-[11px] font-medium text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                  title={tt("clear_all_filters", "حذف همه فیلترها")}
                >
                  <FilterX className="h-3 w-3" />
                  {tt("clear_filters", "حذف فیلترها")}
                </button>
              )}
            </div>

            {/* end cluster (left in RTL): view toggles */}
            <div className="flex items-center gap-1 [&_button]:!h-6 [&_button]:!w-6 [&_button]:!p-0.5 [&_button_svg]:!h-[13px] [&_button_svg]:!w-[13px]">
              <ColumnManagement table={table} displayKey={title || "main-data-grid"} />
              {enableColumnGrouping && (
                <ActionButton
                  onClick={() => setShowGroupPanel(!showGroupPanel)}
                  icon={LayoutList}
                  variant={showGroupPanel ? "primary" : "ghost"}
                  hideLabel
                  tooltip={tt("toggle_grouping", "تغییر نمایش بخش گروه‌بندی")}
                  tooltipPosition="top"
                />
              )}
              {enableAdvancedSearch !== false && (
                <ActionButton
                  onClick={() => {
                    if (isAdvancedSearchOpen) {
                      setAdvancedFilters([]);
                    }
                    setIsAdvancedSearchOpen(!isAdvancedSearchOpen);
                  }}
                  icon={Filter}
                  variant={isAdvancedSearchOpen ? "primary" : "ghost"}
                  hideLabel
                  tooltip={tt("toggle_advanced_search", "تغییر نمایش جستجوی پیشرفته")}
                  tooltipPosition="top"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================= Confirm dialogs ====================== */}
      {isEditConfirmOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setIsEditConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {tt("confirm_edit", "تایید ویرایش")}
              </h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {effectiveSelectedRows.length > 1
                  ? tt("confirm_edit_message_multiple", "آیا از ویرایش ردیف های انتخاب شده اطمینان دارید؟")
                  : tt("confirm_edit_message_single", "آیا از ویرایش ردیف انتخاب شده اطمینان دارید؟")}
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 bg-gray-50 px-6 py-4 dark:bg-gray-800/50">
              <button
                onClick={() => setIsEditConfirmOpen(false)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {tt("no", "خیر")}
              </button>
              <button
                onClick={() => {
                  setIsEditConfirmOpen(false);
                  if (onEditRows && effectiveSelectedRows.length > 0) {
                    onEditRows(effectiveSelectedRows.map((r) => r.original));
                  } else if (onEdit && selectedItem) {
                    if (effectiveSelectedRows.length > 1) {
                      const items = effectiveSelectedRows.map((r) => r.original);
                      items.forEach((item) => onEdit(item));
                    } else {
                      onEdit(selectedItem);
                    }
                  }
                  setRowSelection({});
                  setHighlightedRowIds({});
                  setActiveRowId(null);
                }}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                {tt("yes", "بلی")}
              </button>
            </div>
          </div>
        </div>
      )}
      {isDeleteConfirmOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setIsDeleteConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {tt("confirm_delete", "تایید حذف")}
              </h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {effectiveSelectedRows.length > 1
                  ? tt("confirm_delete_message_multiple", "از حذف ردیف های انتخاب شده اطمینان دارید؟")
                  : tt("confirm_delete_message_single", "از حذف ردیف انتخاب شده اطمینان دارید؟")}
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 bg-gray-50 px-6 py-4 dark:bg-gray-800/50">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {tt("no", "خیر")}
              </button>
              <button
                onClick={async () => {
                  setIsDeleteConfirmOpen(false);
                  setIsDeleting(true);
                  try {
                    if (onDeleteRows && effectiveSelectedRows.length > 0) {
                      await onDeleteRows(effectiveSelectedRows.map((r) => r.original));
                    } else if (onDelete && selectedItem) {
                      if (effectiveSelectedRows.length > 1) {
                        const items = effectiveSelectedRows.map((r) => r.original);
                        await Promise.all(items.map((item) => onDelete(item)));
                      } else {
                        await onDelete(selectedItem);
                      }
                    }
                    setRowSelection({});
                    setHighlightedRowIds({});
                    setActiveRowId(null);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                {tt("yes", "بلی")}
              </button>
            </div>
          </div>
        </div>
      )}
      {isDeleting && (
        <LoadingOverlay
          message={
            effectiveSelectedRows.length > 1
              ? tt("deleting_multiple", "در حال حذف ردیف های انتخاب شده")
              : tt("deleting_single", "در حال حذف ردیف")
          }
        />
      )}
    </div>
  );
}
