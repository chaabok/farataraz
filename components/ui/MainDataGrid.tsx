"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  ColumnDef,
  ColumnFiltersState,
  ColumnOrderState,
  RowSelectionState,
  GroupingState,
  ExpandedState,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Filter,
  GripHorizontal,
  LayoutList,
} from "lucide-react";

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
import { clsx } from "clsx";
import { useLanguage } from "@/components/Providers";
import { useOptionalTabs } from "@/components/TabsProvider";
import { useGridStore } from "@/lib/stores/gridStore";
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
import { logUserActivity } from "@/lib/activity-logger";
import { eventBus, EVENTS } from "@/lib/events";
import { ColumnGrouping } from "./ColumnGrouping";
import { AdvancedSearch, AdvancedFilterCondition } from "./AdvancedSearch";
import { formatDateByLocale, apiFetch } from "@/lib/utils";
import { useGridExport } from "@/hooks/useGridExport";
import { useGridKeyboardNavigation } from "@/hooks/useGridKeyboardNavigation";
import { toast } from "react-hot-toast";
import { useLookupStore } from "@/lib/stores/lookupStore";

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
  "agencyentity"
]);

export function pushBaseFieldsToEnd(order: string[]): string[] {
  const normal: string[] = [];
  const base: string[] = [];
  
  order.forEach(item => {
    if (item === "select") {
      normal.push(item);
    } else if (BASE_INHERITED_FIELDS_SET.has(item.toLowerCase())) {
      base.push(item);
    } else {
      normal.push(item);
    }
  });
  
  return [...normal, ...base];
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

const FIELD_TRANSLATIONS: Record<string, string> = {
  // General & Audit
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

  // Bank & Bank Account
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

  // Cheque & Chequebook
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

  // Cash & Petty Cash
  cashId: "کد صندوق",
  cashierName: "نام صندوق‌دار",
  pettyCashId: "کد تنخواه‌گردان",
  pettyCashierRef: "تنخواه‌دار",
  maxBalance: "سقف موجودی",

  // Parties & Accounts
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

  // Fiscal Year
  fiscalYearId: "کد سال مالی",
  startDate: "تاریخ شروع",
  endDate: "تاریخ پایان",
  isClosed: "بسته شده",

  // Currency
  currencyId: "کد ارز",
  currencySymbol: "نماد ارز",
  exchangeRate: "نرخ برابری",

  // Document Numbering & Entity Numbering
  entityName: "نام موجودیت",
  prefix: "پیشوند",
  suffix: "پسوند",
  startFrom: "شروع از",
  currentNumber: "شماره فعلی",
  paddingLength: "طول پدینگ",

  // Cost Center & Projects
  costCenterId: "کد مرکز هزینه",
  projectId: "کد پروژه",
  contractId: "کد قرارداد",
  contractDate: "تاریخ قرارداد",
  contractor: "پیمانکار",
  employer: "کارفرما",
};

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
  }
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
  disableAutoColumns = false,
}: MainDataGridProps) {
  const formRef = useRef<HTMLDivElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLTableRowElement>(null);

  const { preferences, setPreferences } = useGridStore();
  const gridPrefs = gridId ? preferences[gridId] : undefined;

  const [sorting, setSorting] = useState<SortingState>(() => {
    if (gridPrefs?.sorting && gridPrefs.sorting.length > 0) {
      return gridPrefs.sorting;
    }
    if (columnsDef && columnsDef.length > 0) {
      const firstCol = columnsDef[0];
      const firstColKey = firstCol.key || (firstCol as any).id || (firstCol.header ? String(firstCol.header) : undefined);
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
        const firstColKey = firstCol.key || (firstCol as any).id || (firstCol.header ? String(firstCol.header) : undefined);
        if (firstColKey) {
          setSorting([{ id: firstColKey, desc: true }]);
        }
      }
      isSortingInitializedRef.current = true;
    }
  }, [columnsDef, gridPrefs]);

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

  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() => {
    let order: string[];
    if (gridPrefs?.columnOrder) {
      order = [...gridPrefs.columnOrder];
    } else {
      order = columnsDef.map((c, index) => c.key || (c as any).id || (c.header ? String(c.header) : `column_${index}`));
      if (!disableAutoColumns) {
        if (!order.includes("creator")) order.push("creator");
        if (!order.includes("lastModifier")) order.push("lastModifier");
      }
      if (enableMultiSelection) {
        order.unshift("select");
      }
    }
    return pushBaseFieldsToEnd(order);
  });

  const [showGroupPanel, setShowGroupPanel] = useState(false);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isEditConfirmOpen, setIsEditConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [shiftAnchorIndex, setShiftAnchorIndex] = useState<number | null>(null);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [highlightedRowIds, setHighlightedRowIds] = useState<Record<string, boolean>>({});
  const { t, direction, language } = useLanguage();

  const { fetchLookup } = useLookupStore();
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await fetchLookup('users', '/api/iam/users', 60 * 60 * 1000);
        if (users && Array.isArray(users)) {
          const map: Record<string, string> = {};
          users.forEach((u: any) => {
            const id = u.userId || u.id;
            if (id) {
              map[String(id)] = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username;
            }
          });
          setUsersMap(map);
        }
      } catch (err) {
        // ignore
      }
    };
    loadUsers();
  }, [fetchLookup]);

  // Save changes to gridStore
  useEffect(() => {
    if (gridId) {
      setPreferences(gridId, {
        sorting,
        filters: columnFilters,
        columnOrder,
      });
    }
  }, [gridId, sorting, columnFilters, columnOrder, setPreferences]);

  // Debounce server side params update
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
    }, 500); // 500ms debounce

    return () => clearTimeout(timeout);
  }, [pageIndex, pageSize, sorting, columnFilters, globalFilter, advancedFilters, serverSide]);

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

  useEffect(() => {
    if (!onRefresh) return;
    const unsubscribe = eventBus.on(EVENTS.DATA_CHANGED, () => {
      onRefresh();
    });
    return () => unsubscribe();
  }, [onRefresh]);

  let groupId = "general";

  const tabsCtx = useOptionalTabs();
  if (tabsCtx && tabsCtx.tabs && tabsCtx.activeTabId) {
    const activeTab = tabsCtx.tabs.find((t) => t.id === tabsCtx.activeTabId);
    if (activeTab) {
      groupId = activeTab.groupId;
    }
  }

  const groupHeaderGradients: Record<string, string> = {
    general: "from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600",
    financial:
      "from-emerald-600 to-emerald-500 dark:from-emerald-700 dark:to-emerald-600",
    warehouse: "from-cyan-600 to-cyan-500 dark:from-cyan-700 dark:to-cyan-600",
    hr: "from-rose-600 to-rose-500 dark:from-rose-700 dark:to-rose-600",
    production:
      "from-orange-600 to-orange-500 dark:from-orange-700 dark:to-orange-600",
    admin:
      "from-purple-600 to-purple-500 dark:from-purple-700 dark:to-purple-600",
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
    admin:
      "border-x-purple-100 border-b-purple-100 dark:border-x-purple-900/30 dark:border-b-purple-900/30 shadow-[0_8px_30px_-4px_rgba(168,85,247,0.15)] dark:shadow-[0_8px_30px_-4px_rgba(168,85,247,0.05)]",
  };

  const currentHeaderGradient =
    groupHeaderGradients[groupId] || groupHeaderGradients["general"];
  const currentFormStyle =
    groupFormStyles[groupId] || groupFormStyles["general"];

  const columns = useMemo<ColumnDef<any>[]>(() => {
    const cols: ColumnDef<any>[] = columnsDef.map((col, index) => {
      const colId = col.key || (col as any).id || (col.header ? String(col.header) : `column_${index}`);
      let displayHeader = col.header || col.label;
      if (isTablePrimaryKey(colId)) {
        displayHeader = LOCALIZED_FIELD_TRANSLATIONS[language]?.id || "شناسه";
      } else {
        const localized = LOCALIZED_FIELD_TRANSLATIONS[language]?.[colId] || 
                          LOCALIZED_FIELD_TRANSLATIONS[language]?.[String(displayHeader)] || 
                          t(colId) || 
                          t(String(displayHeader));
        if (localized && localized !== colId && localized !== String(displayHeader)) {
          displayHeader = localized;
        } else if (!displayHeader) {
          displayHeader = LOCALIZED_FIELD_TRANSLATIONS['fa']?.[colId] || colId;
        }
      }
      const def: ColumnDef<any> = {
        id: colId,
        header: displayHeader,
        accessorKey: col.key,
        size: col.width ? (isNaN(Number(col.width)) ? undefined : Number(col.width)) : undefined,
        enableHiding: col.enableHiding,
        filterFn: (row, columnId, filterValue: any) => {
          const value = row.getValue(columnId) as
            | string
            | number
            | null
            | undefined;
          const strVal = String(value ?? "").toLowerCase();

          if (!filterValue || typeof filterValue !== "object") {
            const searchVal = String(filterValue ?? "").toLowerCase();
            return strVal.includes(searchVal);
          }

          const searchVal = String(filterValue.value ?? "").toLowerCase();
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
      
      const isDateCol = col.type === 'date' || 
                        (typeof col.key === 'string' && col.key.toLowerCase().includes('date')) || 
                        (typeof col.header === 'string' && col.header.includes('تاریخ'));

      const hasGlobalEnum = getLocalizedEnumLabel(colId, "1", language) !== null;
      const isEnumCol = col.enumOptions || col.type === 'enum' || hasGlobalEnum;

      if (col.cell) {
        def.cell = col.cell;
      } else if (col.renderCell) {
        def.cell = (info) => col.renderCell!(info);
      } else if ((col as any).render) {
        def.cell = ({ row, getValue }) => (col as any).render(getValue(), row.original, row.index);
      } else if (isEnumCol) {
        def.cell = ({ row }) => {
          const val = row.getValue(colId);
          if (val === null || val === undefined) return "";
          let label = "";
          if (col.enumOptions) {
            const option = col.enumOptions.find(opt => String(opt.value) === String(val));
            label = option ? (t(option.label) || option.label) : "";
          } else {
            label = getLocalizedEnumLabel(colId, val, language) || "";
          }
          if (label) {
            return `[${val}] ${label}`;
          }
          return String(val);
        };
      } else if (isDateCol) {
        def.cell = ({ row }) => {
          const val = row.getValue(colId);
          return val ? formatDateByLocale(val as string, language) : "";
        }
      }
      return def;
    });

    if (enableMultiSelection) {
      cols.unshift({
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center p-1 w-full h-full">
            <input
              type="checkbox"
              checked={table.getIsAllRowsSelected()}
              ref={(input) => {
                if (input) {
                  input.indeterminate = table.getIsSomeRowsSelected();
                }
              }}
              onChange={table.getToggleAllRowsSelectedHandler()}
              className="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div 
            className="flex items-center justify-center p-0 w-full relative" 
            style={{ resize: 'vertical', overflow: 'hidden', minHeight: '8px', height: '20px' }}
          >
            <input
              type="checkbox"
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              readOnly
              className="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer pointer-events-none"
            />
          </div>
        ),
        size: 50,
        enableSorting: false,
        enableResizing: false,
        enableColumnFilter: false,
        enableGrouping: false,
      });
    }

    if (!disableAutoColumns) {
      if (!cols.find(c => c.id === 'creator')) {
        cols.push({
          id: "creator",
          accessorKey: "creator",
          header: "کاربر ایجاد کننده",
          size: 130,
          enableSorting: true,
          cell: (info) => {
            const val = info.row.original.creator;
            return val ? (usersMap[String(val)] || val.toString()) : '';
          }
        });
      }

      if (!cols.find(c => c.id === 'lastModifier')) {
        cols.push({
          id: "lastModifier",
          accessorKey: "lastModifier",
          header: "کاربر ویرایش کننده",
          size: 130,
          enableSorting: true,
          cell: (info) => {
            const val = info.row.original.lastModifier;
            return val ? (usersMap[String(val)] || val.toString()) : '';
          }
        });
      }

      // Scan all keys present in data
      const allDataKeys = new Set<string>();
      if (Array.isArray(data)) {
        data.forEach(item => {
          if (item && typeof item === 'object') {
            Object.keys(item).forEach(k => {
              // Filter out system or internal keys
              if (
                k !== '__v' && 
                k !== '_id' && 
                !k.startsWith('_') && 
                k.toLowerCase() !== 'password' && 
                k.toLowerCase() !== 'salt'
              ) {
                allDataKeys.add(k);
              }
            });
          }
        });
      }

      const existingColKeys = new Set<string>();
      cols.forEach(c => {
        if (c.id) existingColKeys.add(c.id);
        const accKey = (c as any).accessorKey;
        if (accKey && typeof accKey === 'string') {
          existingColKeys.add(accKey);
          const dotIndex = accKey.indexOf('.');
          if (dotIndex !== -1) {
            existingColKeys.add(accKey.substring(0, dotIndex));
          }
        }
      });

      // Add missing keys
      allDataKeys.forEach(key => {
        if (!existingColKeys.has(key)) {
          let headerTitle = isTablePrimaryKey(key) 
            ? (LOCALIZED_FIELD_TRANSLATIONS[language]?.id || "شناسه") 
            : (LOCALIZED_FIELD_TRANSLATIONS[language]?.[key] || t(key) || FIELD_TRANSLATIONS[key]);
          if (!headerTitle) {
            // Fallback: convert camelCase or snake_case to a readable string
            headerTitle = key
              .replace(/([A-Z])/g, ' $1')
              .replace(/[_-]/g, ' ')
              .trim();
            headerTitle = headerTitle.charAt(0).toUpperCase() + headerTitle.slice(1);
          }

          const isDateKey = key.toLowerCase().includes('date') || key.toLowerCase().includes('time') || key.toLowerCase().includes('createdat') || key.toLowerCase().includes('updatedat');

          cols.push({
            id: key,
            accessorKey: key,
            header: headerTitle,
            size: 130,
            enableSorting: true,
            cell: ({ row }) => {
              const val = row.original[key];
              if (val === null || val === undefined) return "";
              if (typeof val === 'object') {
                return val.title || val.name || val.Title || val.Name || val.code || val.Code || JSON.stringify(val);
              }
              if (typeof val === 'boolean') {
                return val ? "✓" : "✗";
              }
              const enumLabel = getLocalizedEnumLabel(key, val, language);
              if (enumLabel) {
                return `[${val}] ${enumLabel}`;
              }
              if (isDateKey && (typeof val === 'string' || val instanceof Date)) {
                return formatDateByLocale(val as string, language);
              }
              return String(val);
            }
          });
        }
      });
    }

    return cols;
  }, [columnsDef, t, enableMultiSelection, usersMap, data, language, disableAutoColumns]);

  // Synchronize columnOrder if new column definitions are introduced
  useEffect(() => {
    const currentKeys = columns.map(c => c.id as string);
    setColumnOrder(prev => {
      const validKeysSet = new Set([...currentKeys, "select"]);
      const sanitizedPrev = prev.filter(k => validKeysSet.has(k));

      const missingKeys = currentKeys.filter(key => !sanitizedPrev.includes(key));
      if (missingKeys.length === 0 && sanitizedPrev.length === prev.length) {
        return pushBaseFieldsToEnd(prev);
      }
      
      const order = [...sanitizedPrev];
      missingKeys.forEach(key => {
        const origIndex = currentKeys.indexOf(key);
        if (origIndex === 0) {
          const insertIdx = enableMultiSelection ? 1 : 0;
          order.splice(insertIdx, 0, key);
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
  }, [columns, enableMultiSelection]);

  const table = useReactTable({
    data,
    columns,
    columnResizeMode: "onChange",
    columnResizeDirection: direction,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      columnOrder,
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
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    autoResetPageIndex: false,
    autoResetExpanded: false,
    enableRowSelection: true,
    enableMultiRowSelection: enableMultiSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: serverSide ? undefined : getSortedRowModel(),
    getFilteredRowModel: serverSide ? undefined : getFilteredRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    manualFiltering: serverSide,
    manualSorting: serverSide,
    manualPagination: serverSide,
    rowCount: totalItems,
  });

  const selectedRows = table.getSelectedRowModel().flatRows;
  // If no checkboxes are checked, use the active row (if any) for actions
  const activeRow = activeRowId ? table.getRowModel().rows.find(r => r.id === activeRowId) : null;
  const effectiveSelectedRows = selectedRows.length > 0 ? selectedRows : (activeRow ? [activeRow] : []);
  const selectedItem = effectiveSelectedRows.length > 0 ? effectiveSelectedRows[0].original : null;

  const onSelectionChangeRef = useRef(onSelectionChange);
  useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange;
  });

  useEffect(() => {
    if (onSelectionChangeRef.current) {
      onSelectionChangeRef.current(effectiveSelectedRows.map(r => r.original));
    }
  }, [rowSelection, activeRowId]);

  const handleRowClick = (e: React.MouseEvent, row: any, index: number) => {
    e.stopPropagation();

    // Setup highlighting and active row
    setActiveRowId(row.id);
    setHighlightedRowIds({ [row.id]: true });
    setLastSelectedIndex(index);
    if (!e.shiftKey) setShiftAnchorIndex(index);

    // Handle Selection
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

  const handleInitiateDelete = async () => {
    if (effectiveSelectedRows.length === 0) return;
    
    if (entityName) {
      setIsDeleting(true);
      try {
        // Iterate and check usage for all selected rows
        for (const row of effectiveSelectedRows) {
          // Attempt to find the primary ID (either 'id' or dynamically matching entityName + 'ID')
          const id = row.original.id || row.original[`${entityName.charAt(0).toLowerCase() + entityName.slice(1)}Id`] || row.original[`${entityName}Id`] || row.original[`${entityName}ID`] || row.original.Id || row.original.ID;
          if (!id || id === 'new' || (typeof id === 'string' && id.startsWith('new-'))) continue;
          
          const res = await apiFetch(`/api/core/usage-check?tableName=${entityName}&id=${id}`);
          const data = await res.json();
          if (data.isUsed) {
            import('@/lib/utils').then(({ getPersianEntityName }) => {
              const destEntity = data.usedInEntity || data.usedInTable;
              const destNamePersian = destEntity ? getPersianEntityName(destEntity) : 'سایر بخش‌ها';
              toast(`از اطلاعات این فرم در فرم [${destNamePersian}] استفاده شده است. امکان حذف وجود ندارد.`, {
                icon: '🔒',
                duration: 5000,
              });
            });
            setIsDeleting(false);
            return; // Abort the deletion process
          }
        }
      } catch (err) {
        console.error('Error checking referential integrity', err);
      }
      setIsDeleting(false);
    }
    
    setIsDeleteConfirmOpen(true);
  };

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
      {/* Header */}
      {!hideTitleBar && (
        <div
          className={`relative flex flex-col flex-shrink-0 w-full m-0 border-b border-x-0 border-b-gray-200 dark:border-b-gray-800 rounded-none z-10`}
        >
          <div
            className={`w-full bg-gradient-to-r rtl:bg-gradient-to-l ${currentHeaderGradient} px-4 py-2 flex items-center justify-between text-white`}
          >
            <div className="flex items-center gap-2">
              {icon && (
                <div className="flex items-center justify-center opacity-90">
                  {icon}
                </div>
              )}
              {title && <h3 className="text-[13px] font-medium">{title}</h3>}
            </div>
            <div className="flex items-center gap-0.5">
              <HelpButton
                onClick={onHelp}
                hideLabel
                variant="ghost"
                className="text-white hover:text-white/80 hover:bg-transparent dark:hover:bg-transparent p-0 h-6 w-6 shadow-none"
              />
              <FullscreenButton
                targetRef={formRef}
                hideLabel
                variant="ghost"
                className="text-white hover:text-white/80 hover:bg-transparent dark:hover:bg-transparent p-0 h-6 w-6 shadow-none"
              />
              <CloseButton
                hideLabel
                variant="ghost"
                className="text-white hover:text-white/80 hover:bg-transparent dark:hover:bg-transparent p-0 h-6 w-6 shadow-none"
              />
            </div>
          </div>
          {customTopActionbar && (
            <div className="Actionbar w-full bg-gray-50/50 dark:bg-gray-800/20 px-4 py-2 flex flex-nowrap items-center justify-start gap-4 overflow-x-auto no-scrollbar">
              {customTopActionbar}
            </div>
          )}
        </div>
      )}

      {/* Table Content */}
      <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-900 relative">
        {isLoading && <LoadingOverlay message={t("loading" as any) || "در حال دریافت اطلاعات..."} />}
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
          className="overflow-hidden flex-1 flex flex-col focus:outline-none" 
          tabIndex={0} 
          onKeyDown={handleKeyDown}
        >
          <div className="overflow-x-auto flex-1">
            <table
              className={clsx(
                "w-full text-xs text-right relative border-collapse outline-none whitespace-nowrap",
                (isLoading || data.length === 0) && "h-full"
              )}
              style={{ width: "100%", minWidth: (table.getTotalSize() && !isNaN(table.getTotalSize()) && table.getTotalSize() > 0) ? table.getTotalSize() : "100%", tableLayout: "fixed" }}
            >
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <React.Fragment key={headerGroup.id}>
                    <tr>
                      {headerGroup.headers.map((header, index) => (
                        <th
                          key={header.id}
                          className={clsx(
                            "py-[3.5px] text-[11px] font-medium select-none relative group transition-colors border border-gray-300 dark:border-gray-700 bg-gray-100/50 dark:bg-gray-800/80 overflow-hidden",
                            header.column.id === "select" ? "px-1" : "px-[1px]"
                          )}
                          style={{ width: header.column.id === "select" ? 50 : (!isNaN(header.getSize()) ? header.getSize() : undefined), maxWidth: header.column.id === "select" ? 50 : undefined }}
                        >
                          {header.column.id === "select" ? (
                            <div className="flex items-center justify-center w-full h-full">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
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
                                "flex items-center gap-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 overflow-hidden",
                                draggedColumn === header.column.id && "opacity-50"
                              )}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              <GripHorizontal className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 shrink-0 cursor-grab" />
                              <div className="whitespace-nowrap">
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                              </div>
                              {header.column.getIsSorted() === 'asc' && (
                                <ChevronUp className="h-4 w-4 shrink-0 text-blue-600" />
                              )}
                              {header.column.getIsSorted() === 'desc' && (
                                <ChevronDown className="h-4 w-4 shrink-0 text-blue-600" />
                              )}
                            </div>
                          )}
                          {header.column.getCanResize() && (
                            <div
                              onMouseDown={header.getResizeHandler()}
                              onTouchStart={header.getResizeHandler()}
                              className={clsx(
                                "absolute top-0 bottom-0 w-2 cursor-col-resize z-20 select-none touch-none",
                                direction === "rtl"
                                  ? "left-0 -ml-1"
                                  : "right-0 -mr-1",
                                header.column.getIsResizing()
                                  ? "bg-blue-500 opacity-100"
                                  : "bg-gray-400 opacity-0 group-hover:opacity-100 dark:bg-gray-500 hover:bg-blue-500 dark:hover:bg-blue-500 transition-opacity",
                              )}
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                        </th>
                      ))}
                    </tr>
                    <tr>
                      {headerGroup.headers.map((header, index) => (
                        <th
                          key={header.id + "-filter"}
                          className="p-1 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 overflow-hidden"
                          style={{ width: header.column.id === "select" ? 50 : (!isNaN(header.getSize()) ? header.getSize() : undefined), maxWidth: header.column.id === "select" ? 50 : undefined }}
                        >
                          {header.column.getCanFilter()
                            ? (() => {
                                const filterValue =
                                  header.column.getFilterValue() as
                                    | AdvancedFilterValue
                                    | string
                                    | undefined;
                                const currentOp =
                                  typeof filterValue === "object" &&
                                  filterValue !== null &&
                                  "op" in filterValue
                                    ? filterValue.op
                                    : "contains";
                                const currentValue =
                                  typeof filterValue === "object" &&
                                  filterValue !== null &&
                                  "value" in filterValue
                                    ? filterValue.value
                                    : typeof filterValue === "string"
                                      ? filterValue
                                      : "";

                                return (
                                  <div className="relative flex items-center w-full group/filter">
                                    <div
                                      className={clsx(
                                        "absolute z-10 flex items-center justify-center w-5 h-5",
                                        direction === "rtl"
                                          ? "right-1"
                                          : "left-1",
                                      )}
                                    >
                                      <select
                                        value={currentOp}
                                        onChange={(e) =>
                                          header.column.setFilterValue({
                                            value: currentValue,
                                            op: e.target
                                              .value as FilterOperator,
                                          })
                                        }
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        title={
                                          t("filter_operator" as any) ||
                                          "شرط فیلتر"
                                        }
                                      >
                                        {filterOptions.map((opt) => (
                                          <option key={opt.val} value={opt.val}>
                                            {opt.label}
                                          </option>
                                        ))}
                                      </select>
                                      <Filter className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 pointer-events-none group-hover/filter:text-blue-500" />
                                    </div>
                                    <input
                                      type="text"
                                      value={currentValue}
                                      onChange={(e) =>
                                        header.column.setFilterValue({
                                          value: e.target.value,
                                          op: currentOp,
                                        })
                                      }
                                      disabled={
                                        currentOp === "empty" ||
                                        currentOp === "notEmpty"
                                      }
                                      placeholder={`${filterOptions.find((o) => o.val === currentOp)?.label}...`}
                                      className={clsx(
                                        "w-full py-1 text-xs font-normal border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:dark:bg-gray-800 disabled:cursor-not-allowed",
                                        direction === "rtl"
                                          ? "pr-7 pl-2"
                                          : "pl-7 pr-2",
                                      )}
                                    />
                                  </div>
                                );
                              })()
                            : header.column.id === "select" || index === 0 ? (
                            <div className="flex items-center justify-center w-full h-full text-gray-400 dark:text-gray-500">
                              <Filter className="w-4 h-4" />
                            </div>
                          ) : null}
                        </th>
                      ))}
                    </tr>
                  </React.Fragment>
                ))}
              </thead>
              <tbody>
                {isLoading && data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-6 py-8 text-center text-gray-500 border border-gray-300 dark:border-gray-700"
                    >
                      {t("loading" as any) || "در حال دریافت اطلاعات..."}
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-6 py-8 text-center text-gray-500 border border-gray-300 dark:border-gray-700"
                    >
                      {t("no_data" as any)}
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row, index) => {
                    const isSelected = row.getIsSelected();
                    const isHighlighted = highlightedRowIds[row.id];
                    const isActive = row.id === activeRowId;
                    
                    return (
                      <tr
                        key={row.id}
                        onClick={(e) => handleRowClick(e, row, index)}
                        onDoubleClick={(e) => handleRowDoubleClick(e, row, index)}
                        className={clsx(
                          "transition-colors cursor-pointer",
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-50 dark:hover:bg-blue-900/40"
                            : isHighlighted || isActive
                              ? "bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                              : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        )}
                      >
                        {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className={clsx(
                            "border border-gray-300 dark:border-gray-700 whitespace-nowrap p-0 relative",
                            cell.column.id === "select" ? "text-center" : ""
                          )}
                          style={{ 
                              width: cell.column.id === "select" ? 50 : (!isNaN(cell.column.getSize()) ? cell.column.getSize() : undefined), 
                              maxWidth: cell.column.id === "select" ? 50 : undefined,
                              height: "1px"
                          }}
                        >
                          <div className={clsx(
                            "flex items-center overflow-hidden w-full h-full py-[1.5px]",
                            cell.column.id === "select" ? "justify-center" : "px-[1px]"
                          )}>
                            <div className="w-full truncate">
                              {cell.getIsGrouped() ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      row.getToggleExpandedHandler()();
                                    }}
                                    className="cursor-pointer text-gray-500 hover:text-blue-500 transition-colors p-1 bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-700"
                                  >
                                    {row.getIsExpanded() ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : direction === "rtl" ? (
                                      <ChevronLeft className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                  </button>
                                  <span className="font-semibold text-blue-700 dark:text-blue-400">
                                    {flexRender(
                                      cell.column.columnDef.cell,
                                      cell.getContext()
                                    )}
                                  </span>
                                  <span className="text-sm text-gray-500 dark:text-gray-400 select-none">
                                    ({row.subRows.length})
                                  </span>
                                </div>
                              ) : cell.getIsAggregated() ? (
                                flexRender(
                                  cell.column.columnDef.aggregatedCell ??
                                    cell.column.columnDef.cell,
                                  cell.getContext()
                                )
                              ) : cell.getIsPlaceholder() ? null : (() => {
                                let isStatusColumn = false;
                                
                                const originalColumnDef = columnsDef.find(c => c.key === cell.column.id);
                                const hasCustomRenderer = !!originalColumnDef?.cell || !!originalColumnDef?.renderCell;

                                if (!hasCustomRenderer) {
                                  // Check header or id
                                  if (cell.column.id === 'isActive' || cell.column.id === 'status' || cell.column.id === 'وضعیت' || cell.column.id === 'فعال') {
                                    isStatusColumn = true;
                                  } else if (typeof cell.column.columnDef.header === 'string' && ['وضعیت', 'فعال', 'status', 'isActive'].includes(cell.column.columnDef.header)) {
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
                                  if (val === true || val === 'بله' || val === 'فعال' || val === 1 || val === 'active') active = true;
                                  else if (val === false || val === 'خیر' || val === 'غیرفعال' || val === 0 || val === 'inactive') active = false;
                                  else active = !!val;

                                  return (
                                    <div className="flex justify-center items-center w-full h-full py-[1.5px]">
                                      <span className={clsx(
                                        "px-3 py-0 rounded-full text-[11px] font-medium border transition-colors whitespace-nowrap",
                                        active 
                                          ? "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-[#072f20] dark:border-emerald-800/60 dark:text-emerald-500" 
                                          : "bg-rose-50 border-rose-200 text-rose-600 dark:bg-[#3f1616] dark:border-rose-800/60 dark:text-rose-500"
                                      )}>
                                        {active ? 'فعال' : 'غیرفعال'}
                                      </span>
                                    </div>
                                  );
                                }

                                return flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                );
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
                    <td colSpan={columns.length} className="p-0 border-none h-4" />
                  </tr>
                )}
                {isLoadingMore && (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-6 py-4 text-center text-gray-500 border border-gray-300 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/20"
                    >
                      <div className="flex items-center justify-center gap-2">
                         <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                         <span>{t("loading_more" as any) || "در حال بارگذاری موارد بیشتر..."}</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer - Actions */}
          <div className="flex items-center justify-between px-6 py-1.5 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-1 [&_button]:!p-0.5 [&_button]:!h-6 [&_button]:!w-6 [&_button_svg]:!w-[13px] [&_button_svg]:!h-[13px]">
              {onRefresh && (
                <ActionButton
                  onClick={onRefresh}
                    disabled={isLoading}
                    icon={RefreshCw}
                    variant="primary"
                    hideLabel
                    tooltip={t("refresh" as any) || "بروزرسانی"}
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
                <ColumnManagement table={table} displayKey={title || "main-data-grid"} />
                {customFooterActions}
                {!hideExcelExport && (
                  <ExcelExportButton onClick={handleExcelExport} hideLabel />
                )}
                {!hidePdfExport && (
                  <PdfExportButton onClick={handlePdfExport} hideLabel />
                )}
              {!hideWordExport && (
                <WordExportButton onClick={handleWordExport} hideLabel />
              )}
              <div className="w-[1px] h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
              <ActionButton
                onClick={() => setShowGroupPanel(!showGroupPanel)}
                icon={LayoutList}
                variant={showGroupPanel ? "primary" : "ghost"}
                hideLabel
                tooltip={t("toggle_grouping" as any) || "تغییر نمایش بخش گروه‌بندی"}
                tooltipPosition="top"
              />
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
                tooltip={t("toggle_advanced_search" as any) || "تغییر نمایش جستجوی پیشرفته"}
                tooltipPosition="top"
              />
            </div>
          </div>
        </div>
      </div>
      {isEditConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setIsEditConfirmOpen(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t("confirm_edit" as any) || "تایید ویرایش"}</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {effectiveSelectedRows.length > 1 
                  ? t("confirm_edit_message_multiple" as any) || "آیا از ویرایش ردیف های انتخاب شده اطمینان دارید؟"
                  : t("confirm_edit_message_single" as any) || "آیا از ویرایش ردیف انتخاب شده اطمینان دارید؟"}
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsEditConfirmOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                {t("no" as any) || "خیر"}
              </button>
              <button
                onClick={() => {
                  setIsEditConfirmOpen(false);
                  if (onEditRows && effectiveSelectedRows.length > 0) {
                    onEditRows(effectiveSelectedRows.map(r => r.original));
                  } else if (onEdit && selectedItem) {
                    if (effectiveSelectedRows.length > 1) {
                      const items = effectiveSelectedRows.map(r => r.original);
                      items.forEach(item => onEdit(item));
                    } else {
                      onEdit(selectedItem);
                    }
                  }
                  setRowSelection({});
                  setHighlightedRowIds({});
                  setActiveRowId(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {t("yes" as any) || "بلی"}
              </button>
            </div>
          </div>
        </div>
      )}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setIsDeleteConfirmOpen(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t("confirm_delete" as any) || "تایید حذف"}</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {effectiveSelectedRows.length > 1 
                  ? t("confirm_delete_message_multiple" as any) || "از حذف ردیف های انتخاب شده اطمینان دارید؟" 
                  : t("confirm_delete_message_single" as any) || "از حذف ردیف اطمینان دارید؟"}
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                {t("no" as any) || "خیر"}
              </button>
              <button
                onClick={async () => {
                  setIsDeleteConfirmOpen(false);
                  setIsDeleting(true);
                  try {
                    if (onDeleteRows && effectiveSelectedRows.length > 0) {
                      await onDeleteRows(effectiveSelectedRows.map(r => r.original));
                    } else if (onDelete && selectedItem) {
                      if (effectiveSelectedRows.length > 1) {
                        const items = effectiveSelectedRows.map(r => r.original);
                        await Promise.all(items.map(item => onDelete(item)));
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
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                {t("yes" as any) || "بلی"}
              </button>
            </div>
          </div>
        </div>
      )}
      {isDeleting && (
        <LoadingOverlay 
          message={effectiveSelectedRows.length > 1 
            ? (t("deleting_multiple" as any) || "در حال حذف ردیف های انتخاب شده")
            : (t("deleting_single" as any) || "در حال حذف ردیف")} 
        />
      )}
    </div>
  );
}
